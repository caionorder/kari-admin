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
import api, { endpoints } from '../../services/api';

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

interface Campaign {
  id: string;
  title: string;
}

const VotingDashboard: React.FC = () => {
  const [voteData, setVoteData] = useState<VoteData[]>([]);
  const [votingStats, setVotingStats] = useState<VotingStats | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState('all');
  const [timeRange, setTimeRange] = useState('7days');
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [dailyData, setDailyData] = useState<any[]>([]);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    fetchVotingData();
    const interval = autoRefresh ? setInterval(fetchVotingData, 30000) : null;
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedCampaign, timeRange, autoRefresh]);

  const fetchCampaigns = async () => {
    try {
      const response = await api.get(endpoints.campaigns.list);
      const activeCampaigns = response.data.filter((c: any) => c.is_active);
      setCampaigns(activeCampaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const fetchVotingData = async () => {
    try {
      setLoading(true);
      
      // Fetch participants and votes
      let participantsEndpoint = endpoints.participants.list;
      let votesEndpoint = endpoints.voting.votes;
      
      // If specific campaign selected
      if (selectedCampaign !== 'all') {
        participantsEndpoint = endpoints.participants.byCampaign(selectedCampaign);
        votesEndpoint = endpoints.voting.votesByCampaign(selectedCampaign);
      }

      const [participantsRes, votesRes] = await Promise.all([
        api.get(participantsEndpoint).catch(() => ({ data: [] })),
        api.get(votesEndpoint).catch(() => ({ data: [] }))
      ]);

      const participants = Array.isArray(participantsRes.data) ? participantsRes.data : [];
      const votes = Array.isArray(votesRes.data) ? votesRes.data : [];

      // Calculate votes per participant
      const votesByParticipant: { [key: string]: number } = {};
      const totalVoteCount = votes.length;

      votes.forEach((vote: any) => {
        const participantId = vote.participant_id || vote.participantId;
        if (participantId) {
          votesByParticipant[participantId] = (votesByParticipant[participantId] || 0) + 1;
        }
      });

      // Create vote data for each participant
      const processedVoteData: VoteData[] = participants
        .map((participant: any) => {
          const voteCount = votesByParticipant[participant.id] || 0;
          return {
            participantId: participant.id,
            participantName: participant.name || 'Sem nome',
            votes: voteCount,
            percentage: totalVoteCount > 0 ? (voteCount / totalVoteCount) * 100 : 0,
            trend: 'stable' as const, // Would need historical data to calculate trend
            photo: participant.photo_url
          };
        })
        .sort((a: any, b: any) => b.votes - a.votes);

      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayVotes = votes.filter((v: any) => {
        if (!v.created_at) return false;
        return new Date(v.created_at) >= today;
      }).length;

      // Get unique voters (would need voter_id field)
      const uniqueVoters = new Set(votes.map((v: any) => v.voter_id || v.id)).size;

      // Calculate average votes per day
      const firstVoteDate = votes.length > 0 && votes[0].created_at 
        ? new Date(votes[0].created_at) 
        : new Date();
      const daysSinceStart = Math.max(1, Math.ceil((today.getTime() - firstVoteDate.getTime()) / (1000 * 60 * 60 * 24)));
      const averageVotesPerDay = Math.floor(totalVoteCount / daysSinceStart);

      // Find peak voting hour (simplified - would need proper aggregation)
      const votesByHour: { [hour: number]: number } = {};
      votes.forEach((vote: any) => {
        if (vote.created_at) {
          const hour = new Date(vote.created_at).getHours();
          votesByHour[hour] = (votesByHour[hour] || 0) + 1;
        }
      });
      
      const peakHour = Object.entries(votesByHour).reduce(
        (max, [hour, count]) => count > max.count ? { hour: parseInt(hour), count } : max,
        { hour: 12, count: 0 }
      ).hour;

      const stats: VotingStats = {
        totalVotes: totalVoteCount,
        votesToday: todayVotes,
        uniqueVoters: uniqueVoters,
        averageVotesPerDay: averageVotesPerDay,
        peakVotingHour: `${peakHour}:00`
      };

      // Process hourly data for chart
      const hourlyChartData = Array.from({ length: 6 }, (_, i) => {
        const hour = i * 4;
        return {
          hour: `${hour.toString().padStart(2, '0')}h`,
          votes: votesByHour[hour] || 0
        };
      });

      // Process daily data for chart
      const dailyChartData = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day, index) => {
        const dayVotes = votes.filter((v: any) => {
          if (!v.created_at) return false;
          return new Date(v.created_at).getDay() === index;
        }).length;
        
        return {
          day,
          votes: dayVotes
        };
      });

      setVoteData(processedVoteData);
      setVotingStats(stats);
      setHourlyData(hourlyChartData);
      setDailyData(dailyChartData);
      
    } catch (error) {
      console.error('Error fetching voting data:', error);
      
      // Set empty data on error
      setVoteData([]);
      setVotingStats({
        totalVotes: 0,
        votesToday: 0,
        uniqueVoters: 0,
        averageVotesPerDay: 0,
        peakVotingHour: '00:00'
      });
      
    } finally {
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Painel de Votação</h1>
          <p className="text-gray-600">Acompanhe as votações em tempo real</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Campaign Filter */}
          <select
            value={selectedCampaign}
            onChange={(e) => setSelectedCampaign(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="all">Todas as Campanhas</option>
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.title}
              </option>
            ))}
          </select>

          {/* Time Range Filter */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="today">Hoje</option>
            <option value="7days">Últimos 7 dias</option>
            <option value="30days">Últimos 30 dias</option>
            <option value="all">Todo período</option>
          </select>

          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`p-2 rounded-lg transition-colors ${
              autoRefresh
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
            title="Auto-atualização"
          >
            <FiRefreshCw className={`w-5 h-5 ${autoRefresh ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {votingStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Votos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {votingStats.totalVotes.toLocaleString('pt-BR')}
                </p>
              </div>
              <FiBarChart className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Votos Hoje</p>
                <p className="text-2xl font-bold text-gray-900">
                  {votingStats.votesToday.toLocaleString('pt-BR')}
                </p>
              </div>
              <FiTrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Votantes Únicos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {votingStats.uniqueVoters.toLocaleString('pt-BR')}
                </p>
              </div>
              <FiUsers className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Média/Dia</p>
                <p className="text-2xl font-bold text-gray-900">
                  {votingStats.averageVotesPerDay.toLocaleString('pt-BR')}
                </p>
              </div>
              <FiTrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Horário Pico</p>
                <p className="text-2xl font-bold text-gray-900">{votingStats.peakVotingHour}</p>
              </div>
              <FiClock className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Ranking */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Ranking Ao Vivo</h3>
          {voteData.length > 0 ? (
            <div className="space-y-4">
              {voteData.slice(0, 10).map((participant, index) => (
                <div key={participant.participantId} className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                    <span className={`text-lg font-bold ${index < 3 ? 'text-purple-600' : 'text-gray-500'}`}>
                      {index + 1}º
                    </span>
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-800">{participant.participantName}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-gray-700">
                          {participant.votes.toLocaleString('pt-BR')} votos
                        </span>
                        {participant.trend === 'up' && (
                          <span className="text-green-500">↑</span>
                        )}
                        {participant.trend === 'down' && (
                          <span className="text-red-500">↓</span>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${participant.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {participant.percentage.toFixed(1)}% dos votos
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Nenhum voto registrado ainda
            </div>
          )}
        </div>

        {/* Vote Distribution Pie Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribuição de Votos</h3>
          {voteData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={voteData.slice(0, 5)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ participantName, percentage }) => `${participantName.split(' ')[0]} ${percentage.toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="votes"
                >
                  {voteData.slice(0, 5).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              Sem dados disponíveis
            </div>
          )}
        </div>
      </div>

      {/* Voting Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Voting */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Votos por Hora</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="votes" stroke="#8b5cf6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Voting */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Votos por Dia da Semana</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="votes" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-center text-sm text-gray-500">
        Última atualização: {format(new Date(), "dd 'de' MMMM 'às' HH:mm:ss", { locale: ptBR })}
        {autoRefresh && <span className="ml-2">(Atualizando a cada 30 segundos)</span>}
      </div>
    </div>
  );
};

export default VotingDashboard;