import { FeedbackItem, FeedbackType } from '../types';

export const getAnemiaTestFeedback = (
    response: 'Sim' | 'Não' | 'Não sei' | null
): FeedbackItem[] => {
    const feedback: FeedbackItem[] = [];

    if (response === 'Sim') {
        feedback.push({
            id: 'anemia_test_review',
            title: 'Exame de Anemia - Registrar Valores',
            message: 'VALORES SÉRICOS REGISTRADOS. Avalie hemograma para presença de anemia.',
            type: 'normal',
            audience: 'professional',
            priority: 7,
            requiresInput: true,
            inputFields: ['hemoglobina', 'hematocrito', 'ferritina', 'data_exame']
        });
    } else if (response === 'Não' || response === 'Não sei') {
        feedback.push({
            id: 'anemia_test_request',
            title: 'SOLICITAR EXAMES',
            message: 'SOLICITE EXAMES.',
            type: 'recommendation',
            audience: 'professional',
            priority: 9
        });
    }

    return feedback;
};
