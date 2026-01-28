import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientService } from '../../services/api';
import { calculateAge, calculateGestationalAgeFromDate } from '../../utils/dateUtils';

export default function Dashboard() {
  const navigate = useNavigate();
  const [userName] = useState(localStorage.getItem('userName') || 'Profissional');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [patients, setPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const data = await patientService.getAll();
      const mappedPatients = data.map((p: any) => {
        // Calcular semana atual baseada na DUM se existir
        let currentWeekStr = '-';
        if (p.dum || p.dados_adicionais?.dum) {
          const dum = p.dum || p.dados_adicionais?.dum;
          const { roundedWeeks } = calculateGestationalAgeFromDate(dum);
          currentWeekStr = roundedWeeks.toString();
        } else if (p.dados_adicionais?.semana_gestacional) {
          currentWeekStr = p.dados_adicionais.semana_gestacional.toString();
        }

        // Calcular idade real
        const age = p.data_nascimento ? calculateAge(p.data_nascimento) : p.idade;

        return {
          id: p.id,
          name: p.nome,
          age: age || '-',
          gestationalWeek: currentWeekStr,
          lastVisit: p.updated_at || p.created_at,
          evaluationsCount: p.dados_adicionais?.total_avaliacoes || 0,
          status: p.dados_adicionais?.status_ganho_peso || 'Em dia',
          riskLevel: p.dados_adicionais?.risco || 'Baixo'
        };
      });
      setPatients(mappedPatients);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const highRiskCount = patients.filter(p => p.riskLevel === 'Alto').length;
  const totalEvaluations = patients.reduce((acc, curr) => acc + (curr.evaluationsCount || 0), 0);

  const statsCards = [
    {
      label: 'Total de Pacientes',
      value: patients.length,
      subtext: `${patients.length} pacientes em acompanhamento`,
      icon: 'ri-user-line',
      iconColor: 'text-blue-600',
      bgIcon: 'bg-blue-100'
    },
    {
      label: 'Consultas Hoje',
      value: 0,
      subtext: 'Nenhum agendamento pendente',
      icon: 'ri-calendar-event-line',
      iconColor: 'text-green-600',
      bgIcon: 'bg-green-100'
    },
    {
      label: 'Alto Risco',
      value: highRiskCount,
      subtext: highRiskCount === 0 ? 'Ótimo! Nenhuma paciente crítica' : 'Atenção necessária',
      icon: 'ri-alert-line',
      iconColor: 'text-red-600',
      bgIcon: 'bg-red-100'
    },
    {
      label: 'Avaliações Totais',
      value: totalEvaluations,
      subtext: totalEvaluations === 0 ? 'Inicie agora' : `${totalEvaluations} completas`,
      icon: 'ri-file-list-line',
      iconColor: 'text-purple-600',
      bgIcon: 'bg-purple-100'
    }
  ];

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' ||
      (selectedFilter === 'high_risk' && patient.riskLevel === 'Alto') ||
      (selectedFilter === 'attention' && patient.riskLevel === 'Médio');
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Olá, {userName}</h2>
          <p className="text-gray-500">Bem-vindo ao painel de controle</p>
        </div>

        <button
          onClick={() => navigate('/checklist')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm w-fit"
        >
          <i className="ri-add-line text-xl"></i>
          Nova Avaliação
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative">
          <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i>
          <input
            type="text"
            placeholder="Buscar paciente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg outline-none text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'all', label: 'Todos' },
          { id: 'high_risk', label: 'Alto Risco' },
          { id: 'attention', label: 'Atenção' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedFilter(tab.id)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${selectedFilter === tab.id
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</h3>
              <p className="font-medium text-gray-700 text-sm">{stat.label}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.subtext}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.bgIcon}`}>
              <i className={`${stat.icon} text-xl ${stat.iconColor}`}></i>
            </div>
          </div>
        ))}
      </div>

      {/* Patient List Table Style */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center gap-2">
          <i className="ri-user-heart-line text-blue-600"></i>
          <h3 className="font-semibold text-gray-800">Pacientes ({filteredPatients.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Idade & Semana</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Risco</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold">
                        {patient.name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-800">{patient.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {patient.age} • {patient.gestationalWeek}ª
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-block
                      ${patient.riskLevel === 'Alto' ? 'bg-red-100 text-red-700' :
                        patient.riskLevel === 'Médio' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-50 text-green-700'}`}>
                      {patient.riskLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/patient/${patient.id}`);
                        }}
                        className="px-4 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        Ver Detalhes
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/checklist', { state: { patientId: patient.id } });
                        }}
                        className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                      >
                        Nova Avaliação
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPatients.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <i className="ri-user-search-line text-4xl text-gray-300 mb-3 block"></i>
            <p>Nenhuma paciente encontrada com os filtros atuais.</p>
          </div>
        )}
      </div>
    </div>
  );
}
