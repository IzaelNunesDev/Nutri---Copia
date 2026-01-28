# Plano de Refatoração - NutriPré

## Status: Em Andamento
**Data de início:** 2026-01-27

---

## Grupo 1: Refatoração de Dados e Cadastro (Backbone)

### Task 1.1: Migrar DUM e Peso Pré-Gestacional para o Cadastro
- [ ] Adicionar campo **Data da Última Menstruação (DUM)** no `PatientInfo.tsx`
- [ ] Adicionar campo **Data Provável do Parto (DPP)** (calculado ou inserido)
- [ ] Adicionar **Método de Datação** (Radio: DUM ou Ultrassom)
- [ ] Atualizar API `patientService.create()` para incluir novos campos
- [ ] Atualizar API `patientService.update()` para permitir edição
- [ ] Garantir edição no Perfil da Paciente (`[id].tsx`)

### Task 1.2: Ajustar Payload da Nova Avaliação
- [ ] Remover inputs de DUM da tela `ConsultationSetup.tsx`
- [ ] Buscar valores automaticamente do perfil da paciente
- [ ] Exibir dados como Read-only no cabeçalho

---

## Grupo 2: Lógica Temporal e Cálculos

### Task 2.1: Implementar Seletor de "Data da Consulta"
- [ ] Adicionar campo **Data da Avaliação** em `ConsultationSetup.tsx`
- [ ] Default: Data de hoje (`new Date()`)
- [ ] Permitir seleção de datas passadas

### Task 2.2: Atualizar Algoritmo de Idade Gestacional (IG)
- [ ] Mudar lógica de `IG = Hoje - DUM` para `IG = Data_da_Avaliação - DUM`
- [ ] Manter regra de arredondamento FIGO (4+ dias arredonda para cima)
- [ ] Atualizar `calculosService.calculateGestationalAge()`

---

## Grupo 3: UX/UI e Navegação (Steppers)

### Task 3.1: Redesign do Stepper Global (Nível Superior)
- [ ] Simplificar stepper global para Breadcrumb discreto
- [ ] Exemplo: `Paciente > Nova Avaliação > Checklist`

### Task 3.2: Redesign do Stepper Interno (Checklist FIGO)
- [ ] Opção A: Tabs Superiores (Dieta | Suplementos | Estilo de Vida | Revisão)
- [ ] Opção B: Menu Lateral Esquerdo (vertical com checks verdes)
- [ ] **Decisão do usuário necessária**

---

## Arquivos Afetados

### Frontend
- `src/pages/checklist/page.tsx` - Stepper global
- `src/pages/checklist/components/PatientInfo.tsx` - Cadastro
- `src/pages/checklist/components/ConsultationSetup.tsx` - Dados consulta
- `src/pages/checklist/components/ChecklistForm.tsx` - Checklist interno
- `src/pages/patient/[id].tsx` - Perfil da paciente
- `src/services/api.ts` - Serviços de API

### Backend (se necessário)
- Endpoint `/api/pacientes` - Adicionar campos DUM, DPP, metodo_datacao

---

## Progresso

| Fase | Descrição | Status |
|------|-----------|--------|
| 1 | Task 1.1 - Campos DUM/DPP no Cadastro | ⏳ Iniciando |
| 2 | Task 2.1/2.2 - Data da Consulta e IG | 🔲 Pendente |
| 3 | Task 1.2 - Read-only no Setup | 🔲 Pendente |
| 4 | Task 3.1/3.2 - Redesign navegação | 🔲 Pendente |
