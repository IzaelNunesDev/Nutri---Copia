"""
Serviço de cálculo de risco nutricional
"""
from typing import Dict, Any
from app.services.calculos_service import classificar_imc, calcular_faixa_ganho_esperado

def calcular_pontuacao_risco(
    respostas: Dict[str, Any],
    imc: float,
    ganho_peso: float,
    semana_gestacional: int
) -> int:
    """
    Calcula a pontuação de risco nutricional baseada nas respostas do checklist
    
    Args:
        respostas: Dicionário com as respostas do checklist
        imc: IMC pré-gestacional
        ganho_peso: Ganho de peso atual em kg
        semana_gestacional: Semana gestacional atual
    
    Returns:
        Pontuação de risco (0-10)
    """
    score = 0
    
    # Avaliação baseada nas respostas (Agora comparando com strings conforme front)
    if respostas.get('dietary_pattern') == 'Vegana (não consome nenhum alimento de origem animal)':
        score += 2
    
    if respostas.get('fruits_vegetables') == 'Não':
        score += 1
    
    if respostas.get('dairy_products') == 'Não':
        score += 1
    
    if respostas.get('whole_grains') == 'Não':
        score += 1
    
    if respostas.get('meat_poultry_eggs') == 'Não':
        score += 1
    
    if respostas.get('plant_proteins') == 'Não':
        score += 1
    
    if respostas.get('fish_consumption') == 'Não':
        score += 1
    
    # Bug fix: A pergunta pergunta se a pessoa LIMITA o consumo.
    # Se ela responde "Não", significa que ela NÃO LIMITA (Risco!)
    if respostas.get('processed_foods') == 'Não':
        score += 2
    
    if respostas.get('folic_acid_supplement') in ['Não', 'Não sei']:
        score += 2
    
    if respostas.get('iron_supplement') in ['Não', 'Não sei']:
        score += 2
    
    if respostas.get('calcium_supplement') in ['Não', 'Não sei']:
        score += 2
    
    if respostas.get('sun_exposure') in ['Não', 'Não sei']:
        score += 1
    
    if respostas.get('anemia_test') in ['Não', 'Não sei']:
        score += 2
    
    if respostas.get('physical_activity') == 'Não':
        score += 1
    
    if respostas.get('substances_use') == 'Sim':
        score += 3
    
    # Avaliação do ganho de peso
    if imc and semana_gestacional:
        classificacao = classificar_imc(imc)
        expected_min, expected_max = calcular_faixa_ganho_esperado(classificacao, semana_gestacional)
        
        # Verifica se o ganho está abaixo ou acima do esperado
        if ganho_peso < expected_min * 0.8:
            score += 2
        elif ganho_peso > expected_max * 1.3:
            score += 2
    
    # Limita o score máximo a 10
    return min(score, 10)

def obter_nivel_risco(pontuacao: int) -> str:
    """
    Converte pontuação de risco em nível de risco
    
    Args:
        pontuacao: Pontuação de risco (0-10)
    
    Returns:
        Nível de risco: "Baixo", "Médio" ou "Alto"
    """
    if pontuacao <= 3:
        return "Baixo"
    elif pontuacao <= 6:
        return "Médio"
    else:
        return "Alto"

def obter_cor_risco(nivel: str) -> str:
    """
    Retorna a cor associada ao nível de risco
    
    Args:
        nivel: Nível de risco
    
    Returns:
        Cor em formato de classe CSS/Tailwind
    """
    cores = {
        "Baixo": "text-green-600",
        "Médio": "text-yellow-600",
        "Alto": "text-red-600"
    }
    return cores.get(nivel, "text-gray-600")

