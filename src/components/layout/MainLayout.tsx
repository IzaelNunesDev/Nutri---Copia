import { type ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';

interface MainLayoutProps {
    children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const userName = localStorage.getItem('userName') || 'Profissional';

    const menuItems = [
        { label: 'Home', icon: 'ri-home-line', path: '/home' },
        { label: 'Pacientes', icon: 'ri-user-line', path: '/dashboard' },
        { label: 'Avaliações', icon: 'ri-file-list-3-line', path: '/checklist' },
        { label: 'Referências', icon: 'ri-book-read-line', path: '/references' },
        { label: 'Agenda', icon: 'ri-calendar-line', path: '#' },
        { label: 'Configurações', icon: 'ri-settings-4-line', path: '#' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar Fixa - Desktop */}
            {location.pathname !== '/checklist' && (
                <aside className="w-64 bg-white border-r border-gray-200 fixed h-full z-20 hidden md:flex flex-col">
                    {/* Logo */}
                    <div className="p-6 border-b border-gray-100">
                        <h1
                            className="text-2xl font-bold text-blue-600 cursor-pointer"
                            style={{ fontFamily: '"Pacifico", cursive' }}
                            onClick={() => navigate('/home')}
                        >
                            NutriPré
                        </h1>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 mt-4 px-4 space-y-1">
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path ||
                                (item.path === '/dashboard' && location.pathname.startsWith('/patient'));
                            return (
                                <button
                                    key={item.label}
                                    onClick={() => item.path !== '#' && navigate(item.path)}
                                    disabled={item.path === '#'}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                        ? 'bg-blue-50 text-blue-600 font-medium'
                                        : item.path === '#'
                                            ? 'text-gray-300 cursor-not-allowed'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                                        }`}
                                >
                                    <i className={`${item.icon} text-xl`}></i>
                                    <span className="text-sm">{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>

                    {/* User Section */}
                    <div className="p-4 border-t border-gray-100">
                        <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                                {userName.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">{userName}</p>
                                <p className="text-xs text-gray-500">Nutricionista</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                title="Sair"
                            >
                                <i className="ri-logout-box-r-line text-lg"></i>
                            </button>
                        </div>
                    </div>
                </aside>
            )}

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-30">
                <div className="flex items-center justify-between px-4 py-3">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 text-gray-600"
                    >
                        <i className={`${isMobileMenuOpen ? 'ri-close-line' : 'ri-menu-line'} text-xl`}></i>
                    </button>
                    <h1
                        className="text-xl font-bold text-blue-600"
                        style={{ fontFamily: '"Pacifico", cursive' }}
                    >
                        NutriPré
                    </h1>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                        {userName.charAt(0).toUpperCase()}
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-20"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside className={`md:hidden fixed top-0 left-0 h-full w-64 bg-white z-30 transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h1
                        className="text-xl font-bold text-blue-600"
                        style={{ fontFamily: '"Pacifico", cursive' }}
                    >
                        NutriPré
                    </h1>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-2 text-gray-600"
                    >
                        <i className="ri-close-line text-xl"></i>
                    </button>
                </div>

                <nav className="mt-4 px-4 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <button
                                key={item.label}
                                onClick={() => {
                                    if (item.path !== '#') {
                                        navigate(item.path);
                                        setIsMobileMenuOpen(false);
                                    }
                                }}
                                disabled={item.path === '#'}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${isActive
                                    ? 'bg-blue-50 text-blue-600 font-medium'
                                    : item.path === '#'
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                                    }`}
                            >
                                <i className={`${item.icon} text-xl`}></i>
                                <span className="text-sm">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                    >
                        <i className="ri-logout-box-r-line text-xl"></i>
                        <span className="text-sm">Sair</span>
                    </button>
                </div>
            </aside>

            {/* Conteúdo Principal */}
            <main className={`flex-1 pt-16 md:pt-0 ${location.pathname === '/checklist' ? 'w-full' : 'md:ml-64'}`}>
                <div className="p-4 md:p-8">
                    {children}
                </div>
            </main>
            <Toaster position="top-right" richColors />
        </div>
    );
}
