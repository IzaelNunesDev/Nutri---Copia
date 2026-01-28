

export default function References() {
    const references = [
        "Brasil. Ministério da Saúde. Secretaria de Atenção Primária à Saúde. Departamento de Promoção da Saúde. Caderno dos programas nacionais de suplementação de micronutrientes. Brasília, 2022.",
        "Brasil. Ministério da Saúde. Secretaria de Atenção Primária à Saúde. Departamento de Gestão do Cuidado Integral. Coordenação-Geral de Atenção à Saúde das Mulheres. Coordenação de Enfrentamento à Mortalidade Materna. Departamento de Prevenção e Promoção da Saúde. Coordenação-Geral de Alimentação e Nutrição. NOTA TÉCNICA CONJUNTA Nº 251/2024-COEMM/CGESMU/DGCI/SAPS/MS E CGAN/DEPPROS/SAPS/MS. 2025.",
        "Brasil. Ministério da Saúde. Guia para a organização da Vigilância Alimentar e Nutricional na Atenção Primária à Saúde. Universidade Federal de Sergipe. Brasília, 2022.",
        "Brasil. Ministério da Saúde. Fascículo 3 Protocolos de uso do Guia Alimentar para a população brasileira na orientação alimentar de gestantes. Universidade de São Paulo. Brasília, 2021.",
        "Brasil. Ministério da Cidadania. Secretaria Nacional de Cuidados e Prevenção às Drogas. Secretaria Nacional de Atenção à Primeira Infância. Conhecendo os Efeitos do Uso de Drogas na Gestação e Consequências para o Bebê. 1. ed., Brasília, 2021",
        "Brasil. Ministério da Saúde. Secretaria de Atenção à Saúde. Departamento de Atenção Básica. Guia alimentar para a população brasileira. 2. ed., Brasília, 2014.",
        "Brasil. Ministério da Saúde. Secretaria de Atenção Primária à Saúde. Departamento de Promoção da Saúde. Guia de Atividade Física para a População Brasileira [recurso eletrônico] / Ministério da Saúde, Secretaria de Atenção Primária à Saúde, Departamento de Promoção da Saúde. - Brasília: Ministério da Saúde, 2021.",
        "Nogueira-de-Almeida CA, Ribas Filho D, Philippi ST, Pimentel CV de MB, Korkes HA, Mello ED de, Bertolucci PHF, Falcão MC. II Consensus of the Brazilian Nutrology Association on DHA recommendations during pregnancy, lactation and childhood. IJN [Internet]. 2022"
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="space-y-4">
                <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: '"Pacifico", cursive' }}>
                    Referências
                </h1>
                <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg shadow-sm">
                    <p className="text-blue-800 font-medium leading-relaxed text-justify">
                        ESTE MATERIAL FOI ELABORADO CONFORME RECOMENDAÇÕES E DIRETRIZES NACIONAIS E TEM COMO FINALIDADE FORNECER EMBASAMENTO PARA O ACONSELHAMENTO NUTRICIONAL, NÃO DEVENDO SUBSTITUIR A ORIENTAÇÃO DO PROFISSIONAL DE SAÚDE.
                    </p>
                </div>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <i className="ri-book-read-line text-blue-500"></i>
                        Referências Bibliográficas
                    </h2>
                </div>
                <div className="divide-y divide-gray-100">
                    {references.map((ref, index) => (
                        <div key={index} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                            <div className="flex gap-4">
                                <span className="text-sm font-medium text-blue-500 min-w-[24px]">
                                    {index + 1}.
                                </span>
                                <p className="text-gray-600 leading-relaxed text-sm text-justify">
                                    {ref}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
