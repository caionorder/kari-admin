import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import DataTable from '../../components/common/DataTable';
import { FiEdit2, FiLock, FiPlus, FiShield, FiTrash2, FiUser } from '../../utils/icons';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'moderator' | 'viewer';
  status: 'active' | 'inactive';
  lastLogin: string;
  createdAt: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'viewer' as 'admin' | 'moderator' | 'viewer',
    password: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Simulated data
      const mockUsers: User[] = [
        {
          id: '1',
          name: 'Admin Master',
          email: 'admin@kariajuda.com',
          role: 'admin',
          status: 'active',
          lastLogin: '2024-01-30T10:30:00',
          createdAt: '2023-01-01',
        },
        {
          id: '2',
          name: 'João Moderador',
          email: 'joao.mod@kariajuda.com',
          role: 'moderator',
          status: 'active',
          lastLogin: '2024-01-29T15:45:00',
          createdAt: '2023-06-15',
        },
        {
          id: '3',
          name: 'Maria Visualizadora',
          email: 'maria.viewer@kariajuda.com',
          role: 'viewer',
          status: 'inactive',
          lastLogin: '2024-01-15T08:00:00',
          createdAt: '2023-09-20',
        },
      ];
      setUsers(mockUsers);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        password: '',
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        role: 'viewer',
        password: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      role: 'viewer',
      password: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Update user
        setUsers(users.map(u =>
          u.id === editingUser.id
            ? { ...u, ...formData }
            : u
        ));
        toast.success('Usuário atualizado com sucesso!');
      } else {
        // Create new user
        const newUser: User = {
          id: String(users.length + 1),
          name: formData.name,
          email: formData.email,
          role: formData.role,
          status: 'active',
          lastLogin: '',
          createdAt: new Date().toISOString().split('T')[0],
        };
        setUsers([...users, newUser]);
        toast.success('Usuário criado com sucesso!');
      }
      handleCloseModal();
    } catch (error) {
      toast.error('Erro ao salvar usuário');
    }
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        setUsers(users.filter(u => u.id !== userId));
        toast.success('Usuário excluído com sucesso!');
      } catch (error) {
        toast.error('Erro ao excluir usuário');
      }
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      setUsers(users.map(u =>
        u.id === userId
          ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' }
          : u
      ));
      toast.success('Status atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      admin: 'bg-purple-100 text-purple-800',
      moderator: 'bg-blue-100 text-blue-800',
      viewer: 'bg-gray-100 text-gray-800',
    };
    const labels = {
      admin: 'Administrador',
      moderator: 'Moderador',
      viewer: 'Visualizador',
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[role as keyof typeof styles]}`}>
        {labels[role as keyof typeof labels]}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
    };
    const labels = {
      active: 'Ativo',
      inactive: 'Inativo',
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const columns = [
    {
      key: 'name',
      header: 'Usuário',
      sortable: true,
      render: (user: User) => (
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400 flex items-center justify-center text-white font-semibold">
              {user.name.charAt(0)}
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{user.name}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Função',
      render: (user: User) => getRoleBadge(user.role),
    },
    {
      key: 'status',
      header: 'Status',
      render: (user: User) => getStatusBadge(user.status),
    },
    {
      key: 'lastLogin',
      header: 'Último Acesso',
      sortable: true,
      render: (user: User) => (
        <span className="text-sm text-gray-900">
          {user.lastLogin ? new Date(user.lastLogin).toLocaleString('pt-BR') : 'Nunca'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (user: User) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleOpenModal(user)}
            className="text-blue-600 hover:text-blue-900"
            title="Editar"
          >
            <FiEdit2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleToggleStatus(user.id)}
            className={`${user.status === 'active' ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}`}
            title={user.status === 'active' ? 'Desativar' : 'Ativar'}
          >
            <FiLock className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleDelete(user.id)}
            className="text-red-600 hover:text-red-900"
            title="Excluir"
          >
            <FiTrash2 className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestão de Usuários</h1>
          <p className="text-gray-600">Gerencie os usuários administrativos do sistema</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700"
        >
          <FiPlus className="w-5 h-5 mr-2" />
          Novo Usuário
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Usuários</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <FiUser className="w-8 h-8 text-purple-500 opacity-30" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Administradores</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
            <FiShield className="w-8 h-8 text-red-500 opacity-30" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Usuários Ativos</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.status === 'active').length}
              </p>
            </div>
            <div className="w-8 h-8 bg-green-500 rounded-full opacity-30"></div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inativos</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.status === 'inactive').length}
              </p>
            </div>
            <div className="w-8 h-8 bg-gray-500 rounded-full opacity-30"></div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <DataTable
        data={users}
        columns={columns}
        loading={loading}
        emptyMessage="Nenhum usuário encontrado"
      />

      {/* User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Função *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'moderator' | 'viewer' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="viewer">Visualizador</option>
                  <option value="moderator">Moderador</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editingUser ? 'Nova Senha (deixe em branco para manter)' : 'Senha *'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required={!editingUser}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700"
                >
                  {editingUser ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
