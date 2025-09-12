import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import {
  FiArrowLeft,
  FiAward,
  FiBarChart,
  FiCalendar,
  FiDollarSign,
  FiEdit2,
  FiTrendingUp,
  FiUsers,
} from '../../utils/icons';

interface Campaign {
  id: string;
  title: string;
  description: string;
  image: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'pending' | 'completed';
  targetAmount: number;
  raisedAmount: number;
  participantsCount: number;
  votesCount: number;
  category: string;
}

interface Participant {
  id: string;
  name: string;
  votes: number;
  position: number;
  photo?: string;
}

const CampaignDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchCampaignDetails();
  }, [id]);

  const fetchCampaignDetails = async () => {
    try {
      // Simulated data
      const mockCampaign: Campaign = {
        id: '1',
        title: 'Educação para Todos',
        description: 'Campanha para arrecadar fundos para materiais escolares e infraestrutura educacional em comunidades carentes.',
        image: '/images/campaign1.jpg',
        startDate: '2024-01-15',
        endDate: '2024-03-15',
        status: 'active',
        targetAmount: 50000,
        raisedAmount: 32000,
        participantsCount: 45,
        votesCount: 1234,
        category: 'Educação',
      };

      const mockParticipants: Participant[] = [
        { id: '1', name: 'Maria Silva', votes: 456, position: 1 },
        { id: '2', name: 'João Santos', votes: 389, position: 2 },
        { id: '3', name: 'Ana Costa', votes: 234, position: 3 },
        { id: '4', name: 'Pedro Oliveira', votes: 189, position: 4 },
        { id: '5', name: 'Lucia Ferreira', votes: 156, position: 5 },
      ];

      setCampaign(mockCampaign);
      setParticipants(mockParticipants);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching campaign details:', error);
      setLoading(false);
    }
  };

  const dailyVotingData = [
    { day: '01/01', votes: 45, donations: 2300 },
    { day: '02/01', votes: 67, donations: 3200 },
    { day: '03/01', votes: 89, donations: 4100 },
    { day: '04/01', votes: 123, donations: 5600 },
    { day: '05/01', votes: 156, donations: 7200 },
    { day: '06/01', votes: 189, donations: 8900 },
    { day: '07/01', votes: 234, donations: 10500 },
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-gray-100 text-gray-800',
    };
    const labels = {
      active: 'Ativa',
      pending: 'Pendente',
      completed: 'Encerrada',
    };
    return (
      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getProgressPercentage = () => {
    if (!campaign) return 0;
    return Math.min((campaign.raisedAmount / campaign.targetAmount) * 100, 100);
  };

  if (loading || !campaign) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/campaigns')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{campaign.title}</h1>
            <div className="flex items-center space-x-3 mt-1">
              <span className="text-gray-600">{campaign.category}</span>
              {getStatusBadge(campaign.status)}
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate(`/campaigns/${id}/edit`)}
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <FiEdit2 className="w-5 h-5 mr-2" />
          Editar Campanha
        </button>
      </div>

      {/* Campaign Image and Progress */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="relative h-64">
          <img
            src={"https://api.kariajuda.com/"+campaign.image || '/placeholder.jpg'}
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <p className="text-sm mb-2">
              <FiCalendar className="inline w-4 h-4 mr-1" />
              {format(new Date(campaign.startDate), 'dd MMM', { locale: ptBR })} -{' '}
              {format(new Date(campaign.endDate), 'dd MMM yyyy', { locale: ptBR })}
            </p>
            <div className="bg-white/20 rounded-lg backdrop-blur-sm p-3">
              <div className="flex justify-between text-sm mb-2">
                <span>Arrecadado: R$ {campaign.raisedAmount.toLocaleString()}</span>
                <span>{getProgressPercentage().toFixed(0)}%</span>
              </div>
              <div className="w-full bg-white/30 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-500 h-3 rounded-full"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
              <p className="text-xs mt-2">Meta: R$ {campaign.targetAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Participantes</p>
              <p className="text-2xl font-bold text-gray-900">{campaign.participantsCount}</p>
            </div>
            <FiUsers className="w-8 h-8 text-blue-500 opacity-30" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Votos</p>
              <p className="text-2xl font-bold text-gray-900">{campaign.votesCount.toLocaleString()}</p>
            </div>
            <FiBarChart className="w-8 h-8 text-purple-500 opacity-30" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Arrecadado</p>
              <p className="text-2xl font-bold text-gray-900">R$ {campaign.raisedAmount.toLocaleString()}</p>
            </div>
            <FiDollarSign className="w-8 h-8 text-green-500 opacity-30" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Dias Restantes</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}
              </p>
            </div>
            <FiCalendar className="w-8 h-8 text-orange-500 opacity-30" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {['overview', 'participants', 'analytics'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'overview' && 'Visão Geral'}
                {tab === 'participants' && 'Participantes'}
                {tab === 'analytics' && 'Análises'}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Descrição</h3>
                <p className="text-gray-600">{campaign.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <p className="text-sm text-gray-600">Data de Início</p>
                  <p className="font-semibold">
                    {format(new Date(campaign.startDate), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Data de Término</p>
                  <p className="font-semibold">
                    {format(new Date(campaign.endDate), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Categoria</p>
                  <p className="font-semibold">{campaign.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <div className="mt-1">{getStatusBadge(campaign.status)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Participants Tab */}
          {activeTab === 'participants' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Participantes</h3>
              <div className="space-y-3">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl font-bold text-gray-400">#{participant.position}</div>
                      <div>
                        <p className="font-semibold text-gray-900">{participant.name}</p>
                        <p className="text-sm text-gray-600">{participant.votes} votos</p>
                      </div>
                    </div>
                    {participant.position === 1 && <FiAward className="w-6 h-6 text-yellow-500" />}
                    {participant.position === 2 && <FiAward className="w-6 h-6 text-gray-400" />}
                    {participant.position === 3 && <FiAward className="w-6 h-6 text-orange-600" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Tendência de Votação e Doações</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailyVotingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="votes"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      name="Votos"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="donations"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Doações (R$)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <FiTrendingUp className="w-6 h-6 text-green-500 mb-2" />
                  <p className="text-sm text-gray-600">Taxa de Crescimento</p>
                  <p className="text-xl font-bold text-gray-900">+23.5%</p>
                  <p className="text-xs text-gray-500">Últimos 7 dias</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <FiUsers className="w-6 h-6 text-blue-500 mb-2" />
                  <p className="text-sm text-gray-600">Média de Votos/Participante</p>
                  <p className="text-xl font-bold text-gray-900">27.4</p>
                  <p className="text-xs text-gray-500">Total do período</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;
