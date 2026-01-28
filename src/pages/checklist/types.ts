export interface PatientData {
    id: string;
    name: string;
    email: string;
    birthDate: string;
    age: string;
    gestationalWeek: string;
    currentWeight: string;
    height: string;
    preGestationalWeight: string;
    isReturningPatient: boolean;
    hasRecordedWeight: boolean;
    phone: string;
    address: string;
    // Campos de gestação (Backbone)
    dum: string;
    dpp: string;
    datingMethod: 'dum' | 'ultrassom';
}

export interface ChecklistItem {
    id: string;
    category: string;
    question: string;
    type: 'boolean' | 'multiple' | 'text' | 'number';
    options?: string[];
    required?: boolean;
    block: number;
    feedback?: {
        condition: (value: any) => boolean;
        message: string;
        type: 'alert' | 'recommendation' | 'normal';
    }[];
}
