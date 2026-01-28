"""
Serviço de cálculos antropométricos e recomendações
ATUALIZADO: Lógica FIGO/Kac et al./MS 2022 com textos dinâmicos do PDF
"""
from typing import Optional, Tuple, Dict, Any

def arredondar_semana_figo(semanas: int, dias: int) -> int:
    """
    Regra de arredondamento da semana gestacional conforme PDF (Página 4):
    - Se 1, 2 ou 3 dias -> mantém a semana atual
    - Se 4, 5 ou 6 dias -> arredonda para a próxima semana
    """
    if dias >= 4:
        return semanas + 1
    return semanas

def calcular_imc(peso: float, altura: float) -> float:
    """Calcula o IMC (kg/m²)"""
    if altura <= 0:
        raise ValueError("Altura deve ser maior que zero")
    return round(peso / (altura * altura), 1)

def classificar_imc(imc: float) -> str:
    """Classifica o IMC pré-gestacional"""
    if imc < 18.5:
        return "Baixo peso"
    elif imc < 25:
        return "Eutrofia"
    elif imc < 30:
        return "Sobrepeso"
    else:
        return "Obesidade"

def calcular_ganho_peso(peso_atual: float, peso_pre_gestacional: float) -> float:
    """Calcula o ganho de peso atual"""
    return round(peso_atual - peso_pre_gestacional, 1)

def determinar_trimestre(semana_gestacional: int) -> str:
    if semana_gestacional < 14:
        return "Primeiro Trimestre"
    elif semana_gestacional <= 27:
        return "Segundo Trimestre"
    else:
        return "Terceiro Trimestre"

def determinar_trimestre_numero(semana_gestacional: int) -> int:
    """Retorna o número do trimestre (1, 2 ou 3)"""
    if semana_gestacional < 14:
        return 1
    elif semana_gestacional <= 27:
        return 2
    else:
        return 3

# === CONSTANTES E LÓGICA FIGO ===

LIMITES_CATEGORIA = {
    "Baixo peso": {
        "trim1": {"min": 0.2, "max": 1.2, "lossLimit": 0},
        "trim2": {"min": 5.6, "max": 7.2},
        "trim3": {"min": 9.7, "max": 12.2},
        "totalMax": 12.2,
        "weeklyRateGrams": 242
    },
    "Eutrofia": {
        "trim1": {"min": -1.8, "max": 0.7, "lossLimit": -1.8},
        "trim2": {"min": 3.1, "max": 6.3},
        "trim3": {"min": 8.0, "max": 12.0},
        "totalMax": 12.0,
        "weeklyRateGrams": 200
    },
    "Sobrepeso": {
        "trim1": {"min": -1.6, "max": -0.05, "lossLimit": -1.6},
        "trim2": {"min": 2.3, "max": 3.7},
        "trim3": {"min": 7.0, "max": 9.0},
        "totalMax": 9.0,
        "weeklyRateGrams": 175
    },
    "Obesidade": {
        "trim1": {"min": -1.6, "max": -0.05, "lossLimit": -1.6},
        "trim2": {"min": 1.1, "max": 2.7},
        "trim3": {"min": 5.0, "max": 7.2},
        "totalMax": 7.2,
        "weeklyRateGrams": 125
    }
}

MENSAGENS_FIGO = {
    "Baixo peso": {
        "trim1": {
            "adequate": "O ganho de peso até a semana {semana} foi de {ganho} kg.\nDeve ser recomendado um ganho de peso entre {meta_min_1tri} e {meta_max_1tri} kg até as 13 semanas de idade gestacional.",
            "above": "O ganho de peso até a semana {semana} foi de {ganho} kg.\nPortanto, a paciente já ganhou o peso máximo (1,2kg) recomendado para o período.\nAssim, deve ser recomendado um ganho de {meta_min_2tri} a {meta_max_2tri} kg até as 27 semanas de gravidez.",
            "loss": "A perda de peso até a semana {semana} foi de {ganho} kg.\nA perda de peso não é aceitável para pacientes que engravidaram com baixo peso. Avalie o motivo dessa perda e defina uma conduta para resolução do quadro.\nDeve ser recomendado um ganho de {meta_min_1tri} a {meta_max_1tri} kg até as 13 semanas de idade gestacional.",
            "below": "O ganho de peso até a semana {semana} foi de {ganho} kg.\nEsse ganho está abaixo do recomendado para a idade gestacional.\nDeve ser recomendado um ganho de peso entre {meta_min_1tri} e {meta_max_1tri} kg até as 13 semanas de idade gestacional."
        },
        "trim2": {
            "adequate": "O ganho de peso até a semana {semana} foi de {ganho} kg.\nDeve ser recomendado um ganho de peso entre {meta_min_2tri} e {meta_max_2tri} kg até as 27 semanas de idade gestacional.",
            "max_reached": "O ganho de peso até a semana {semana} foi de {ganho} kg.\nPortanto, a paciente já ganhou o peso máximo (7,2kg) recomendado para o período.\nAssim, deve ser recomendado um ganho de {meta_min_3tri} a {meta_max_3tri} kg até o final da gravidez.",
            "loss": "A perda de peso até a semana {semana} foi de {ganho} kg.\nA perda de peso não é aceitável para pacientes que engravidaram com baixo peso. Avalie o motivo dessa perda, investigue a presença de hiperêmese gravídica e defina uma conduta para resolução do quadro.\nDeve ser recomendado um ganho de {meta_min_2tri} a {meta_max_2tri} kg até as 27 semanas de idade gestacional.",
            "below": "O ganho de peso até a semana {semana} foi de {ganho} kg.\nEsse ganho está abaixo do recomendado para a idade gestacional, onde a paciente deveria ter ganho no mínimo {meta_min_2tri} kg.\nAvalie o motivo desse baixo ganho de peso e defina uma conduta para resolução do quadro.\nDeve ser recomendado um ganho de {meta_min_2tri} a {meta_max_2tri} kg até as 27 semanas de idade gestacional.",
            "above": "O ganho de peso até a semana {semana} foi de {ganho} kg.\nPortanto, a paciente já ganhou o peso máximo (7,2kg) recomendado para o período.\nAssim, deve ser recomendado um ganho de {meta_min_3tri} a {meta_max_3tri} kg até o final da gravidez."
        },
        "trim3": {
            "adequate": "O ganho de peso até a semana {semana} foi de {ganho} kg.\nDeve ser recomendado um ganho de peso entre {meta_min_3tri} e {meta_max_3tri} kg até o final da gestação.",
            "max_reached": "O ganho de peso até a semana {semana} foi de {ganho} kg.\nMulheres com baixo peso pré-gestacional devem ter um ganho máximo de 12,2kg na gestação.\nAssim, deve ser recomendado um ganho de 242 gramas/semana até o final da gravidez.",
            "loss": "A perda de peso até a semana {semana} foi de {ganho} kg.\nA perda de peso não é aceitável para pacientes que engravidaram com baixo peso. Avalie o motivo dessa perda, investigue a presença de hiperêmese gravídica e defina uma conduta para resolução do quadro.\nDeve ser recomendado um ganho de {meta_min_3tri} a {meta_max_3tri} kg até o final da gravidez.",
            "below": "O ganho de peso até a semana {semana} foi de {ganho} kg.\nEsse ganho está abaixo do recomendado para a idade gestacional, onde a paciente deveria ter ganho no mínimo 5,6 kg.\nAvalie o motivo desse baixo ganho de peso e defina uma conduta para resolução do quadro.\nDeve ser recomendado um ganho de {meta_min_3tri} a {meta_max_3tri} kg até o final da gravidez.",
            "above": "O ganho de peso até a semana {semana} foi de {ganho} kg.\nMulheres com baixo peso pré-gestacional devem ter um ganho máximo de 12,2kg na gestação.\nAssim, deve ser recomendado um ganho de 242 gramas/semana até o final da gravidez."
        }
    },
    "Eutrofia": {
        "trim1": {
            "adequate": "O ganho de peso até a semana {semana} foi de {ganho} kg.\nDeve ser recomendado um ganho de no máximo {meta_max_1tri} kg até as 13 semanas de idade gestacional.",
            "loss_acceptable": "A perda de peso até a semana {semana} foi de {ganho} kg.\nA perda de até 1,8 kg é aceitável no primeiro trimestre. Avalie o motivo dessa perda e defina uma conduta para resolução do quadro.\nDeve ser recomendado um ganho de {meta_min_1tri} a {meta_max_1tri} kg até as 13 semanas de idade gestacional.",
            "loss_excessive": "A perda de peso até a semana {semana} foi de {ganho} kg.\nA perda de peso foi excessiva. É aceitável uma perda de no máximo 1,8 kg para pacientes que engravidaram com eutrofia. Avalie o motivo dessa perda e defina uma conduta para resolução do quadro.\nDeve ser recomendado um ganho de {meta_min_1tri} a {meta_max_1tri} kg até as 13 semanas de idade gestacional.",
            "above": "O ganho de peso até a semana {semana} foi de {ganho} kg.\nPortanto, a paciente já ganhou o peso máximo (0,7 kg) recomendado para o período.\nAssim, deve ser recomendado um ganho de {meta_min_2tri} a {meta_max_2tri} kg até as 27 semanas de gravidez."
        },
        "trim2": {
            "adequate": "O ganho de peso até a semana {semana} foi de {ganho} kg.\nDeve ser recomendado um ganho de peso entre {meta_min_2tri} e {meta_max_2tri} kg até as 27 semanas de idade gestacional.",
            "max_reached": "O ganho de peso até a semana {semana} foi de {ganho} kg.\nPortanto, a paciente já ganhou o peso máximo (6,3 kg) recomendado para o período.\nAssim, deve ser recomendado um ganho de {meta_min_3tri} a {meta_max_3tri} kg até o final da gravidez.",
            "loss_excessive": "A perda de peso até a semana {semana} foi de {ganho} kg.\nA perda de peso foi excessiva. É aceitável uma perda de no máximo 1,8 kg para pacientes que engravidaram com eutrofia. Avalie o motivo dessa perda, avalie hiperêmese gravídica e defina uma conduta para resolução do quadro.\nDeve ser recomendado um ganho de {meta_min_2tri} a {meta_max_2tri} kg até as 27 semanas de idade gestacional.",
            "loss_acceptable": "A perda de peso até a semana {semana} foi de {ganho} kg.\nEssa perda de peso é aceitável no primeiro trimestre. O ganho de peso é recomendado a partir das 14 semanas de idade gestacional.\nAssim, deve ser recomendado um ganho de {meta_min_2tri} a {meta_max_2tri} kg até as 27 semanas de idade gestacional.",
            "below": "O ganho de peso até a semana {semana} foi de {ganho} kg.\nEsse ganho está abaixo do recomendado para a idade gestacional, onde a paciente deveria ter ganho no mínimo 3,1 kg.\nAvalie o motivo desse baixo ganho de peso e defina uma conduta para resolução do quadro.\nDeve ser recomendado um ganho de {meta_min_2tri} a {meta_max_2tri} kg até as 27 semanas de gravidez.",
            "above": "O ganho de peso até a semana {semana} foi de {ganho} kg.\nPortanto, a paciente já ganhou o peso máximo (6,3 kg) recomendado até as 27 semanas de idade gestacional.\nAssim, deve ser recomendado um ganho de {meta_min_3tri} a {meta_max_3tri} kg até o final da gravidez."
        },
        "trim3": {
            "adequate": "O ganho de peso até a semana {semana} foi de {ganho} kg.\nDeve ser orientado um ganho de peso {meta_min_3tri} e {meta_max_3tri} kg até o final da gestação.",
            "max_reached": "O ganho de peso até a semana {semana} foi de {ganho} kg.\nMulheres que com eutrofia pré-gestacional devem ter um ganho máximo de 12 kg na gestação.\nAssim, deve ser recomendado um ganho de 200 gramas/semana até o final da gravidez.",
            "below": "O ganho de peso até a semana {semana} foi de {ganho} kg.\nEsse ganho está abaixo do recomendado para a idade gestacional, onde a paciente deveria ter ganho no mínimo 3,1 kg.\nAvalie o motivo desse baixo ganho de peso e defina uma conduta para resolução do quadro.\nDeve ser recomendado um ganho de {meta_min_3tri} a {meta_max_3tri} kg até o final da gravidez.",
            "loss": "A perda de peso até a semana {semana} foi de {ganho} kg.\nAté esse momento de gestação, a paciente deveria ter ganho no mínimo 3,1 kg.\nAvalie o motivo dessa perda de peso até o momento atual. Se sintomas de náuseas e vômitos, investigue hiperêmese gravídica. Defina uma conduta para resolução do quadro.\nDeve ser recomendado um ganho de {meta_min_3tri} a {meta_max_3tri} kg até o final da gravidez.",
            "above": "O ganho de peso até a semana {semana} foi de {ganho} kg.\nMulheres que com eutrofia pré-gestacional devem ter um ganho máximo de 12 kg na gestação.\nAssim, deve ser recomendado um ganho de 200 gramas/semana até o final da gravidez."
        }
    },
    "Sobrepeso": {
        "trim1": {
            "adequate": "A perda de peso até a semana {semana} foi de {ganho} kg.\nDeve ser recomendada a manutenção do peso pré-gestacional até as 13 semanas de idade gestacional, sendo aceita uma perda de até 1,6 kg no período.",
            "loss_excessive": "A perda de peso até a semana {semana} foi de {ganho} kg.\nA perda de peso foi excessiva. É aceitável uma perda de no máximo 1,6 kg para pacientes que engravidaram com sobrepeso. Avalie o motivo dessa perda e defina uma conduta para resolução do quadro.\nDeve ser recomendado um ganho de {meta_min_1tri} a {meta_max_1tri} kg até as 13 semanas de idade gestacional.",
            "above": "O ganho de peso até a semana {semana} foi de {ganho}kg.\nNesse período é recomendada a manutenção do peso.\nReforce que o ganho de peso deve acontecer a partir da semana 14, sendo recomendado um ganho de {meta_min_2tri} a {meta_max_2tri} kg até as 27 semanas de gravidez.",
            "loss_acceptable": "A perda de peso até a semana {semana} foi de {ganho} kg.\nDeve ser recomendada a manutenção do peso pré-gestacional até as 13 semanas de idade gestacional, sendo aceita uma perda de até 1,6 kg no período."
        },
        "trim2": {
            "adequate": "O ganho de peso até a semana {semana} foi de {ganho}kg.\nDeve ser recomendado um ganho entre {meta_min_2tri} e {meta_max_2tri} kg até as 27 semanas de idade gestacional.",
            "max_reached": "O ganho de peso até a semana {semana} foi de {ganho}kg.\nPortanto, a paciente já ganhou o peso máximo (3,7 kg) recomendado para o período.\nAssim, deve ser recomendado um ganho de {meta_min_3tri} a {meta_max_3tri} kg até o final da gravidez.",
            "loss_excessive": "A perda de peso até a semana {semana} foi de {ganho} kg.\nA perda de peso foi excessiva. É aceitável uma perda de no máximo 1,6 kg para pacientes que engravidaram com sobrepeso. Avalie o motivo dessa perda, investigue hiperêmese gravídica e defina uma conduta para resolução do quadro.\nDeve ser recomendado um ganho de {meta_min_2tri} a {meta_max_2tri} kg até as 27 semanas de idade gestacional.",
            "loss_acceptable": "A perda de peso até a semana {semana} foi de {ganho} kg.\nEssa perda de peso é aceitável no primeiro trimestre. O ganho de peso é recomendado a partir das 14 semanas de idade gestacional.\nAssim, deve ser recomendado um ganho de {meta_min_2tri} a {meta_max_2tri} kg até as 27 semanas de idade gestacional.",
            "above": "O ganho de peso até a semana {semana} foi de {ganho}kg.\nPortanto, a paciente já ganhou o peso máximo (3,7 kg) recomendado até as 27 semanas de idade gestacional.\nAssim, deve ser recomendado um ganho de {meta_min_3tri} a {meta_max_3tri} kg até o final da gravidez.",
            "below": "O ganho de peso até a semana {semana} foi de {ganho}kg.\nEsse ganho está abaixo do recomendado para a idade gestacional, onde a paciente deveria ter ganho no mínimo 2,3 kg.\nAvalie o motivo desse baixo ganho de peso. Se existir presença de vômitos e náuseas, investigue hiperêmese gravídica. Defina uma conduta para resolução do quadro.\nDeve ser recomendado um ganho de {meta_min_2tri} a {meta_max_2tri} kg até as 27 semanas de gravidez."
        },
        "trim3": {
            "adequate": "O ganho de peso até a semana {semana} foi de {ganho}kg.\nDeve ser recomendado um ganho entre {meta_min_3tri} e {meta_max_3tri} kg até o final da gestação.",
            "max_reached": "O ganho de peso até a semana {semana} foi de {ganho}kg.\nMulheres com sobrepeso pré-gestacional devem ter um ganho máximo de 9,0 kg na gestação.\nAssim, deve ser recomendado um ganho de 175 gramas/semana até o final da gravidez.",
            "below": "O ganho de peso até a semana {semana} foi de {ganho}kg.\nEsse ganho está abaixo do recomendado para a idade gestacional, onde a paciente deveria ter ganho no mínimo 2,3 kg.\nAvalie o motivo desse baixo ganho de peso. Se existir presença de vômitos e náuseas, investigue hiperêmese gravídica. Defina uma conduta para resolução do quadro.\nDeve ser recomendado um ganho de {meta_min_3tri} a {meta_max_3tri} kg até o final da gravidez.",
            "loss": "A perda de peso até a semana {semana} foi de {ganho} kg.\nAté esse momento de gestação, a paciente deveria ter ganho no mínimo 2,3 kg.\nAvalie o motivo dessa perda de peso até o momento atual. Se sintomas de náuseas e vômitos, investigue hiperêmese gravídica. Defina uma conduta para resolução do quadro.\nDeve ser recomendado um ganho de {meta_min_3tri} a {meta_max_3tri} kg até o final da gravidez.",
            "above": "O ganho de peso até a semana {semana} foi de {ganho}kg.\nMulheres com sobrepeso pré-gestacional devem ter um ganho máximo de 9,0 kg na gestação.\nAssim, deve ser recomendado um ganho de 175 gramas/semana até o final da gravidez."
        }
    },
    "Obesidade": {
        "trim1": {
            "adequate": "A perda de peso até a semana {semana} foi de {ganho} kg.\nDeve ser recomendada a manutenção do peso pré-gestacional até as 13 semanas de idade gestacional, sendo aceita uma perda de até 1,6 kg no período.",
            "loss_excessive": "A perda de peso até a semana {semana} foi de {ganho} kg.\nA perda de peso foi excessiva. É aceitável uma perda de no máximo 1,6 kg para pacientes que engravidaram com obesidade. Avalie o motivo dessa perda e defina uma conduta para resolução do quadro.\nDeve ser recomendado um ganho de {meta_min_1tri} a {meta_max_1tri} kg até as 13 semanas de idade gestacional.",
            "above": "O ganho de peso até a semana {semana} foi de {ganho}kg.\nNesse período é recomendada a manutenção do peso.\nReforce que o ganho de peso deve acontecer a partir da semana 14, sendo recomendado um ganho de {meta_min_2tri} a {meta_max_2tri} kg até as 27 semanas de gravidez.",
            "loss_acceptable": "A perda de peso até a semana {semana} foi de {ganho} kg.\nDeve ser recomendada a manutenção do peso pré-gestacional até as 13 semanas de idade gestacional, sendo aceita uma perda de até 1,6 kg no período."
        },
        "trim2": {
            "adequate": "O ganho de peso até a semana {semana} foi de {ganho}kg.\nDeve ser recomendado um ganho entre {meta_min_2tri} e {meta_max_2tri} kg até as 27 semanas de idade gestacional.",
            "max_reached": "O ganho de peso até a semana {semana} foi de {ganho}kg.\nPortanto, a paciente já ganhou o peso máximo (2,7 kg) recomendado para o período.\nAssim, deve ser recomendado um ganho de {meta_min_3tri} a {meta_max_3tri} kg até o final da gravidez.",
            "loss_excessive": "A perda de peso até a semana {semana} foi de {ganho} kg.\nA perda de peso foi excessiva. É aceitável uma perda de no máximo 1,6 kg para pacientes que engravidaram com obesidade. Avalie o motivo dessa perda, investigue hiperêmese gravídica e defina uma conduta para resolução do quadro.\nDeve ser recomendado um ganho de {meta_min_2tri} a {meta_max_2tri} kg até as 27 semanas de idade gestacional.",
            "loss_acceptable": "A perda de peso até a semana {semana} foi de {ganho} kg.\nEssa perda de peso é aceitável no primeiro trimestre. O ganho de peso é recomendado a partir das 14 semanas de idade gestacional.\nAssim, deve ser recomendado um ganho de {meta_min_2tri} a {meta_max_2tri} kg até as 27 semanas de idade gestacional.",
            "above": "O ganho de peso até a semana {semana} foi de {ganho}kg.\nNesse período é recomendada a manutenção do peso.\nReforce que o ganho de peso deve acontecer a partir da semana 14, sendo recomendado um ganho de {meta_min_3tri} a {meta_max_3tri} kg até até o final da gravidez.",
            "below": "O ganho de peso até a semana {semana} foi de {ganho}kg.\nEsse ganho está abaixo do recomendado para a idade gestacional, onde a paciente deveria ter ganho no mínimo 1,1 kg.\nAvalie o motivo desse baixo ganho de peso. Se existir presença de vômitos e náuseas, investigue hiperêmese gravídica. Defina uma conduta para resolução do quadro.\nDeve ser recomendado um ganho de {meta_min_2tri} a {meta_max_2tri} kg até as 27 semanas de gravidez."
        },
        "trim3": {
            "adequate": "O ganho de peso até a semana {semana} foi de {ganho}kg.\nDeve ser recomendado um ganho entre {meta_min_3tri} e {meta_max_3tri} kg até o final da gestação.",
            "max_reached": "O ganho de peso até a semana {semana} foi de {ganho}kg.\nMulheres com obesidade pré-gestacional devem ter um ganho máximo de 7,2 kg na gestação.\nAssim, deve ser recomendado um ganho de 125 gramas/semana até o final da gravidez.",
            "below": "O ganho de peso até a semana {semana} foi de {ganho}kg.\nEsse ganho está abaixo do recomendado para a idade gestacional, onde a paciente deveria ter ganho no mínimo 1,1 kg.\nAvalie o motivo desse baixo ganho de peso. Se existir presença de vômitos e náuseas, investigue hiperêmese gravídica. Defina uma conduta para resolução do quadro.\nDeve ser recomendado um ganho de {meta_min_3tri} a {meta_max_3tri} kg até o final da gravidez.",
            "loss": "A perda de peso até a semana {semana} foi de {ganho} kg.\nAté esse momento de gestação, a paciente deveria ter ganho no mínimo 1,1 kg.\nAvalie o motivo dessa perda de peso até o momento atual. Se sintomas de náuseas e vômitos, investigue hiperêmese gravídica. Defina uma conduta para resolução do quadro.\nDeve ser recomendado um ganho de {meta_min_3tri} a {meta_max_3tri} kg até o final da gravidez.",
            "above": "O ganho de peso até a semana {semana} foi de {ganho}kg.\nMulheres com obesidade pré-gestacional devem ter um ganho máximo de 7,2 kg na gestação.\nAssim, deve ser recomendado um ganho de 125 gramas/semana até o final da gravidez."
        }
    }
}

def fmt_num(num: float) -> str:
    """Formata número para string com vírgula"""
    return str(num).replace('.', ',')

def obter_recomendacao_ganho_peso(imc_pre: float, semana_gestacional: int, ganho: float) -> str:
    classificacao = classificar_imc(imc_pre)
    trimestre = determinar_trimestre_numero(semana_gestacional)
    limites = LIMITES_CATEGORIA.get(classificacao)
    
    if not limites:
        return f"Classificação IMC não encontrada: {classificacao}"
    
    is_baixo_peso = (classificacao == "Baixo peso")
    status = "adequate"
    
    # 1. Total Max Reached (Regra 4)
    # Ignora trimestre se já estourou o teto total
    if not is_baixo_peso and ganho >= limites["totalMax"]:
        status = "total_max_reached"
    
    elif is_baixo_peso and ganho < 0:
        # Perda crítica para baixo peso em qualquer momento
        status = "loss"
        
    elif trimestre == 1:
        if is_baixo_peso:
            if ganho < limites["trim1"]["min"]: status = "below"
            elif ganho <= limites["trim1"]["max"]: status = "adequate"
            else: status = "above" # > 1.2
        elif classificacao == "Eutrofia":
            if ganho < limites["trim1"]["lossLimit"]: status = "loss_excessive" # < -1.8
            elif ganho < 0: status = "loss_acceptable" # -1.8 a 0
            elif ganho > limites["trim1"]["max"]: status = "above" # > 0.7
            else: status = "adequate"
        else: # Sobrepeso/Obesidade
            if ganho < limites["trim1"]["lossLimit"]: status = "loss_excessive" # < -1.6
            elif ganho < 0: status = "loss_acceptable"
            elif ganho > 0: status = "above" # Ganho não recomendado no 1tri
            else: status = "adequate" # Manutenção (0)
            
    elif trimestre == 2:
        if not is_baixo_peso and ganho < 0:
            if ganho < limites["trim1"]["lossLimit"]: status = "loss_excessive"
            else: status = "loss_acceptable"
        elif ganho >= limites["trim2"]["max"]: status = "max_reached"
        elif ganho < limites["trim2"]["min"]: status = "below"
        elif ganho > limites["trim2"]["max"]: status = "above"
        else: status = "adequate"
        
    else: # Trimestre 3
        if not is_baixo_peso and ganho < 0: status = "loss"
        elif ganho < limites["trim3"]["min"]: status = "below"
        elif ganho > limites["trim3"]["max"]: status = "above"
        else: status = "adequate"
    
    # Gerar mensagem
    if status == "total_max_reached":
         # Template dinâmico
         return (f"O ganho de peso até a semana {semana_gestacional} foi de {fmt_num(ganho)} kg.\n"
                 f"Portanto, a paciente já atingiu o ganho de peso máximo recomendado para toda a gestação.\n"
                 f"Assim, deve ser recomendado um ganho de {limites['weeklyRateGrams']} gramas/semana até o final da gravidez.")

    msgs_trim = MENSAGENS_FIGO.get(classificacao, {}).get(f"trim{trimestre}", {})
    template = msgs_trim.get(status)
    
    if not template:
        return f"Status '{status}' não encontrado para {classificacao} no trimestre {trimestre}."
        
    # Substituição de placeholders
    return template.format(
        semana=semana_gestacional,
        ganho=fmt_num(ganho),
        meta_min_1tri=fmt_num(max(0, limites["trim1"]["min"])),
        meta_max_1tri=fmt_num(limites["trim1"]["max"]),
        meta_min_2tri=fmt_num(limites["trim2"]["min"]),
        meta_max_2tri=fmt_num(limites["trim2"]["max"]),
        meta_min_3tri=fmt_num(limites["trim3"]["min"]),
        meta_max_3tri=fmt_num(limites["trim3"]["max"]),
        total_max=fmt_num(limites["totalMax"]),
        taxa_semanal=limites["weeklyRateGrams"]
    )
