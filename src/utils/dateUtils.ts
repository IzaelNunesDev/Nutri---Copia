import { differenceInYears, differenceInDays, parseISO, startOfDay } from 'date-fns';

/**
 * Parses a date string into a Date object, ensuring it's treated as local time
 * even if it's in YYYY-MM-DD format (which browsers often parse as UTC).
 */
const parseDateLocal = (dateString: string): Date => {
    if (!dateString) return new Date();

    // If it's YYYY-MM-DD, use the components to create a local date
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
    }

    // Otherwise fall back to date-fns parseISO or native Date
    try {
        const parsed = parseISO(dateString);
        if (!isNaN(parsed.getTime())) return parsed;
    } catch (e) {
        // ignore
    }

    return new Date(dateString);
};


export const calculateAge = (dateString: string): number | null => {
    if (!dateString) return null;
    const birthDate = parseDateLocal(dateString);
    const today = new Date();

    if (isNaN(birthDate.getTime())) return null;

    return differenceInYears(today, birthDate);
};


export const calculateDaysDifference = (earlierDateString: string, laterDateString?: string): number => {
    if (!earlierDateString) return 0;

    const earlier = parseDateLocal(earlierDateString);
    const later = laterDateString ? parseDateLocal(laterDateString) : new Date();

    // Use startOfDay from date-fns for consistency
    return differenceInDays(startOfDay(later), startOfDay(earlier));
}


export const calculateGestationalAgeFromDate = (dum: string, evaluationDate: string = new Date().toISOString()) => {
    if (!dum) return { weeks: 0, days: 0, roundedWeeks: 0, totalDays: 0 };

    // Ajustar o fuso horário para garantir precisão se necessário, mas geralmente setHours(0,0,0,0) resolve
    // Porém, se a string for YYYY-MM-DD, o construtor pode interpretar como UTC.
    // Melhor garantir que ambas sejam interpretadas da mesma forma (Local Time)
    // Para simplificar, vamos assumir strings ISO ou YYYY-MM-DD e usar a lógica de UTC para diferença absoluta

    // Mas differenceInDays do date-fns é robusto. Vamos usar calculateDaysDifference

    const totalDays = calculateDaysDifference(dum, evaluationDate); // (reference - date) = (eval - dum)

    if (totalDays < 0) return { weeks: 0, days: 0, roundedWeeks: 0, totalDays: 0 };

    const weeks = Math.floor(totalDays / 7);
    const days = totalDays % 7;

    // FIGO rounding: if days >= 4, add 1 to weeks
    const roundedWeeks = days >= 4 ? weeks + 1 : weeks;

    return {
        weeks,
        days,
        roundedWeeks,
        totalDays
    };
}
