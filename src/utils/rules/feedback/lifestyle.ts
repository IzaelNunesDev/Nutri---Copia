import { FEEDBACK_CONTENT } from '../constants';
import { FeedbackItem, FeedbackType } from '../types';

export const getSunExposureFeedback = (
    response: 'Sim' | 'Não' | 'Não sei' | null
): FeedbackItem[] => {
    const feedback: FeedbackItem[] = [];

    if (response === 'Não') {
        const item = FEEDBACK_CONTENT.sun_exposure.negative;
        feedback.push({
            id: 'sun_exposure_low',
            title: item.title,
            message: item.content,
            type: item.type as FeedbackType,
            audience: 'both',
            priority: 7
        });
    } else if (response === 'Não sei') {
        feedback.push({
            id: 'sun_exposure_investigate',
            title: 'EXPOSIÇÃO SOLAR - INVESTIGAR',
            message: 'FAÇA UMA AVALIAÇÃO MAIS APROFUNDADA.',
            type: 'clinical',
            audience: 'professional',
            priority: 5
        });
    }

    return feedback;
};

export const getPhysicalActivityFeedback = (
    response: 'Sim' | 'Não' | 'Não sei' | null
): FeedbackItem[] => {
    const feedback: FeedbackItem[] = [];
    const isNo = response === 'Não';
    const isYes = response === 'Sim';
    const isDontKnow = response === 'Não sei';

    if (isNo) {
        const item = FEEDBACK_CONTENT.physical_activity.negative;
        feedback.push({
            id: 'physical_activity_low',
            title: item.title,
            message: item.content,
            type: item.type as FeedbackType,
            audience: 'both',
            priority: 6
        });
    } else if (isYes) {
        const item = FEEDBACK_CONTENT.physical_activity.positive;
        feedback.push({
            id: 'physical_activity_ok',
            title: item.title,
            message: item.content,
            type: item.type as FeedbackType,
            audience: 'patient',
            priority: 1
        });
    } else if (isDontKnow) {
        feedback.push({
            id: 'physical_activity_investigate',
            title: 'ATIVIDADE FÍSICA - INVESTIGAR',
            message: 'FAÇA UMA AVALIAÇÃO MAIS APROFUNDADA.',
            type: 'clinical',
            audience: 'professional',
            priority: 5
        });
    }

    return feedback;
};

export const getSubstanceUseFeedback = (response: boolean | null): FeedbackItem[] => {
    const feedback: FeedbackItem[] = [];

    if (response === true) {
        const item = FEEDBACK_CONTENT.substances.negative;
        feedback.push({
            id: 'substance_use',
            title: item.title,
            message: item.content,
            type: item.type as FeedbackType,
            audience: 'both',
            priority: 10
        });
    } else if (response === false) {
        const item = FEEDBACK_CONTENT.substances.positive;
        feedback.push({
            id: 'substance_use_ok',
            title: item.title,
            message: item.content, // Now using the correct positive method
            type: item.type as FeedbackType,
            audience: 'patient',
            priority: 1
        });
    }

    return feedback;
};

export const getCoffeTeaFeedback = (response: boolean | null): FeedbackItem[] => {
    const feedback: FeedbackItem[] = [];

    if (response === true) {
        const item = FEEDBACK_CONTENT.coffee_tea.positive; // Sim = consome
        feedback.push({
            id: 'coffee_tea',
            title: item.title,
            message: item.content,
            type: item.type as FeedbackType,
            audience: 'patient',
            priority: 4
        });
    } else if (response === false) {
        const item = FEEDBACK_CONTENT.coffee_tea.negative; // Não consome
        feedback.push({
            id: 'coffee_tea_none',
            title: item.title,
            message: item.content,
            type: item.type as FeedbackType,
            audience: 'patient',
            priority: 1
        });
    }

    return feedback;
};
