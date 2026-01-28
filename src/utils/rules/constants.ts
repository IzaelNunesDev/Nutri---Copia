import type { WeightGainGuidelines } from './types';

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
    // ITEM 1: Dieta Especial (Handled in diet.ts, keeping structure for safety)
    dietary_pattern: {
        vegan: { type: "warning", title: "Dieta Vegana", content: "..." },
        restricted: { type: "info", title: "Dieta com Restrições", content: "..." }
    },

    // ITEM 2A: Frutas e Vegetais
    fruits_vegetables: {
        positive: { // Resposta: SIM
            type: "success",
            title: "Consumo Adequado de Frutas e Vegetais",
            content: `É recomendado manter esse hábito.

Prefira o consumo de vegetais verde-escuros, como brócolis, couve, espinafre, agrião, rúcula, de alimentos vermelho-alaranjados, como abóbora/jerimum, cenoura e tomate e de frutas amarelas e vermelhas, como laranja, mamão, acerola, caju, pêssego, manga, jabuticaba, ameixa, que são alimentos fontes dos nutrientes importantes para a gestação.

Higienização de frutas, verduras e legumes: A fim de evitar a contaminação pelo Toxoplasma goondi (causador da toxoplasmose), é recomendado lavar frutas, legumes ou verduras em água corrente e depois os colocar imersos em uma solução de 1 colher de hipoclorito de sódio ou 1 colher de água sanitária própria para uso em alimentos para um litro de água, por 15 minutos. Após esse período, enxaguar em água corrente. Assim, os alimentos estarão prontos e seguros para o consumo.`
        },
        negative: { // Resposta: NÃO
            type: "critical",
            title: "Baixo Consumo de Frutas e Vegetais",
            content: `SOBRE AS FRUTAS
- Consuma frutas diariamente, de preferência inteiras, em vez de sucos. Priorize as frutas da sua região e que estão na safra. 
- As frutas podem ser consumidas frescas ou secas (desidratadas): no café da manhã e nos lanches entre as refeições, com iogurte natural, leite e aveia ou como cremes; e no almoço e no jantar, em saladas de folhas ou como sobremesas.
- Para evitar o desperdício, opte pelo congelamento das frutas para elas sejam usadas depois em preparações. 
- Prefira as frutas amarelas e vermelhas, como laranja, mamão, acerola, caju, pêssego, manga, jabuticaba, ameixa, que são alimentos fontes dos nutrientes importantes para a gestação;
- Em caso de náuseas, escolha frutas cítricas ou frutas geladas pois podem ser melhor toleradas, como laranja, tangerina, abacaxi e até mesmo a água com limão espremido.

SOBRE VERDURAS E LEGUMES
- Consuma legumes e verduras diariamente no almoço e no jantar. Priorize alimentos da sua região e que estão na safra. 
- Esses alimentos podem ser consumidos em saladas cruas, em preparações quentes (cozidos, refogados, assados, gratinados, empanados, ensopados), em preparações culinárias, como omelete com legumes, arroz com legumes, feijão, bolinho de espinafre, tortas, sopas e, em alguns casos, recheados ou na forma de purês;
- Utilize verduras como temperos naturais, a fim de temperar e realçar o sabor das preparações, como cheiro-verde, alho, cebola, manjericão, gengibre, pimenta-do-reino, cominho, louro, hortelã, jambu, orégano, coentro, alecrim, pimentão, tomate, entre outros); 
- Prefira consumir vegetais verde-escuros, como brócolis, couve, espinafre, agrião, rúcula e alimentos vermelho-alaranjados, como abóbora/jerimum, cenoura e tomate, que são alimentos fontes de nutrientes importantes para a gestação.

Higienização de frutas, verduras e legumes: A fim de evitar a contaminação pelo Toxoplasma goondi (causador da toxoplasmose), é recomendado lavar frutas, legumes ou verduras em água corrente e depois os colocar imersos em uma solução de 1 colher de hipoclorito de sódio ou 1 colher de água sanitária própria para uso em alimentos para um litro de água, por 15 minutos. Após esse período, enxaguar em água corrente. Assim, os alimentos estarão prontos e seguros para o consumo.`
        }
    },
    dairy_products: {
        positive: { // SIM
            type: "success",
            title: "Consumo Adequado de Laticínios",
            content: `É recomendado manter esse hábito. Opte por consumir esses alimentos nos lanches.
Atenção: os laticínios pasteurizados ou UHT e de preferência desnatados ou semidesnatados.`
        },
        negative: { // NÃO
            type: "critical",
            title: "Baixo Consumo de Laticínios",
            content: `Opte por consumir esses alimentos nos lanches.

Se não houver restrições ao consumo de alimentos desse grupo:
- prefira os leites, as coalhadas e os iogurtes em opções semidesnatadas ou desnatadas. 
- consuma de forma menos frequente os queijos.
ATENÇÃO: os laticínios devem ser pasteurizados ou UHT.

Se houver restrições ao consumo de alimentos desse grupo:
- é recomendada a ingestão adequada de alimentos fonte de proteína (animais ou vegetais);
- opte pelo consumo de bebidas vegetais enriquecidas com cálcio nos lanches.`,
            professionalContent: "Avaliar necessidade de suplementação de cálcio e vitamina B12 e monitorar ingestão de cálcio/proteínas."
        }
    },
    whole_grains: {
        positive: { // SIM
            type: "success",
            title: "Consumo Adequado de Cereais Integrais",
            content: `É recomendado manter esse hábito.
Nos lanches: Aveia, quinoa, amaranto, gérmen de trigo, milho, tapioca, cuscuz, preparações caseiras com farinhas de cereais integrais (bolo, biscoito, torrada, pão).
Nas refeições principais (almoço e jantar): Arroz integral ou parboilizado, cuscuz, macarrão integral, quinoa em grão, macaxeira, batata doce, batata baroa, batata inglesa, polenta.`
        },
        negative: { // NÃO
            type: "critical",
            title: "Baixo Consumo de Cereais Integrais",
            content: `Oriente preferir cereais integrais.
Nos lanches: Aveia, quinoa, amaranto, gérmen de trigo, milho, tapioca, cuscuz, preparações caseiras com farinhas de cereais integrais (bolo, biscoito, torrada, pão).
Nas refeições principais (almoço e jantar): Arroz integral ou parboilizado, cuscuz, macarrão integral, quinoa em grão, macaxeira, batata doce, batata baroa, batata inglesa, polenta.`
        }
    },
    meat_poultry_eggs: {
        positive: { // SIM
            type: "success",
            title: "Ingestão Adequada de Carnes/Ovos",
            content: `É recomendado manter esse hábito.
Prefira o consumo de pescado e ovos. 
Sobre as carnes vermelhas ou de aves, prefira os cortes com menos gordura, estes podem ser utilizados no preparo de ensopados. Já cortes mais gordurosos, prefira seu consumo assado, grelhado ou refogado, evitando peles ou gorduras aparentes, utilizando a menor quantidade possível de gordura e sal no seu preparo, priorizando ervas e outros temperos naturais.
ATENÇÃO: EVITE OVOS E CARNES MAL COZIDAS.`
        },
        negative: { // NÃO
            type: "critical",
            title: "Baixa Ingestão de Carnes/Ovos",
            content: `Se não houver restrições ao consumo de alimentos desse grupo, prefira o consumo de pescado e ovos. 
Sobre as carnes vermelhas ou de aves, prefira os cortes com menos gordura, estes podem ser utilizados no preparo de ensopados. Já cortes mais gordurosos, prefira seu consumo assado, grelhado ou refogado, evitando peles ou gorduras aparentes, utilizando a menor quantidade possível de gordura e sal no seu preparo, priorizando ervas e outros temperos naturais.
ATENÇÃO: EVITE OVOS E CARNES MAL COZIDAS.

Se houver restrições ao consumo de alimentos desse grupo, é recomendado o consumo adequado de proteínas vegetais (leguminosas e oleaginosas) e/ou de laticínios.`
        }
    },
    plant_proteins: {
        positive: { // SIM
            type: "success",
            title: "Consumo Adequado de Leguminosas/Oleaginosas",
            content: `- É recomendado manter esse hábito.
- Realize o remolho dos grãos, essa técnica reduz o tempo de cozimento e o desconforto gastrointestinal que esse alimento pode causar, além de melhorar a absorção de seus nutrientes. Os grãos devem ficar imersos em água, antes do cozimento, por período de 6 a 12 horas, com a realização de, pelo menos, uma troca de água nesse intervalo de tempo e descarte dessa água após o tempo de remolho, não devendo ser usada na cocção.
- Consuma na mesma refeição das leguminosas, frutas ricas em vitamina C (laranja, acerola, limão e caju) e frutas ou legumes amarelo-alaranjados ricos em carotenoides (mamão e manga e abóbora e cenoura, principalmente se você não consumir carnes.`
        },
        negative: { // NÃO
            type: "critical",
            title: "Baixo Consumo de Leguminosas/Oleaginosas",
            content: `LEGUMINOSAS:
- Consuma leguminosas (feijão de todas as variedades, lentilha, soja, grão-de-bico, ervilha ou fava) diariamente, de preferência no almoço e no jantar.
- Varie a forma de preparo dessas leguminosas: arroz com feijão, tutu de feijão, feijão tropeiro, baião de dois, podem estar presentes no acarajé, em pastas, sopas e saladas, entre outros.
- Realize o remolho dos grãos, essa técnica reduz o tempo de cozimento e o desconforto gastrointestinal que esse alimento pode causar, além de melhorar a absorção de seus nutrientes. Os grãos devem ficar imersos em água, antes do cozimento, por período de 6 a 12 horas, com a realização de, pelo menos, uma troca de água nesse intervalo de tempo e descarte dessa água após o tempo de remolho, não devendo ser usada na cocção.
- Congele o alimento já preparado para que possa ser consumido ao longo dos dias da semana de forma prática.
- Consuma na mesma refeição das leguminosas, frutas ricas em vitamina C (laranja, acerola, limão e caju) e frutas ou legumes amarelo-alaranjados ricos em carotenoides (mamão e manga e abóbora e cenoura, principalmente se você não consumir carnes.

OLEAGINOSAS:
- Consuma sementes e castanhas, com frutas, iogurtes, saladas, preparações, entre outros.`
        }
    },
    fish_consumption: {
        positive: { // SIM
            type: "success",
            title: "Ingestão Semanal de Peixes Adequada",
            content: `É recomendado manter esse hábito.
Prefira peixes como sardinha, cavala, pargo ou atum enlatado.`
        },
        negative: { // NÃO
            type: "critical",
            title: "Baixo Consumo Semanal de Peixe",
            content: `Se não houver restrições ao consumo de alimentos desse grupo, prefira peixes como sardinha, cavala, pargo ou atum enlatado.`,
            professionalContent: "Considere a necessidade de suplementar 200-600mg DHA com selo de isenção de metais pesados; opte por opção de alga para gestante com restrição a peixe."
        }
    },
    processed_foods: {
        positive: { // Resposta: NÃO (O ideal) -> Verde
            type: "success",
            title: "Baixa Ingestão de Ultraprocessados",
            content: `É recomendado manter esse hábito.
Priorizar o consumo de alimentos naturais e comidas caseiras.`
        },
        negative: { // Resposta: SIM (O problema) -> Vermelho/Crítico
            type: "critical",
            title: "Alto Consumo de Ultraprocessados",
            content: `- Evite o consumo de alimentos prontos para o consumo.
No almoço e jantar, prefira comidas caseiras, como arroz e feijão, macarrão, carnes, ovos, legumes e verduras, mandioca, milho, além de frutas como sobremesa.
Nos lanches, prefira o consumo de leite ou iogurte natural (aqueles sem adição de açúcar ou sabor artificial) acompanhado de frutas frescas ou secas, castanhas, amendoim ou nozes, cuscuz, tapioca, pamonha, pão francês, entre outros.
Quando fora de casa, se planeje e leve alimentos saudáveis e práticos para transporte e consumo, como frutas e castanhas.`
        }
    },
    supplements_folic: {
        check_dose: { // SIM
            type: "warning",
            title: "Verificar Dosagem de Ácido Fólico",
            content: "Utilizar suplementação conforme prescrição."
        },
        prescribe: { // NÃO
            type: "critical",
            title: "Suplementação de Ácido Fólico Necessária",
            content: "Utilizar suplementação conforme prescrição."
        }
    },
    supplements_iron: {
        check_dose: { // SIM
            type: "info",
            title: "Verificar Dosagem de Ferro",
            content: `Utilizar suplementação conforme prescrição.
A ingestão do suplemento de ferro deve ocorrer com intervalo mínimo de 2 horas do suplemento de cálcio, pois a absorção do ferro pode ficar diminuída.
Opte por ingerir o suplemento de ferro antes de refeições onde serão consumidas frutas ricas em vitamina C (laranja, acerola, limão, caju, entre outras).`
        },
        prescribe: { // NÃO
            type: "critical",
            title: "Suplementação de Ferro Necessária",
            content: `Utilizar suplementação conforme prescrição.
A ingestão do suplemento de ferro deve ocorrer com intervalo mínimo de 2 horas do suplemento de cálcio, pois a absorção do ferro pode ficar diminuída.
Opte por ingerir o suplemento de ferro antes de refeições onde serão consumidas frutas ricas em vitamina C (laranja, acerola, limão, caju, entre outras).`
        }
    },
    supplements_calcium: {
        check_dose: { // SIM
            type: "info",
            title: "Verificar Dosagem de Cálcio",
            content: `Utilizar suplementação conforme prescrição.
- A ingestão do suplemento de cálcio deve ocorrer com intervalo mínimo de 2 horas do suplemento de ferro (sulfato ferroso) ou de polivitamínicos contendo ferro.
- O suplemento de cálcio não seja ingerido em jejum. 
- Evite a ingestão do suplemento de cálcio junto de alimentos como feijão, fígado, espinafre, acelga, couve, beterraba, batata doce, sementes, castanhas ou cereais, café, alimentos ultraprocessados (alimentos prontos para o consumo e ricos em sal, açúcar e/ou gordura);
- Prefira ingerir o suplemento de cálcio no período da noite acompanhado de um copo de leite ou suco de frutas.`
        },
        prescribe: { // NÃO
            type: "critical",
            title: "Suplementação de Cálcio Necessária",
            content: `Utilizar suplementação conforme prescrição.
- A ingestão do suplemento de cálcio deve ocorrer com intervalo mínimo de 2 horas do suplemento de ferro (sulfato ferroso) ou de polivitamínicos contendo ferro.
- O suplemento de cálcio não seja ingerido em jejum. 
- Evite a ingestão do suplemento de cálcio junto de alimentos como feijão, fígado, espinafre, acelga, couve, beterraba, batata doce, sementes, castanhas ou cereais, café, alimentos ultraprocessados (alimentos prontos para o consumo e ricos em sal, açúcar e/ou gordura);
- Prefira ingerir o suplemento de cálcio no período da noite acompanhado de um copo de leite ou suco de frutas.`
        }
    },
    sun_exposure: {
        negative: { // Resposta: NÃO
            type: "warning",
            title: "Baixa Exposição à Luz Solar",
            content: "Considere a necessidade de suplementar 600-2000UI de vitamina D/dia.",
            professionalContent: "Considere a necessidade de suplementar 600-2000UI de vitamina D/dia."
        }
    },
    physical_activity: {
        positive: { // Resposta: SIM
            type: "success",
            title: "Nível Adequado de Atividade Física",
            content: `Caso não exista contraindicação, pratique atividade física até o dia do parto.
É recomendada a prática de 150 minutos de atividade física moderada ou de 75 minutos de exercício vigoroso por semana.
Mantenha ou aumente a intensidade e o tempo de duração progressivamente, praticando atividades de intensidade moderada, de acordo com a sua capacidade e respeitando seus limites. 
Se você já tiver uma rotina de exercício constante e vigoroso anterior à gravidez, mantenha essa prática de atividades físicas vigorosas na gestação. 
Atividade física moderada ou vigorosa:
* Atividade moderada: é possível conversar com dificuldade enquanto se exercita, mas não é possível cantar. A respiração e os batimentos do coração aumentam moderadamente.
* Atividade vigorosa: não é possível conversar. A respiração fica muito mais rápida que o normal, assim como os batimentos do coração.`
        },
        negative: { // Resposta: NÃO
            type: "critical",
            title: "Inatividade Física",
            content: `Caso não exista contraindicação, pratique atividade física até o dia do parto.
É recomendada a prática de 150 minutos de atividade física moderada ou de 75 minutos de exercício vigoroso por semana.
Se você for sedentária, comece com uma atividade física de intensidade leve e com tempo de menor duração. Aumente a intensidade e o tempo de duração progressivamente, praticando atividades de intensidade leve a moderada, de acordo com a sua capacidade e respeitando seus limites. 
Se você já tiver uma rotina de exercício constante e vigoroso anterior à gestação, mantenha essa prática de atividade física vigorosa na gestação. 
Atividade física moderada ou vigorosa:
* Atividade moderada: é possível conversar com dificuldade enquanto se exercita, mas não é possível cantar. A respiração e os batimentos do coração aumentam moderadamente.
* Atividade vigorosa: não é possível conversar. A respiração fica muito mais rápida que o normal, assim como os batimentos do coração.`
        }
    },
    coffee_tea: {
        positive: { // Resposta: SIM
            type: "info",
            title: "Consumo de Chá/Café",
            content: `SOBRE OS CHÁS:
Consuma apenas chás considerados seguros para a gestação - hortelã, camomila, erva-cidreira e boldo. Outros chás são contraindicados pois podem gerar riscos para a gravidez.

SOBRE O CAFÉ:
A dose máxima segura para consumo de café é de uma xícara por dia. Quantidades maiores podem gerar riscos para a gravidez.`
        },
        negative: { // Resposta: NÃO
            type: "info",
            title: "Sem Consumo de Chá/Café",
            content: `Esses alimentos não precisam ser consumidos na gestação, mas se esse for o seu desejo, aqui vão algumas orientações:
SOBRE OS CHÁS:
Consuma apenas chás considerados seguros para a gestação - hortelã, camomila, erva-cidreira e boldo. Outros chás são contraindicados pois podem gerar riscos para a gravidez.

SOBRE O CAFÉ:
A dose máxima segura para consumo de café é de uma xícara por dia. Quantidades maiores podem gerar riscos para a gravidez.`
        }
    },
    substances: {
        negative: { // Resposta: SIM (Crítico)
            type: "critical",
            title: "Uso de Substâncias Contraindicadas",
            content: `Todas as substâncias lícitas ou ilícitas utilizadas durante a gestação afetam o desenvolvimento do bebê e o colocam em risco.
 
Riscos associados às substâncias de uso mais comuns:
Álcool: aborto, natimorto, baixo peso ao nascer, síndrome alcoólica fetal (alterações mentais e físicas irreversíveis) e paralisia cerebral.
Tabaco: aborto, natimorto, baixo peso ao nascer, descolamento prematuro de placenta, prematuridade e más-formações congênitas.
Maconha: aborto, natimorto, baixo peso ao nascer, restrição de crescimento fetal, descolamento prematuro de placenta, prematuridade e maior necessidade de internação do bebê em unidade de terapia intensiva.
Cocaína e crack: doença renais ou cardíacas no bebê, alterações no perímetro cefálico ao nascer, baixo peso ao nascer, descolamento prematuro de placenta e prematuridade.`
        },
        positive: { // Resposta: NÃO
            type: "success",
            title: "Sem Uso de Substâncias",
            content: "Gestante não faz uso de substâncias contraindicadas para o período."
        }
    }
};
