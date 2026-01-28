import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientService } from '../../services/api';
import { calculateAge, calculateGestationalAgeFromDate } from '../../utils/dateUtils';

export default function Home() {
  const navigate = useNavigate();
  const [currentDate] = useState(new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }));
  const userName = localStorage.getItem('userName') || 'Profissional';

  const [recentPatients, setRecentPatients] = useState<any[]>([]);
  const [stats, setStats] = useState({
    todayConsultations: 0,
    totalPatients: 0,
    pendingEvaluations: 0
  });

  useEffect(() => {
    const fetchPatients = async () => {
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
            status: p.dados_adicionais?.status_ganho_peso || 'normal'
          };
        });

        // Sort by last visit desc
        const sortedPatients = [...mappedPatients].sort((a, b) =>
          new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime()
        );

        setRecentPatients(sortedPatients.slice(0, 5));

        // Calculate stats
        const today = new Date().toDateString();
        const todayConsultations = mappedPatients.filter((p: any) =>
          new Date(p.lastVisit).toDateString() === today
        ).length;

        setStats({
          todayConsultations,
          totalPatients: mappedPatients.length,
          pendingEvaluations: mappedPatients.filter((p: any) => !p.gestationalWeek || p.gestationalWeek === '-').length
        });

      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    };

    fetchPatients();
  }, []);

  const quickStats = [
    {
      label: 'Consultas Hoje',
      value: stats.todayConsultations.toString(),
      icon: 'ri-calendar-check-line',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      label: 'Pacientes Acompanhados',
      value: stats.totalPatients.toString(),
      icon: 'ri-user-heart-line',
      color: 'bg-green-100 text-green-600'
    },
    {
      label: 'Avaliações Pendentes',
      value: stats.pendingEvaluations.toString(),
      icon: 'ri-file-list-3-line',
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Bem-vindo, {userName}!</h2>
          <p className="text-gray-500 capitalize">{currentDate}</p>
        </div>

        <button
          onClick={() => navigate('/checklist')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm w-fit"
        >
          <i className="ri-add-line text-xl"></i>
          Nova Avaliação
        </button>
      </div>

      {/* Welcome Card */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <i className="ri-stethoscope-line text-4xl text-blue-600"></i>
          </div>
          <div className="text-center md:text-left flex-1">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Avaliação Nutricional Pré-Natal
            </h3>
            <p className="text-gray-600 mb-4">
              Ferramenta para acompanhamento nutricional de gestantes baseada em evidências científicas e nas diretrizes do Ministério da Saúde.
            </p>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                <i className="ri-check-line mr-1"></i>FIGO Guidelines
              </span>
              <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-medium">
                <i className="ri-check-line mr-1"></i>Caderneta da Gestante
              </span>
              <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-medium">
                <i className="ri-check-line mr-1"></i>Atualizado 2024
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-800">{stat.value}</div>
                <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                <i className={`${stat.icon} text-xl`}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Patients */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <i className="ri-time-line text-blue-600"></i>
            Pacientes Recentes
          </h3>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-blue-600 text-sm font-medium hover:text-blue-700"
          >
            Ver Todos
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          {recentPatients.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <i className="ri-user-add-line text-4xl text-gray-300 mb-3 block"></i>
              <p>Nenhum paciente cadastrado ainda.</p>
              <button
                onClick={() => navigate('/checklist')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                Iniciar Primeira Avaliação
              </button>
            </div>
          ) : (
            recentPatients.map(patient => (
              <div
                key={patient.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/patient/${patient.id}`)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                    <span className="text-pink-600 font-bold">{patient.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 text-sm">{patient.name}</h4>
                    <p className="text-xs text-gray-500">
                      {patient.age} anos • {patient.gestationalWeek}ª semana
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${patient.status === 'normal' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                  <span className="text-xs text-gray-500">
                    {new Date(patient.lastVisit).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                  </span>
                  <i className="ri-arrow-right-s-line text-gray-400"></i>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Information Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 shadow-sm text-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">Baseado em Evidências Científicas</h3>
            <p className="text-sm text-blue-100 leading-relaxed">
              Esta ferramenta segue as diretrizes da Caderneta da Gestante 2022 e protocolos FIGO para acompanhamento nutricional pré-natal seguro e eficaz.
            </p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center ml-4 flex-shrink-0">
            <i className="ri-shield-check-line text-2xl"></i>
          </div>
        </div>
      </div>
    </div>
  );
}
