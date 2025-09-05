import React, { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import {
  FiArrowDown,
  FiArrowUp,
  FiAward,
  FiDollarSign,
  FiTrendingUp,
  FiUsers,
} from '../utils/icons';

interface StatCard {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: string;
}

interface ChartData {
  name: string;
  value: number;
  participants?: number;
  votes?: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [votingData, setVotingData] = useState<ChartData[]>([]);
  const [participantsData, setParticipantsData] = useState<ChartData[]>([]);
  const [campaignData, setCampaignData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Simulated data - replace with actual API calls
      const statsData: StatCard[] = [
        {
          title: 'Total de Campanhas',
          value: 24,
          change: 12.5,
          icon: <FiAward className="w-6 h-6" />,
          color: 'bg-purple-500',
        },
        {
          title: 'Participantes Ativos',
          value: '1,234',
          change: 8.2,
          icon: <FiUsers className="w-6 h-6" />,
          color: 'bg-blue-500',
        },
        {
          title: 'Total de Votos',
          value: '45,678',
          change: -2.4,
          icon: <FiTrendingUp className="w-6 h-6" />,
          color: 'bg-green-500',
        },
        {
          title: 'Arrecadação Total',
          value: 'R$ 89,345',
          change: 15.3,
          icon: <FiDollarSign className="w-6 h-6" />,
          color: 'bg-orange-500',
        },
      ];

      const votingChartData: ChartData[] = [
        { name: 'Jan', value: 4000, votes: 4000, participants: 240 },
        { name: 'Fev', value: 3000, votes: 3000, participants: 139 },
        { name: 'Mar', value: 2000, votes: 2000, participants: 980 },
        { name: 'Abr', value: 2780, votes: 2780, participants: 390 },
        { name: 'Mai', value: 1890, votes: 1890, participants: 480 },
        { name: 'Jun', value: 2390, votes: 2390, participants: 380 },
        { name: 'Jul', value: 3490, votes: 3490, participants: 430 },
      ];

      const participantsChartData: ChartData[] = [
        { name: 'Educação', value: 35 },
        { name: 'Saúde', value: 25 },
        { name: 'Meio Ambiente', value: 20 },
        { name: 'Cultura', value: 10 },
        { name: 'Esporte', value: 10 },
      ];

      const campaignChartData: ChartData[] = [
        { name: 'Ativas', value: 12 },
        { name: 'Encerradas', value: 8 },
        { name: 'Pendentes', value: 4 },
      ];

      setStats(statsData);
      setVotingData(votingChartData);
      setParticipantsData(participantsChartData);
      setCampaignData(campaignChartData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

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
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <div className="flex items-center mt-2">
                  {stat.change > 0 ? (
                    <FiArrowUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <FiArrowDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      stat.change > 0 ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {Math.abs(stat.change)}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs último mês</span>
                </div>
              </div>
              <div className={`${stat.color} p-3 rounded-lg text-white`}>{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Voting Trends */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tendência de Votação</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={votingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="votes"
                stackId="1"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.6}
                name="Votos"
              />
              <Area
                type="monotone"
                dataKey="participants"
                stackId="1"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
                name="Participantes"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Campaign Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Status das Campanhas</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={campaignData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {campaignData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Participants by Category */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Participantes por Categoria
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={participantsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]}>
                {participantsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Atividade Recente</h3>
          <div className="space-y-4">
            {[
              { action: 'Nova campanha criada', time: '2 min atrás', type: 'campaign' },
              { action: '45 novos votos', time: '15 min atrás', type: 'vote' },
              { action: 'Novo participante', time: '1 hora atrás', type: 'participant' },
              { action: 'Vencedor anunciado', time: '3 horas atrás', type: 'winner' },
              { action: 'Campanha encerrada', time: '5 horas atrás', type: 'campaign' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    activity.type === 'campaign'
                      ? 'bg-purple-500'
                      : activity.type === 'vote'
                      ? 'bg-blue-500'
                      : activity.type === 'participant'
                      ? 'bg-green-500'
                      : 'bg-orange-500'
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-md p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition-colors">
            <FiAward className="w-8 h-8 mx-auto mb-2" />
            <span className="text-sm">Nova Campanha</span>
          </button>
          <button className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition-colors">
            <FiUsers className="w-8 h-8 mx-auto mb-2" />
            <span className="text-sm">Add Participante</span>
          </button>
          <button className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition-colors">
            <FiTrendingUp className="w-8 h-8 mx-auto mb-2" />
            <span className="text-sm">Ver Relatórios</span>
          </button>
          <button className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition-colors">
            <FiDollarSign className="w-8 h-8 mx-auto mb-2" />
            <span className="text-sm">Exportar Dados</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
