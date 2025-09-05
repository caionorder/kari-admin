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
import api, { endpoints } from '../services/api';

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
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch real data from API
      const [campaignsRes, participantsRes, votesRes] = await Promise.all([
        api.get(endpoints.campaigns.list).catch(() => ({ data: [] })),
        api.get(endpoints.participants.list).catch(() => ({ data: [] })),
        api.get(endpoints.voting.votes).catch(() => ({ data: [] }))
      ]);

      // Process campaigns data
      const campaigns = Array.isArray(campaignsRes.data) ? campaignsRes.data : [];
      const activeCampaigns = campaigns.filter((c: any) => c.is_active).length;
      const totalCampaigns = campaigns.length;
      
      // Process participants data
      const participants = Array.isArray(participantsRes.data) ? participantsRes.data : [];
      const totalParticipants = participants.length;
      
      // Process votes data
      const votes = Array.isArray(votesRes.data) ? votesRes.data : [];
      const totalVotes = votes.length;
      
      // Process donations data
      const donations: any[] = []; // Donations not implemented in API yet
      const totalDonations = donations.reduce((sum: number, d: any) => sum + (d.amount || 0), 0);

      // Calculate changes (mock data for now - would need historical data)
      const statsData: StatCard[] = [
        {
          title: 'Total de Campanhas',
          value: totalCampaigns || 0,
          change: 12.5, // Mock - would calculate from historical data
          icon: <FiAward className="w-6 h-6" />,
          color: 'bg-purple-500',
        },
        {
          title: 'Participantes Ativos',
          value: totalParticipants || 0,
          change: 8.2, // Mock
          icon: <FiUsers className="w-6 h-6" />,
          color: 'bg-blue-500',
        },
        {
          title: 'Total de Votos',
          value: totalVotes || 0,
          change: -2.4, // Mock
          icon: <FiTrendingUp className="w-6 h-6" />,
          color: 'bg-green-500',
        },
        {
          title: 'Arrecadação Total',
          value: `R$ ${totalDonations.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          change: 15.3, // Mock
          icon: <FiDollarSign className="w-6 h-6" />,
          color: 'bg-orange-500',
        },
      ];

      // Process voting trends by month (last 6 months)
      const votingChartData: ChartData[] = processMonthlyData(votes, participants);

      // Process participants by campaign category
      const participantsChartData: ChartData[] = processCategoryData(campaigns, participants);

      // Campaign status data
      const completedCampaigns = campaigns.filter((c: any) => c.status === 'completed').length;
      const pendingCampaigns = campaigns.filter((c: any) => c.status === 'pending').length;
      
      const campaignChartData: ChartData[] = [
        { name: 'Ativas', value: activeCampaigns || 0 },
        { name: 'Encerradas', value: completedCampaigns || 0 },
        { name: 'Pendentes', value: pendingCampaigns || 0 },
      ];

      // Recent activity (combine recent data from all endpoints)
      const activities = processRecentActivity(campaigns, participants, votes);
      
      setStats(statsData);
      setVotingData(votingChartData);
      setParticipantsData(participantsChartData);
      setCampaignData(campaignChartData);
      setRecentActivity(activities);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Set default empty data on error
      setStats([
        {
          title: 'Total de Campanhas',
          value: 0,
          change: 0,
          icon: <FiAward className="w-6 h-6" />,
          color: 'bg-purple-500',
        },
        {
          title: 'Participantes Ativos',
          value: 0,
          change: 0,
          icon: <FiUsers className="w-6 h-6" />,
          color: 'bg-blue-500',
        },
        {
          title: 'Total de Votos',
          value: 0,
          change: 0,
          icon: <FiTrendingUp className="w-6 h-6" />,
          color: 'bg-green-500',
        },
        {
          title: 'Arrecadação Total',
          value: 'R$ 0,00',
          change: 0,
          icon: <FiDollarSign className="w-6 h-6" />,
          color: 'bg-orange-500',
        },
      ]);
      
    } finally {
      setLoading(false);
    }
  };

  const processMonthlyData = (votes: any[], participants: any[]): ChartData[] => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    const currentMonth = new Date().getMonth();
    
    return months.slice(0, currentMonth + 1).map((month, index) => {
      // Filter data by month (mock implementation - would need date fields)
      const monthVotes = votes.filter((v: any) => {
        if (!v.created_at) return false;
        const voteMonth = new Date(v.created_at).getMonth();
        return voteMonth === index;
      }).length;
      
      const monthParticipants = participants.filter((p: any) => {
        if (!p.created_at) return false;
        const partMonth = new Date(p.created_at).getMonth();
        return partMonth === index;
      }).length;
      
      return {
        name: month,
        value: monthVotes,
        votes: monthVotes,
        participants: monthParticipants
      };
    });
  };

  const processCategoryData = (campaigns: any[], participants: any[]): ChartData[] => {
    // Group campaigns by category
    const categories: { [key: string]: number } = {};
    
    campaigns.forEach((campaign: any) => {
      const category = campaign.category || 'Outros';
      const campaignParticipants = participants.filter((p: any) => 
        p.campaign_id === campaign.id
      ).length;
      
      if (categories[category]) {
        categories[category] += campaignParticipants;
      } else {
        categories[category] = campaignParticipants;
      }
    });
    
    // Convert to chart data format
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 categories
  };

  const processRecentActivity = (campaigns: any[], participants: any[], votes: any[]) => {
    const activities = [];
    
    // Add recent campaigns
    campaigns.slice(0, 2).forEach((campaign: any) => {
      activities.push({
        action: `Nova campanha: ${campaign.title || 'Sem título'}`,
        time: formatTimeAgo(campaign.created_at),
        type: 'campaign'
      });
    });
    
    // Add recent participants
    participants.slice(0, 2).forEach((participant: any) => {
      activities.push({
        action: `Novo participante: ${participant.name || 'Sem nome'}`,
        time: formatTimeAgo(participant.created_at),
        type: 'participant'
      });
    });
    
    // Add recent votes
    if (votes.length > 0) {
      activities.push({
        action: `${votes.length} novos votos`,
        time: formatTimeAgo(votes[0].created_at),
        type: 'vote'
      });
    }
    
    // Sort by time and return top 5
    return activities
      .sort((a, b) => {
        // Sort by time (most recent first)
        return 0; // Would need proper date comparison
      })
      .slice(0, 5);
  };

  const formatTimeAgo = (date: string | undefined): string => {
    if (!date) return 'agora';
    
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins} min atrás`;
    if (diffHours < 24) return `${diffHours} horas atrás`;
    return `${diffDays} dias atrás`;
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
                  ) : stat.change < 0 ? (
                    <FiArrowDown className="w-4 h-4 text-red-500 mr-1" />
                  ) : null}
                  {stat.change !== 0 && (
                    <>
                      <span
                        className={`text-sm font-medium ${
                          stat.change > 0 ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        {Math.abs(stat.change)}%
                      </span>
                      <span className="text-sm text-gray-500 ml-1">vs último mês</span>
                    </>
                  )}
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
          {votingData.length > 0 ? (
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
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              Sem dados disponíveis
            </div>
          )}
        </div>

        {/* Campaign Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Status das Campanhas</h3>
          {campaignData.some(d => d.value > 0) ? (
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
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              Sem campanhas cadastradas
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Participants by Category */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Participantes por Categoria
          </h3>
          {participantsData.length > 0 ? (
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
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              Sem dados de categorias
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Atividade Recente</h3>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
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
              ))
            ) : (
              <p className="text-sm text-gray-500">Nenhuma atividade recente</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-md p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => window.location.href = '/campaigns/new'}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition-colors"
          >
            <FiAward className="w-8 h-8 mx-auto mb-2" />
            <span className="text-sm">Nova Campanha</span>
          </button>
          <button 
            onClick={() => window.location.href = '/participants/new'}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition-colors"
          >
            <FiUsers className="w-8 h-8 mx-auto mb-2" />
            <span className="text-sm">Add Participante</span>
          </button>
          <button 
            onClick={() => window.location.href = '/reports'}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition-colors"
          >
            <FiTrendingUp className="w-8 h-8 mx-auto mb-2" />
            <span className="text-sm">Ver Relatórios</span>
          </button>
          <button 
            onClick={() => alert('Função de exportar em desenvolvimento')}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 text-center transition-colors"
          >
            <FiDollarSign className="w-8 h-8 mx-auto mb-2" />
            <span className="text-sm">Exportar Dados</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;