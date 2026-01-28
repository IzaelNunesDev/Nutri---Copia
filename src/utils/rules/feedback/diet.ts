import { DIET_CODES, FEEDBACK_CONTENT } from '../constants';
import { dietNameToCode } from '../helpers';
import { FeedbackItem, FeedbackType, ResponseData } from '../types';

export const getDietFeedback = (dietPattern: string | null, description?: string): FeedbackItem[] => {
    const feedback: FeedbackItem[] = [];
    const dietCode = dietPattern ? dietNameToCode(dietPattern) : DIET_CODES.NAO;

    if (!dietCode || dietCode === DIET_CODES.NAO) {
        return []; // Sem restrições, sem feedback necessário
    }

    switch (dietCode) {
        case DIET_CODES.VEGANA:
            // [item1] = '6' → Amarelo - Duas caixinhas conforme IZAEL-JANEIRO.txt
            // CAIXA 1: Orientação educativa para PACIENTE (vai para o PDF)
            feedback.push({
                id: 'diet_vegan_patient',
                title: 'DIETA VEGANA - ATENÇÃO ESPECIAL',
                message: `Dieta vegana requer atenção ao ferro, vitamina B12, proteínas, cálcio e ômega 3.

É recomendado o uso de bebidas vegetais enriquecidas com cálcio ou suplementação desse mineral.

Recomenda-se o consumo adequado de leguminosas (feijões, ervilha, grão de bico, soja e lentilha) juntamente com cereais (arroz, cuscuz, milho, macarrão, quinoa) nas refeições principais.`,
                patientMessage: `Você segue uma alimentação vegana, o que é ótimo!

Para garantir uma gestação saudável, é importante prestar atenção especial a alguns nutrientes:

• Ferro: presente em feijões, lentilha e vegetais verde-escuros
• Proteínas: combine feijões com arroz nas refeições
• Cálcio: escolha bebidas vegetais enriquecidas com cálcio
• Vitamina B12: será necessário suplementar (converse comigo sobre isso)

Dica: Misture leguminosas (feijão, grão de bico, lentilha) com cereais (arroz, quinoa) - essa combinação fornece proteína completa!`,
                type: 'warning',
                audience: 'patient',
                priority: 10
            });
            // CAIXA 2: Alerta clínico EXCLUSIVO para PROFISSIONAL (só tela)
            feedback.push({
                id: 'diet_vegan_professional',
                title: 'ALERTA CLÍNICO: DIETA VEGANA',
                message: 'Suplemente vitamina B12 e considere suplementar DHA (200-600mg/dia de fonte vegetal - algas).',
                type: 'clinical',
                audience: 'professional',
                priority: 10
            });
            break;

        case DIET_CODES.PESCETARIANA:
            // [item1] = '2' → Verde conforme IZAEL-JANEIRO.txt
            feedback.push({
                id: 'diet_pescetarian',
                title: 'DIETA PESCETARIANA',
                message: 'Dieta pescetariana bem planejada atende às necessidades nutricionais na gestação. Rico em ômega-3 pelo consumo de peixes. É importante ter atenção aos níveis de ferro.',
                patientMessage: `Sua alimentação pescetariana é muito boa para a gestação!

✓ Ótimo: os peixes que você consome são ricos em ômega-3, essencial para o desenvolvimento do bebê!

⚠ Fique atenta ao ferro: como você não come outras carnes, inclua na sua alimentação:
• Feijão, lentilha e grão de bico
• Vegetais verde-escuros (espinafre, couve)
• Coma junto com frutas cítricas para melhor absorção!`,
                type: 'normal',
                audience: 'patient',
                priority: 3
            });
            break;

        case DIET_CODES.FLEXITARIANA:
            // [item1] = '5' → Verde conforme IZAEL-JANEIRO.txt
            feedback.push({
                id: 'diet_flexitarian',
                title: 'DIETA FLEXITARIANA',
                message: 'Dieta flexitariana bem planejada atende às necessidades nutricionais na gestação. Requer atenção ao ferro e proteínas.',
                patientMessage: `Sua alimentação flexitariana está no caminho certo!

Como você come carne ocasionalmente, sua dieta pode ser bem equilibrada. Para garantir todos os nutrientes:

• Nos dias sem carne, capriche nas leguminosas (feijão, lentilha)
• Combine sempre com cereais (arroz, quinoa) para proteína completa
• Fique atenta ao ferro nos dias vegetarianos

Seu bebê vai receber todos os nutrientes que precisa!`,
                type: 'normal',
                audience: 'patient',
                priority: 3
            });
            break;

        case DIET_CODES.OVOLACTOVEGETARIANA:
            // [item1] = '3' → Amarelo - Duas caixinhas conforme IZAEL-JANEIRO.txt
            // CAIXA 1: Orientação educativa para PACIENTE (vai para o PDF)
            feedback.push({
                id: 'diet_ovolacto_patient',
                title: 'DIETA OVOLACTOVEGETARIANA',
                message: 'Dieta ovolactovegetariana requer atenção ao ferro e ômega-3. É recomendado um consumo adequado de ovos e laticínios.',
                patientMessage: `Sua alimentação vegetariana com ovos e laticínios pode ser muito saudável!

Para garantir tudo que você e o bebê precisam:

• Ferro: coma feijões, lentilha e vegetais verde-escuros
   → Dica: tome suco de laranja junto para absorver melhor!
• Ovos: são ótima fonte de proteína e vitaminas
• Laticínios: garantem o cálcio para os ossos do bebê

Converse comigo sobre ômega-3, pois como você não come peixe, podemos pensar em uma suplementação.`,
                type: 'warning',
                audience: 'patient',
                priority: 6
            });
            // CAIXA 2: Alerta clínico EXCLUSIVO para PROFISSIONAL (só tela)
            feedback.push({
                id: 'diet_ovolacto_professional',
                title: 'ALERTA CLÍNICO: DIETA OVOLACTOVEGETARIANA',
                message: 'Considere suplementação de DHA.',
                type: 'clinical',
                audience: 'professional',
                priority: 8
            });
            break;

        case DIET_CODES.LACTOVEGETARIANA:
            // [item1] = '4' → Amarelo - Duas caixinhas conforme IZAEL-JANEIRO.txt
            // CAIXA 1: Orientação educativa para PACIENTE (vai para o PDF)
            feedback.push({
                id: 'diet_lacto_patient',
                title: 'DIETA LACTOVEGETARIANA',
                message: 'Dieta lactovegetariana requer monitoramento de ferro, ômega-3, vitamina B12 e proteínas. É recomendado um consumo adequado de leguminosas + cereais e laticínios.',
                patientMessage: `Sua alimentação vegetariana com laticínios precisa de atenção especial!

Alguns nutrientes importantes para você e o bebê:

• Ferro: presente em feijões, lentilha, grão de bico e vegetais escuros
   → Coma com frutas cítricas para absorver melhor!
• Proteínas: combine leguminosas + cereais nas refeições
   → Exemplo: arroz com feijão, quinoa com grão de bico
• Laticínios: continue consumindo para garantir cálcio

Precisamos conversar sobre vitamina B12 e ômega-3, pois podem precisar de suplementação.`,
                type: 'warning',
                audience: 'patient',
                priority: 6
            });
            // CAIXA 2: Alerta clínico EXCLUSIVO para PROFISSIONAL (só tela)
            feedback.push({
                id: 'diet_lacto_professional',
                title: 'ALERTA CLÍNICO: DIETA LACTOVEGETARIANA',
                message: 'Considere suplementação de DHA e de vitamina B12.',
                type: 'clinical',
                audience: 'professional',
                priority: 8
            });
            break;

        case DIET_CODES.ISENTA_LACTOSE:
            // [item1] = '7' → Verde conforme IZAEL-JANEIRO.txt
            feedback.push({
                id: 'diet_lactose_free',
                title: 'ISENTA DE LACTOSE',
                message: 'É recomendada uma alimentação saudável e equilibrada com consumo de laticínios zero lactose ou bebidas vegetais enriquecidas com cálcio.',
                patientMessage: `Não se preocupe com a intolerância à lactose! Podemos garantir todo o cálcio que você precisa.

Boas opções para você:
• Leite e derivados ZERO LACTOSE (são iguais nutricionalmente!)
• Bebidas vegetais ENRIQUECIDAS com cálcio (olhe o rótulo)
• Vegetais verde-escuros (couve, brócolis)
• Sardinha e salmão também têm cálcio

O importante é manter a ingestão de cálcio para a formação dos ossinhos do bebê!`,
                type: 'normal',
                audience: 'patient',
                priority: 3
            });
            break;

        case DIET_CODES.ISENTA_GLUTEN:
            // [item1] = '8' → Amarelo conforme IZAEL-JANEIRO.txt
            feedback.push({
                id: 'diet_gluten_free',
                title: 'ISENTA DE GLÚTEN',
                message: 'Dieta sem glúten requer monitoramento de fibras e vitaminas do complexo B. Oriente consumo de cereais integrais sem glúten (arroz, quinoa, aveia sem contaminação).',
                patientMessage: `Sua alimentação sem glúten pode ser bem nutritiva!

Para garantir fibras e vitaminas do complexo B, inclua:

• Arroz integral
• Quinoa (super nutritiva!)
• Aveia sem contaminação (procure o selo "sem glúten")
• Batata-doce e mandioca
• Milho e derivados

Esses alimentos vão garantir as fibras e vitaminas que o trigo normalmente fornece!`,
                type: 'warning',
                audience: 'patient',
                priority: 5
            });
            break;

        case DIET_CODES.OUTROS:
            feedback.push({
                id: 'diet_others',
                title: 'DIETA COM RESTRIÇÕES ESPECÍFICAS',
                message: `Restrição informada: "${description || 'Não especificada'}".\nInvestigar a adequação nutricional individualmente e monitorar possíveis deficiências baseadas na restrição relatada.`,
                type: 'recommendation',
                audience: 'professional',
                priority: 8
            });
            break;
    }

    return feedback;
};

export const getFishConsumptionFeedback = (
    fishConsumption: 'Sim' | 'Não' | null,
    _dietPattern: string | null // Reservado para cruzamento peixe/dieta vegetariana
): FeedbackItem[] => {
    const feedback: FeedbackItem[] = [];

    if (fishConsumption === 'Sim') {
        const item = FEEDBACK_CONTENT.fish_consumption.positive;
        feedback.push({
            id: 'fish_consumption_ok',
            title: item.title,
            message: item.content,
            type: item.type as FeedbackType,
            audience: 'patient',
            priority: 1
        });
    } else if (fishConsumption === 'Não') {
        const item = FEEDBACK_CONTENT.fish_consumption.negative;
        feedback.push({
            id: 'fish_consumption_low',
            title: item.title,
            message: item.content,
            type: item.type as FeedbackType, // 'critical'
            audience: 'both',
            priority: 8
        });
    }

    return feedback;
};

export const getDietQualityFeedback = (responses: ResponseData): FeedbackItem[] => {
    const feedback: FeedbackItem[] = [];

    // Helper to generate generic structure
    const checkItem = (
        response: boolean | null,
        key: 'fruits_vegetables' | 'dairy_products' | 'whole_grains' | 'meat_poultry_eggs' | 'plant_proteins' | 'processed_foods',
        isInverted: boolean = false
    ) => {
        if (response === null) return;

        // Inverted: SIM is Bad (processed_foods)
        // Normal: SIM is Good

        const isGood = isInverted ? !response : response;

        if (isGood) {
            const item = FEEDBACK_CONTENT[key].positive;
            feedback.push({
                id: `${key}_ok`,
                title: item.title,
                message: item.content,
                type: item.type as FeedbackType,
                audience: 'patient',
                priority: 1
            });
        } else {
            const item = FEEDBACK_CONTENT[key].negative;
            feedback.push({
                id: `${key}_critical`,
                title: item.title,
                message: item.content,
                type: item.type as FeedbackType,
                audience: 'both',
                priority: 8,
                note: key === 'processed_foods' ? undefined : 'Verificar recordatório alimentar.'
            });
        }
    };

    checkItem(responses.fruits_vegetables, 'fruits_vegetables');
    checkItem(responses.dairy_products, 'dairy_products');
    checkItem(responses.whole_grains, 'whole_grains');
    checkItem(responses.meat_poultry_eggs, 'meat_poultry_eggs');
    checkItem(responses.plant_proteins, 'plant_proteins');
    checkItem(responses.processed_foods, 'processed_foods', true); // Inverted

    return feedback;
};
