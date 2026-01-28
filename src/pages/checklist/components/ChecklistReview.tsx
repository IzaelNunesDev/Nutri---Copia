import { Dispatch, SetStateAction } from 'react';
import { FeedbackItem } from '../../../utils/rules/types';

interface ChecklistReviewProps {
    activeAlerts: FeedbackItem[];
    weightGainRecommendation: string | null;
    selectedReviewId: string | null;
    setSelectedReviewId: Dispatch<SetStateAction<string | null>>;
    weightRecMode: 'auto' | 'manual';
    setWeightRecMode: Dispatch<SetStateAction<'auto' | 'manual'>>;
    manualWeightRec: string;
    setManualWeightRec: Dispatch<SetStateAction<string>>;
    selectedGuidelines: Record<string, { selected: boolean; note: string }>;
    toggleGuideline: (id: string) => void;
    editedMessages: Record<string, string>;
    setEditedMessages: Dispatch<SetStateAction<Record<string, string>>>;
    updateGuidelineNote: (id: string, note: string) => void;
}

export const ChecklistReview = ({
    activeAlerts,
    weightGainRecommendation,
    selectedReviewId,
    setSelectedReviewId,
    weightRecMode,
    setWeightRecMode,
    manualWeightRec,
    setManualWeightRec,
    selectedGuidelines,
    toggleGuideline,
    editedMessages,
    setEditedMessages,
    updateGuidelineNote
}: ChecklistReviewProps) => {
    return (
        <div className="flex flex-col lg:flex-row h-[700px] lg:h-full overflow-hidden">
            {/* Left Column: Alert List */}
            <div className="lg:w-1/3 border-r border-gray-100 flex flex-col bg-gray-50/30">
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {/* Weight Gain Item */}
                    {weightGainRecommendation && (
                        <button
                            onClick={() => setSelectedReviewId('weight_gain_rec')}
                            className={`w-full text-left p-3 rounded-xl border transition-all duration-200 group relative ${selectedReviewId === 'weight_gain_rec'
                                ? 'bg-white border-blue-500 shadow-md ring-1 ring-blue-100'
                                : 'bg-white border-blue-100 hover:border-blue-300'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Automático</span>
                                {selectedReviewId === 'weight_gain_rec' && <i className="ri-arrow-right-line text-blue-500"></i>}
                            </div>
                            <h5 className="font-semibold text-gray-800 text-sm leading-tight">Recomendação de Peso</h5>
                        </button>
                    )}

                    {/* Alerts List */}
                    {activeAlerts.length === 0 && !weightGainRecommendation && (
                        <div className="text-center py-10 text-gray-400 px-4">
                            <i className="ri-checkbox-circle-line text-3xl mb-2 opacity-30"></i>
                            <p className="text-sm">Nenhum alerta para revisão.</p>
                        </div>
                    )}

                    {activeAlerts.map((alert) => {
                        const isSelected = selectedGuidelines[alert.id]?.selected;
                        return (
                            <button
                                key={alert.id}
                                onClick={() => setSelectedReviewId(alert.id)}
                                className={`w-full text-left p-3 rounded-xl border transition-all duration-200 group relative ${selectedReviewId === alert.id
                                    ? 'bg-white border-blue-500 shadow-md z-10 ring-1 ring-blue-100'
                                    : 'bg-white border-gray-200 hover:border-blue-300'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleGuideline(alert.id);
                                        }}
                                        className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors cursor-pointer ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300 hover:border-blue-400'
                                            }`}
                                    >
                                        {isSelected && <i className="ri-check-line text-white text-xs"></i>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h5 className={`font-semibold text-sm mb-1 truncate ${alert.type === 'critical' ? 'text-red-700' :
                                            alert.type === 'recommendation' || alert.type === 'warning' ? 'text-amber-700' :
                                                alert.type === 'success' || alert.type === 'normal' ? 'text-green-700' : 'text-blue-700'
                                            }`}>
                                            {alert.title}
                                        </h5>
                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                            {alert.type === 'critical' ? <span className="text-red-600 flex items-center"><i className="ri-error-warning-fill mr-1"></i>Crítico</span> :
                                                (alert.type === 'recommendation' || alert.type === 'warning') ? <span className="text-amber-600 flex items-center"><i className="ri-alert-fill mr-1"></i>Atenção</span> :
                                                    <span className="text-green-600 flex items-center"><i className="ri-check-double-line mr-1"></i>Adequado</span>}
                                        </div>
                                    </div>
                                    {selectedReviewId === alert.id && (
                                        <i className="ri-arrow-right-s-line text-blue-500 text-xl absolute right-3 top-1/2 -translate-y-1/2"></i>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Right Column: Editor */}
            <div className="lg:w-2/3 bg-white flex flex-col h-full">
                {!selectedReviewId ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
                        <i className="ri-edit-2-line text-4xl mb-4 opacity-30"></i>
                        <p className="text-center font-medium">Selecione um item à esquerda para visualizar e editar o texto final.</p>
                    </div>
                ) : (
                    (() => {
                        const activeItem = activeAlerts.find(a => a.id === selectedReviewId);
                        const isWeightRec = selectedReviewId === 'weight_gain_rec';

                        if (!activeItem && !isWeightRec) return null;

                        if (isWeightRec) {
                            return (
                                <div className="p-6 h-full flex flex-col animate-fade-in overflow-y-auto">
                                    <div className="mb-6 pb-4 border-b border-gray-100">
                                        <h4 className="text-xl font-bold text-gray-800 mb-2">Recomendação de Ganho de Peso</h4>
                                        <div className="flex bg-gray-100 p-1 rounded-lg inline-flex mt-2">
                                            <button
                                                onClick={() => setWeightRecMode('auto')}
                                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${weightRecMode === 'auto' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                                            >
                                                Automático
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setWeightRecMode('manual');
                                                    if (!manualWeightRec && weightGainRecommendation) setManualWeightRec(weightGainRecommendation);
                                                }}
                                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${weightRecMode === 'manual' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                                            >
                                                Manual
                                            </button>
                                        </div>
                                    </div>
                                    <div className={`flex-1 rounded-xl p-6 border transition-all ${weightRecMode === 'manual' ? 'bg-white border-blue-200 ring-2 ring-blue-100' : 'bg-blue-50 border-blue-100'}`}>
                                        <label className="block text-xs font-bold text-blue-800 mb-2 uppercase">{weightRecMode === 'manual' ? 'Texto da Recomendação (Editável)' : 'Texto Gerado Automaticamente'}</label>
                                        <textarea
                                            readOnly={weightRecMode === 'auto'}
                                            onChange={(e) => setManualWeightRec(e.target.value)}
                                            className={`w-full h-full bg-transparent border-0 resize-none focus:ring-0 text-base leading-relaxed ${weightRecMode === 'manual' ? 'text-gray-800' : 'text-blue-900'}`}
                                            value={weightRecMode === 'manual' ? manualWeightRec : (weightGainRecommendation || '')}
                                            placeholder="Escreva a recomendação aqui..."
                                        />
                                    </div>
                                    <p className="mt-4 text-xs text-gray-500 text-center">
                                        {weightRecMode === 'auto' ? 'Este texto é calculado automaticamente com base nas diretrizes FIGO.' : 'Você está definindo a recomendação manualmente.'}
                                    </p>
                                </div>
                            );
                        }

                        const isSelected = selectedGuidelines[activeItem!.id]?.selected;
                        const editedText = editedMessages[activeItem!.id] ?? activeItem!.message;

                        return (
                            <div className="p-6 h-full flex flex-col animate-fade-in">
                                <div className="mb-6 flex items-start justify-between">
                                    <div>
                                        <h4 className={`text-xl font-bold mb-2 ${activeItem!.type === 'critical' ? 'text-red-700' : activeItem!.type === 'recommendation' || activeItem!.type === 'warning' ? 'text-amber-700' : 'text-green-700'}`}>
                                            {activeItem!.title}
                                        </h4>
                                    </div>
                                    <button
                                        onClick={() => toggleGuideline(activeItem!.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${isSelected ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}
                                    >
                                        {isSelected ? <><i className="ri-checkbox-circle-fill text-lg"></i><span>Incluir no PDF</span></> : <><i className="ri-checkbox-blank-circle-line text-lg"></i><span>Ignorar item</span></>}
                                    </button>
                                </div>
                                <div className="flex-1 flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex bg-gray-100 p-1 rounded-lg">
                                            <button
                                                onClick={() => { const newMap = { ...editedMessages }; delete newMap[activeItem!.id]; setEditedMessages(newMap); }}
                                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${!editedMessages[activeItem!.id] ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                                            >
                                                <i className="ri-stethoscope-line mr-1"></i> Profissional
                                            </button>
                                            <button
                                                onClick={() => { if (!editedMessages[activeItem!.id]) { const textToUse = activeItem!.patientMessage || activeItem!.message; setEditedMessages(prev => ({ ...prev, [activeItem!.id]: textToUse })); } }}
                                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${editedMessages[activeItem!.id] ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                                            >
                                                <i className="ri-user-heart-line mr-1"></i> Paciente
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex-1 relative">
                                        {!editedMessages[activeItem!.id] ? (
                                            <div className="h-full">
                                                <label className="block text-sm font-medium text-purple-600 mb-2"><i className="ri-stethoscope-line mr-1"></i> Texto Técnico (Original)</label>
                                                <div className="w-full h-[calc(100%-3rem)] p-4 rounded-xl border-2 border-purple-200 bg-purple-50/30 text-gray-700 leading-relaxed overflow-y-auto whitespace-pre-line">{activeItem!.message}</div>
                                            </div>
                                        ) : (
                                            <div className="h-full">
                                                <label className="block text-sm font-medium text-blue-600 mb-2 flex justify-between">
                                                    <span><i className="ri-user-heart-line mr-1"></i> Texto Adaptado para Paciente</span>
                                                    <button onClick={() => { const newMap = { ...editedMessages }; delete newMap[activeItem!.id]; setEditedMessages(newMap); }} className="text-xs text-purple-600 hover:underline"><i className="ri-arrow-go-back-line mr-1"></i> Ver Original</button>
                                                </label>
                                                <textarea value={editedText} onChange={(e) => setEditedMessages(prev => ({ ...prev, [activeItem!.id]: e.target.value }))} className={`w-full h-[calc(100%-3rem)] p-4 rounded-xl border-2 text-base leading-relaxed transition-all focus:ring-4 ${isSelected ? 'border-blue-300 focus:border-blue-500 bg-blue-50/20' : 'border-gray-200 bg-gray-50'}`} placeholder="Adapte o texto..." />
                                            </div>
                                        )}
                                    </div>
                                    {isSelected && (
                                        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                                            <label className="block text-xs font-bold text-yellow-800 mb-1 uppercase">Nota Interna</label>
                                            <input type="text" value={selectedGuidelines[activeItem!.id]?.note || ''} onChange={(e) => updateGuidelineNote(activeItem!.id, e.target.value)} placeholder="Adicione uma observação..." className="w-full bg-white border-yellow-300 rounded-lg text-sm p-2 focus:ring-yellow-200" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })()
                )}
            </div>
        </div>
    );
};
