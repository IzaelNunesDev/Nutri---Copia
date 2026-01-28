import { CategoryMessages } from '../types';
import { BAIXO_PESO_MESSAGES } from './underweight';
import { EUTROFIA_MESSAGES } from './normal';
import { SOBREPESO_MESSAGES } from './overweight';
import { OBESIDADE_MESSAGES } from './obesity';

export const FIGO_WEIGHT_GAIN_MESSAGES: Record<string, CategoryMessages> = {
    'Baixo peso pré-gestacional': BAIXO_PESO_MESSAGES,
    'Eutrofia pré-gestacional': EUTROFIA_MESSAGES,
    'Sobrepeso pré-gestacional': SOBREPESO_MESSAGES,
    'Obesidade pré-gestacional': OBESIDADE_MESSAGES,
    // Aliases
    'Baixo peso': BAIXO_PESO_MESSAGES,
    'Eutrofia': EUTROFIA_MESSAGES,
    'Sobrepeso': SOBREPESO_MESSAGES,
    'Obesidade': OBESIDADE_MESSAGES
};
