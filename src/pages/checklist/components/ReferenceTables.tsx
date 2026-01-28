import { useMemo } from 'react';
import { CATEGORY_LIMITS } from '../../../utils/rules/weight/figo/data';
import { IMC_CATEGORIES } from '../../../utils/nutritionConstants';

interface ReferenceTablesProps {
    currentClassification?: string; // Full classification e.g. "Eutrofia pré-gestacional"
    isMaxReached?: boolean;
}

export function ReferenceTables({ currentClassification, isMaxReached }: ReferenceTablesProps) {

    // Normalize classification for highlighting
    const normalizedClass = useMemo(() => {
        if (!currentClassification) return null;
        // Map simple names to full names if needed, or just match against keys
        return currentClassification;
    }, [currentClassification]);

    return (
        <div className="space-y-6">
            {/* Tabela 1: Faixas por Trimestre (Antiga Tabela 2) */}
            <div className={`border rounded-lg overflow-hidden ${!isMaxReached ? 'ring-2 ring-blue-400 shadow-md' : 'border-gray-200'}`}>
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <h4 className="text-sm font-bold text-gray-700">
                        Tabela 1 — Faixas de recomendações de ganho de peso gestacional
                        <span className="block text-xs font-normal text-gray-500 mt-0.5">(segundo IMC pré-gestacional)</span>
                    </h4>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600 font-medium">
                            <tr>
                                <th className="px-3 py-2 text-left">IMC / Categoria</th>
                                <th className="px-3 py-2 text-center">1º Trimestre<br /><span className="text-[10px] font-normal">(até 13 sem)</span></th>
                                <th className="px-3 py-2 text-center">2º Trimestre<br /><span className="text-[10px] font-normal">(até 27 sem)</span></th>
                                <th className="px-3 py-2 text-center">3º Trimestre<br /><span className="text-[10px] font-normal">(até 40 sem)</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {Object.entries(CATEGORY_LIMITS).map(([key, limits]) => {
                                const isHighlighted = normalizedClass === key;
                                // Simple mapping to show IMC range
                                const imcRange = IMC_CATEGORIES.find(c => c.labelFull === key);
                                const imcLabel = imcRange ? `${imcRange.imcMin} - ${imcRange.imcMax === 999 ? '≥30' : imcRange.imcMax}` : '';

                                return (
                                    <tr key={key} className={isHighlighted ? 'bg-blue-50' : 'bg-white'}>
                                        <td className="px-3 py-2">
                                            <div className="font-medium text-gray-800">{key}</div>
                                            <div className="text-xs text-gray-500">{imcLabel}</div>
                                        </td>
                                        <td className="px-3 py-2 text-center text-gray-700">
                                            {limits.trim1.min} a {limits.trim1.max} kg
                                            {limits.trim1.lossLimit < 0 && <div className="text-[10px] text-red-500">*perda até {limits.trim1.lossLimit}</div>}
                                        </td>
                                        <td className="px-3 py-2 text-center text-gray-700">
                                            {limits.trim2.min} a {limits.trim2.max} kg
                                        </td>
                                        <td className="px-3 py-2 text-center text-gray-700">
                                            {limits.trim3.min} a {limits.trim3.max} kg
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Tabela 2: Semanal (Antiga Tabela 1) */}
            <div className={`border rounded-lg overflow-hidden ${isMaxReached ? 'ring-2 ring-amber-400 shadow-md' : 'border-gray-200'}`}>
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <h4 className="text-sm font-bold text-gray-700">
                        Tabela 2 — Recomendações de taxa de ganho gestacional semanal
                        <span className="block text-xs font-normal text-gray-500 mt-0.5">(para mulheres que já atingiram o seu ganho de peso máximo)</span>
                    </h4>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600 font-medium">
                            <tr>
                                <th className="px-4 py-2 text-left">Classificação IMC Pré-Gestacional</th>
                                <th className="px-4 py-2 text-right">Ganho semanal (g)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {IMC_CATEGORIES.map((cat) => {
                                const limits = CATEGORY_LIMITS[cat.labelFull];
                                const rateText = limits ? `${limits.weeklyRateGrams}` : '-';

                                return (
                                    <tr
                                        key={cat.key}
                                        className={`${normalizedClass?.includes(cat.label) ? 'bg-blue-50' : 'bg-white'}`}
                                    >
                                        <td className="px-4 py-2 text-gray-800">{cat.labelFull} ({cat.imcMin} - {cat.imcMax === 999 ? '≥ 30' : cat.imcMax})</td>
                                        <td className="px-4 py-2 text-right font-medium text-gray-800">{rateText} g</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="text-[10px] text-gray-400 mt-2 px-1">
                Fonte: Adaptado de WHO, 1995; Kac et al., 2021 apud Caderneta da Gestante.
            </div>
        </div>
    );
}
