import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Sistema de Cores Profissional
const colors = {
    primary: '#059669',
    primaryLight: '#ecfdf5',
    secondary: '#1e40af',
    secondaryLight: '#eff6ff',
    accent: '#7c3aed',
    accentLight: '#f5f3ff',
    danger: '#dc2626',
    dangerLight: '#fef2f2',
    warning: '#d97706',
    warningLight: '#fffbeb',
    success: '#059669',
    successLight: '#ecfdf5',
    gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827'
    }
};

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 10,
        lineHeight: 1.5,
        color: colors.gray[700],
        backgroundColor: '#ffffff',
    },

    // ========== HEADER ==========
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
        paddingBottom: 16,
        borderBottomWidth: 3,
        borderBottomColor: colors.primary,
    },
    brandContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    brandIcon: {
        width: 44,
        height: 44,
        backgroundColor: colors.primary,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    brandIconText: {
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold',
    },
    brandTextContainer: {
        flexDirection: 'column',
    },
    brandName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.primary,
        letterSpacing: -0.5,
    },
    brandTagline: {
        fontSize: 9,
        color: colors.gray[500],
        marginTop: 2,
    },
    headerRight: {
        alignItems: 'flex-end',
    },
    dateText: {
        fontSize: 10,
        color: colors.gray[600],
        marginBottom: 6,
    },
    protocolBadge: {
        fontSize: 8,
        fontWeight: 'bold',
        backgroundColor: colors.gray[800],
        color: 'white',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
    },

    // ========== SECTIONS ==========
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: colors.gray[800],
        marginBottom: 12,
        paddingBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[200],
    },

    // ========== PATIENT INFO GRID ==========
    infoGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 20,
    },
    infoCard: {
        flex: 1,
        backgroundColor: colors.gray[50],
        borderRadius: 8,
        padding: 14,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
    },
    infoCardBlue: {
        flex: 1,
        backgroundColor: colors.secondaryLight,
        borderRadius: 8,
        padding: 14,
        borderLeftWidth: 4,
        borderLeftColor: colors.secondary,
    },
    infoCardPurple: {
        flex: 1,
        backgroundColor: colors.accentLight,
        borderRadius: 8,
        padding: 14,
        borderLeftWidth: 4,
        borderLeftColor: colors.accent,
    },
    infoLabel: {
        fontSize: 8,
        color: colors.gray[500],
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.gray[800],
    },
    infoUnit: {
        fontSize: 10,
        fontWeight: 'normal',
        color: colors.gray[500],
    },
    infoContext: {
        fontSize: 9,
        color: colors.gray[500],
        marginTop: 4,
    },

    // ========== WEIGHT STATUS BOX ==========
    statusBox: {
        padding: 14,
        borderRadius: 8,
        marginBottom: 20,
        borderWidth: 1,
    },
    statusBoxAdequate: {
        backgroundColor: colors.successLight,
        borderColor: '#a7f3d0',
    },
    statusBoxWarning: {
        backgroundColor: colors.warningLight,
        borderColor: '#fcd34d',
    },
    statusBoxDanger: {
        backgroundColor: colors.dangerLight,
        borderColor: '#fecaca',
    },
    statusTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    statusText: {
        fontSize: 10,
        lineHeight: 1.6,
        color: colors.gray[700],
    },

    // ========== FIGO TABLE ==========
    table: {
        marginVertical: 16,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.gray[200],
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: colors.gray[100],
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[200],
    },
    tableHeaderCell: {
        fontSize: 8,
        fontWeight: 'bold',
        color: colors.gray[700],
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray[100],
    },
    tableRowAlt: {
        backgroundColor: colors.gray[50],
    },
    tableCell: {
        fontSize: 9,
        color: colors.gray[700],
    },
    tableCellHighlight: {
        fontSize: 9,
        color: colors.primary,
        fontWeight: 'bold',
    },
    colPeriod: { width: '30%' },
    colGain: { width: '35%' },
    colWeekly: { width: '35%' },

    // ========== FEEDBACK CARDS ==========
    feedbackSection: {
        marginBottom: 16,
    },
    feedbackCard: {
        marginBottom: 10,
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 4,
    },
    feedbackCardCritical: {
        backgroundColor: colors.dangerLight,
        borderLeftColor: colors.danger,
    },
    feedbackCardWarning: {
        backgroundColor: colors.warningLight,
        borderLeftColor: colors.warning,
    },
    feedbackCardSuccess: {
        backgroundColor: colors.successLight,
        borderLeftColor: colors.success,
    },
    feedbackCardInfo: {
        backgroundColor: colors.secondaryLight,
        borderLeftColor: colors.secondary,
    },
    feedbackTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    feedbackTitleCritical: { color: colors.danger },
    feedbackTitleWarning: { color: colors.warning },
    feedbackTitleSuccess: { color: colors.success },
    feedbackTitleInfo: { color: colors.secondary },
    feedbackMessage: {
        fontSize: 9,
        lineHeight: 1.6,
        color: colors.gray[700],
        marginBottom: 4,
    },
    feedbackGuideline: {
        fontSize: 9,
        lineHeight: 1.6,
        color: colors.gray[600],
        marginTop: 6,
        paddingTop: 6,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    feedbackNote: {
        fontSize: 8,
        fontStyle: 'italic',
        color: colors.gray[500],
        marginTop: 6,
    },

    // ========== PROFESSIONAL PAGE ==========
    professionalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 12,
        borderBottomWidth: 2,
        borderBottomColor: colors.accent,
    },
    professionalBrand: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    professionalIcon: {
        width: 40,
        height: 40,
        backgroundColor: colors.accent,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    professionalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.accent,
    },
    professionalSubtitle: {
        fontSize: 9,
        color: colors.gray[500],
    },
    confidentialBadge: {
        fontSize: 8,
        fontWeight: 'bold',
        backgroundColor: colors.danger,
        color: 'white',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 4,
    },
    professionalCard: {
        marginBottom: 10,
        padding: 12,
        backgroundColor: colors.accentLight,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: colors.accent,
    },
    professionalCardTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.accent,
        marginBottom: 4,
    },
    professionalCardText: {
        fontSize: 9,
        lineHeight: 1.6,
        color: colors.gray[700],
    },

    // ========== SIGNATURE ==========
    signatureSection: {
        marginTop: 30,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: colors.gray[200],
    },
    signatureLabel: {
        fontSize: 8,
        color: colors.gray[500],
        marginBottom: 4,
    },
    signatureName: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.gray[800],
    },
    signatureDate: {
        fontSize: 9,
        color: colors.gray[500],
        marginTop: 4,
    },

    // ========== FOOTER ==========
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: colors.gray[200],
    },
    footerText: {
        fontSize: 7,
        color: colors.gray[400],
    },
    footerPage: {
        fontSize: 8,
        color: colors.gray[500],
    },
});

// ========== INTERFACES ==========
export interface FeedbackItem {
    id: string;
    title: string;
    message: string;
    type: 'critical' | 'recommendation' | 'adequate' | 'info' | 'investigate' | 'success' | 'warning' | 'normal' | 'clinical';
    audience: 'professional' | 'patient' | 'both';
    note?: string;
    patientMessage?: string;
}

export interface PatientData {
    name: string;
    age: number;
    height: number;
    gestationalWeek: number;
    preGestationalWeight: number;
    currentWeight: number;
    imc: number;
    imcClassification: string;
    weightGain: number;
    trimester: string;
    professionalName: string;
    evaluationDate: Date;
    observations?: string;
}

export interface FigoData {
    expectedMin: number;
    expectedMax: number;
    totalMin: number;
    totalMax: number;
    weeklyRate: string;
    status: 'adequate' | 'below' | 'above' | 'loss' | 'critical';
    statusMessage: string;
}

interface EvaluationDocumentProps {
    patient: PatientData;
    figo: FigoData;
    patientGuidelines: FeedbackItem[];
    professionalAlerts: FeedbackItem[];
    showProfessionalPage?: boolean;
}

// ========== HELPER COMPONENTS ==========
const InfoCard = ({ label, value, unit, context, variant = 'default' }: {
    label: string;
    value: string | number;
    unit?: string;
    context?: string;
    variant?: 'default' | 'blue' | 'purple';
}) => {
    const cardStyle = variant === 'blue' ? styles.infoCardBlue :
        variant === 'purple' ? styles.infoCardPurple : styles.infoCard;

    return (
        <View style={cardStyle}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>
                {value}<Text style={styles.infoUnit}>{unit}</Text>
            </Text>
            {context && <Text style={styles.infoContext}>{context}</Text>}
        </View>
    );
};

const FeedbackCard = ({ item }: { item: FeedbackItem }) => {
    const isCritical = item.type === 'critical';
    const isWarning = item.type === 'recommendation' || item.type === 'warning' || item.type === 'clinical' || item.type === 'investigate';
    const isSuccess = item.type === 'adequate' || item.type === 'success' || item.type === 'normal';

    const cardStyle = isCritical ? styles.feedbackCardCritical :
        isWarning ? styles.feedbackCardWarning :
            isSuccess ? styles.feedbackCardSuccess : styles.feedbackCardInfo;

    const titleStyle = isCritical ? styles.feedbackTitleCritical :
        isWarning ? styles.feedbackTitleWarning :
            isSuccess ? styles.feedbackTitleSuccess : styles.feedbackTitleInfo;

    const icon = isCritical ? '!' : isWarning ? '>' : isSuccess ? 'v' : '-';

    return (
        <View style={[styles.feedbackCard, cardStyle]}>
            <Text style={[styles.feedbackTitle, titleStyle]}>
                {icon} {item.title}
            </Text>
            <Text style={styles.feedbackMessage}>{item.message}</Text>
            {item.patientMessage && (
                <Text style={styles.feedbackGuideline}>{item.patientMessage}</Text>
            )}
            {item.note && (
                <Text style={styles.feedbackNote}>Nota tecnica: {item.note}</Text>
            )}
        </View>
    );
};

const FigoTable = ({ classification }: { classification: string }) => {
    const data: Record<string, { t1: { range: string }, t2: { range: string, weekly: string }, t3: { range: string, weekly: string }, total: string }> = {
        'Baixo peso': {
            t1: { range: '0,2 a 1,2 kg' },
            t2: { range: '5,6 a 7,2 kg', weekly: '242g/semana' },
            t3: { range: '9,7 a 12,2 kg', weekly: '242g/semana' },
            total: '9,7 - 12,2 kg'
        },
        'Eutrofia': {
            t1: { range: '-1,8 a 0,7 kg' },
            t2: { range: '3,1 a 6,3 kg', weekly: '200g/semana' },
            t3: { range: '8,0 a 12,0 kg', weekly: '200g/semana' },
            total: '8,0 - 12,0 kg'
        },
        'Sobrepeso': {
            t1: { range: '-1,6 a 0 kg' },
            t2: { range: '2,3 a 3,7 kg', weekly: '175g/semana' },
            t3: { range: '7,0 a 9,0 kg', weekly: '175g/semana' },
            total: '7,0 - 9,0 kg'
        },
        'Obesidade': {
            t1: { range: '-1,6 a 0 kg' },
            t2: { range: '1,1 a 2,7 kg', weekly: '125g/semana' },
            t3: { range: '5,0 a 7,2 kg', weekly: '125g/semana' },
            total: '5,0 - 7,2 kg'
        }
    };

    const normalizedClass = classification.replace(' pre-gestacional', '').replace(' pré-gestacional', '');
    const current = data[normalizedClass] || data['Eutrofia'];

    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recomendacoes de Ganho de Peso (FIGO 2021)</Text>

            <View style={styles.table}>
                <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderCell, styles.colPeriod]}>PERIODO</Text>
                    <Text style={[styles.tableHeaderCell, styles.colGain]}>GANHO ESPERADO</Text>
                    <Text style={[styles.tableHeaderCell, styles.colWeekly]}>TAXA SEMANAL</Text>
                </View>

                <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.colPeriod]}>1o Trimestre (ate 13s)</Text>
                    <Text style={[styles.tableCell, styles.colGain]}>{current.t1.range}</Text>
                    <Text style={[styles.tableCell, styles.colWeekly]}>Manutencao</Text>
                </View>

                <View style={[styles.tableRow, styles.tableRowAlt]}>
                    <Text style={[styles.tableCell, styles.colPeriod]}>2o Trimestre (14-27s)</Text>
                    <Text style={[styles.tableCell, styles.colGain]}>{current.t2.range}</Text>
                    <Text style={[styles.tableCellHighlight, styles.colWeekly]}>{current.t2.weekly}</Text>
                </View>

                <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.colPeriod]}>3o Trimestre (28-40s)</Text>
                    <Text style={[styles.tableCell, styles.colGain]}>{current.t3.range}</Text>
                    <Text style={[styles.tableCell, styles.colWeekly]}>{current.t3.weekly}</Text>
                </View>
            </View>

            <View style={[styles.statusBox, styles.statusBoxAdequate]}>
                <Text style={[styles.statusTitle, { color: colors.success }]}>Meta Total da Gestacao</Text>
                <Text style={styles.statusText}>
                    Para classificacao de {normalizedClass}, o ganho total recomendado ao final da gestacao e de {current.total}.
                </Text>
            </View>
        </View>
    );
};

// ========== MAIN DOCUMENT ==========
export const EvaluationDocument = ({
    patient,
    figo,
    patientGuidelines,
    professionalAlerts,
    showProfessionalPage = true
}: EvaluationDocumentProps) => {

    let formattedDate = '';
    try {
        const dateObj = patient.evaluationDate instanceof Date && !isNaN(patient.evaluationDate.getTime())
            ? patient.evaluationDate
            : new Date();
        formattedDate = format(dateObj, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
        formattedDate = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    }

    // Filter guidelines for patient
    const guidelinesForPatient = patientGuidelines.filter(g => g.audience === 'patient' || g.audience === 'both');

    // Separate by category
    const criticalItems = guidelinesForPatient.filter(g => g.type === 'critical');
    const warningItems = guidelinesForPatient.filter(g => ['recommendation', 'warning', 'clinical', 'investigate'].includes(g.type));
    const adequateItems = guidelinesForPatient.filter(g => ['adequate', 'success', 'normal'].includes(g.type));

    // Status styles
    const getStatusStyles = () => {
        if (figo.status === 'adequate') return { box: styles.statusBoxAdequate, color: colors.success, title: 'Ganho de Peso Adequado' };
        if (figo.status === 'below') return { box: styles.statusBoxWarning, color: colors.warning, title: 'Atencao: Ganho Abaixo do Esperado' };
        return { box: styles.statusBoxDanger, color: colors.danger, title: 'Atencao ao Ganho de Peso' };
    };
    const statusConfig = getStatusStyles();

    return (
        <Document>
            {/* ========== PAGE 1: PATIENT REPORT ========== */}
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.brandContainer}>
                        <View style={styles.brandIcon}>
                            <Text style={styles.brandIconText}>N</Text>
                        </View>
                        <View style={styles.brandTextContainer}>
                            <Text style={styles.brandName}>NutriPre</Text>
                            <Text style={styles.brandTagline}>Avaliacao Nutricional Pre-Natal</Text>
                        </View>
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={styles.dateText}>{formattedDate}</Text>
                        <Text style={styles.protocolBadge}>Protocolo FIGO</Text>
                    </View>
                </View>

                {/* Patient Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Dados da Gestante</Text>
                    <View style={styles.infoGrid}>
                        <InfoCard
                            label="NOME"
                            value={patient.name}
                            context={`${patient.age} anos`}
                        />
                        <InfoCard
                            label="SEMANA GESTACIONAL"
                            value={patient.gestationalWeek}
                            unit="a sem"
                            context={patient.trimester}
                            variant="purple"
                        />
                        <InfoCard
                            label="IMC PRE-GESTACIONAL"
                            value={patient.imc.toFixed(1)}
                            unit="kg/m2"
                            context={patient.imcClassification}
                            variant="blue"
                        />
                    </View>
                </View>

                {/* Weight Tracking */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Acompanhamento do Peso</Text>
                    <View style={styles.infoGrid}>
                        <InfoCard
                            label="PESO PRE-GESTACIONAL"
                            value={patient.preGestationalWeight.toFixed(1)}
                            unit="kg"
                        />
                        <InfoCard
                            label="PESO ATUAL"
                            value={patient.currentWeight.toFixed(1)}
                            unit="kg"
                            variant="blue"
                        />
                        <InfoCard
                            label="GANHO DE PESO"
                            value={patient.weightGain > 0 ? `+${patient.weightGain.toFixed(1)}` : patient.weightGain.toFixed(1)}
                            unit="kg"
                            context={`Esperado: ${figo.expectedMin} a ${figo.expectedMax} kg`}
                            variant={figo.status === 'adequate' ? 'default' : 'purple'}
                        />
                    </View>
                </View>

                {/* Weight Status */}
                <View style={[styles.statusBox, statusConfig.box]}>
                    <Text style={[styles.statusTitle, { color: statusConfig.color }]}>{statusConfig.title}</Text>
                    <Text style={styles.statusText}>{figo.statusMessage}</Text>
                </View>

                {/* FIGO Table */}
                <FigoTable classification={patient.imcClassification} />

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Fonte: Adaptado de Kac et al., 2021 (FIGO) e Caderneta da Gestante MS 2022</Text>
                    <Text style={styles.footerPage}>Pagina 1</Text>
                </View>
            </Page>

            {/* ========== PAGE 2: ORIENTATIONS ========== */}
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.brandContainer}>
                        <View style={styles.brandIcon}>
                            <Text style={styles.brandIconText}>N</Text>
                        </View>
                        <View style={styles.brandTextContainer}>
                            <Text style={styles.brandName}>NutriPre</Text>
                            <Text style={styles.brandTagline}>Orientacoes Nutricionais</Text>
                        </View>
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={styles.dateText}>{patient.name}</Text>
                        <Text style={styles.protocolBadge}>{patient.gestationalWeek}a semana</Text>
                    </View>
                </View>

                {/* Critical Alerts */}
                {criticalItems.length > 0 && (
                    <View style={styles.feedbackSection}>
                        <Text style={styles.sectionTitle}>Alertas Importantes</Text>
                        {criticalItems.map((item, idx) => (
                            <FeedbackCard key={`crit-${idx}`} item={item} />
                        ))}
                    </View>
                )}

                {/* Recommendations */}
                {warningItems.length > 0 && (
                    <View style={styles.feedbackSection}>
                        <Text style={styles.sectionTitle}>Recomendacoes</Text>
                        {warningItems.map((item, idx) => (
                            <FeedbackCard key={`warn-${idx}`} item={item} />
                        ))}
                    </View>
                )}

                {/* Adequate Items */}
                {adequateItems.length > 0 && (
                    <View style={styles.feedbackSection}>
                        <Text style={styles.sectionTitle}>Pontos Adequados</Text>
                        {adequateItems.map((item, idx) => (
                            <FeedbackCard key={`ok-${idx}`} item={item} />
                        ))}
                    </View>
                )}

                {/* No guidelines message */}
                {guidelinesForPatient.length === 0 && (
                    <View style={[styles.statusBox, styles.statusBoxAdequate]}>
                        <Text style={[styles.statusTitle, { color: colors.success }]}>Avaliacao Concluida</Text>
                        <Text style={styles.statusText}>
                            Nenhuma orientacao especifica foi registrada para esta avaliacao. Continue seguindo as orientacoes gerais de alimentacao saudavel na gestacao.
                        </Text>
                    </View>
                )}

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>NutriPre - Sistema de Acompanhamento Nutricional Pre-Natal</Text>
                    <Text style={styles.footerPage}>Pagina 2</Text>
                </View>
            </Page>

            {/* ========== PAGE 3: PROFESSIONAL NOTES (Optional) ========== */}
            {showProfessionalPage && professionalAlerts.length > 0 && (
                <Page size="A4" style={styles.page}>
                    {/* Professional Header */}
                    <View style={styles.professionalHeader}>
                        <View style={styles.professionalBrand}>
                            <View style={styles.professionalIcon}>
                                <Text style={styles.brandIconText}>P</Text>
                            </View>
                            <View>
                                <Text style={styles.professionalTitle}>Area Tecnica</Text>
                                <Text style={styles.professionalSubtitle}>Notas Clinicas e Alertas</Text>
                            </View>
                        </View>
                        <Text style={styles.confidentialBadge}>CONFIDENCIAL</Text>
                    </View>

                    {/* Professional Alerts */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Alertas para o Profissional de Saude</Text>
                        {professionalAlerts.map((alert, idx) => (
                            <View key={`prof-${idx}`} style={styles.professionalCard}>
                                <Text style={styles.professionalCardTitle}>[{idx + 1}] {alert.title}</Text>
                                <Text style={styles.professionalCardText}>{alert.message}</Text>
                                {alert.note && (
                                    <Text style={[styles.feedbackNote, { color: colors.accent }]}>Nota: {alert.note}</Text>
                                )}
                            </View>
                        ))}
                    </View>

                    {/* Technical Observations */}
                    {patient.observations && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Observacoes Tecnicas</Text>
                            <Text style={{ fontSize: 10, lineHeight: 1.6, color: colors.gray[700] }}>
                                {patient.observations}
                            </Text>
                        </View>
                    )}

                    {/* Signature */}
                    <View style={styles.signatureSection}>
                        <Text style={styles.signatureLabel}>Avaliacao realizada por:</Text>
                        <Text style={styles.signatureName}>{patient.professionalName}</Text>
                        <Text style={styles.signatureDate}>{formattedDate}</Text>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Documento gerado eletronicamente pelo sistema NutriPre</Text>
                        <Text style={styles.footerPage}>Pagina 3</Text>
                    </View>
                </Page>
            )}
        </Document>
    );
};