import { FEEDBACK_CONTENT } from '../constants';
import type { FeedbackItem, FeedbackType } from '../types';

export const getFolicAcidFeedback = (
    response: 'Sim' | 'Não' | 'Não sei' | null,
    _gestationalWeek: number | null
): FeedbackItem[] => {
    const feedback: FeedbackItem[] = [];

    if (response === 'Sim') {
        const item = FEEDBACK_CONTENT.supplements_folic.check_dose;
        feedback.push({
            id: 'folic_acid_check',
            title: item.title,
            message: item.content,
            patientMessage: item.content,
            type: item.type as FeedbackType,
            audience: 'patient',
            priority: 5
        });
    } else if (response === 'Não') {
        const item = FEEDBACK_CONTENT.supplements_folic.prescribe;
        feedback.push({
            id: 'folic_acid_prescribe',
            title: item.title,
            message: item.content,
            patientMessage: item.content,
            type: item.type as FeedbackType,
            audience: 'patient',
            priority: 10
        });
    } else if (response === 'Não sei') {
        feedback.push({
            id: 'folic_acid_investigate',
            title: 'Ácido Fólico - Investigar',
            message: 'Faça uma avaliação mais aprofundada.',
            type: 'investigate' as any,
            audience: 'professional',
            priority: 9
        });
    }

    return feedback;
};

export const getIronSupplementFeedback = (
    response: 'Sim' | 'Não' | 'Não sei' | null
): FeedbackItem[] => {
    const feedback: FeedbackItem[] = [];

    if (response === 'Sim') {
        const item = FEEDBACK_CONTENT.supplements_iron.check_dose;
        feedback.push({
            id: 'iron_check',
            title: item.title,
            message: item.content,
            patientMessage: item.content,
            type: item.type as FeedbackType,
            audience: 'patient',
            priority: 5
        });
    } else if (response === 'Não') {
        const item = FEEDBACK_CONTENT.supplements_iron.prescribe;
        feedback.push({
            id: 'iron_prescribe',
            title: item.title,
            message: item.content,
            patientMessage: item.content,
            type: item.type as FeedbackType,
            audience: 'patient',
            priority: 10
        });
    } else if (response === 'Não sei') {
        feedback.push({
            id: 'iron_investigate',
            title: 'Ferro - Investigar',
            message: 'Faça uma avaliação mais aprofundada.',
            type: 'investigate' as any,
            audience: 'professional',
            priority: 8
        });
    }

    return feedback;
};

export const getCalciumSupplementFeedback = (
    response: 'Sim' | 'Não' | 'Não sei' | null
): FeedbackItem[] => {
    const feedback: FeedbackItem[] = [];

    if (response === 'Sim') {
        const item = FEEDBACK_CONTENT.supplements_calcium.check_dose;
        feedback.push({
            id: 'calcium_check',
            title: item.title,
            message: item.content,
            patientMessage: item.content,
            type: item.type as FeedbackType,
            audience: 'patient',
            priority: 5
        });
    } else if (response === 'Não') {
        const item = FEEDBACK_CONTENT.supplements_calcium.prescribe;
        feedback.push({
            id: 'calcium_prescribe',
            title: item.title,
            message: item.content,
            patientMessage: item.content,
            type: item.type as FeedbackType,
            audience: 'patient',
            priority: 10
        });
    } else if (response === 'Não sei') {
        feedback.push({
            id: 'calcium_investigate',
            title: 'Cálcio - Investigar',
            message: 'Faça uma avaliação mais aprofundada.',
            type: 'investigate' as any,
            audience: 'professional',
            priority: 6
        });
    }

    return feedback;
};
