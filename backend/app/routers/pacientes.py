"""
Rotas para gerenciamento de pacientes
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from bson import ObjectId
from datetime import datetime
from pymongo import DESCENDING
from app.database import get_database
from app.models.schemas import (
    PacienteCreate, 
    PacienteUpdate, 
    PacienteResponse
)
from app.auth import get_current_user
from app.models.user import UserResponse

router = APIRouter()

def paciente_helper(paciente) -> dict:
    """Helper para converter documento MongoDB para dict"""
    if not paciente:
        return None
    paciente_dict = dict(paciente)
    paciente_dict["id"] = str(paciente_dict["_id"])
    paciente_dict.pop("_id", None)
    return paciente_dict

@router.post("/pacientes", response_model=PacienteResponse, status_code=201)
async def criar_paciente(
    paciente: PacienteCreate, 
    db=Depends(get_database),
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Cria uma nova paciente
    
    Valida os dados de entrada e salva no banco de dados
    """
    # Verificar se já existe paciente com mesmo nome (opcional)
    existing = await db.pacientes.find_one({"nome": paciente.nome})
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Já existe uma paciente com este nome"
        )
    
    # Criar documento
    paciente_dict = paciente.model_dump()
    paciente_dict["user_id"] = str(current_user.id)
    paciente_dict["created_at"] = datetime.utcnow()
    paciente_dict["updated_at"] = None
    
    # Converter data_nascimento para string ISO (MongoDB não serializa datetime.date nativamente)
    if paciente_dict.get("data_nascimento"):
        paciente_dict["data_nascimento"] = paciente_dict["data_nascimento"].isoformat()
    if paciente_dict.get("dum"):
        paciente_dict["dum"] = paciente_dict["dum"].isoformat()
    if paciente_dict.get("dpp"):
        paciente_dict["dpp"] = paciente_dict["dpp"].isoformat()
    
    try:
        # Inserir no banco
        result = await db.pacientes.insert_one(paciente_dict)
        
        # Buscar o documento criado
        new_paciente = await db.pacientes.find_one({"_id": result.inserted_id})
        
        return paciente_helper(new_paciente)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar paciente: {str(e)}")

@router.get("/pacientes", response_model=List[PacienteResponse])
async def listar_pacientes(
    skip: int = 0,
    limit: int = 100,
    db=Depends(get_database),
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Lista todas as pacientes
    
    Usado para popular a lista no Dashboard
    """
    pacientes = []
    cursor = db.pacientes.find({"user_id": str(current_user.id)}).skip(skip).limit(limit).sort("created_at", DESCENDING)
    
    async for paciente in cursor:
        pacientes.append(paciente_helper(paciente))
    
    return pacientes

@router.get("/pacientes/{paciente_id}", response_model=PacienteResponse)
async def obter_paciente(
    paciente_id: str, 
    db=Depends(get_database),
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Obtém os detalhes de uma paciente específica
    
    Usado para carregar o perfil da paciente
    """
    if not ObjectId.is_valid(paciente_id):
        raise HTTPException(status_code=400, detail="ID inválido")
    
    paciente = await db.pacientes.find_one({
        "_id": ObjectId(paciente_id),
        "user_id": str(current_user.id)
    })
    
    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente não encontrada")
    
    return paciente_helper(paciente)

@router.put("/pacientes/{paciente_id}", response_model=PacienteResponse)
async def atualizar_paciente(
    paciente_id: str,
    paciente_update: PacienteUpdate,
    db=Depends(get_database),
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Atualiza os dados de uma paciente
    """
    if not ObjectId.is_valid(paciente_id):
        raise HTTPException(status_code=400, detail="ID inválido")
    
    # Verificar se paciente existe e pertence ao usuário
    paciente = await db.pacientes.find_one({
        "_id": ObjectId(paciente_id),
        "user_id": str(current_user.id)
    })
    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente não encontrada")
    
    # Preparar atualização (apenas campos fornecidos)
    update_data = {k: v for k, v in paciente_update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    # Converter data_nascimento para string ISO se presente
    if update_data.get("data_nascimento"):
        update_data["data_nascimento"] = update_data["data_nascimento"].isoformat()
    if update_data.get("dum"):
        update_data["dum"] = update_data["dum"].isoformat()
    if update_data.get("dpp"):
        update_data["dpp"] = update_data["dpp"].isoformat()
    
    # Atualizar
    await db.pacientes.update_one(
        {"_id": ObjectId(paciente_id), "user_id": str(current_user.id)},
        {"$set": update_data}
    )
    
    # Buscar atualizado
    updated_paciente = await db.pacientes.find_one({"_id": ObjectId(paciente_id)})
    
    return paciente_helper(updated_paciente)

@router.delete("/pacientes/{paciente_id}", status_code=204)
async def deletar_paciente(
    paciente_id: str, 
    db=Depends(get_database),
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Deleta uma paciente
    """
    if not ObjectId.is_valid(paciente_id):
        raise HTTPException(status_code=400, detail="ID inválido")
    
    result = await db.pacientes.delete_one({
        "_id": ObjectId(paciente_id),
        "user_id": str(current_user.id)
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Paciente não encontrada")
    
    return None

