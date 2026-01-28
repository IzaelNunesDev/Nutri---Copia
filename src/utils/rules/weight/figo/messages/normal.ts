import { CategoryMessages } from '../types';

export const EUTROFIA_MESSAGES: CategoryMessages = {
    trim1: {
        adequate: {
            id: 'eut_t1_adequate',
            condition: 'Ganho entre -1.8 e 0.7 kg',
            template: `O ganho de peso até a semana \${semana} foi de \${ganho} kg.
Deve ser recomendado um ganho de no máximo \${meta_max_1tri} kg até as 13 semanas de idade gestacional.`
        },
        max_reached: {
            id: 'eut_t1_max',
            condition: 'Ganho > 0.7 kg',
            template: `O ganho de peso até a semana \${semana} foi de \${ganho} kg.
Portanto, a paciente já ganhou o peso máximo (0,7 kg) recomendado para o período.
Assim, deve ser recomendado um ganho de \${meta_min_2tri} a \${meta_max_2tri} kg até as 27 semanas de gravidez.`
        },
        // Salto: Atingiu meta do 2º tri (6.3kg) no 1º tri
        max_reached_next: {
            id: 'eut_t1_max_next',
            condition: 'Ganho >= 6.3 kg',
            template: `O ganho de peso até a semana \${semana} foi de \${ganho} kg.
Portanto, a paciente já ganhou o peso máximo (6,3 kg) recomendado para o período.
Assim, deve ser recomendado um ganho de \${meta_min_3tri} a \${meta_max_3tri} kg até o final da gravidez.`
        },
        loss_acceptable: {
            id: 'eut_t1_loss_ok',
            condition: 'Perda até -1.8 kg',
            template: `A perda de peso até a semana \${semana} foi de \${ganho} kg.
A perda de até 1,8 kg é aceitável no primeiro trimestre.
Avalie o motivo dessa perda e defina uma conduta para resolução do quadro.
Deve ser recomendado um ganho de \${meta_min_1tri} a \${meta_max_1tri} kg até as 13 semanas de idade gestacional.`
        },
        loss_excessive: {
            id: 'eut_t1_loss_excessive',
            condition: 'Perda > 1.8 kg',
            template: `A perda de peso até a semana \${semana} foi de \${ganho} kg.
A perda de peso foi excessiva. É aceitável uma perda de no máximo 1,8 kg para pacientes que engravidaram com eutrofia.
Avalie o motivo dessa perda e defina uma conduta para resolução do quadro.
Deve ser recomendado um ganho de \${meta_min_1tri} a \${meta_max_1tri} kg até as 13 semanas de idade gestacional.`
        },
        total_max_reached: {
            id: 'eut_t1_max_total',
            condition: 'Já atingiu 12.0 kg',
            template: `O ganho de peso até a semana \${semana} foi de \${ganho} kg.
Mulheres que com eutrofia pré-gestacional devem ter um ganho máximo de 12 kg na gestação.
Assim, deve ser recomendado um ganho de 200 gramas/semana até o final da gravidez.`
        }
    },

    trim2: {
        adequate: {
            id: 'eut_t2_adequate',
            condition: 'Ganho dentro da faixa',
            template: `O ganho de peso até a semana \${semana} foi de \${ganho} kg.
Deve ser recomendado um ganho de peso entre \${meta_min_2tri} e \${meta_max_2tri} kg até as 27 semanas de idade gestacional.`
        },
        max_reached: {
            id: 'eut_t2_max',
            condition: 'Ganho >= 6.3 kg',
            template: `O ganho de peso até a semana \${semana} foi de \${ganho} kg.
Portanto, a paciente já ganhou o peso máximo (6,3 kg) recomendado para o período.
Assim, deve ser recomendado um ganho de \${meta_min_3tri} a \${meta_max_3tri} kg até o final da gravidez.`
        },
        loss_excessive: {
            id: 'eut_t2_loss_excessive',
            condition: 'Perda excessiva',
            template: `A perda de peso até a semana \${semana} foi de \${ganho} kg.
A perda de peso foi excessiva. É aceitável uma perda de no máximo 1,8 kg para pacientes que engravidaram com eutrofia.
Avalie o motivo dessa perda, investigue a presença de hiperêmese gravídica e defina uma conduta para resolução do quadro.
Deve ser recomendado um ganho de \${meta_min_2tri} a \${meta_max_2tri} kg até as 27 semanas de idade gestacional.`
        },
        loss_acceptable: {
            id: 'eut_t2_loss_ok',
            condition: 'Perda aceitável (trazida do 1º tri)',
            template: `A perda de peso até a semana \${semana} foi de \${ganho} kg.
Essa perda de peso é aceitável no primeiro trimestre. O ganho de peso é recomendado a partir das 14 semanas de idade gestacional.
Assim, deve ser recomendado um ganho de \${meta_min_2tri} a \${meta_max_2tri} kg até as 27 semanas de idade gestacional.`
        },
        below: {
            id: 'eut_t2_below',
            condition: 'Ganho abaixo do mínimo',
            template: `O ganho de peso até a semana \${semana} foi de \${ganho} kg.
Esse ganho está abaixo do recomendado para a idade gestacional.
Avalie o motivo desse baixo ganho de peso e defina uma conduta para resolução do quadro.
Deve ser recomendado um ganho de \${meta_min_2tri} a \${meta_max_2tri} kg até as 27 semanas de gravidez.`
        },
        above: {
            id: 'eut_t2_above',
            condition: 'Ganho acima do esperado para a semana',
            template: `O ganho de peso até a semana \${semana} foi de \${ganho} kg.
Esse ganho está acima do recomendado para a idade gestacional.
Avalie hábitos alimentares e nível de atividade física.
Deve ser recomendado um ganho de \${meta_min_2tri} a \${meta_max_2tri} kg até as 27 semanas de idade gestacional.`
        },
        total_max_reached: {
            id: 'eut_t2_max_total',
            condition: 'Já atingiu 12 kg',
            template: `O ganho de peso até a semana \${semana} foi de \${ganho} kg.
Mulheres que com eutrofia pré-gestacional devem ter um ganho máximo de 12 kg na gestação.
Assim, deve ser recomendado um ganho de 200 gramas/semana até o final da gravidez.`
        }
    },

    trim3: {
        adequate: {
            id: 'eut_t3_adequate',
            condition: 'Ganho dentro da faixa',
            template: `O ganho de peso até a semana \${semana} foi de \${ganho} kg.
Deve ser orientado um ganho de peso \${meta_min_3tri} e \${meta_max_3tri} kg até o final da gestação.`
        },
        total_max_reached: {
            id: 'eut_t3_max_total',
            condition: 'Já atingiu 12 kg',
            template: `O ganho de peso até a semana \${semana} foi de \${ganho} kg.
Mulheres que com eutrofia pré-gestacional devem ter um ganho máximo de 12 kg na gestação.
Assim, deve ser recomendado um ganho de 200 gramas/semana até o final da gravidez.`
        },
        below: {
            id: 'eut_t3_below',
            condition: 'Ganho abaixo do mínimo',
            template: `O ganho de peso até a semana \${semana} foi de \${ganho} kg.
Esse ganho está abaixo do recomendado para a idade gestacional.
Deve ser recomendado um ganho de \${meta_min_3tri} a \${meta_max_3tri} kg até o final da gravidez.`
        },
        // Crítico: Abaixo do mínimo do 2º tri
        below_severe: {
            id: 'eut_t3_below_severe',
            condition: 'Ganho < 3.1 kg',
            template: `O ganho de peso até a semana \${semana} foi de \${ganho} kg.
Esse ganho está abaixo do recomendado para a idade gestacional, onde a paciente deveria ter ganho no mínimo 3,1 kg.
Avalie o motivo desse baixo ganho de peso e defina uma conduta para resolução do quadro.
Deve ser recomendado um ganho de \${meta_min_3tri} a \${meta_max_3tri} kg até o final da gravidez.`
        },
        loss: {
            id: 'eut_t3_loss',
            condition: 'Perda de peso',
            template: `A perda de peso até a semana \${semana} foi de \${ganho} kg.
Até esse momento de gestação, a paciente deveria ter ganho no mínimo 3,1 kg.
Avalie o motivo dessa perda de peso até o momento atual. Se sintomas de náuseas e vômitos, investigue hiperêmese gravídica.
Defina uma conduta para resolução do quadro.
Deve ser recomendado um ganho de \${meta_min_3tri} a \${meta_max_3tri} kg até o final da gravidez.`
        }
    }
};
