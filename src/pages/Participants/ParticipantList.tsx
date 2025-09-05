import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';
import DataTable from '../../components/common/DataTable';
import { FiAward, FiCalendar, FiMail, FiPhone, FiSearch } from '../../utils/icons';

interface Participant {
  id: string;
  name: string;
  email: string;
  phone: string;
  campaignId: string;
  campaignName: string;
  registrationDate: string;
  votesReceived: number;
  status: 'active' | 'inactive' | 'winner';
  photo?: string;
}

const ParticipantList: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [filteredParticipants, setFilteredParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [campaignFilter, setCampaignFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [campaigns, setCampaigns] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetchParticipants();
    fetchCampaigns();
  }, []);

  useEffect(() => {
    filterParticipants();
  }, [participants, searchTerm, campaignFilter, statusFilter]);

  const fetchParticipants = async () => {
    try {
      // Simulated data - replace with actual API call
      const mockData: Participant[] = [
        {
          id: '1',
          name: 'Maria Silva',
          email: 'maria.silva@email.com',
          phone: '(11) 98765-4321',
          campaignId: '1',
          campaignName: 'Educação para Todos',
          registrationDate: '2024-01-20',
          votesReceived: 234,
          status: 'active',
        },
        {
          id: '2',
          name: 'João Santos',
          email: 'joao.santos@email.com',
          phone: '(21) 91234-5678',
          campaignId: '1',
          campaignName: 'Educação para Todos',
          registrationDate: '2024-01-22',
          votesReceived: 189,
          status: 'active',
        },
        {
          id: '3',
          name: 'Ana Costa',
          email: 'ana.costa@email.com',
          phone: '(31) 99876-5432',
          campaignId: '2',
          campaignName: 'Saúde em Primeiro Lugar',
          registrationDate: '2024-02-05',
          votesReceived: 456,
          status: 'winner',
        },
      ];
      setParticipants(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching participants:', error);
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      // Simulated data - replace with actual API call
      const mockCampaigns = [
        { id: '1', name: 'Educação para Todos' },
        { id: '2', name: 'Saúde em Primeiro Lugar' },
        { id: '3', name: 'Meio Ambiente Sustentável' },
      ];
      setCampaigns(mockCampaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const filterParticipants = () => {
    let filtered = [...participants];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.phone.includes(searchTerm)
      );
    }

    // Campaign filter
    if (campaignFilter !== 'all') {
      filtered = filtered.filter((p) => p.campaignId === campaignFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    setFilteredParticipants(filtered);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      winner: 'bg-yellow-100 text-yellow-800',
    };
    const labels = {
      active: 'Ativo',
      inactive: 'Inativo',
      winner: 'Vencedor',
    };
    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${
          styles[status as keyof typeof styles]
        }`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const columns = [
    {
      key: 'name',
      header: 'Participante',
      sortable: true,
      render: (participant: Participant) => (
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400 flex items-center justify-center text-white font-semibold">
              {participant.name.charAt(0)}
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{participant.name}</div>
            <div className="text-sm text-gray-500">{participant.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'campaignName',
      header: 'Campanha',
      sortable: true,
      render: (participant: Participant) => (
        <div>
          <div className="text-sm text-gray-900">{participant.campaignName}</div>
          <div className="text-xs text-gray-500">ID: {participant.campaignId}</div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Contato',
      render: (participant: Participant) => (
        <div>
          <div className="flex items-center text-sm text-gray-900">
            <FiPhone className="w-4 h-4 mr-1 text-gray-400" />
            {participant.phone}
          </div>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <FiMail className="w-4 h-4 mr-1 text-gray-400" />
            {participant.email}
          </div>
        </div>
      ),
    },
    {
      key: 'registrationDate',
      header: 'Data de Registro',
      sortable: true,
      render: (participant: Participant) => (
        <div className="flex items-center text-sm text-gray-900">
          <FiCalendar className="w-4 h-4 mr-2 text-gray-400" />
          {format(new Date(participant.registrationDate), 'dd/MM/yyyy', { locale: ptBR })}
        </div>
      ),
    },
    {
      key: 'votesReceived',
      header: 'Votos',
      sortable: true,
      render: (participant: Participant) => (
        <div className="flex items-center">
          <FiAward className="w-4 h-4 mr-2 text-yellow-500" />
          <span className="text-sm font-semibold text-gray-900">
            {participant.votesReceived.toLocaleString()}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (participant: Participant) => getStatusBadge(participant.status),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Participantes</h1>
          <p className="text-gray-600">Gerencie todos os participantes das campanhas</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Total:</span>
          <span className="text-lg font-semibold text-purple-600">
            {filteredParticipants.length} participantes
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, email ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            value={campaignFilter}
            onChange={(e) => setCampaignFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Todas as Campanhas</option>
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.name}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Todos os Status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
            <option value="winner">Vencedores</option>
          </select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total de Participantes', value: participants.length, color: 'bg-purple-500' },
          { label: 'Participantes Ativos', value: participants.filter(p => p.status === 'active').length, color: 'bg-green-500' },
          { label: 'Total de Votos', value: participants.reduce((sum, p) => sum + p.votesReceived, 0), color: 'bg-blue-500' },
          { label: 'Vencedores', value: participants.filter(p => p.status === 'winner').length, color: 'bg-yellow-500' },
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg opacity-20`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredParticipants}
        columns={columns}
        loading={loading}
        emptyMessage="Nenhum participante encontrado"
      />
    </div>
  );
};

export default ParticipantList;
