import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../../services/api';

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('Token de recuperação não encontrado. Por favor, solicite um novo link.');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('As senhas não coincidem.');
            setIsLoading(false);
            return;
        }

        // Validate password length
        if (formData.password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            setIsLoading(false);
            return;
        }

        try {
            await authService.resetPassword(token!, formData.password);
            setSuccess(true);

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } catch (err: any) {
            console.error('Reset password error:', err);
            if (err.response?.status === 400) {
                setError(err.response?.data?.detail || 'Token inválido ou expirado.');
            } else if (err.code === 'ERR_NETWORK' || !err.response) {
                setError('Erro de conexão com o servidor. Verifique sua internet.');
            } else {
                setError(err.response?.data?.detail || 'Erro ao redefinir senha.');
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
                        <i className="ri-key-2-line text-3xl text-white"></i>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: '"Pacifico", serif' }}>
                        NutriPré
                    </h1>
                    <p className="text-sm text-gray-600 mt-2">
                        Redefinir Senha
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    {!success ? (
                        <>
                            <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center">
                                Criar Nova Senha
                            </h2>
                            <p className="text-sm text-gray-500 text-center mb-6">
                                Digite sua nova senha abaixo.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nova Senha
                                    </label>
                                    <div className="relative">
                                        <i className="ri-lock-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            minLength={6}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full pl-11 pr-12 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                                            placeholder="Mínimo 6 caracteres"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirmar Nova Senha
                                    </label>
                                    <div className="relative">
                                        <i className="ri-lock-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            minLength={6}
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                                            placeholder="Repita a senha"
                                        />
                                    </div>
                                </div>

                                {/* Password strength indicator */}
                                {formData.password && (
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <div className={`h-1 flex-1 rounded-full ${formData.password.length >= 6 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                                            <div className={`h-1 flex-1 rounded-full ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                                            <div className={`h-1 flex-1 rounded-full ${formData.password.length >= 10 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {formData.password.length < 6 ? 'Muito curta' :
                                                formData.password.length < 8 ? 'Fraca' :
                                                    formData.password.length < 10 ? 'Boa' : 'Forte'}
                                        </p>
                                    </div>
                                )}

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
                                    disabled={isLoading || !token}
                                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            <span>Salvando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <i className="ri-save-line text-lg"></i>
                                            <span>Salvar Nova Senha</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                <i className="ri-check-double-line text-3xl text-green-600"></i>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                Senha Alterada com Sucesso!
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">
                                Você será redirecionado para o login em instantes...
                            </p>
                            <div className="animate-pulse">
                                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            </div>
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
                        <span>Conexão segura</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
