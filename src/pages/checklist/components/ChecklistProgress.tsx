import { PatientData } from '../types';

interface ChecklistProgressProps {
    currentBlock: number;
    setCurrentBlock: (block: number) => void;
    patientData: PatientData;
    steps: { id: number; title: string; icon: string; description: string }[];
}

export const ChecklistProgress = ({
    currentBlock,
    setCurrentBlock,
    patientData,
    steps
}: ChecklistProgressProps) => {
    return (
        <div className="hidden lg:block w-72 flex-shrink-0 sticky top-4 self-start space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                    <i className="ri-list-check text-blue-500"></i>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Etapas da Avaliação</h3>
                </div>
                <nav className="p-2 space-y-1">
                    {steps.map(step => {
                        const isActive = currentBlock === step.id;
                        const isCompleted = currentBlock > step.id;
                        const isFuture = currentBlock < step.id;

                        return (
                            <button
                                key={step.id}
                                onClick={() => !isFuture && setCurrentBlock(step.id)}
                                disabled={isFuture}
                                className={`w-full flex items-center p-3 rounded-lg text-left transition-all ${isActive ? 'bg-blue-600 text-white shadow-md' :
                                    isCompleted ? 'text-gray-700 hover:bg-gray-50' :
                                        'text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mr-3 ${isActive ? 'bg-white/20 text-white' :
                                    isCompleted ? 'bg-green-100 text-green-600' :
                                        'bg-gray-100 text-gray-400'
                                    }`}>
                                    {isCompleted ? <i className="ri-check-line text-lg"></i> : <i className={`${step.icon} text-lg`}></i>}
                                </div>
                                <div>
                                    <span className={`block text-sm font-semibold ${isActive ? 'text-white' : 'text-gray-700'}`}>{step.title}</span>
                                    <span className={`block text-[10px] ${isActive ? 'text-blue-200' : 'text-gray-400'}`}>{step.description}</span>
                                </div>
                            </button>
                        );
                    })}
                </nav>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm">
                        <i className="ri-user-heart-line"></i>
                    </div>
                    <div>
                        <p className="text-xs text-blue-500 font-bold uppercase">Paciente</p>
                        <p className="text-sm font-bold text-blue-900 truncate max-w-[140px]">{patientData.name}</p>
                    </div>
                </div>
                <div className="flex justify-between items-center text-xs text-blue-800 bg-white/50 rounded-lg p-2">
                    <span>IG: <strong>{patientData.gestationalWeek}sem</strong></span>
                </div>
            </div>
        </div>
    );
};
