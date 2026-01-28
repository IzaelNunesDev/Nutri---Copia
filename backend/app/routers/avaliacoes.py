"""
Rotas para gerenciamento de avaliações
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from bson import ObjectId
from datetime import datetime
from pymongo import DESCENDING
from app.database import get_database
from app.models.schemas import (
    AvaliacaoRequest,
    AvaliacaoResponse,
    CalculosResponse,
    RelatorioResponse,
    RespostasChecklist
)
from app.auth import get_current_user
from app.models.user import UserResponse
from app.services.calculos_service import (
    calcular_imc,
    classificar_imc,
    calcular_ganho_peso,
    obter_recomendacao_ganho_peso,
    determinar_trimestre
)
from app.services.relatorio_service import gerar_relatorio_completo

router = APIRouter()

def avaliacao_helper(avaliacao) -> dict:
    """Helper para converter documento MongoDB para dict"""
    if not avaliacao:
        return None
    avaliacao_dict = dict(avaliacao)
    avaliacao_dict["id"] = str(avaliacao_dict["_id"])
    avaliacao_dict.pop("_id", None)
    return avaliacao_dict

@router.post("/avaliacoes", response_model=AvaliacaoResponse, status_code=201)
async def criar_avaliacao(
    req: AvaliacaoRequest, 
    db=Depends(get_database),
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Cria uma nova avaliação para uma paciente
    
    Lógica principal:
    - Recebe os dados da paciente e as respostas do checklist
    - Busca peso pré-gestacional do cadastro do paciente
    - Executa os cálculos: IMC pré-gestacional, ganho de peso, trimestre
    - Gera as recomendações e alertas clínicos
    - Monta o relatório completo
    - Salva no banco de dados
    """
    if not ObjectId.is_valid(req.paciente_id):
        raise HTTPException(status_code=400, detail="ID inválido")
    
    # Busca Paciente para pegar o Peso Pré-Gestacional (AGORA FIXO NO PACIENTE)
    paciente = await db.pacientes.find_one({
        "_id": ObjectId(req.paciente_id),
        "user_id": str(current_user.id)
    })
    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente não encontrada")
    
    peso_pre = paciente.get("peso_pre_gestacional")
    altura = paciente.get("altura")
    
    # Se paciente não tem peso_pre_gestacional, tenta usar o enviado na request
    if not peso_pre:
        if req.peso_pre_gestacional:
            peso_pre = req.peso_pre_gestacional
            # Atualiza o cadastro do paciente com o peso pré-gestacional
            await db.pacientes.update_one(
                {"_id": ObjectId(req.paciente_id)},
                {"$set": {"peso_pre_gestacional": peso_pre}}
            )
        else:
            raise HTTPException(
                status_code=400, 
                detail="Peso pré-gestacional não cadastrado. Por favor, informe o peso antes da gestação."
            )
    
    if not altura:
        raise HTTPException(status_code=400, detail="Altura não cadastrada para esta paciente.")

    # Cálculos
    imc_pre = calcular_imc(peso_pre, altura)
    class_imc = classificar_imc(imc_pre)
    ganho = calcular_ganho_peso(req.peso_atual, peso_pre)
    trimestre = determinar_trimestre(req.semana_gestacional)
    rec_peso = obter_recomendacao_ganho_peso(imc_pre, req.semana_gestacional, ganho)
    
    calculos = CalculosResponse(
        imc_pre_gestacional=imc_pre,
        imc_classification=class_imc,
        peso_atual=req.peso_atual,
        ganho_peso_atual=ganho,
        trimestre=trimestre,
        weight_gain_recommendation=rec_peso
    )
    
    # Relatório
    rel_dict = gerar_relatorio_completo(req.respostas, class_imc, req.semana_gestacional)
    relatorio = RelatorioResponse(**rel_dict)
    
    # Converter respostas para RespostasChecklist
    respostas_checklist = RespostasChecklist(**req.respostas)
    
    # Salvar
    avaliacao_doc = {
        "paciente_id": req.paciente_id,
        "semana_gestacional": req.semana_gestacional,
        "peso_atual": req.peso_atual,
        "peso_pre_gestacional": peso_pre, # Salva cópia histórica
        "respostas_checklist": respostas_checklist.model_dump(),
        "observacoes": req.observacoes,
        "data_avaliacao": datetime.utcnow(),
        "calculos": calculos.model_dump(),
        "relatorio": relatorio.model_dump()
    }
    
    res = await db.avaliacoes.insert_one(avaliacao_doc)
    created = await db.avaliacoes.find_one({"_id": res.inserted_id})
    
    return avaliacao_helper(created)

@router.get("/pacientes/{paciente_id}/avaliacoes", response_model=List[AvaliacaoResponse])
async def listar_avaliacoes_paciente(
    paciente_id: str,
    skip: int = 0,
    limit: int = 100,
    db=Depends(get_database),
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Lista o histórico de avaliações de uma paciente
    
    Usado para a aba "Histórico" no perfil da paciente
    """
    if not ObjectId.is_valid(paciente_id):
        raise HTTPException(status_code=400, detail="ID de paciente inválido")
    
    # Verificar se paciente existe e pertence ao usuário
    paciente = await db.pacientes.find_one({
        "_id": ObjectId(paciente_id),
        "user_id": str(current_user.id)
    })
    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente não encontrada")
    
    avaliacoes = []
    cursor = (
        db.avaliacoes
        .find({"paciente_id": paciente_id})
        .skip(skip)
        .limit(limit)
        .sort("data_avaliacao", DESCENDING)
    )
    
    async for avaliacao in cursor:
        avaliacoes.append(avaliacao_helper(avaliacao))
    
    return avaliacoes

@router.get("/avaliacoes/{avaliacao_id}", response_model=AvaliacaoResponse)
async def obter_avaliacao(
    avaliacao_id: str, 
    db=Depends(get_database),
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Obtém os detalhes de uma avaliação específica
    """
    if not ObjectId.is_valid(avaliacao_id):
        raise HTTPException(status_code=400, detail="ID inválido")
    
    avaliacao = await db.avaliacoes.find_one({"_id": ObjectId(avaliacao_id)})
    
    if not avaliacao:
        raise HTTPException(status_code=404, detail="Avaliação não encontrada")
    
    # Verificar se a paciente pertence ao usuário atual
    paciente_id = avaliacao.get("paciente_id")
    paciente = await db.pacientes.find_one({
        "_id": ObjectId(paciente_id),
        "user_id": str(current_user.id)
    })
    
    if not paciente:
        raise HTTPException(status_code=403, detail="Acesso negado a esta avaliação")
    
    return avaliacao_helper(avaliacao)

@router.delete("/avaliacoes/{avaliacao_id}", status_code=204)
async def deletar_avaliacao(
    avaliacao_id: str, 
    db=Depends(get_database),
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Deleta uma avaliação
    """
    if not ObjectId.is_valid(avaliacao_id):
        raise HTTPException(status_code=400, detail="ID inválido")
    
    avaliacao = await db.avaliacoes.find_one({"_id": ObjectId(avaliacao_id)})
    if not avaliacao:
        raise HTTPException(status_code=404, detail="Avaliação não encontrada")

    # Verificar se a paciente pertence ao usuário atual
    paciente_id = avaliacao.get("paciente_id")
    paciente = await db.pacientes.find_one({
        "_id": ObjectId(paciente_id),
        "user_id": str(current_user.id)
    })
    
    if not paciente:
        raise HTTPException(status_code=403, detail="Acesso negado")

    await db.avaliacoes.delete_one({"_id": ObjectId(avaliacao_id)})
    
    return None
    