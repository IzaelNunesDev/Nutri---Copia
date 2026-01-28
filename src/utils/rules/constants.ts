import { WeightGainGuidelines } from './types';

export const DIET_CODES = {
    NAO: '1',           // Não segue dieta específica
    PESCETARIANA: '2',
    OVOLACTOVEGETARIANA: '3',
    LACTOVEGETARIANA: '4',
    FLEXITARIANA: '5',
    VEGANA: '6',
    ISENTA_LACTOSE: '7',
    ISENTA_GLUTEN: '8',
    OUTROS: '9'
} as const;

// Dietas vegetarianas/veganas (para cruzamento com peixes)
export const VEGETARIAN_DIETS = [
    DIET_CODES.OVOLACTOVEGETARIANA,
    DIET_CODES.LACTOVEGETARIANA,
    DIET_CODES.VEGANA
];

// Dietas que podem consumir peixe tradicional
export const OMNIVORE_DIETS = [
    DIET_CODES.NAO,
    DIET_CODES.PESCETARIANA,
    DIET_CODES.FLEXITARIANA,
    DIET_CODES.ISENTA_LACTOSE,
    DIET_CODES.ISENTA_GLUTEN,
    DIET_CODES.OUTROS
];

export const WEIGHT_GAIN_GUIDELINES: Record<string, WeightGainGuidelines> = {
    'Baixo peso pré-gestacional': {
        classification: 'Baixo peso pré-gestacional',
        trim1_min: 0.2,
        trim1_max: 1.2,
        trim2_min: 5.6,
        trim2_max: 7.2,
        trim3_min: 9.7,
        trim3_max: 12.2,
        total_min: 9.7,
        total_max: 12.2,
        weekly_rate_min: 0.242,
        weekly_rate_max: 0.242
    },
    'Eutrofia pré-gestacional': {
        classification: 'Eutrofia pré-gestacional',
        trim1_min: -1.8,
        trim1_max: 0.7,
        trim2_min: 3.1,
        trim2_max: 6.3,
        trim3_min: 8.0,
        trim3_max: 12.0,
        total_min: 8.0,
        total_max: 12.0,
        weekly_rate_min: 0.220,
        weekly_rate_max: 0.420
    },
    'Sobrepeso pré-gestacional': {
        classification: 'Sobrepeso pré-gestacional',
        trim1_min: -1.6,
        trim1_max: -0.05,
        trim2_min: 2.3,
        trim2_max: 3.7,
        trim3_min: 7.0,
        trim3_max: 9.0,
        total_min: 7.0,
        total_max: 9.0,
        weekly_rate_min: 0.175,
        weekly_rate_max: 0.175
    },
    'Obesidade pré-gestacional': {
        classification: 'Obesidade pré-gestacional',
        trim1_min: -1.6,
        trim1_max: -0.05,
        trim2_min: 1.1,
        trim2_max: 2.7,
        trim3_min: 5.0,
        trim3_max: 7.2,
        total_min: 5.0,
        total_max: 7.2,
        weekly_rate_min: 0.125,
        weekly_rate_max: 0.125
    }
};

// Mapeamento das respostas que geram pontos críticos (Score de Risco)
export const CRITICAL_POINTS_MAP = {
    'fruits_vegetables': false, // 2a
    'dairy_products': false,    // 2b
    'whole_grains': false,      // 2c
    'meat_poultry_eggs': false, // 2d
    'plant_proteins': false,    // 2e
    'fish_consumption': 'Não',  // 2f
    'processed_foods': true,     // 2g - sim
    'physical_activity': 'Não', // 7 - não
    'substances_use': true      // 9 - sim
};


export const FEEDBACK_CONTENT = {
    // ITEM 1: Dieta Especial
    dietary_pattern: {
        vegan: {
            type: "warning",
            title: "Dieta Vegana",
            content: `A adesão a uma dieta VEGANA exige ATENÇÃO à ingestão de proteína, de cálcio e de vitamina B12.
      
      Proteína: Oriente o consumo de leguminosas (feijões, ervilha, grão de bico, soja e lentilha) juntamente com cereais (arroz, cuscuz, milho, macarrão, quinoa) nas refeições principais e sementes/oleaginosas nos lanches.
      Cálcio: Oriente o consumo de bebidas vegetais enriquecidas com cálcio.
      Vitamina B12: Oriente a suplementação em dosagem adequada.`
        },
        restricted: { // Para qualquer resposta que não seja 'Não' e não seja 'Vegana'
            type: "info",
            title: "Dieta com Restrições",
            content: "Uma dieta especial bem planejada pode atender a todas as necessidades nutricionais. Verifique as restrições específicas."
        }
    },

    // ITEM 2A: Frutas e Vegetais
    fruits_vegetables: {
        positive: { // Resposta: SIM
            type: "success",
            title: "Consumo Adequado de Frutas e Vegetais",
            content: `Oriente a manutenção desse hábito.
      
      Estimule o consumo de vegetais verde-escuros (brócolis, couve, espinafre), vermelho-aranjados (abóbora, cenoura) e frutas amarelas/vermelhas.
      
      Higienização (Prevenção Toxoplasmose): Lavar em água corrente, deixar 15 min em solução com 1 colher de hipoclorito de sódio/água sanitária para 1 litro de água, e enxaguar novamente.`
        },
        negative: { // Resposta: NÃO
            type: "critical", // Ponto Crítico
            title: "Baixo Consumo de Frutas e Vegetais",
            content: `Possibilidade de baixa ingestão de nutrientes, antioxidantes e fibras. O consumo previne ganho de peso excessivo e constipação.
      
      Frutas: Estimule consumo diário (inteiras ao invés de sucos), frescas ou secas. Em caso de náuseas: frutas cítricas ou geladas.
      Legumes/Verduras: Estimule no almoço e jantar (crus ou cozidos). Use como temperos naturais.
      
      Higienização (Prevenção Toxoplasmose): Lavar em água corrente, deixar 15 min em solução com 1 colher de hipoclorito de sódio/água sanitária para 1 litro de água, e enxaguar novamente.`
        }
    },
    dairy_products: {
        positive: { // Resposta: SIM
            type: "success",
            title: "Consumo Adequado de Laticínios",
            content: `Oriente a manutenção desse hábito.
      Alerte sobre a necessidade do consumo de laticínios pasteurizados ou UHT.`
        },
        negative: { // Resposta: NÃO
            type: "critical", // Ponto Crítico
            title: "Baixo Consumo de Laticínios",
            content: `Possibilidade de baixa ingestão de vitamina B12, cálcio, proteína e iodo.
      
      Se sem restrição: Oriente leite, coalhada, iogurtes e queijos (pasteurizados/UHT).
      Se houver restrição: Avalie ingestão de proteína, B12 (suplemente se necessário) e bebidas vegetais enriquecidas com cálcio.`
        }
    },
    whole_grains: {
        positive: { // Resposta: SIM
            type: "success",
            title: "Consumo Adequado de Cereais Integrais",
            content: "Oriente a manutenção desse hábito."
        },
        negative: { // Resposta: NÃO
            type: "critical", // Ponto Crítico
            title: "Baixo Consumo de Cereais Integrais",
            content: `Possibilidade de baixa ingestão de fibras, vitaminas B e minerais.
      
      Oriente preferir cereais integrais: Aveia, quinoa, milho, arroz integral, cuscuz, batata doce, macaxeira, etc.`
        }
    },
    meat_poultry_eggs: {
        positive: { // Resposta: SIM
            type: "success",
            title: "Ingestão Adequada de Carnes/Ovos",
            content: `Oriente a manutenção desse hábito. Preferir pescados e ovos.
      Carnes vermelhas/aves: Preferir cortes magros, assados/grelhados/ensopados.
      ATENÇÃO: Evitar ovos e carnes mal cozidas.`
        },
        negative: { // Resposta: NÃO
            type: "critical", // Ponto Crítico
            title: "Baixa Ingestão de Carnes/Ovos",
            content: `Possibilidade de baixa ingestão de vitamina B12, ferro e proteína.
      
      Se sem restrição: Preferir pescados, ovos e cortes magros bem cozidos.
      Se houver restrição: Avalie consumo de proteína vegetal e laticínios.`
        }
    },
    plant_proteins: { // "Leguminosas e Oleaginosas"
        positive: { // Resposta: SIM
            type: "success",
            title: "Consumo Adequado de Leguminosas/Oleaginosas",
            content: `Oriente a manutenção desse hábito.
      
      Remolho: Oriente deixar grãos de molho (6-12h) e descartar a água.
      Combinação: Consumir com frutas ricas em Vitamina C (laranja, acerola) para melhorar absorção.`
        },
        negative: { // Resposta: NÃO
            type: "critical", // Ponto Crítico
            title: "Baixo Consumo de Leguminosas/Oleaginosas",
            content: `Possibilidade de baixa ingestão de proteínas, ferro e fibras.
      
      Estimule consumo diário (feijões, lentilha, grão-de-bico).
      Remolho: Obrigatório deixar de molho (6-12h) e descartar água.
      Combinação: Consumir com frutas ricas em Vitamina C na mesma refeição.`
        }
    },

    // ITEM 2F: Peixes
    fish_consumption: {
        positive: { // Resposta: SIM
            type: "success",
            title: "Ingestão Semanal de Peixes Adequada",
            content: `Oriente a manutenção desse hábito.
      Estimule o consumo de peixes gordos (sardinha, cavala, pargo, atum).`
        },
        negative: { // Resposta: NÃO
            type: "critical", // Ponto Crítico
            title: "Baixo Consumo Semanal de Peixe",
            content: `Possibilidade de baixa ingestão de ômega 3, vit D, B12 e iodo.
      
      Se sem restrição: Estimule sardinha, cavala, atum e avalie suplementar 200-600mg DHA.
      Se houver restrição: Avalie suplementar 200-600mg DHA de algas.`
        }
    },
    processed_foods: {
        positive: { // Resposta: NÃO (O ideal)
            type: "success",
            title: "Baixa Ingestão de Ultraprocessados",
            content: "Oriente a manutenção desse hábito. Estimule priorizar alimentos naturais."
        },
        negative: { // Resposta: SIM (O problema)
            type: "critical", // Ponto Crítico
            title: "Alto Consumo de Ultraprocessados",
            content: `Possibilidade de alta ingestão de gordura saturada, açúcar e sal.
      
      Oriente evitar alimentos prontos (biscoitos, congelados, embutidos).
      Priorize comida caseira (arroz, feijão, carnes, legumes) e lanches naturais (frutas, iogurte natural, castanhas).`
        }
    },

    // ITEM 3A: Ácido Fólico
    supplements_folic: {
        check_dose: { // Se SIM e 1º Trimestre
            type: "warning",
            title: "Verificar Dosagem de Ácido Fólico",
            content: "Investigue a dosagem. Suplementação Universal: 400mcg ou 5mg em casos específicos (histórico de defeito do tubo neural, diabetes, anticonvulsivantes)."
        },
        prescribe: { // Se NÃO e 1º Trimestre
            type: "critical",
            title: "Suplementação de Ácido Fólico Necessária",
            content: "Suplemente diariamente 400mcg (universal) ou 5mg (alto risco/histórico familiar/diabetes/uso de anticonvulsivantes)."
        }
    },

    // ITEM 3B: Ferro
    supplements_iron: {
        check_dose: { // Se SIM
            type: "info",
            title: "Verificar Dosagem de Ferro",
            content: `Dose profilática universal: 200mg sulfato ferroso (40mg ferro elementar).
      Ingerir com intervalo de 2h do cálcio. Preferir ingerir antes de frutas ricas em Vitamina C.`
        },
        prescribe: { // Se NÃO
            type: "critical",
            title: "Suplementação de Ferro Necessária",
            content: `Prescreva Dose Profilática Universal: 1 cp de 200mg sulfato ferroso/dia.
      Oriente intervalo de 2h do suplemento de cálcio. Ingerir com fonte de Vitamina C.`
        }
    },

    // ITEM 3C: Cálcio
    supplements_calcium: {
        check_dose: { // Se SIM
            type: "info",
            title: "Verificar Dosagem de Cálcio",
            content: `Dose Universal: 1000mg cálcio elementar/dia.
      Intervalo min de 2h do ferro. Não ingerir em jejum. Evitar com alimentos ricos em fitatos/cafeína.
      Alerta: Hipercalcemia é rara mas requer monitoramento.`
        },
        prescribe: { // Se NÃO
            type: "critical",
            title: "Suplementação de Cálcio Necessária",
            content: `Prescreva 1000mg cálcio elementar ou 2 cp de 1250mg carbonato de cálcio/dia.
      Intervalo min de 2h do ferro. Sugira ingestão à noite com leite/suco. Não ingerir em jejum.`
        }
    },

    // ITEM 4: Sol / Vitamina D
    sun_exposure: {
        negative: { // Resposta: NÃO
            type: "warning",
            title: "Baixa Exposição à Luz Solar",
            content: "Considere a suplementação de Vitamina D."
        }
        // Se SIM, o documento não pede feedback específico
    },
    physical_activity: {
        positive: { // Resposta: SIM
            type: "success",
            title: "Nível Adequado de Atividade Física",
            content: `Se sem contraindicação, manter até o parto.
      Meta: 150min/sem (moderada) ou 75min/sem (vigorosa).
      Moderada: Consegue conversar com dificuldade. Vigorosa: Não consegue conversar.`
        },
        negative: { // Resposta: NÃO
            type: "critical", // Ponto Crítico
            title: "Inatividade Física",
            content: `Se sem contraindicação, estimule o início (leve a moderado).
      Meta: 150min/sem (moderada). Aumentar progressivamente.
      Moderada: Consegue conversar com dificuldade, mas não cantar.`
        }
    },

    // ITEM 8: Café e Chás
    coffee_tea: {
        positive: { // Resposta: SIM
            type: "info",
            title: "Consumo de Chá/Café",
            content: `Chás Seguros: Hortelã, camomila, erva-cidreira, boldo. (Outros contraindicados).
      Café: Máximo 1 xícara/dia.`
        },
        negative: { // Resposta: NÃO
            type: "info",
            title: "Sem Consumo de Chá/Café",
            content: `Não é necessário estimular. Se desejar:
      Chás Seguros: Hortelã, camomila, erva-cidreira, boldo.
      Café: Máximo 1 xícara/dia.`
        }
    },

    // ITEM 9: Substâncias (Lógica Invertida: SIM é Ruim)
    substances: {
        negative: { // Resposta: SIM (Crítico)
            type: "critical", // Ponto Crítico
            title: "Uso de Substâncias Contraindicadas",
            content: `Contraindique totalmente (Álcool, Tabaco, Drogas).
      Riscos: Aborto, baixo peso, SAF, descolamento de placenta, prematuridade.
      Avalie encaminhamento para CAPS AD.`
        },
        positive: { // Resposta: NÃO
            type: "success",
            title: "Sem Uso de Substâncias",
            content: "Gestante não faz uso de substâncias contraindicadas para o período."
        }
    }
};
