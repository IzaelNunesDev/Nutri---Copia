import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { patientService } from '../../../services/api';

interface PatientData {
  id: string;
  name: string;
  email: string;
  birthDate: string;
  age: string;
  height: string;
  preGestationalWeight: string;
  gestationalWeek: string;
  currentWeight: string;
  isReturningPatient: boolean;
  hasRecordedWeight: boolean;
  phone: string;
  address: string;
  // Campos de gestação (Backbone)
  dum: string; // Data da Última Menstruação
  dpp: string; // Data Provável do Parto
  datingMethod: 'dum' | 'ultrassom'; // Método de datação
}

interface PatientInfoProps {
  data: PatientData;
  onChange: (data: PatientData) => void;
  onNext: () => void;
  onSavePatient?: () => Promise<boolean>;
  isLoading?: boolean;
}

import { z } from 'zod';
import { calculateAge } from '../../../utils/dateUtils';

const patientSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido").optional().or(z.literal('')),
  birthDate: z.string().refine((date) => {
    if (!date) return false;
    const age = calculateAge(date);
    return age !== null && age >= 12 && age <= 60;
  }, "Idade deve estar entre 12 e 60 anos"),
  height: z.string().min(1, "Altura é obrigatória").refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 1.2 && num < 2.2;
  }, "Altura deve estar entre 1.20m e 2.20m"),
  preGestationalWeight: z.string().min(1, "Peso é obrigatório").refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 30 && num < 200;
  }, "Peso deve estar entre 30kg e 200kg"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export default function PatientInfo({ data, onChange, onNext, onSavePatient, isLoading }: PatientInfoProps) {
  const location = useLocation();
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      const pId = (location.state as any)?.patientId;
      if (pId) {
        try {
          const p = await patientService.getById(pId);
          // Calcular idade se tiver data de nascimento
          const birthDateStr = p.data_nascimento || '';
          const calculatedAge = calculateAge(birthDateStr);

          onChange({
            ...data,
            id: p.id,
            name: p.nome,
            email: p.email || '',
            birthDate: birthDateStr,
            age: calculatedAge?.toString() || p.idade?.toString() || '',
            height: p.altura.toString(),
            preGestationalWeight: p.peso_pre_gestacional?.toString() || '',
            hasRecordedWeight: !!p.peso_pre_gestacional,
            isReturningPatient: true,
            gestationalWeek: '',
            currentWeight: ''
          });
        } catch (error) {
          console.error("Error fetching patient", error);
        }
      }
    };
    load();
  }, [location.state]);

  const handleChange = (field: string, value: string) => {
    onChange({ ...data, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  // Handler especial para atualizar data de nascimento E calcular idade
  const handleBirthDateChange = (dateValue: string) => {
    const age = calculateAge(dateValue);
    onChange({
      ...data,
      birthDate: dateValue,
      age: age?.toString() || ''
    });
    if (errors.birthDate) setErrors({ ...errors, birthDate: '' });
  };

  const validate = () => {
    const result = patientSchema.safeParse({
      name: data.name,
      email: data.email,
      birthDate: data.birthDate,
      height: data.height,
      preGestationalWeight: data.preGestationalWeight,
      phone: data.phone,
      address: data.address
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err: any) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleNext = async () => {
    if (!validate()) return;

    // Se for nova paciente e tiver função de salvar, salvar primeiro
    if (!data.isReturningPatient && onSavePatient) {
      const success = await onSavePatient();
      if (!success) return;
    }

    onNext();
  };

  // Idade calculada para exibição
  const displayAge = data.birthDate ? calculateAge(data.birthDate) : null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
      {/* Seção: Dados de Cadastro */}
      <div className="border-b pb-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <i className="ri-user-3-line text-blue-600"></i>
          </div>
          <h2 className="text-lg font-bold text-gray-800">Dados de Cadastro</h2>
        </div>
        <p className="text-sm text-gray-500 ml-10">
          {data.isReturningPatient
            ? "Dados fixos da paciente (já cadastrada)"
            : "Preencha os dados iniciais da paciente"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
        {/* Nome */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Nome</label>
          <input
            value={data.name}
            onChange={e => handleChange('name', e.target.value)}
            disabled={data.isReturningPatient}
            className="w-full p-2.5 border border-gray-200 rounded-lg disabled:bg-gray-100 disabled:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Nome completo"
          />
          {errors.name && <span className="text-xs text-red-500 mt-1">{errors.name}</span>}
        </div>

        {/* E-mail (NOVO) */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            <i className="ri-mail-line mr-1 text-blue-500"></i>
            E-mail
          </label>
          <input
            type="email"
            value={data.email || ''}
            onChange={e => handleChange('email', e.target.value)}
            disabled={data.isReturningPatient}
            className="w-full p-2.5 border border-gray-200 rounded-lg disabled:bg-gray-100 disabled:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="paciente@email.com"
          />
          <p className="text-[10px] text-gray-400 mt-1">Opcional - para contato e lembretes</p>
          {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
        </div>

        {/* Telefone (NOVO) */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            <i className="ri-phone-line mr-1 text-blue-500"></i>
            Telefone
          </label>
          <input
            type="tel"
            value={data.phone || ''}
            onChange={e => handleChange('phone', e.target.value)}
            disabled={data.isReturningPatient}
            className="w-full p-2.5 border border-gray-200 rounded-lg disabled:bg-gray-100 disabled:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="(00) 00000-0000"
          />
          {errors.phone && <span className="text-xs text-red-500 mt-1">{errors.phone}</span>}
        </div>

        {/* Endereço (NOVO) */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            <i className="ri-map-pin-line mr-1 text-blue-500"></i>
            Endereço
          </label>
          <input
            type="text"
            value={data.address || ''}
            onChange={e => handleChange('address', e.target.value)}
            disabled={data.isReturningPatient}
            className="w-full p-2.5 border border-gray-200 rounded-lg disabled:bg-gray-100 disabled:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Endereço completo"
          />
        </div>

        {/* Data de Nascimento (SUBSTITUI IDADE) */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            <i className="ri-calendar-line mr-1 text-blue-500"></i>
            Data de Nascimento
          </label>
          <div className="flex gap-3 items-center">
            <input
              type="date"
              value={data.birthDate || ''}
              onChange={e => handleBirthDateChange(e.target.value)}
              disabled={data.isReturningPatient}
              className="flex-1 p-2.5 border border-gray-200 rounded-lg disabled:bg-gray-100 disabled:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />

            {/* Mostrador visual da idade calculada */}
            {displayAge !== null && (
              <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg whitespace-nowrap border border-blue-200">
                <i className="ri-user-heart-line mr-1"></i>
                {displayAge} anos
              </span>
            )}
          </div>
          <p className="text-[10px] text-gray-400 mt-1">A idade é calculada automaticamente</p>
          {errors.birthDate && <span className="text-xs text-red-500">{errors.birthDate}</span>}
        </div>

        {/* Altura */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Altura (m)</label>
          <input
            type="text"
            inputMode="decimal"
            pattern="[0-9]*[.,]?[0-9]*"
            value={data.height}
            onChange={e => {
              const value = e.target.value.replace(',', '.').replace(/[^0-9.]/g, '');
              const parts = value.split('.');
              const cleanValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : value;
              handleChange('height', cleanValue);
            }}
            disabled={data.isReturningPatient}
            className="w-full p-2.5 border border-gray-200 rounded-lg disabled:bg-gray-100 disabled:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Ex: 1.65"
          />
          {errors.height && <span className="text-xs text-red-500 mt-1">{errors.height}</span>}
        </div>

        {/* Peso Pré-Gestacional */}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Peso Pré-Gestacional (kg)</label>
          <input
            type="text"
            inputMode="decimal"
            pattern="[0-9]*[.,]?[0-9]*"
            value={data.preGestationalWeight}
            onChange={e => {
              const value = e.target.value.replace(',', '.').replace(/[^0-9.]/g, '');
              const parts = value.split('.');
              const cleanValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : value;
              handleChange('preGestationalWeight', cleanValue);
            }}
            disabled={data.isReturningPatient && !!data.hasRecordedWeight}
            className="w-full p-2.5 border border-gray-200 rounded-lg disabled:bg-gray-100 disabled:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Ex: 60.5"
          />
          <p className="text-[10px] text-gray-400 mt-1">Peso antes da gestação (dado histórico fixo)</p>
          {errors.preGestationalWeight && <span className="text-xs text-red-500">{errors.preGestationalWeight}</span>}
        </div>
      </div>

      {/* =========================================== */}
      {/* NOVA SEÇÃO: Dados da Gestação (Backbone) */}
      {/* =========================================== */}
      <div className="border-t pt-4 mt-2">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
            <i className="ri-heart-pulse-line text-pink-600"></i>
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-800">Dados da Gestação</h3>
            <p className="text-xs text-gray-500">Informações fixas do episódio gestacional atual</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-pink-50/50 p-4 rounded-xl border border-pink-100">
          {/* Método de Datação */}
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-2">
              <i className="ri-calendar-check-line mr-1 text-pink-500"></i>
              Método de Datação da Gestação
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2.5 rounded-lg border border-gray-200 hover:border-pink-300 transition-colors">
                <input
                  type="radio"
                  name="datingMethod"
                  checked={data.datingMethod === 'dum' || !data.datingMethod}
                  onChange={() => onChange({ ...data, datingMethod: 'dum' })}
                  disabled={data.isReturningPatient && !!data.dum} // Só desabilita se JÁ TEM DUM
                  className="text-pink-600 focus:ring-pink-500"
                />
                <span className="text-sm text-gray-700">Por DUM (Data da Última Menstruação)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2.5 rounded-lg border border-gray-200 hover:border-pink-300 transition-colors">
                <input
                  type="radio"
                  name="datingMethod"
                  checked={data.datingMethod === 'ultrassom'}
                  onChange={() => onChange({ ...data, datingMethod: 'ultrassom' })}
                  disabled={data.isReturningPatient && !!data.dum} // Só desabilita se JÁ TEM DUM (ou seja, já foi definido)
                  className="text-pink-600 focus:ring-pink-500"
                />
                <span className="text-sm text-gray-700">Por Ultrassom</span>
              </label>
            </div>
          </div>

          {/* DUM - Data da Última Menstruação */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              <i className="ri-calendar-line mr-1 text-pink-500"></i>
              Data da Última Menstruação (DUM)
            </label>
            <input
              type="date"
              value={data.dum || ''}
              onChange={e => {
                const dumValue = e.target.value;
                // Calcular DPP automaticamente (DUM + 280 dias = 40 semanas)
                let calculatedDpp = '';
                if (dumValue && (data.datingMethod === 'dum' || !data.datingMethod)) {
                  const dumDate = new Date(dumValue);
                  const dppDate = new Date(dumDate);
                  dppDate.setDate(dppDate.getDate() + 280); // 40 semanas
                  calculatedDpp = dppDate.toISOString().split('T')[0];
                }
                onChange({
                  ...data,
                  dum: dumValue,
                  dpp: data.datingMethod === 'ultrassom' ? data.dpp : calculatedDpp
                });
                if (errors.dum) setErrors({ ...errors, dum: '' });
              }}
              disabled={data.isReturningPatient && !!data.dum} // Permite editar se estiver vazio
              max={new Date().toISOString().split('T')[0]} // Não pode ser futura
              className="w-full p-2.5 border border-gray-200 rounded-lg disabled:bg-gray-100 disabled:text-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
            />
            <p className="text-[10px] text-gray-400 mt-1">Primeiro dia do último ciclo menstrual</p>
            {errors.dum && <span className="text-xs text-red-500">{errors.dum}</span>}
          </div>

          {/* DPP - Data Provável do Parto */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              <i className="ri-calendar-event-line mr-1 text-pink-500"></i>
              Data Provável do Parto (DPP)
            </label>
            <input
              type="date"
              value={data.dpp || ''}
              onChange={e => {
                const dppValue = e.target.value;
                // Se método é ultrassom, permitir edição direta do DPP
                // Se método é DUM, calcular DUM baseado no DPP
                let calculatedDum = data.dum;
                if (dppValue && data.datingMethod === 'ultrassom') {
                  const dppDate = new Date(dppValue);
                  const dumDate = new Date(dppDate);
                  dumDate.setDate(dumDate.getDate() - 280); // DPP - 40 semanas = DUM
                  calculatedDum = dumDate.toISOString().split('T')[0];
                }
                onChange({
                  ...data,
                  dpp: dppValue,
                  dum: data.datingMethod === 'ultrassom' ? calculatedDum : data.dum
                });
                if (errors.dpp) setErrors({ ...errors, dpp: '' });
              }}
              disabled={(data.isReturningPatient && !!data.dpp) || (data.datingMethod !== 'ultrassom' && data.datingMethod !== undefined)}
              min={new Date().toISOString().split('T')[0]} // Deve ser futura
              className={`w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all ${(data.datingMethod !== 'ultrassom' && data.datingMethod !== undefined)
                ? 'bg-gray-50 text-gray-600 cursor-not-allowed'
                : 'disabled:bg-gray-100 disabled:text-gray-500'
                }`}
            />
            <p className="text-[10px] text-gray-400 mt-1">
              {data.datingMethod === 'ultrassom'
                ? 'Insira a DPP corrigida pelo ultrassom'
                : 'Calculada automaticamente pela DUM'}
            </p>
            {errors.dpp && <span className="text-xs text-red-500">{errors.dpp}</span>}
          </div>

          {/* Informativo de Semanas Restantes */}
          {data.dpp && (
            <div className="md:col-span-2">
              {(() => {
                const dpp = new Date(data.dpp);
                const today = new Date();
                const diffTime = dpp.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const diffWeeks = Math.floor(diffDays / 7);

                if (diffDays > 0) {
                  return (
                    <div className="flex items-center gap-2 text-sm text-pink-700 bg-pink-100 p-3 rounded-lg border border-pink-200">
                      <i className="ri-time-line text-lg"></i>
                      <span>
                        Faltam aproximadamente <strong>{diffWeeks} semanas</strong> ({diffDays} dias) para a data provável do parto.
                      </span>
                    </div>
                  );
                } else {
                  return (
                    <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-100 p-3 rounded-lg border border-amber-200">
                      <i className="ri-alert-line text-lg"></i>
                      <span>A data provável do parto já passou. Verifique se os dados estão corretos.</span>
                    </div>
                  );
                }
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Informação para paciente retornando */}
      {data.isReturningPatient && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <i className="ri-information-line text-blue-600 text-lg mt-0.5"></i>
            <div>
              <p className="text-sm text-blue-800 font-medium">Paciente já cadastrada</p>
              <p className="text-xs text-blue-600 mt-1">
                Os dados de cadastro estão bloqueados. Clique em "Próximo" para informar os dados da consulta atual.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Botão de Ação */}
      <button
        onClick={handleNext}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Salvando...</span>
          </>
        ) : (
          <>
            <span>{data.isReturningPatient ? 'Próximo: Dados da Consulta' : 'Cadastrar e Continuar'}</span>
            <i className="ri-arrow-right-line"></i>
          </>
        )}
      </button>
    </div>
  );
}

