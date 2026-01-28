/**
 * ====================================================================
 * RECOMENDAÇÕES DIETÉTICAS - LISTA DE VERIFICAÇÃO NUTRICIONAL FIGO
 * ====================================================================
 * 
 * Textos extraídos do PDF "ListaDeVerificaONutricionalFIG.pdf" (Páginas 12-16)
 * Estes são os textos exatos a serem exibidos no "Plano de Cuidados"
 * quando a resposta do checklist for "Não"
 */

export interface DietaryRecommendation {
    id: string;
    question: string;
    trigger: 'Não' | 'Sim' | 'Não sei';
    professionalAlert: string;
    patientGuideline: string;
    citation?: string;
}

// Item 2a - Frutas e Vegetais
export const FRUITS_VEGETABLES_RECOMMENDATION: DietaryRecommendation = {
    id: 'item2a',
    question: 'Consome frutas e vegetais diariamente (3 ou mais porções)?',
    trigger: 'Não',
    professionalAlert: 'BAIXO CONSUMO DIÁRIO DE FRUTAS E VEGETAIS. Possibilidade de baixa ingestão de antioxidantes, micronutrientes e fibras.',
    patientGuideline: `Estimule o consumo diário de frutas, sendo preferencialmente inteiras, em vez de sucos. 
Valorize as frutas da região. Explique que as frutas podem ser consumidas frescas ou secas (desidratadas), 
no café da manhã, no almoço e no jantar.

Se a gestante tem queixa de náuseas, oriente frutas cítricas ou frutas geladas pois podem ser mais bem toleradas.`,
    citation: 'Página 12 do PDF'
};

// Item 2b - Laticínios
export const DAIRY_RECOMMENDATION: DietaryRecommendation = {
    id: 'item2b',
    question: 'Consome laticínios diariamente (leite, iogurte, queijo)?',
    trigger: 'Não',
    professionalAlert: 'Possibilidade de baixa ingestão de vitamina B12, cálcio, proteína e iodo.',
    patientGuideline: `Se não houver restrições ao consumo de alimentos desse grupo, oriente o consumo nos lanches 
de leites, coalhadas ou iogurtes semidesnatados ou desnatados e o consumo menos frequente de queijos.

Considere a necessidade de prescrever suplementos de cálcio.`,
    citation: 'Página 12 do PDF'
};

// Item 2c - Cereais Integrais
export const WHOLE_GRAINS_RECOMMENDATION: DietaryRecommendation = {
    id: 'item2c',
    question: 'Consome cereais integrais diariamente?',
    trigger: 'Não',
    professionalAlert: 'Possibilidade de baixa ingestão de fibras, vitaminas B e minerais.',
    patientGuideline: `Oriente preferir cereais integrais (arroz, macarrão, pão, aveia) e a farinha de trigo integral. 
O arroz parboilizado é também uma boa alternativa.`,
    citation: 'Página 13 do PDF'
};

// Item 2d - Carnes, Aves e Ovos
export const MEAT_EGGS_RECOMMENDATION: DietaryRecommendation = {
    id: 'item2d',
    question: 'Consome carnes, aves ou ovos semanalmente?',
    trigger: 'Não',
    professionalAlert: 'Possibilidade de baixa ingestão de vitamina B12, ferro e proteína.',
    patientGuideline: `Se não houver restrições ao consumo de alimentos desse grupo, oriente preferir o consumo 
de pescado e ovos. Se houver restrições, avalie o consumo de alimentos fonte de proteína vegetal e de laticínios.`,
    citation: 'Página 13 do PDF'
};

// Item 2e - Leguminosas
export const LEGUMES_RECOMMENDATION: DietaryRecommendation = {
    id: 'item2e',
    question: 'Consome leguminosas (feijão, lentilha, grão-de-bico)?',
    trigger: 'Não',
    professionalAlert: 'Possibilidade de baixa ingestão de proteínas vegetais, ferro e fibras.',
    patientGuideline: `Estimule o consumo diário de leguminosas, preferencialmente no almoço e no jantar.

Oriente sobre o remolho dos grãos (de 6 a 12 horas) para reduzir o tempo de cozimento e melhorar a absorção dos nutrientes.

Oriente consumir na mesma refeição das leguminosas, frutas ricas em vitamina C (laranja, acerola, limão e caju).`,
    citation: 'Página 14 do PDF'
};

// Item 2f - Peixes
export const FISH_RECOMMENDATION: DietaryRecommendation = {
    id: 'item2f',
    question: 'Consome peixes pelo menos 1 vez por semana?',
    trigger: 'Não',
    professionalAlert: 'Possibilidade de baixa ingestão de ácidos graxos ômega 3/ômega 6, vitamina D, proteína, vitamina B12 e iodo.',
    patientGuideline: `Estimule o consumo de peixes gordos como sardinha, cavala, pargo ou atum enlatado.

Avalie a necessidade de suplementar entre 200 - 600mg de DHA com certificação de isenção de metais pesados.

Para dietas vegetarianas/veganas: suplementar DHA de ALGAS com certificado de isenção de metais pesados.`,
    citation: 'Página 14 do PDF'
};

// Item 2g - Ultraprocessados
export const ULTRAPROCESSED_RECOMMENDATION: DietaryRecommendation = {
    id: 'item2g',
    question: 'Limita o consumo de alimentos ultraprocessados?',
    trigger: 'Não', // Se responde "Não" (não limita), então consome muito
    professionalAlert: 'Possibilidade de alta ingestão de gordura saturada, açúcar e sal.',
    patientGuideline: `Oriente evitar o consumo de alimentos prontos para o consumo.

Aconselhe preferir no almoço e no jantar, o consumo de comida caseira, como arroz e feijão, macarrão, 
carnes, ovos, legumes e verduras.

Nos lanches, preferir o consumo de leite ou iogurte natural acompanhado de frutas frescas ou secas, 
castanhas, amendoim ou nozes, cuscuz, tapioca, pão francês, entre outros.`,
    citation: 'Página 15 do PDF'
};

// Suplementação - Ferro
export const IRON_SUPPLEMENT_RECOMMENDATION: DietaryRecommendation = {
    id: 'item3b',
    question: 'Faz uso de suplementação de ferro?',
    trigger: 'Não',
    professionalAlert: 'SUPLEMENTAÇÃO UNIVERSAL DE FERRO - Paciente não está suplementando ferro.',
    patientGuideline: `Dose profilática - 1 comprimido de 200mg de sulfato ferroso por dia (40mg de ferro elementar).

Oriente que a ingestão do suplemento de ferro ocorra com intervalo mínimo de 2 horas do suplemento de cálcio, 
pois a absorção do ferro pode ficar diminuída.

Aconselhe que a ingestão seja realizada antes de refeições onde serão consumidas 
frutas ricas em vitamina C (laranja, acerola, limão e caju).`,
    citation: 'Página 15 do PDF'
};

// Suplementação - Ácido Fólico
export const FOLIC_ACID_RECOMMENDATION: DietaryRecommendation = {
    id: 'item3a',
    question: 'Faz uso de suplementação de ácido fólico?',
    trigger: 'Não',
    professionalAlert: 'SUPLEMENTAÇÃO UNIVERSAL DE ÁCIDO FÓLICO - Crítico especialmente no 1º trimestre.',
    patientGuideline: `Suplemente diariamente 400mcg de ácido fólico ou 5mg de ácido fólico em caso de mulheres com:

• Um dos pais com histórico pessoal de defeito do tubo neural;
• História prévia de gestação acometida por defeito do tubo neural;
• Histórico familiar com defeito do tubo neural em parente de segundo ou terceiro grau;
• Uso de terapia medicamentosa de anticonvulsivantes com ácido valpróico e carbamazepina;
• Condições médicas maternas associadas à diminuição de absorção de ácido fólico;
• Diabetes mellitus pré-gestacional.`,
    citation: 'Página 16 do PDF'
};

// Suplementação - Cálcio
export const CALCIUM_RECOMMENDATION: DietaryRecommendation = {
    id: 'item3c',
    question: 'Faz uso de suplementação de cálcio?',
    trigger: 'Não',
    professionalAlert: 'SUPLEMENTAÇÃO UNIVERSAL DE CÁLCIO - Avaliar necessidade de prescrição.',
    patientGuideline: `Prescreva 1000mg de cálcio elementar ou 2 comprimidos de 1250mg de carbonato de cálcio por dia.

Oriente que a ingestão do suplemento de cálcio ocorra com intervalo mínimo de 2 horas do suplemento de ferro.

Recomende que o cálcio não seja ingerido em jejum. Evitar a ingestão com alimentos ricos em fitatos, 
oxalatos ou ferro (feijão, fígado, espinafre, acelga, couve, beterraba, batata doce, sementes, 
castanhas ou cereais), bem como deve-se evitar a ingestão com alta ingestão de cafeína e ultraprocessados.

Sugira a ingestão no período da noite com um copo de leite ou suco de frutas.

ALERTA: A hipercalcemia gestacional é rara, mas pode estar relacionada a complicações materno-fetais.`,
    citation: 'Página 16 do PDF'
};

// ====================================================================
// TABELAS DE GANHO DE PESO - Diretrizes Kac et al./MS 2022
// ====================================================================

export interface WeightGainGuideline {
    classification: string;
    imcRange: string;
    imcMin: number;
    imcMax: number;
    milestones: {
        week13: { min: number; max: number };
        week27: { min: number; max: number };
        week40: { min: number; max: number };
    };
    weeklyRate: number; // kg/semana após 1º trimestre
    weeklyRateGrams: number; // g/semana
}

export const WEIGHT_GAIN_GUIDELINES: WeightGainGuideline[] = [
    {
        classification: 'Baixo peso',
        imcRange: '< 18,5',
        imcMin: 0,
        imcMax: 18.5,
        milestones: {
            week13: { min: 0.2, max: 1.2 },
            week27: { min: 5.6, max: 7.2 },
            week40: { min: 9.7, max: 12.2 }
        },
        weeklyRate: 0.242,
        weeklyRateGrams: 242
    },
    {
        classification: 'Eutrofia',
        imcRange: '18,5 - 24,9',
        imcMin: 18.5,
        imcMax: 25,
        milestones: {
            week13: { min: 0.2, max: 1.2 },
            week27: { min: 3.1, max: 6.3 },
            week40: { min: 8.0, max: 12.0 }
        },
        weeklyRate: 0.200,
        weeklyRateGrams: 200
    },
    {
        classification: 'Sobrepeso',
        imcRange: '25 - 29,9',
        imcMin: 25,
        imcMax: 30,
        milestones: {
            week13: { min: -1.6, max: -0.05 },
            week27: { min: 2.3, max: 3.7 },
            week40: { min: 7.0, max: 9.0 }
        },
        weeklyRate: 0.175,
        weeklyRateGrams: 175
    },
    {
        classification: 'Obesidade',
        imcRange: '≥ 30',
        imcMin: 30,
        imcMax: 999,
        milestones: {
            week13: { min: -1.6, max: -0.05 },
            week27: { min: 2.7, max: 4.2 },
            week40: { min: 5.0, max: 7.2 }
        },
        weeklyRate: 0.125,
        weeklyRateGrams: 125
    }
];

// ====================================================================
// FUNÇÃO AUXILIAR - Obter guideline por IMC
// ====================================================================

export const getWeightGainGuidelineByIMC = (imc: number): WeightGainGuideline | null => {
    return WEIGHT_GAIN_GUIDELINES.find(
        g => imc >= g.imcMin && imc < g.imcMax
    ) || null;
};

// ====================================================================
// FUNÇÃO AUXILIAR - Arredondamento de semana gestacional (Regra FIGO)
// ====================================================================

/**
 * Regra de arredondamento da semana gestacional conforme PDF (Página 4):
 * - Se 1, 2 ou 3 dias -> mantém a semana atual
 * - Se 4, 5 ou 6 dias -> arredonda para a próxima semana
 */
export const roundGestationalWeek = (weeks: number, days: number): number => {
    if (days >= 4) {
        return weeks + 1;
    }
    return weeks;
};
