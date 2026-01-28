import { ChecklistItem } from '../types';
import { INVERTED_COLOR_IDS } from '../config';
import { FeedbackInline } from './FeedbackInline';

interface QuestionItemProps {
    item: ChecklistItem;
    responses: Record<string, any>;
    handleResponseChange: (id: string, value: any) => void;
    validationErrors: Record<string, string>;
    getInlineFeedback: (itemId: string, response: any) => { show: boolean; message: string; type: 'info' | 'warning' | 'critical' | 'success' };
}

export const QuestionItem = ({
    item,
    responses,
    handleResponseChange,
    validationErrors,
    getInlineFeedback
}: QuestionItemProps) => {

    const isSimpleMultiple = item.type === 'multiple' &&
        item.options &&
        item.options.length <= 3 &&
        item.options.every(o => ['Sim', 'Não', 'Não sei'].includes(o));

    const highlightKeywords = (text: string) => {
        const keywords = [
            'peixes', 'laticínios', 'ovos', 'carnes', 'aves',
            'origem vegetal', 'origem animal', 'lactose', 'glúten',
            'alergias', 'intolerâncias', 'preferências', 'proteína',
            'cálcio', 'vitamina B12', 'leguminosas', 'cereais',
            'Sim', 'Não', 'Não sei'
        ];

        let result = text;
        keywords.forEach(keyword => {
            const regex = new RegExp(`(${keyword})`, 'gi');
            result = result.replace(regex, `<span class="text-blue-600 font-medium">$1</span>`);
        });
        return result;
    };

    return (
        <div key={item.id} className="border-b border-gray-100 pb-10 last:border-0 last:pb-0 pt-8 first:pt-0">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className={`col-span-1 lg:col-span-12`}>
                    <label className="block text-lg font-semibold text-gray-800 mb-6 leading-relaxed">
                        {item.question}
                        {item.required && <span className="text-red-500 ml-1">*</span>}
                    </label>

                    <div className="w-full">
                        {item.type === 'boolean' && (
                            <div className="grid grid-cols-2 gap-4 max-w-md">
                                <button
                                    onClick={() => handleResponseChange(item.id, true)}
                                    className={`py-4 px-6 rounded-xl border-2 flex items-center justify-center space-x-3 transition-all duration-200 ${responses[item.id] === true
                                        ? (INVERTED_COLOR_IDS.has(item.id)
                                            ? 'bg-red-50 border-red-500 text-red-700 shadow-sm ring-1 ring-red-500' // True = Bad (Red)
                                            : 'bg-green-50 border-green-500 text-green-700 shadow-sm ring-1 ring-green-500') // True = Good (Green)
                                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${responses[item.id] === true
                                        ? (INVERTED_COLOR_IDS.has(item.id) ? 'border-red-500 bg-red-500' : 'border-green-500 bg-green-500')
                                        : 'border-gray-300'
                                        }`}>
                                        {responses[item.id] === true && (INVERTED_COLOR_IDS.has(item.id)
                                            ? <i className="ri-close-line text-white text-sm"></i>
                                            : <i className="ri-check-line text-white text-sm"></i>
                                        )}
                                    </div>
                                    <span className="text-lg font-medium">Sim</span>
                                </button>

                                <button
                                    onClick={() => handleResponseChange(item.id, false)}
                                    className={`py-4 px-6 rounded-xl border-2 flex items-center justify-center space-x-3 transition-all duration-200 ${responses[item.id] === false
                                        ? (INVERTED_COLOR_IDS.has(item.id)
                                            ? 'bg-green-50 border-green-500 text-green-700 shadow-sm ring-1 ring-green-500' // False = Good (Green)
                                            : 'bg-red-50 border-red-500 text-red-700 shadow-sm ring-1 ring-red-500') // False = Bad (Red)
                                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${responses[item.id] === false
                                        ? (INVERTED_COLOR_IDS.has(item.id) ? 'border-green-500 bg-green-500' : 'border-red-500 bg-red-500')
                                        : 'border-gray-300'
                                        }`}>
                                        {responses[item.id] === false && (INVERTED_COLOR_IDS.has(item.id)
                                            ? <i className="ri-check-line text-white text-sm"></i>
                                            : <i className="ri-close-line text-white text-sm"></i>
                                        )}
                                    </div>
                                    <span className="text-lg font-medium">Não</span>
                                </button>
                            </div>
                        )}

                        {isSimpleMultiple && item.options && (
                            <div className={`grid gap-4 max-w-2xl ${item.options.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
                                {item.options.map(option => {
                                    const isSelected = responses[item.id] === option;
                                    let colorClass = 'blue';

                                    if (INVERTED_COLOR_IDS.has(item.id)) {
                                        // Inverted Logic: Sim=Red, Não=Green
                                        if (option === 'Sim') colorClass = 'red';
                                        if (option === 'Não') colorClass = 'green';
                                    } else {
                                        // Standard Logic: Sim=Green, Não=Red
                                        if (option === 'Sim') colorClass = 'green';
                                        if (option === 'Não') colorClass = 'red';
                                    }
                                    if (option === 'Não sei') colorClass = 'gray';

                                    const baseClasses = `py-4 px-4 rounded-xl border-2 flex flex-col md:flex-row items-center justify-center md:space-x-2 transition-all duration-200`;
                                    const activeClasses = {
                                        green: 'bg-green-50 border-green-500 text-green-700 shadow-sm ring-1 ring-green-500',
                                        red: 'bg-red-50 border-red-500 text-red-700 shadow-sm ring-1 ring-red-500',
                                        gray: 'bg-gray-100 border-gray-500 text-gray-800 shadow-sm ring-1 ring-gray-500',
                                        blue: 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm ring-1 ring-blue-500'
                                    };
                                    const inactiveClasses = 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50';

                                    return (
                                        <button
                                            key={option}
                                            onClick={() => handleResponseChange(item.id, option)}
                                            className={`${baseClasses} ${isSelected ? activeClasses[colorClass as keyof typeof activeClasses] : inactiveClasses}`}
                                        >
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mb-1 md:mb-0 ${isSelected
                                                ? `border-${colorClass === 'gray' ? 'gray-500' : colorClass + '-500'} bg-${colorClass === 'gray' ? 'gray-500' : colorClass + '-500'}`
                                                : 'border-gray-300'
                                                }`}>
                                                {isSelected && <i className={`ri-${option === 'Não' ? 'close' : option === 'Não sei' ? 'question' : 'check'}-line text-white text-xs`}></i>}
                                            </div>
                                            <span className="text-base font-medium">{option}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {!isSimpleMultiple && item.type === 'multiple' && item.options && (
                            <div className="grid grid-cols-1 gap-3 max-w-xl">
                                {item.options.map(option => {
                                    const isSelected = responses[item.id] === option;
                                    return (
                                        <button
                                            key={option}
                                            onClick={() => handleResponseChange(item.id, option)}
                                            className={`w-full px-6 py-4 text-left rounded-xl text-base transition-all duration-200 flex items-start space-x-3 ${isSelected
                                                ? 'bg-blue-50 text-gray-800 border-2 border-blue-500 shadow-md transform scale-[1.01]'
                                                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50/10'
                                                }`}
                                        >
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                                                {isSelected && <i className="ri-check-line text-white text-xs"></i>}
                                            </div>
                                            <span dangerouslySetInnerHTML={{ __html: highlightKeywords(option) }} className="leading-tight" />
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {item.type === 'number' && (
                            <div className="relative max-w-xs">
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    pattern="[0-9]*[.,]?[0-9]*"
                                    value={responses[item.id] || ''}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(',', '.').replace(/[^0-9.]/g, '');
                                        const parts = value.split('.');
                                        const cleanValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : value;
                                        handleResponseChange(item.id, cleanValue);
                                    }}
                                    className={`w-full px-6 py-4 rounded-xl text-lg text-center font-semibold focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all border-2 ${validationErrors[item.id]
                                        ? 'border-red-300 focus:border-red-500'
                                        : 'border-gray-200 focus:border-blue-500'
                                        }`}
                                    placeholder="0.0"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400 font-medium">kg</div>
                            </div>
                        )}

                        {item.type === 'text' && (
                            <textarea
                                value={responses[item.id] || ''}
                                onChange={(e) => handleResponseChange(item.id, e.target.value)}
                                className={`w-full max-w-3xl px-6 py-4 rounded-xl text-base focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all resize-y border-2 ${validationErrors[item.id]
                                    ? 'border-red-300 focus:border-red-500'
                                    : 'border-gray-200 focus:border-blue-500'
                                    }`}
                                rows={4}
                                placeholder="Digite suas observações..."
                                maxLength={1000}
                            />
                        )}

                        {/* ITEM 1 - Input Adicional "Outros" */}
                        {item.id === 'dietary_pattern' && String(responses[item.id]).includes('Outros') && (
                            <div className="mt-4 animate-fade-in">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Especifique:</label>
                                <textarea
                                    value={responses['dietary_pattern_desc'] || ''}
                                    onChange={(e) => handleResponseChange('dietary_pattern_desc', e.target.value)}
                                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                                    placeholder="Descreva a restrição alimentar..."
                                    rows={2}
                                />
                            </div>
                        )}

                        {/* ITEM 5 - Campos de Exames */}
                        {item.id === 'anemia_test' && responses[item.id] === 'Sim' && (
                            <div className="mt-6 p-6 bg-blue-50 rounded-xl border border-blue-100 animate-fade-in space-y-4">
                                <h4 className="font-semibold text-blue-900 mb-2">Registro de Resultados</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Data do Exame</label>
                                        <input
                                            type="date"
                                            value={responses['exam_date'] || ''}
                                            onChange={(e) => handleResponseChange('exam_date', e.target.value)}
                                            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Hemoglobina (g/dL)</label>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={responses['hemoglobin_value'] || ''}
                                            onChange={(e) => handleResponseChange('hemoglobin_value', e.target.value)}
                                            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-bold text-gray-800"
                                            placeholder="Ex: 11.5"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Ferritina (ng/mL) - Opcional</label>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={responses['ferritin_value'] || ''}
                                            onChange={(e) => handleResponseChange('ferritin_value', e.target.value)}
                                            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                                            placeholder="Ex: 30"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {validationErrors[item.id] && (
                            <p className="text-red-500 text-sm mt-2 flex items-center animate-shake">
                                <i className="ri-error-warning-line mr-1"></i>
                                {validationErrors[item.id]}
                            </p>
                        )}

                        {/* FEEDBACK CONTEXTUAL INLINE */}
                        {(() => {
                            const inlineFeedback = getInlineFeedback(item.id, responses[item.id]);
                            if (inlineFeedback.show) {
                                return (
                                    <FeedbackInline
                                        message={inlineFeedback.message}
                                        type={inlineFeedback.type}
                                    />
                                );
                            }
                            return null;
                        })()}

                    </div>
                </div>
            </div>
        </div>
    );
};
