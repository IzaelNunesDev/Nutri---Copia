
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('Attempting login with API:', import.meta.env.VITE_API_URL || 'http://localhost:8000');
      const response = await authService.login({
        username: formData.email,
        password: formData.password
      });

      localStorage.setItem('token', response.access_token);
      localStorage.setItem('authenticated', 'true');

      // Get user details
      const user = response.user;
      localStorage.setItem('userRole', user.role || 'healthcare_professional');
      localStorage.setItem('userName', user.full_name || user.email);

      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      console.error('Error response:', err.response);

      if (err.response?.status === 401) {
        setError('E-mail ou senha incorretos.');
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        setError('Erro de conexão com o servidor. Verifique sua internet e tente novamente.');
      } else {
        setError(`Erro ao fazer login: ${err.response?.data?.detail || err.message || 'Tente novamente.'}`);
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
            Sistema de Acompanhamento Nutricional Pré-Natal
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
            Acesso Profissional
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  <span>Entrando...</span>
                </>
              ) : (
                <>
                  <i className="ri-login-box-line text-lg"></i>
                  <span>Entrar</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
              Esqueceu sua senha?
            </Link>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-white/50 rounded-2xl p-4 mt-6 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <i className="ri-shield-check-line text-green-600"></i>
            <span>Acesso restrito a profissionais de saúde</span>
          </div>
        </div>
      </div>
    </div>
  );
}
