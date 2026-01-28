// src/pages/checklist/components/FeedbackInline.tsx

interface FeedbackInlineProps {
    message: string;
    type: 'info' | 'warning' | 'critical' | 'success';
    icon?: string;
}

export const FeedbackInline = ({ message, type = 'info' }: FeedbackInlineProps) => {
    const styles = {
        info: {
            bg: 'bg-blue-50',
            border: 'border-blue-400',
            text: 'text-blue-800',
            icon: 'ri-information-line'
        },
        warning: {
            bg: 'bg-amber-50',
            border: 'border-amber-400',
            text: 'text-amber-800',
            icon: 'ri-alert-line'
        },
        critical: {
            bg: 'bg-red-50',
            border: 'border-red-400',
            text: 'text-red-800',
            icon: 'ri-error-warning-line'
        },
        success: {
            bg: 'bg-green-50',
            border: 'border-green-400',
            text: 'text-green-800',
            icon: 'ri-check-line'
        }
    };

    const style = styles[type];

    return (
        <div className={`mt-3 p-3 ${style.bg} border-l-4 ${style.border} rounded-md flex items-start gap-2 animate-fade-in`}>
            <i className={`${style.icon} ${style.text} mt-0.5 flex-shrink-0`}></i>
            <span className={`text-xs ${style.text} font-medium leading-relaxed`}>{message}</span>
        </div>
    );
};

export default FeedbackInline;
