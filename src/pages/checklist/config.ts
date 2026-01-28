import type { ChecklistItem, PatientData } from './types';

export const getChecklistItems = (patientData: PatientData): ChecklistItem[] => [
    {
        id: 'dietary_pattern',
        category: 'Padrão Alimentar',
        question: 'Você segue alguma dieta ou hábito alimentar específico?',
        type: 'multiple',
        options: [
            'Não',
            'Pescetariana (consome peixes, laticínios e ovos, mas não consome carnes e aves)',
            'Ovolactovegetariana (consome laticínios e ovos, mas não consome carnes, peixes e aves)',
            'Lactovegetariana (consome laticínios, mas não consome carnes, peixes, aves e ovos)',
            'Flexitariana (consome principalmente alimentos de origem vegetal, mas ainda consome produtos de origem animal)',
            'Vegana (não consome nenhum alimento de origem animal)',
            'Isenta de lactose',
            'Isenta de glúten',
            'Outros (alergias, intolerâncias ou preferências)'
        ],
        required: true,
        block: 1
    }, {
        id: 'dietary_pattern_other', // Campo auxiliar, não exibido na lista principal, mas controlado manualmente
        category: 'Padrão Alimentar',
        question: 'Quais outras restrições?',
        type: 'text',
        block: -1 // Hidden from main flow
    },
    {
        id: 'fruits_vegetables', // 2a
        category: 'Qualidade da Dieta',
        question: 'Atualmente, você come frutas ou vegetais (secos, sucos, congelados ou frescos) três ou mais vezes por dia?',
        type: 'boolean',
        required: true,
        block: 1
    },
    {
        id: 'dairy_products', // 2b
        category: 'Qualidade da Dieta',
        question: 'Atualmente, você consome produtos lácteos (leite, coalhada, iogurte ou queijo) pelo menos uma vez por dia?',
        type: 'boolean',
        required: true,
        block: 1
    },
    {
        id: 'whole_grains', // 2c
        category: 'Qualidade da Dieta',
        question: 'Atualmente, você come grãos integrais ou versões "integrais" de alimentos como pão, arroz, macarrão, biscoitos, cereais, aveia, painço ou trigo pelo menos uma vez por dia?',
        type: 'boolean',
        required: true,
        block: 1
    },
    {
        id: 'meat_poultry_eggs', // 2d
        category: 'Qualidade da Dieta',
        question: 'Atualmente, você come carne (porco, boi ou carneiro), aves (frango, capote/galinha da angola ou peru) ou ovos pelo menos duas ou três vezes por semana?',
        type: 'boolean',
        required: true,
        block: 1
    },
    {
        id: 'plant_proteins', // 2e
        category: 'Qualidade da Dieta',
        question: 'Atualmente, você come fontes de proteína vegetariana como leguminosas (feijões, ervilhas, lentilhas ou grão de bico), oleaginosas (castanhas, amendoim, nozes, amêndoas ou avelãs) ou sementes (chia, linhaça, gergelim ou girassol) pelo menos duas ou três vezes por semana?',
        type: 'boolean',
        required: true,
        block: 1
    },
    {
        id: 'fish_consumption', // 2f
        category: 'Qualidade da Dieta',
        question: 'Atualmente, você come peixe pelo menos uma vez por semana?',
        type: 'boolean',
        required: true,
        block: 1
    },
    {
        id: 'processed_foods', // 2g
        category: 'Qualidade da Dieta',
        question: 'Atualmente, você consome alimentos embalados (biscoitos, sanduíches congelados, pizzas congeladas, macarrão instantâneo ou sopas em pó, presunto, mortadela, salame, linguiça, salsicha), bolos, doces ou bebidas adoçadas com açúcar (achocolatados, bebidas lácteas, refrigerantes, sucos em pó ou sucos em caixa) cinco ou mais vezes por semana?',
        type: 'boolean',
        required: true,
        block: 1
    },
    {
        id: 'folic_acid_supplement', // 3a
        category: 'Suplementação',
        question: 'Atualmente, você toma suplemento de ácido fólico?',
        type: 'multiple',
        options: ['Sim', 'Não', 'Não sei'],
        required: true,
        block: 2,
        feedback: [
            {
                condition: (value) => value === 'Não sei' && parseInt(patientData.gestationalWeek) < 14,
                message: 'FAÇA UMA AVALIAÇÃO MAIS APROFUNDADA SOBRE A SUPLEMENTAÇÃO DE ÁCIDO FÓLICO.',
                type: 'recommendation'
            }
        ]
    },
    {
        id: 'iron_supplement', // 3b
        category: 'Suplementação',
        question: 'Atualmente, você toma suplemento de ferro?',
        type: 'multiple',
        options: ['Sim', 'Não', 'Não sei'],
        required: true,
        block: 2,
        feedback: [
            {
                condition: (value) => value === 'Não sei',
                message: 'FAÇA UMA AVALIAÇÃO MAIS APROFUNDADA SOBRE A SUPLEMENTAÇÃO DE FERRO.',
                type: 'recommendation'
            }
        ]
    },
    {
        id: 'calcium_supplement', // 3c
        category: 'Suplementação',
        question: 'Atualmente, você toma suplemento de cálcio?',
        type: 'multiple',
        options: ['Sim', 'Não', 'Não sei'],
        required: true,
        block: 2,
        feedback: [
            {
                condition: (value) => value === 'Não sei',
                message: 'FAÇA UMA AVALIAÇÃO MAIS APROFUNDADA SOBRE A SUPLEMENTAÇÃO DE CÁLCIO.',
                type: 'recommendation'
            }
        ]
    },
    {
        id: 'sun_exposure', // 4
        category: 'Estilo de Vida',
        question: 'Atualmente, você se expõe regularmente ao sol no rosto, nos braços e nas mãos por pelo menos 10 a 15 minutos por dia?',
        type: 'multiple',
        options: ['Sim', 'Não', 'Não sei'],
        required: true,
        block: 3,
        feedback: [
            {
                condition: (value) => value === 'Não sei',
                message: 'FAÇA UMA AVALIAÇÃO MAIS APROFUNDADA SOBRE A EXPOSIÇÃO DA PACIENTE AO SOL.',
                type: 'recommendation'
            }
        ]
    },
    {
        id: 'anemia_test', // 5
        category: 'Exames Laboratoriais',
        question: 'Você fez um exame de sangue para detectar anemia recentemente? Pode ser um exame que analisa o hemograma, a hemoglobina (Hb) ou os níveis de ferro.',
        type: 'multiple',
        options: ['Sim', 'Não', 'Não sei'],
        required: true,
        block: 2
    },
    {
        id: 'physical_activity', // 7
        category: 'Estilo de Vida',
        question: 'Atualmente, você se exercita ou pratica esporte que exija esforço moderado por pelo menos 150 minutos por semana ou que necessite de esforço vigoroso pelo mínimo de 75 minutos por semana? (No esforço moderado, a gestante vai conseguir conversar com dificuldade enquanto se movimenta e não vai conseguir cantar. Já no esforço vigoroso, ela não vai conseguir conversar.)',
        type: 'multiple',
        options: ['Sim', 'Não', 'Não sei'],
        required: true,
        block: 3
    },
    {
        id: 'coffee_tea_consumption', // 8
        category: 'Estilo de Vida',
        question: 'Atualmente, você consome café ou chá?',
        type: 'boolean',
        required: true,
        block: 3
    },
    {
        id: 'substances_use', // 9
        category: 'Estilo de Vida',
        question: 'Atualmente, você consome bebida alcoólica, fuma ou utiliza outras substâncias?',
        type: 'boolean',
        required: true,
        block: 3
    },
    {
        id: 'observations',
        category: 'Observações',
        question: 'Observações adicionais ou condutas recomendadas:',
        type: 'text',
        block: 4
    }
];

// IDs que mostram feedback inline (não devem aparecer na sidebar)
export const INLINE_FEEDBACK_IDS = new Set([
    'folic_acid_supplement',
    'iron_supplement',
    'calcium_supplement',
    'processed_foods',
    'sun_exposure',
    'physical_activity',
    'dietary_pattern',      // Item 1 - Dietas especiais
    'anemia_test',          // Item 5 - Exames
    'coffee_tea_consumption', // Item 8 - Café/Chá
    'fish_consumption',     // Item 2f - Peixe
    'fruits_vegetables',
    'dairy_products',
    'whole_grains',
    'meat_poultry_eggs',
    'plant_proteins'
]);

// IDs of fields with inverted color logic (Yes=Bad, No=Good)
export const INVERTED_COLOR_IDS = new Set([
    'processed_foods',
    'coffee_tea_consumption',
    'substances_use'
]);
