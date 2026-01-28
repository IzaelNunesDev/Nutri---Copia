import { WeightGainStatus, CategoryLimit, CategoryLimitsMap } from './types';
import { CATEGORY_LIMITS, INTERPOLATION_LANDMARKS, INTERPOLATION_LANDMARKS_SIMPLE } from './data';
import { FIGO_WEIGHT_GAIN_MESSAGES } from './messages';

const formatNumber = (num: number): string => {
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
};

export const calculateExpectedWeightGain = (classification: string, gestationalWeek: number): { min: number; max: number } => {
    const landmarks = INTERPOLATION_LANDMARKS[classification as keyof typeof INTERPOLATION_LANDMARKS];
    if (!landmarks || gestationalWeek < 1) return { min: 0, max: 0 };

    let startWeek: number;
    let endWeek: number;

    if (gestationalWeek <= 13) {
        startWeek = 0;
        endWeek = 13;
    } else if (gestationalWeek <= 27) {
        startWeek = 13;
        endWeek = 27;
    } else if (gestationalWeek <= 40) {
        startWeek = 27;
        endWeek = 40;
    } else {
        return { min: landmarks[40].min, max: landmarks[40].max };
    }

    const startLandmark = landmarks[startWeek as keyof typeof landmarks];
    const endLandmark = landmarks[endWeek as keyof typeof landmarks];

    const ratio = (gestationalWeek - startWeek) / (endWeek - startWeek);

    const expectedMin = startLandmark.min + (endLandmark.min - startLandmark.min) * ratio;
    const expectedMax = startLandmark.max + (endLandmark.max - startLandmark.max) * ratio;

    return {
        min: Math.round(expectedMin * 10) / 10,
        max: Math.round(expectedMax * 10) / 10
    };
};

export const calculateExpectedWeightGainSimple = (gestationalWeek: number, classification: string): { min: number; max: number } => {
    const landmarks = INTERPOLATION_LANDMARKS_SIMPLE[classification as keyof typeof INTERPOLATION_LANDMARKS_SIMPLE];
    if (!landmarks || gestationalWeek < 1) return { min: 0, max: 0 };

    let startWeek: number;
    let endWeek: number;

    if (gestationalWeek <= 13) {
        startWeek = 0;
        endWeek = 13;
    } else if (gestationalWeek <= 27) {
        startWeek = 13;
        endWeek = 27;
    } else if (gestationalWeek <= 40) {
        startWeek = 27;
        endWeek = 40;
    } else {
        return { min: landmarks[40].min, max: landmarks[40].max };
    }

    const startLandmark = landmarks[startWeek as keyof typeof landmarks];
    const endLandmark = landmarks[endWeek as keyof typeof landmarks];

    const ratio = (gestationalWeek - startWeek) / (endWeek - startWeek);

    const expectedMin = startLandmark.min + (endLandmark.min - startLandmark.min) * ratio;
    const expectedMax = startLandmark.max + (endLandmark.max - startLandmark.max) * ratio;

    return {
        min: Math.round(expectedMin * 10) / 10,
        max: Math.round(expectedMax * 10) / 10
    };
};

export const determineWeightGainStatus = (
    classification: string,
    trimester: 1 | 2 | 3,
    currentGain: number,
    gestationalWeek: number
): WeightGainStatus => {
    const limits = CATEGORY_LIMITS[classification] || CATEGORY_LIMITS[classification + ' pré-gestacional'];
    if (!limits) return 'adequate';

    const isBaixoPeso = classification.toLowerCase().includes('baixo');
    const isEutrofia = classification.toLowerCase().includes('eutrofia');
    const isSobrepeso = classification.includes('Sobrepeso');
    const isObesidade = classification.includes('Obesidade');

    if (currentGain >= limits.totalMax) {
        return 'total_max_reached';
    }

    if (trimester === 1) {
        if (isBaixoPeso) {
            if (currentGain < 0) return 'loss';
            if (currentGain >= 0 && currentGain <= limits.trim1.max) return 'adequate';
            if (currentGain >= limits.trim2.max) return 'max_reached_next';
            if (currentGain > limits.trim1.max) return 'max_reached';
            return 'below';
        }
        if (isEutrofia) {
            if (currentGain < limits.trim1.lossLimit) return 'loss_excessive';
            if (currentGain >= limits.trim1.lossLimit && currentGain < 0) return 'loss_acceptable';
            if (currentGain >= 0 && currentGain <= limits.trim1.max) return 'adequate';
            if (currentGain >= limits.trim2.max) return 'max_reached_next';
            if (currentGain > limits.trim1.max) return 'max_reached';
            return 'adequate';
        }
        if (isSobrepeso || isObesidade) {
            if (currentGain < limits.trim1.lossLimit) return 'loss_excessive';
            if (currentGain >= limits.trim1.lossLimit && currentGain <= 0) return 'loss_acceptable';
            if (currentGain > 0 && currentGain < limits.trim2.max) return 'above';
            if (currentGain >= limits.trim2.max) return 'max_reached_next';
            return 'adequate';
        }
    } else if (trimester === 2) {
        if (isBaixoPeso) {
            if (currentGain < 0) return 'loss';
            if (currentGain >= limits.trim2.max) return 'max_reached';
            if (currentGain >= 0 && currentGain < limits.trim2.max) return 'adequate';
            return 'below';
        }
        if (isEutrofia) {
            if (currentGain < limits.trim1.lossLimit) return 'loss_excessive';
            if (currentGain >= limits.trim1.lossLimit && currentGain < 0) return 'loss_acceptable';
            if (currentGain >= limits.trim2.max) return 'max_reached';
            if (currentGain >= 0 && currentGain < limits.trim2.max) return 'adequate';
            return 'below';
        }
        if (isSobrepeso || isObesidade) {
            if (currentGain < limits.trim1.lossLimit) return 'loss_excessive';
            if (currentGain >= limits.trim1.lossLimit && currentGain < 0) return 'loss_acceptable';
            if (currentGain >= limits.trim2.max) return 'max_reached';
            if (currentGain >= 0 && currentGain < limits.trim2.max) return 'adequate';
            return 'below';
        }
    } else {
        if (currentGain < 0) return 'loss';
        // Check severe below using trim2.min as threshold for T3 severe
        if (currentGain < limits.trim2.min) return 'below_severe';
        // Note: 'below' (mild) check is missing in original snippets for T3 generic, mostly relied on 'adequate' fallthrough or specific conditions in original. 
        // Adding check for below min of T3 if needed, but original code snippet simply had 'adequate' fallthrough after severe check.
        // However, messages have 'below' and 'below_severe'.
        // Let's check below T3 min.
        if (currentGain < limits.trim3.min) {
            // If not severe (already checked above), then just below.
            return 'below';
        }

        return 'adequate';
    }

    return 'adequate';
};

interface RedcapCalculations {
    trim1: { min: number; max: number };
    trim2: { min: number; max: number };
    trim3: { min: number; max: number };
}

const calculateRemainingMin = (target: number, current: number): number => {
    const diff = target - current;
    const roundedDiff = Math.round(diff * 10) / 10;
    return roundedDiff > 0 ? roundedDiff : 0;
};

const calculateRemainingMax = (target: number, current: number): number => {
    const diff = target - current;
    return Math.round(diff * 10) / 10;
};

const calculateRedcapValues = (
    limits: CategoryLimit,
    currentGain: number
): RedcapCalculations => {
    return {
        trim1: {
            min: calculateRemainingMin(limits.trim1.min, currentGain),
            max: calculateRemainingMax(limits.trim1.max, currentGain)
        },
        trim2: {
            min: calculateRemainingMin(limits.trim2.min, currentGain),
            max: calculateRemainingMax(limits.trim2.max, currentGain)
        },
        trim3: {
            min: calculateRemainingMin(limits.trim3.min, currentGain),
            max: calculateRemainingMax(limits.trim3.max, currentGain)
        }
    };
};

export const generateFigoWeightGainMessage = (
    context: { semana: number; ganho: number; classification: string; trimester: 1 | 2 | 3 },
    status: WeightGainStatus
): string => {
    let classKey = context.classification;
    if (!CATEGORY_LIMITS[classKey]) classKey += ' pré-gestacional';

    const messages = FIGO_WEIGHT_GAIN_MESSAGES[classKey];
    const limits = CATEGORY_LIMITS[classKey];

    if (!messages || !limits) return '';

    const msgObj = messages[`trim${context.trimester}`][status];
    if (!msgObj) return `Mensagem não encontrada para status: ${status}`;

    const redcapValues = calculateRedcapValues(limits, context.ganho);

    return msgObj.template
        .replace(/\${semana}/g, context.semana.toString())
        .replace(/\${ganho}/g, formatNumber(context.ganho))
        .replace(/\${meta_min_1tri}/g, formatNumber(redcapValues.trim1.min))
        .replace(/\${meta_max_1tri}/g, formatNumber(redcapValues.trim1.max))
        .replace(/\${meta_min_2tri}/g, formatNumber(redcapValues.trim2.min))
        .replace(/\${meta_max_2tri}/g, formatNumber(redcapValues.trim2.max))
        .replace(/\${meta_min_3tri}/g, formatNumber(redcapValues.trim3.min))
        .replace(/\${meta_max_3tri}/g, formatNumber(redcapValues.trim3.max))
        .replace(/\${total_max}/g, formatNumber(limits.totalMax))
        .replace(/\${taxa_semanal}/g, limits.weeklyRateGrams.toString());
};

export const getFigoWeightGainFeedback = (
    classification: string,
    trimester: 1 | 2 | 3,
    gestationalWeek: number,
    currentGain: number,
    _expectedMin: number,
    _expectedMax: number
): { status: WeightGainStatus; message: string } => {
    const status = determineWeightGainStatus(classification, trimester, currentGain, gestationalWeek);
    const message = generateFigoWeightGainMessage(
        { semana: gestationalWeek, ganho: currentGain, classification, trimester },
        status
    );
    return { status, message };
};
