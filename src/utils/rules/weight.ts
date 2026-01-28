import { calculateExpectedWeightGain, getFigoWeightGainFeedback } from './weight/figo';

/**
 * Gera a recomendação textual de ganho de peso baseado nas 40 mensagens literais do PDF FIGO
 * Usa o módulo figoWeightGainMessages.ts para mensagens exatas (páginas 5-11 do PDF)
 */
export const generateWeightGainRecommendation = (
    imcClassification: string | null,
    weightGain: number | null,
    gestationalWeek: number | null,
    trimester: 1 | 2 | 3 | null
): string | null => {
    if (!imcClassification || weightGain === null || !gestationalWeek || !trimester) {
        return null;
    }

    // Calcular ganho esperado para a semana atual (para passar ao determineStatus)
    const { min: expectedMin, max: expectedMax } = calculateExpectedWeightGain(imcClassification, gestationalWeek);

    // Usar o novo módulo FIGO para obter a mensagem literal
    const { message } = getFigoWeightGainFeedback(
        imcClassification,
        trimester,
        gestationalWeek,
        weightGain,
        expectedMin,
        expectedMax
    );

    // Montar mensagem final com contexto
    // CORREÇÃO UX: Não incluir cabeçalho repetitivo "Situação Atual...". O layout já mostra o ganho.
    return message;
};
