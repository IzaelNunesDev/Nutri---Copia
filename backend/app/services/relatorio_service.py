"""
Serviço de geração de feedback clínico e relatório
ATUALIZADO: 08/12 - Textos completos conforme solicitação
"""
from typing import Dict, Any, List
from app.models.schemas import FeedbackItem
from app.services.calculos_service import determinar_trimestre

# Helper para normalizar respostas (Sim/Não/Não sei)
def check(val, target):
    if val is None:
        return False
    if isinstance(val, bool):
        return val == (target == 'Sim')
    return str(val).lower() == str(target).lower()

def gerar_relatorio_completo(
    respostas: Dict[str, Any],
    imc_classification: str,
    semana_gestacional: int
) -> Dict[str, Any]:
    
    alertas = []
    recomendacoes = []
    adequados = []
    
    # --- LÓGICA DE FEEDBACKS CONFORME ARQUIVO TXT ---

    # 1. Padrão Alimentar
    diet = respostas.get('dietary_pattern', '')
    if diet == 'Vegana (não consome nenhum alimento de origem animal)':
        alertas.append(FeedbackItem(
            item_id='dietary_pattern',
            title='Dieta Vegana',
            message="A adesão a uma dieta VEGANA exige ATENÇÃO à ingestão de proteína, de cálcio e de vitamina B12.\n\n"
                    "• Para ingestão adequada de proteína: oriente o consumo de leguminosas (feijões, ervilha, grão de bico, soja e lentilha) juntamente com cereais (arroz, cuscuz, milho, macarrão, quinoa) nas refeições principais (almoço e jantar) e consumo de sementes e oleaginosas nos lanches.\n"
                    "• Para ingestão adequada de cálcio: oriente o consumo de bebidas vegetais enriquecidas com cálcio em quantidade adequada.\n"
                    "• Para ingestão adequada de vitamina B12: oriente a suplementação em dosagem adequada.",
            type='alert'
        ))
    elif diet and diet != 'Não':
        # Se for "Outros", tenta pegar a descrição
        desc = respostas.get('dietary_pattern_desc', '')
        if 'Outros' in diet and desc:
            msg = f"RESTRIÇÃO ESPECÍFICA: \"{desc}\".\nInvestigar a adequação nutricional individualmente."
        else:
            msg = "ATENÇÃO. Uma dieta especial bem planejada pode atender a todas as necessidades nutricionais."
            
        recomendacoes.append(FeedbackItem(
            item_id='dietary_pattern',
            title='Dieta Especial / Restrições',
            message=msg,
            type='recommendation'
        ))

    # 2a. Frutas e Vegetais
    val = respostas.get('fruits_vegetables')
    if check(val, 'Sim'):
        adequados.append(FeedbackItem(
            item_id='fruits_vegetables',
            title='Consumo de Frutas e Vegetais',
            message="PARABENIZE! Oriente a manter o consumo de legumes e verduras no almoço e jantar e frutas nos lanches. "
                    "Incentive o consumo de alimentos regionais e da estação.",
            type='normal'
        ))
    elif check(val, 'Não'):
        alertas.append(FeedbackItem(
            item_id='fruits_vegetables',
            title='Baixo Consumo de Frutas e Vegetais',
            message="BAIXO CONSUMO DIÁRIO DE FRUTAS E VEGETAIS.\n"
                    "Possibilidade de baixa ingestão de nutrientes, incluindo antioxidantes...\n"
                    "SOBRE AS FRUTAS:\n"
                    "- Estimule o consumo diário de frutas...\n"
                    "- Em caso de náuseas pela gestante, oriente o consumo de frutas cítricas...\n"
                    "SOBRE VERDURAS E LEGUMES:\n"
                    "- Estimule o consumo diário de legumes...\n"
                    "Higienização de frutas, verduras e legumes: A fim de evitar a contaminação...",
            type='alert'
        ))

    # 2b. Laticínios
    val = respostas.get('dairy_products')
    if check(val, 'Sim'):
        adequados.append(FeedbackItem(
            item_id='dairy_products',
            title='Consumo de Laticínios',
            message="CONSUMO ADEQUADO. Oriente a manutenção desse hábito. Alerte sobre a importância de laticínios pasteurizados.",
            type='normal'
        ))
    elif check(val, 'Não'):
        alertas.append(FeedbackItem(
            item_id='dairy_products',
            title='Baixo Consumo de Laticínios',
            message="BAIXO CONSUMO DIÁRIO DE LATICÍNIOS.\n"
                    "Possibilidade de baixa ingestão de vitamina B12, cálcio, proteína e iodo.\n"
                    "• Se não houver restrição: oriente consumo de leites, iogurtes e queijos (pasteurizados/UHT) nos lanches.\n"
                    "• Se houver restrição: avalie ingestão de proteína, B12 e considere bebidas vegetais enriquecidas com cálcio.",
            type='alert'
        ))

    # 2c. Cereais Integrais
    val = respostas.get('whole_grains')
    if check(val, 'Sim'):
        adequados.append(FeedbackItem(
            item_id='whole_grains',
            title='Cereais Integrais',
            message="CONSUMO ADEQUADO. Oriente a manutenção desse hábito. Arroz parboilizado, aveia e quinoa são boas opções.",
            type='normal'
        ))
    elif check(val, 'Não'):
        alertas.append(FeedbackItem(
            item_id='whole_grains',
            title='Baixo Consumo de Integrais',
            message="BAIXO CONSUMO DIÁRIO DE CEREAIS INTEGRAIS.\n"
                    "Possibilidade de baixa ingestão de fibras, vitaminas B e minerais.\n"
                    "Oriente preferir cereais integrais (aveia, quinoa, milho, arroz integral, macarrão integral, batata doce, etc).",
            type='alert'
        ))

    # 2d. Carnes/Ovos
    val = respostas.get('meat_poultry_eggs')
    if check(val, 'Sim'):
        adequados.append(FeedbackItem(
            item_id='meat_poultry_eggs',
            title='Proteínas Animais',
            message="CONSUMO ADEQUADO. Oriente preferir pescado e ovos. EVITAR CARNES/OVOS MAL COZIDOS.",
            type='normal'
        ))
    elif check(val, 'Não'):
        alertas.append(FeedbackItem(
            item_id='meat_poultry_eggs',
            title='Baixa Ingestão de Proteínas Animais',
            message="BAIXA INGESTÃO DE CARNES, AVES OU OVOS.\n"
                    "Possibilidade de baixa ingestão de vitamina B12, ferro e proteína.\n"
                    "Se não houver restrições, oriente preferir pescado e ovos. Se houver restrições, avalie proteína vegetal.",
            type='alert'
        ))

    # 2e. Leguminosas/Plant Proteins
    val = respostas.get('plant_proteins')
    if check(val, 'Sim'):
        adequados.append(FeedbackItem(
            item_id='plant_proteins',
            title='Leguminosas',
            message="CONSUMO ADEQUADO. Oriente a técnica de remolho dos grãos (6-12h). Combinar com frutas ricas em Vitamina C.",
            type='normal'
        ))
    elif check(val, 'Não'):
        alertas.append(FeedbackItem(
            item_id='plant_proteins',
            title='Baixo Consumo de Leguminosas',
            message="BAIXO CONSUMO DE LEGUMINOSAS E OLEAGINOSAS.\n"
                    "Possibilidade de baixa ingestão de proteínas, ferro e fibras.\n"
                    "Estimule consumo diário (feijão, lentilha, grão de bico) no almoço e jantar. Oriente sobre o remolho dos grãos.",
            type='alert'
        ))

    # 2f. Peixes
    val = respostas.get('fish_consumption')
    if check(val, 'Sim'):
        adequados.append(FeedbackItem(
            item_id='fish_consumption',
            title='Consumo de Peixes',
            message="CONSUMO ADEQUADO. Estimule o consumo de peixes gordos (sardinha, cavala, pargo, atum).",
            type='normal'
        ))
    elif check(val, 'Não'):
        alertas.append(FeedbackItem(
            item_id='fish_consumption',
            title='Baixo Consumo de Peixes',
            message="BAIXO CONSUMO SEMANAL DE PEIXE.\n"
                    "Possibilidade de baixa ingestão de ômega 3, vitamina D e iodo.\n"
                    "Se não houver restrição, estimule consumo. Se houver restrição, avalie suplementação de DHA (200-600mg).",
            type='alert'
        ))

    # 2g. Ultraprocessados
    val = respostas.get('processed_foods')
    if check(val, 'Sim'):
        alertas.append(FeedbackItem(
            item_id='processed_foods',
            title='Alto Consumo de Ultraprocessados',
            message="ALTO CONSUMO DE ULTRAPROCESSADOS.\n"
                    "Explique o que são (refrigerantes, sucos em pó, biscoitos, sorvetes, guloseimas, bolos, sopas/macarrão instantâneo, "
                    "salgados de pacote, empanados, embutidos e congelados prontos).\n"
                    "Oriente evitar esses alimentos e preferir alimentos in natura ou minimamente processados.",
            type='alert'
        ))
    elif check(val, 'Não'):
        adequados.append(FeedbackItem(
            item_id='processed_foods',
            title='Baixo Consumo de Ultraprocessados',
            message="CONSUMO ADEQUADO (BAIXO). Oriente a manutenção do hábito, priorizando sempre alimentos in natura.",
            type='normal'
        ))

    # 3a. Ácido Fólico
    val = respostas.get('folic_acid_supplement')
    if check(val, 'Sim') and semana_gestacional < 14:
        recomendacoes.append(FeedbackItem(
            item_id='folic_acid_supplement',
            title='Suplementação Ácido Fólico',
            message="INVESTIGUE A DOSAGEM (Universal: 400mcg ou 5mg em casos de risco).",
            type='recommendation'
        ))
    elif check(val, 'Sim'):
        # Feedback positivo se > 14 sem (já implementado implicitamente, ou add se quiser)
        adequados.append(FeedbackItem(
            item_id='folic_acid_supplement',
            title='Ácido Fólico',
            message="Uso relatado. Se após 12 semanas, avaliar necessidade de manutenção.",
            type='normal'
        ))
    elif check(val, 'Não'):
         # Se 'Não' -> Universal Necessária
        alertas.append(FeedbackItem(
            item_id='folic_acid_supplement',
            title='Necessidade de Ácido Fólico',
            message="SUPLEMENTAÇÃO UNIVERSAL NECESSÁRIA (1º Trimestre).\n"
                    "Prescrever 400mcg diariamente (ou 5mg se histórico de risco).",
            type='alert'
        ))
    elif check(val, 'Não sei'):
        # Se 'Não sei' -> Investigar
        alertas.append(FeedbackItem(
            item_id='folic_acid_supplement',
            title='Ácido Fólico - Investigar',
            message="FAÇA UMA AVALIAÇÃO MAIS APROFUNDADA sobre a suplementação de ácido fólico.",
            type='recommendation'
        ))

    # 3b. Ferro
    val = respostas.get('iron_supplement')
    if check(val, 'Sim'):
        recomendacoes.append(FeedbackItem(
            item_id='iron_supplement',
            title='Suplementação Ferro',
            message="INVESTIGUE A DOSAGEM (Universal: 200mg sulfato ferroso/dia).\n"
                    "Oriente ingestão longe do cálcio (>2h) e preferencialmente com frutas ricas em Vit C.",
            type='recommendation'
        ))
    elif check(val, 'Não'):
        alertas.append(FeedbackItem(
            item_id='iron_supplement',
            title='Necessidade de Ferro',
            message="SUPLEMENTAÇÃO UNIVERSAL NECESSÁRIA.\n"
                    "Prescrever 40mg ferro elementar (200mg sulfato ferroso).",
            type='alert'
        ))
    elif check(val, 'Não sei'):
        alertas.append(FeedbackItem(
            item_id='iron_supplement',
            title='Ferro - Investigar',
            message="FAÇA UMA AVALIAÇÃO MAIS APROFUNDADA sobre a suplementação de ferro.",
            type='recommendation'
        ))

    # 3c. Cálcio
    val = respostas.get('calcium_supplement')
    if check(val, 'Sim'):
        recomendacoes.append(FeedbackItem(
            item_id='calcium_supplement',
            title='Suplementação Cálcio',
            message="INVESTIGUE A DOSAGEM (Universal: 1000mg/dia).\n"
                    "Ingerir longe do ferro (>2h), não em jejum. Evitar com cafeína.",
            type='recommendation'
        ))
    elif check(val, 'Não') and semana_gestacional > 11:
         alertas.append(FeedbackItem(
            item_id='calcium_supplement',
            title='Necessidade de Cálcio',
            message="SUPLEMENTAÇÃO UNIVERSAL NECESSÁRIA (>11 semanas).\n"
                    "Prescrever 1000mg cálcio elementar.",
            type='alert'
        ))
    elif check(val, 'Não sei'):
        alertas.append(FeedbackItem(
            item_id='calcium_supplement',
            title='Cálcio - Investigar',
            message="FAÇA UMA AVALIAÇÃO MAIS APROFUNDADA sobre a suplementação de cálcio.",
            type='recommendation'
        ))

    # 4. Sol
    val = respostas.get('sun_exposure')
    if check(val, 'Não'):
        recomendacoes.append(FeedbackItem(
            item_id='sun_exposure',
            title='Exposição Solar',
            message="BAIXA EXPOSIÇÃO À LUZ SOLAR. Considere suplementação de Vitamina D.",
            type='recommendation'
        ))
    elif check(val, 'Não sei'):
        recomendacoes.append(FeedbackItem(
            item_id='sun_exposure',
            title='Exposição Solar',
            message="FAÇA UMA AVALIAÇÃO MAIS APROFUNDADA sobre a exposição da paciente ao sol.",
            type='recommendation'
        ))

    # 5. Exames (Anemia)
    val = respostas.get('anemia_test')
    if check(val, 'Sim'):
        # Reportar valores se existirem
        detalhes = []
        if respostas.get('hemoglobin'): detalhes.append(f"Hb: {respostas.get('hemoglobin')} g/dL")
        if respostas.get('hematocrit'): detalhes.append(f"Ht: {respostas.get('hematocrit')}%")
        if respostas.get('ferritin'): detalhes.append(f"Ferritina: {respostas.get('ferritin')} ng/mL")
        if respostas.get('exam_date'): detalhes.append(f"Data: {respostas.get('exam_date')}")
        
        msg_valores = " // ".join(detalhes) if detalhes else "Valores não informados."
        
        adequados.append(FeedbackItem(
            item_id='anemia_test',
            title='Exames de Anemia Realizados',
            message=f"Paciente realizou exames recente. Resultados: {msg_valores}",
            type='normal'
        ))
    elif check(val, 'Não') or check(val, 'Não sei'):
        recomendacoes.append(FeedbackItem(
            item_id='anemia_test',
            title='Exames Laboratoriais',
            message="SOLICITE EXAMES (Hemograma, etc).",
            type='recommendation'
        ))

    # 7. Atividade Física
    val = respostas.get('physical_activity')
    if check(val, 'Sim'):
        adequados.append(FeedbackItem(
            item_id='physical_activity',
            title='Atividade Física',
            message="NÍVEL ADEQUADO. Paciente ativa. Oriente MANTER A PRÁTICA de 150min moderada ou 75min vigorosa/semana, respeitando os limites do corpo.",
            type='normal'
        ))
    elif check(val, 'Não'):
        alertas.append(FeedbackItem(
            item_id='physical_activity',
            title='Inatividade Física',
            message="INATIVIDADE. Estimule prática leve a moderada progressiva (caminhada, etc) até completar 150min/semana, salvo contraindicação obstétrica.",
            type='alert'
        ))
    elif check(val, 'Não sei'):
         alertas.append(FeedbackItem(
            item_id='physical_activity',
            title='Atividade Física - Investigar',
            message="FAÇA UMA AVALIAÇÃO MAIS APROFUNDADA sobre a prática de atividade física da paciente.",
            type='recommendation'
        ))

    # 8. Café/Chá
    val = respostas.get('coffee_tea_consumption')
    if check(val, 'Sim'):
        recomendacoes.append(FeedbackItem(
            item_id='coffee_tea_consumption',
            title='Café e Chás',
            message="• Chás: Permitidos (hortelã, camomila, erva-cidreira, boldo). Contraindique outros.\n"
                    "• Café: Máximo 1 xícara/dia.",
            type='recommendation'
        ))
    
    # 9. Substâncias
    val = respostas.get('substances_use')
    if check(val, 'Sim'):
        alertas.append(FeedbackItem(
            item_id='substances_use',
            title='Uso de Substâncias (Álcool/Tabaco/Drogas)',
            message="RISCO ALTO. CONTRAINDIQUE TOTALMENTE.\n"
                    "Riscos: aborto, baixo peso, malformações. Encaminhar para CAPS AD se necessário.",
            type='alert'
        ))

    return {
        'alertas_criticos': alertas,
        'recomendacoes': recomendacoes,
        'adequados': adequados
    }
