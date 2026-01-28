"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import Optional, Dict, Any, List
from datetime import datetime, date
from enum import Enum

class RiskLevel(str, Enum):
    BAIXO = "Baixo"
    MEDIO = "Médio"
    ALTO = "Alto"

class IMCCategory(str, Enum):
    BAIXO_PESO = "Baixo peso"
    EUTROFIA = "Eutrofia"
    SOBREPESO = "Sobrepeso"
    OBESIDADE = "Obesidade"

# --- ATUALIZADO: Paciente Schemas ---
class PacienteBase(BaseModel):
    nome: str = Field(..., min_length=3, max_length=200)
    email: Optional[EmailStr] = Field(None, description="E-mail da paciente para contato")
    data_nascimento: Optional[date] = Field(None, description="Data de nascimento para cálculo automático de idade")
    idade: Optional[int] = Field(None, ge=12, le=60, description="Idade (calculada automaticamente se data_nascimento for informada)")
    altura: float = Field(..., gt=1.2, le=2.2)
    contato: Optional[str] = None
    dados_adicionais: Optional[Dict[str, Any]] = None
    # Novos campos para gestação (Top Level)
    dum: Optional[date] = Field(None, description="Data da Última Menstruação")
    dpp: Optional[date] = Field(None, description="Data Provável do Parto")
    metodo_datacao: Optional[str] = Field(None, description="Método de datação (dum ou ultrassom)")

class PacienteCreate(PacienteBase):
    """Schema para criação de paciente - peso_pre_gestacional é obrigatório"""
    peso_pre_gestacional: float = Field(..., gt=30, le=200, description="Peso antes da gestação")

class PacienteUpdate(BaseModel):
    nome: Optional[str] = Field(None, min_length=3, max_length=200)
    email: Optional[EmailStr] = Field(None, description="E-mail da paciente")
    data_nascimento: Optional[date] = Field(None, description="Data de nascimento")
    idade: Optional[int] = Field(None, ge=12, le=60)
    altura: Optional[float] = Field(None, gt=1.2, le=2.2)
    peso_pre_gestacional: Optional[float] = Field(None, gt=30, le=200)
    contato: Optional[str] = None
    dados_adicionais: Optional[Dict[str, Any]] = None
    dum: Optional[date] = None
    dpp: Optional[date] = None
    metodo_datacao: Optional[str] = None

class PacienteResponse(BaseModel):
    """Schema de resposta - data_nascimento é string ISO pois MongoDB salva como string"""
    id: str
    nome: str
    email: Optional[str] = None
    data_nascimento: Optional[str] = Field(None, description="Data de nascimento em formato ISO (YYYY-MM-DD)")
    idade: Optional[int] = None
    altura: float
    contato: Optional[str] = None
    dados_adicionais: Optional[Dict[str, Any]] = None
    peso_pre_gestacional: Optional[float] = Field(None, description="Peso antes da gestação (pode ser None para dados antigos)")
    dum: Optional[str] = None
    dpp: Optional[str] = None
    metodo_datacao: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)

# --- ATUALIZADO: Avaliação Schemas ---
class RespostasChecklist(BaseModel):
    # Campos do formulário
    dietary_pattern: Optional[str] = None
    fruits_vegetables: Optional[str] = None
    dairy_products: Optional[str] = None
    whole_grains: Optional[str] = None
    meat_poultry_eggs: Optional[str] = None
    plant_proteins: Optional[str] = None
    fish_consumption: Optional[str] = None
    processed_foods: Optional[str] = None
    folic_acid_supplement: Optional[str] = None
    iron_supplement: Optional[str] = None
    calcium_supplement: Optional[str] = None
    sun_exposure: Optional[str] = None
    anemia_test: Optional[str] = None
    physical_activity: Optional[str] = None
    coffee_tea_consumption: Optional[str] = None
    substances_use: Optional[str] = None
    
    # Novos campos para exames e detalhes
    exam_date: Optional[str] = None
    hemoglobin: Optional[str] = None
    hematocrit: Optional[str] = None
    ferritin: Optional[str] = None
    dietary_pattern_desc: Optional[str] = None
    
    observations: Optional[str] = None


class CalculosResponse(BaseModel):
    """Resultados dos cálculos da avaliação"""
    imc_pre_gestacional: float
    imc_classification: str
    peso_atual: float
    ganho_peso_atual: float
    trimestre: str # Novo campo
    weight_gain_recommendation: str

class FeedbackItem(BaseModel):
    item_id: str
    title: str # Adicionado título para organizar melhor no PDF
    message: str
    type: str  # 'alert' (crítico), 'recommendation', 'normal'

class RelatorioResponse(BaseModel):
    """Relatório completo da avaliação"""
    alertas_criticos: List[FeedbackItem] = []
    recomendacoes: List[FeedbackItem] = []
    adequados: List[FeedbackItem] = [] # Renomeado de 'confirmacoes' para clareza

class AvaliacaoBase(BaseModel):
    paciente_id: str
    semana_gestacional: int = Field(..., ge=1, le=42, description="Semana gestacional atual (arredondada para baixo)")
    peso_atual: float = Field(..., gt=30, le=200, description="Peso na consulta atual")
    respostas_checklist: RespostasChecklist
    observacoes: Optional[str] = None

class AvaliacaoRequest(BaseModel):
    """Request completo para criar avaliação"""
    paciente_id: str
    semana_gestacional: int
    peso_atual: float
    # Peso pré-gestacional: opcional, usado quando paciente antigo não tem o dado
    peso_pre_gestacional: Optional[float] = Field(None, gt=30, le=200, description="Peso antes da gestação (obrigatório se paciente não tiver)")
    respostas: Dict[str, Any]
    observacoes: Optional[str] = None

class AvaliacaoResponse(AvaliacaoBase):
    id: str
    data_avaliacao: datetime
    # O peso pré-gestacional é retornado para referência
    peso_pre_gestacional: float 
    calculos: CalculosResponse
    relatorio: RelatorioResponse
    
    model_config = ConfigDict(from_attributes=True)

class IMCCalculationRequest(BaseModel):
    weight: float
    height: float

class IMCCalculationResponse(BaseModel):
    imc: float
    classification: str

class GestationalAgeRequest(BaseModel):
    date: date
    method: str # 'dum' or 'dpp'

class GestationalAgeResponse(BaseModel):
    gestational_week: int
    days: int
    weeks_remaining: Optional[int] = None

class WeightGainAnalysisRequest(BaseModel):
    pre_gestational_weight: float
    current_weight: float
    height: float
    gestational_week: int
    days: int = 0

