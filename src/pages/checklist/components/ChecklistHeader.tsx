import { PatientData } from '../types';

interface ChecklistHeaderProps {
    currentBlock: number;
    steps: { id: number; title: string; icon: string; description: string }[];
    patientData: PatientData;
    onPrev: () => void;
    patientIMC: string;
    currentTrimester: 1 | 2 | 3 | null;
    trimesterText: string;
}

export const ChecklistHeader = ({
    currentBlock,
    steps,
    patientData,
    onPrev,
    patientIMC,
    currentTrimester,
    trimesterText
}: ChecklistHeaderProps) => {
    const currentStep = steps.find(s => s.id === currentBlock);

    return (
        <>
            {/* Header (Desktop Only Title) */}
            <div className="hidden lg:flex p-6 border-b border-gray-100 bg-gray-50/30 items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <i className={`${currentStep?.icon} text-blue-600`}></i>
                        {currentStep?.title}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">{currentStep?.description}</p>
                </div>
                <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-500 shadow-sm">
                    Passo {currentBlock} de {steps.length}
                </span>
            </div>

            {/* Mobile Header */}
            <div className="lg:hidden p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={onPrev} className="text-gray-500"><i className="ri-arrow-left-line text-xl"></i></button>
                    <div>
                        <h3 className="font-semibold text-gray-800 text-sm">{patientData.name} {patientData.isReturningPatient ? '(Retorno)' : ''}</h3>
                        <p className="text-xs text-gray-600">{patientData.age} anos • {patientData.gestationalWeek}ª semana • IMC: {patientIMC}</p>
                    </div>
                </div>
                {/* Trimester Badge */}
                {currentTrimester && (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${currentTrimester === 1 ? 'bg-purple-100 text-purple-700' :
                        currentTrimester === 2 ? 'bg-blue-100 text-blue-700' :
                            'bg-green-100 text-green-700'
                        }`}>
                        {trimesterText}
                    </span>
                )}
            </div>
        </>
    );
};
