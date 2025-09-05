import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import {
  FiBarChart,
  FiClock,
  FiRefreshCw,
  FiTrendingUp,
  FiUsers,
} from '../../utils/icons';

interface VoteData {
  participantId: string;
  participantName: string;
  votes: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  photo?: string;
}

interface VotingStats {
  totalVotes: number;
  votesToday: number;
  uniqueVoters: number;
  averageVotesPerDay: number;
  peakVotingHour: string;
}

const VotingDashboard: React.FC = () => {
  const [voteData, setVoteData] = useState<VoteData[]>([]);
  const [votingStats, setVotingStats] = useState<VotingStats | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState('all');
  const [timeRange, setTimeRange] = useState('7days');
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    fetchVotingData();
    const interval = autoRefresh ? setInterval(fetchVotingData, 30000) : null;
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedCampaign, timeRange, autoRefresh]);

  const fetchVotingData = async () => {
    try {
      // Simulated data
      const mockVoteData: VoteData[] = [
        {
          participantId: '1',
          participantName: 'Maria Silva',
          votes: 4532,
          percentage: 28.5,
          trend: 'up',
        },
        {
          participantId: '2',
          participantName: 'João Santos',
          votes: 3890,
          percentage: 24.5,
          trend: 'up',
        },
        {
          participantId: '3',
          participantName: 'Ana Costa',
          votes: 3456,
          percentage: 21.7,
          trend: 'down',
        },
        {
          participantId: '4',
          participantName: 'Pedro Oliveira',
          votes: 2234,
          percentage: 14.1,
          trend: 'stable',
        },
        {
          participantId: '5',
          participantName: 'Lucia Ferreira',
          votes: 1788,
          percentage: 11.2,
          trend: 'up',
        },
      ];

      const mockStats: VotingStats = {
        totalVotes: 15900,
        votesToday: 1234,
        uniqueVoters: 8567,
        averageVotesPerDay: 2271,
        peakVotingHour: '20:00',
      };

      setVoteData(mockVoteData);
      setVotingStats(mockStats);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching voting data:', error);
      setLoading(false);
    }
  };

  const hourlyVotingData = [
    { hour: '00h', votes: 45 },
    { hour: '04h', votes: 23 },
    { hour: '08h', votes: 156 },
    { hour: '12h', votes: 234 },
    { hour: '16h', votes: 345 },
    { hour: '20h', votes: 567 },
  ];

  const dailyVotingData = [
    { day: 'Seg', votes: 2345 },
    { day: 'Ter', votes: 2567 },
    { day: 'Qua', votes: 2234 },
    { day: 'Qui', votes: 2890 },
    { day: 'Sex', votes: 3456 },
    { day: 'Sáb', votes: 1234 },
    { day: 'Dom', votes: 890 },
  ];

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard de Votação</h1>
          <p className="text-gray-600">Acompanhe os resultados em tempo real</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Todas as Campanhas</option>
            <option value="1">Educação para Todos</option>
            <option value="2">Saúde em Primeiro Lugar</option>
          </select>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="today">Hoje</option>
            <option value="7days">Últimos 7 dias</option>
            <option value="30days">Últimos 30 dias</option>
            <option value="all">Todo período</option>
          </select>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`p-2 rounded-lg transition-colors ${
              autoRefresh
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
            title={autoRefresh ? 'Auto-refresh ativado' : 'Ativar auto-refresh'}
          >
            <FiRefreshCw className={`w-5 h-5 ${autoRefresh ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {votingStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Votos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {votingStats.totalVotes.toLocaleString()}
                </p>
              </div>
              <FiBarChart className="w-8 h-8 text-purple-500 opacity-30" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Votos Hoje</p>
                <p className="text-2xl font-bold text-gray-900">
                  {votingStats.votesToday.toLocaleString()}
                </p>
              </div>
              <FiTrendingUp className="w-8 h-8 text-green-500 opacity-30" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Votantes Únicos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {votingStats.uniqueVoters.toLocaleString()}
                </p>
              </div>
              <FiUsers className="w-8 h-8 text-blue-500 opacity-30" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Média/Dia</p>
                <p className="text-2xl font-bold text-gray-900">
                  {votingStats.averageVotesPerDay.toLocaleString()}
                </p>
              </div>
              <FiBarChart className="w-8 h-8 text-orange-500 opacity-30" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pico de Votação</p>
                <p className="text-2xl font-bold text-gray-900">{votingStats.peakVotingHour}</p>
              </div>
              <FiClock className="w-8 h-8 text-red-500 opacity-30" />
            </div>
          </div>
        </div>
      )}

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Participants */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 5 Participantes</h3>
          <div className="space-y-4">
            {voteData.map((participant, index) => (
              <div key={participant.participantId} className="flex items-center">
                <div className="w-8 text-center font-bold text-gray-600">{index + 1}</div>
                <div className="flex-1 mx-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {participant.participantName}
                    </span>
                    <span className="text-sm text-gray-600">
                      {participant.votes.toLocaleString()} votos
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-6">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                      style={{ width: `${participant.percentage}%` }}
                    >
                      {participant.percentage}%
                    </div>
                  </div>
                </div>
                <div className="ml-2">
                  {participant.trend === 'up' && (
                    <span className="text-green-500">↑</span>
                  )}
                  {participant.trend === 'down' && (
                    <span className="text-red-500">↓</span>
                  )}
                  {participant.trend === 'stable' && (
                    <span className="text-gray-500">→</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vote Distribution Pie Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribuição de Votos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={voteData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ participantName, percentage }) => `${participantName} (${percentage}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="votes"
              >
                {voteData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Voting Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Voting */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Votação por Hora</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={hourlyVotingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="votes"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Voting */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Votação por Dia</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailyVotingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="votes" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Votes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Votos Recentes</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Horário</th>
                <th className="px-4 py-2 text-left">Votante</th>
                <th className="px-4 py-2 text-left">Participante</th>
                <th className="px-4 py-2 text-left">Campanha</th>
                <th className="px-4 py-2 text-left">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm">
                    {format(new Date(), 'HH:mm:ss', { locale: ptBR })}
                  </td>
                  <td className="px-4 py-2 text-sm">user{i}@email.com</td>
                  <td className="px-4 py-2 text-sm">Maria Silva</td>
                  <td className="px-4 py-2 text-sm">Educação para Todos</td>
                  <td className="px-4 py-2 text-sm">192.168.1.{i}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VotingDashboard;
