import React, { useState, useEffect } from 'react';
import { FiAward, FiCalendar, FiUser, FiCheckCircle } from '../../utils/icons';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api, { endpoints } from '../../services/api';

interface Winner {
  id: string;
  participantId: string;
  participantName: string;
  campaignId: string;
  campaignName: string;
  position: number;
  votes: number;
  prize: string;
  announcedDate: string;
  status: 'pending' | 'announced' | 'claimed';
}

interface Campaign {
  id: string;
  title: string;
  is_active: boolean;
  end_date?: string;
}

interface Participant {
  id: string;
  name: string;
  campaign_id: string;
  votes_count?: number;
}

const WinnerManagement: React.FC = () => {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeclareModal, setShowDeclareModal] = useState(false);
  const [campaignParticipants, setCampaignParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    fetchCampaigns();
    fetchWinners();
  }, []);

  useEffect(() => {
    if (selectedCampaign) {
      fetchCampaignParticipants(selectedCampaign);
    }
  }, [selectedCampaign]);

  const fetchCampaigns = async () => {
    try {
      const response = await api.get(endpoints.campaigns.list);
      setCampaigns(response.data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Erro ao carregar campanhas');
    }
  };

  const fetchWinners = async () => {
    try {
      setLoading(true);
      
      // Fetch winners from API
      const winnersRes = await api.get(endpoints.winners.list).catch(() => ({ data: [] }));
      const campaignsRes = await api.get(endpoints.campaigns.list).catch(() => ({ data: [] }));
      const participantsRes = await api.get(endpoints.participants.list).catch(() => ({ data: [] }));
      
      const winnersData = Array.isArray(winnersRes.data) ? winnersRes.data : [];
      const campaignsData = Array.isArray(campaignsRes.data) ? campaignsRes.data : [];
      const participantsData = Array.isArray(participantsRes.data) ? participantsRes.data : [];
      
      // Map winners with campaign and participant names
      const processedWinners: Winner[] = winnersData.map((winner: any) => {
        const campaign = campaignsData.find((c: any) => c.id === winner.campaign_id);
        const participant = participantsData.find((p: any) => p.id === winner.participant_id);
        
        return {
          id: winner.id,
          participantId: winner.participant_id,
          participantName: participant?.name || 'Unknown',
          campaignId: winner.campaign_id,
          campaignName: campaign?.title || 'Unknown Campaign',
          position: winner.position || 1,
          votes: winner.votes_count || 0,
          prize: winner.prize || 'N/A',
          announcedDate: winner.announced_at || winner.created_at,
          status: winner.status || 'announced'
        };
      });
      
      setWinners(processedWinners);
    } catch (error) {
      console.error('Error fetching winners:', error);
      toast.error('Erro ao carregar vencedores');
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaignParticipants = async (campaignId: string) => {
    try {
      // Fetch participants for the selected campaign
      const participantsRes = await api.get(endpoints.participants.byCampaign(campaignId)).catch(() => ({ data: [] }));
      const votesRes = await api.get(endpoints.voting.votesByCampaign(campaignId)).catch(() => ({ data: [] }));
      
      const participants = Array.isArray(participantsRes.data) ? participantsRes.data : [];
      const votes = Array.isArray(votesRes.data) ? votesRes.data : [];
      
      // Count votes per participant
      const votesByParticipant: { [key: string]: number } = {};
      votes.forEach((vote: any) => {
        const participantId = vote.participant_id;
        if (participantId) {
          votesByParticipant[participantId] = (votesByParticipant[participantId] || 0) + 1;
        }
      });
      
      // Add vote count to participants and sort by votes
      const participantsWithVotes = participants.map((p: any) => ({
        ...p,
        votes_count: votesByParticipant[p.id] || 0
      })).sort((a: any, b: any) => b.votes_count - a.votes_count);
      
      setCampaignParticipants(participantsWithVotes);
    } catch (error) {
      console.error('Error fetching campaign participants:', error);
    }
  };

  const handleDeclareWinners = async () => {
    if (!selectedCampaign) {
      toast.error('Selecione uma campanha');
      return;
    }
    
    if (campaignParticipants.length === 0) {
      toast.error('Não há participantes nesta campanha');
      return;
    }
    
    try {
      // Get top 3 participants as winners
      const top3 = campaignParticipants.slice(0, 3);
      const prizes = ['R$ 10.000', 'R$ 5.000', 'R$ 2.000'];
      
      // Create winner records
      for (let i = 0; i < top3.length; i++) {
        const participant = top3[i];
        const winnerData = {
          campaign_id: selectedCampaign,
          participant_id: participant.id,
          position: i + 1,
          votes_count: participant.votes_count,
          prize: prizes[i],
          status: 'announced'
        };
        
        // Post to API
        await api.post(endpoints.winners.declare, winnerData).catch((error: any) => {
          console.error('Error declaring winner:', error);
        });
      }
      
      toast.success('Vencedores declarados com sucesso!');
      setShowDeclareModal(false);
      fetchWinners(); // Refresh winners list
    } catch (error) {
      console.error('Error declaring winners:', error);
      toast.error('Erro ao declarar vencedores');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      announced: 'bg-green-100 text-green-800',
      claimed: 'bg-blue-100 text-blue-800',
    };
    const labels = {
      pending: 'Pendente',
      announced: 'Anunciado',
      claimed: 'Resgatado',
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

  const getPositionBadge = (position: number) => {
    const colors = {
      1: 'bg-yellow-400 text-yellow-900',
      2: 'bg-gray-300 text-gray-800',
      3: 'bg-orange-400 text-orange-900',
    };
    return (
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
          colors[position as keyof typeof colors] || 'bg-gray-200 text-gray-600'
        }`}
      >
        {position}º
      </div>
    );
  };

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
          <h1 className="text-2xl font-bold text-gray-800">Gerenciamento de Vencedores</h1>
          <p className="text-gray-600">Declare e gerencie os vencedores das campanhas</p>
        </div>
        <button
          onClick={() => setShowDeclareModal(true)}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <FiAward className="w-5 h-5" />
          Declarar Vencedores
        </button>
      </div>

      {/* Winners Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Posição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campanha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Votos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prêmio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Anúncio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {winners.length > 0 ? (
                winners.map((winner) => (
                  <tr key={winner.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPositionBadge(winner.position)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FiUser className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {winner.participantName}
                          </div>
                          <div className="text-xs text-gray-500">ID: {winner.participantId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{winner.campaignName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {winner.votes.toLocaleString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">{winner.prize}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <FiCalendar className="w-4 h-4 mr-1" />
                        {winner.announcedDate ? 
                          format(new Date(winner.announcedDate), 'dd/MM/yyyy', { locale: ptBR })
                          : 'N/A'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(winner.status)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Nenhum vencedor declarado ainda
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Declare Winners Modal */}
      {showDeclareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Declarar Vencedores</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecione a Campanha
                </label>
                <select
                  value={selectedCampaign}
                  onChange={(e) => setSelectedCampaign(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Selecione...</option>
                  {campaigns.filter(c => !c.is_active).map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.title}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCampaign && campaignParticipants.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Top 3 Participantes (serão declarados vencedores)
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {campaignParticipants.slice(0, 3).map((participant, index) => (
                      <div
                        key={participant.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div className="flex items-center">
                          {getPositionBadge(index + 1)}
                          <span className="ml-2 text-sm font-medium">{participant.name}</span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {participant.votes_count} votos
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeclareModal(false);
                  setSelectedCampaign('');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeclareWinners}
                disabled={!selectedCampaign}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FiCheckCircle className="w-4 h-4" />
                Declarar Vencedores
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WinnerManagement;