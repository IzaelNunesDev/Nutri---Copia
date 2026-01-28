import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/api';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess(false);

        try {
            const response = await authService.forgotPassword(email);
            setSuccess(true);
            setSuccessMessage(response.message);
        } catch (err: any) {
            console.error('Forgot password error:', err);
            if (err.response?.status === 503) {
                setError('Serviço de email temporariamente indisponível. Tente novamente mais tarde.');
            } else if (err.response?.status === 500) {
                setError('Erro ao enviar email de recuperação. Tente novamente.');
            } else if (err.code === 'ERR_NETWORK' || !err.response) {
                setError('Erro de conexão com o servidor. Verifique sua internet.');
            } else {
                setError(err.response?.data?.detail || 'Erro ao solicitar recuperação de senha.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <i className="ri-lock-password-line text-3xl text-white"></i>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: '"Pacifico", serif' }}>
                        NutriPré
                    </h1>
                    <p className="text-sm text-gray-600 mt-2">
                        Recuperação de Senha
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    {!success ? (
                        <>
                            <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center">
                                Esqueceu sua senha?
                            </h2>
                            <p className="text-sm text-gray-500 text-center mb-6">
                                Digite seu e-mail e enviaremos um link para redefinir sua senha.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        E-mail
                                    </label>
                                    <div className="relative">
                                        <i className="ri-mail-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                                            placeholder="seu@email.com"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                                        <div className="flex items-center">
                                            <i className="ri-error-warning-line text-red-500 mr-2"></i>
                                            <p className="text-red-700 text-sm">{error}</p>
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            <span>Enviando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <i className="ri-mail-send-line text-lg"></i>
                                            <span>Enviar Link de Recuperação</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i className="ri-mail-check-line text-3xl text-green-600"></i>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                Verifique seu E-mail
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                                {successMessage}
                            </p>

                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                                <div className="flex items-start space-x-3">
                                    <i className="ri-information-line text-blue-600 text-lg flex-shrink-0 mt-0.5"></i>
                                    <div className="text-left">
                                        <p className="text-sm text-blue-800 font-medium mb-1">Próximos passos:</p>
                                        <ul className="text-xs text-blue-700 space-y-1">
                                            <li>1. Acesse sua caixa de entrada</li>
                                            <li>2. Procure um email de "NutriPré"</li>
                                            <li>3. Clique no link de recuperação</li>
                                            <li>4. Crie sua nova senha</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                                <div className="flex items-center space-x-2">
                                    <i className="ri-spam-2-line text-amber-600"></i>
                                    <p className="text-xs text-amber-700">
                                        Não encontrou? Verifique sua pasta de <strong>spam</strong> ou <strong>lixo eletrônico</strong>.
                                    </p>
                                </div>
                            </div>

                            <p className="text-xs text-gray-400">
                                O link expira em 1 hora.
                            </p>
                        </div>
                    )}

                    <div className="mt-6 text-center">
                        <Link to="/" className="text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center space-x-1">
                            <i className="ri-arrow-left-line"></i>
                            <span>Voltar para o login</span>
                        </Link>
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-white/50 rounded-2xl p-4 mt-6 text-center">
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                        <i className="ri-shield-check-line text-green-600"></i>
                        <span>Seus dados estão protegidos</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

