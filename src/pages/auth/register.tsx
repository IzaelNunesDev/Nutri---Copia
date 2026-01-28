
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/api';

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('As senhas não coincidem.');
            setIsLoading(false);
            return;
        }

        try {
            console.log('Attempting registration with API:', import.meta.env.VITE_API_URL || 'http://localhost:8000');
            await authService.register({
                email: formData.email,
                password: formData.password,
                full_name: formData.full_name,
                role: 'healthcare_professional'
            });

            // Redirect to login after successful registration
            navigate('/login', { state: { message: 'Cadastro realizado com sucesso! Faça login.' } });
        } catch (err: any) {
            console.error('Registration error:', err);
            console.error('Error response:', err.response);
            console.error('Error message:', err.message);

            if (err.response?.status === 400) {
                setError('Este e-mail já está cadastrado.');
            } else if (err.code === 'ERR_NETWORK' || !err.response) {
                setError('Erro de conexão com o servidor. Verifique sua internet e tente novamente.');
            } else {
                setError(`Erro ao realizar cadastro: ${err.response?.data?.detail || err.message || 'Tente novamente.'}`);
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
                        <i className="ri-stethoscope-line text-3xl text-white"></i>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: '"Pacifico", serif' }}>
                        NutriPré
                    </h1>
                    <p className="text-sm text-gray-600 mt-2">
                        Cadastro de Profissional
                    </p>
                </div>

                {/* Register Form */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
                        Criar Conta
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nome Completo
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                                placeholder="Seu nome completo"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                E-mail
                            </label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                                placeholder="seu@email.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Senha
                            </label>
                            <input
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                                placeholder="Sua senha"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirmar Senha
                            </label>
                            <input
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                                placeholder="Confirme sua senha"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                                <p className="text-red-700 text-sm">{error}</p>
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
                                    <span>Cadastrando...</span>
                                </>
                            ) : (
                                <>
                                    <i className="ri-user-add-line text-lg"></i>
                                    <span>Cadastrar</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Já tem uma conta?{' '}
                            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                                Faça login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
