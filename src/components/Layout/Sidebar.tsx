import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiHome,
  FiAward,
  FiUsers,
  FiBarChart2,
  FiFileText,
  FiUser,
  FiX,
  FiLogOut,
  FiGift,
} from '../../utils/icons';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: <FiHome className="w-5 h-5" />,
    },
    {
      path: '/campaigns',
      name: 'Campanhas',
      icon: <FiAward className="w-5 h-5" />,
    },
    {
      path: '/participants',
      name: 'Participantes',
      icon: <FiUsers className="w-5 h-5" />,
    },
    {
      path: '/voting',
      name: 'Votação',
      icon: <FiBarChart2 className="w-5 h-5" />,
    },
    {
      path: '/winners',
      name: 'Vencedores',
      icon: <FiAward className="w-5 h-5" />,
    },
    {
      path: '/testimonials',
      name: 'Entregas',
      icon: <FiGift className="w-5 h-5" />,
    },
    {
      path: '/content',
      name: 'Conteúdo',
      icon: <FiFileText className="w-5 h-5" />,
    },
    {
      path: '/users',
      name: 'Usuários',
      icon: <FiUser className="w-5 h-5" />,
    },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-purple-900 to-indigo-900 text-white transition-transform duration-300 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="flex items-center justify-between p-6 border-b border-purple-700">
            <h1 className="text-2xl font-bold">Kari Ajuda</h1>
            <button
              onClick={toggleSidebar}
              className="lg:hidden text-white hover:text-purple-200"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-purple-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-lg font-semibold">
                  {(user as any)?.full_name?.charAt(0).toUpperCase() || (user as any)?.username?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
              <div>
                <p className="font-semibold">{(user as any)?.full_name || (user as any)?.username}</p>
                <p className="text-xs text-purple-200">{(user as any)?.is_superuser ? 'Administrador' : 'Usuário'}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-6 py-3 transition-colors duration-200 ${
                    isActive
                      ? 'bg-purple-700 bg-opacity-50 border-r-4 border-white'
                      : 'hover:bg-purple-700 hover:bg-opacity-30'
                  }`
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-purple-700">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-2 py-3 text-left hover:bg-purple-700 hover:bg-opacity-30 rounded-lg transition-colors duration-200"
            >
              <FiLogOut className="w-5 h-5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;