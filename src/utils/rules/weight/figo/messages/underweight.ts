import { CategoryMessages } from '../types';

export const BAIXO_PESO_MESSAGES: CategoryMessages = {
    trim1: {
        adequate: {
            id: 'bp_t1_adequate',
            condition: 'Ganho entre 0.2 e 1.2 kg',
            template: `O ganho de peso até a semana \${semana} foi de \${ganho} kg.
Deve ser recomendado um ganho de peso entre \${meta_min_1tri} e \${meta_max_1tri} kg até as 13 semanas de idade gestacional.`
        },
        // Atingiu máximo do 1º Trimestre (1.2kg) -> Meta vira 2º Tri
        max_reached: {
            id: 'bp_t1_max',
            condition: 'Ganho > 1.2 kg no 1º trimestre',
            template: `O ganho de peso até a semana \${semana} foi de \${ganho} kg.
Portanto, a paciente já ganhou o peso máximo (1,2kg) recomendado para o período.
Assim, deve ser recomendado um ganho de \${meta_min_2tri} a \${meta_max_2tri} kg até as 27 semanas de gravidez.`
        },
        // Atingiu máximo do 2º Trimestre (7.2kg) JÁ NO 1º Tri -> Meta vira 3º Tri (Salto)
        max_reached_next: {
            id: 'bp_t1_max_next',
            condition: 'Ganho >= 7.2 kg no 1º trimestre',
            template: `O ganho de peso até a semana \${semana} foi de \${ganho} kg.
Portanto, a paciente já ganhou o peso máximo (7,2kg) recomendado até as 27 semanas.
Assim, deve ser recomendado um ganho de \${meta_min_3tri} a \${meta_max_3tri} kg até o final da gravidez.`
        },
        loss: {
            id: 'bp_t1_loss',
            condition: 'Perda de peso (ganho < 0)',
            template: `A perda de peso até a semana \${semana} foi de \${ganho} kg.
A perda de peso não é aceitável para pacientes que engravidaram com baixo peso.
Avalie o motivo dessa perda e defina uma conduta para resolução do quadro.
Deve ser recomendado um ganho de \${meta_min_1tri} a \${meta_max_1tri} kg até as 13 semanas de idade gestacional.`
        },
        below: {
            id: 'bp_t1_below',
            condition: 'Ganho < 0.2 kg',
            template: `O ganho de peso até a semana \${semana} foi de \${ganho} kg.
Esse ganho está abaixo do recomendado para a idade gestacional.
Deve ser recomendado um ganho de peso entre \${meta_min_1tri} e \${meta_max_1tri} kg até as 13 semanas de idade gestacional.`
        },
        total_max_reached: {
            id: 'bp_t1_max_total',
            condition: 'Já atingiu 12.2 kg',
            template: `O ganho de peso até a semana \${semana} foi de \${ganho} kg.
Mulheres com baixo peso pré-gestacional devem ter um ganho máximo de 12,2kg na gestação.
Assim, deve ser recomendado um ganho de 242 gramas/semana até o final da gravidez.`
        }
    },

    trim2: {
        adequate: {
            id: 'bp_t2_adequate',
            condition: 'Ganho dentro da faixa esperada',
            template: `O ganho de peso até a semana \${semana} foi de \${ganho} kg.
Deve ser recomendado um ganho de peso entre \${meta_min_2tri} e \${meta_max_2tri} kg até as 27 semanas de idade gestacional.`
        },
        // Atingiu máximo do 2º Trimestre (7.2kg) -> Meta vira 3º Tri
        max_reached: {
            id: 'bp_t2_max',
            condition: 'Já ganhou 7.2 kg',
            template: `O ganho de peso até a semana \${semana} foi de \${ganho} kg.
Portanto, a paciente já ganhou o peso máximo (7,2kg) recomendado para o período.
Assim, deve ser recomendado um ganho de \${meta_min_3tri} a \${meta_max_3tri} kg até o final da gravidez.`
        },
        loss: {
            id: 'bp_t2_loss',
            condition: 'Perda de peso',
            template: `A perda de peso até a semana \${semana} foi de \${ganho} kg.
A perda de peso não é aceitável para pacientes que engravidaram com baixo peso.
Avalie o motivo dessa perda, investigue a presença de hiperêmese gravídica e defina uma conduta para resolução do quadro.
Deve ser recomendado um ganho de \${meta_min_2tri} a \${meta_max_2tri} kg até as 27 semanas de idade gestacional.`
        },
        below: {
            id: 'bp_t2_below',
            condition: 'Ganho abaixo do esperado',
            template: `O ganho de peso até a semana \${semana} foi de \${ganho} kg.
Esse ganho está abaixo do recomendado para a idade gestacional, onde a paciente deveria ter ganho no mínimo \${meta_min_2tri} kg.
Avalie o motivo desse baixo ganho de peso e defina uma conduta para resolução do quadro.
Deve ser recomendado um ganho de \${meta_min_2tri} a \${meta_max_2tri} kg até as 27 semanas de idade gestacional.`
        },
        above: {
            id: 'bp_t2_above',
            condition: 'Ganho acima do esperado para a semana',
            template: `O ganho de peso até a semana \${semana} foi de \${ganho} kg.
Esse ganho está acima do recomendado para a idade gestacional.
Avalie hábitos alimentares e nível de atividade física.
Deve ser recomendado um ganho de \${meta_min_2tri} a \${meta_max_2tri} kg até as 27 semanas de idade gestacional.`
        },
        total_max_reached: {
            id: 'bp_t2_max_total',
            condition: 'Já atingiu 12.2 kg',
            template: `O ganho de peso até a semana \${semana} foi de \${ganho} kg.
Mulheres com baixo peso pré-gestacional devem ter um ganho máximo de 12,2kg na gestação.
Assim, deve ser recomendado um ganho de 242 gramas/semana até o final da gravidez.`
        }
    },

    trim3: {
        adequate: {
            id: 'bp_t3_adequate',
            condition: 'Ganho dentro da faixa',
            template: `O ganho de peso até a semana \${semana} foi de \${ganho} kg.
Deve ser recomendado um ganho de peso entre \${meta_min_3tri} e \${meta_max_3tri} kg até o final da gestação.`
        },
        total_max_reached: {
            id: 'bp_t3_max_total',
            condition: 'Já atingiu 12.2 kg',
            template: `O ganho de peso até a semana \${semana} foi de \${ganho} kg.
Mulheres com baixo peso pré-gestacional devem ter um ganho máximo de 12,2kg na gestação.
Assim, deve ser recomendado um ganho de 242 gramas/semana até o final da gravidez.`
        },
        loss: {
            id: 'bp_t3_loss',
            condition: 'Perda de peso',
            template: `A perda de peso até a semana \${semana} foi de \${ganho} kg.
A perda de peso não é aceitável para pacientes que engravidaram com baixo peso.
Avalie o motivo dessa perda, investigue a presença de hiperêmese gravídica e defina uma conduta para resolução do quadro.
Deve ser recomendado um ganho de \${meta_min_3tri} a \${meta_max_3tri} kg até o final da gravidez.`
        },
        below: {
            id: 'bp_t3_below',
            condition: 'Ganho abaixo do mínimo do 3º tri',
            template: `O ganho de peso até a semana \${semana} foi de \${ganho} kg.
Esse ganho está abaixo do recomendado para a idade gestacional.
Deve ser recomendado um ganho de \${meta_min_3tri} a \${meta_max_3tri} kg até o final da gravidez.`
        },
        // Abaixo do mínimo do 2º Trimestre (Critico)
        below_severe: {
            id: 'bp_t3_below_severe',
            condition: 'Ganho < 5.6 kg (min 2º tri) no 3º trimestre',
            template: `O ganho de peso até a semana \${semana} foi de \${ganho} kg.
Esse ganho está abaixo do recomendado para a idade gestacional, onde a paciente deveria ter ganho no mínimo 5,6 kg.
Avalie o motivo desse baixo ganho de peso e defina uma conduta para resolução do quadro.
Deve ser recomendado um ganho de \${meta_min_3tri} a \${meta_max_3tri} kg até o final da gravidez.`
        }
    }
};
