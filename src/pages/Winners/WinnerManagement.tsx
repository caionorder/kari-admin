import React, { useState, useEffect } from 'react';
import { FiAward, FiCalendar, FiUser, FiCheckCircle } from '../../utils/icons';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

const WinnerManagement: React.FC = () => {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [campaigns, setCampaigns] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeclareModal, setShowDeclareModal] = useState(false);

  useEffect(() => {
    fetchWinners();
    fetchCampaigns();
  }, []);

  const fetchWinners = async () => {
    try {
      // Simulated data
      const mockWinners: Winner[] = [
        {
          id: '1',
          participantId: 'p1',
          participantName: 'Maria Silva',
          campaignId: 'c1',
          campaignName: 'Educação para Todos',
          position: 1,
          votes: 4532,
          prize: 'R$ 10.000',
          announcedDate: '2024-01-30',
          status: 'announced',
        },
        {
          id: '2',
          participantId: 'p2',
          participantName: 'João Santos',
          campaignId: 'c1',
          campaignName: 'Educação para Todos',
          position: 2,
          votes: 3890,
          prize: 'R$ 5.000',
          announcedDate: '2024-01-30',
          status: 'announced',
        },
        {
          id: '3',
          participantId: 'p3',
          participantName: 'Ana Costa',
          campaignId: 'c1',
          campaignName: 'Educação para Todos',
          position: 3,
          votes: 3456,
          prize: 'R$ 2.000',
          announcedDate: '2024-01-30',
          status: 'claimed',
        },
      ];
      setWinners(mockWinners);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching winners:', error);
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const mockCampaigns = [
        { id: 'c1', name: 'Educação para Todos' },
        { id: 'c2', name: 'Saúde em Primeiro Lugar' },
        { id: 'c3', name: 'Meio Ambiente Sustentável' },
      ];
      setCampaigns(mockCampaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const handleDeclareWinners = async () => {
    if (!selectedCampaign) {
      toast.error('Selecione uma campanha');
      return;
    }
    
    try {
      // API call to declare winners
      toast.success('Vencedores declarados com sucesso!');
      setShowDeclareModal(false);
      fetchWinners();
    } catch (error) {
      toast.error('Erro ao declarar vencedores');
    }
  };

  const handleAnnounceWinner = async (winnerId: string) => {
    try {
      // API call to announce winner
      setWinners(winners.map(w => 
        w.id === winnerId ? { ...w, status: 'announced' } : w
      ));
      toast.success('Vencedor anunciado com sucesso!');
    } catch (error) {
      toast.error('Erro ao anunciar vencedor');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      announced: 'bg-blue-100 text-blue-800',
      claimed: 'bg-green-100 text-green-800',
    };
    const labels = {
      pending: 'Pendente',
      announced: 'Anunciado',
      claimed: 'Reivindicado',
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getPositionMedal = (position: number) => {
    const medals = {
      1: '🥇',
      2: '🥈',
      3: '🥉',
    };
    return medals[position as keyof typeof medals] || `${position}º`;
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
          <h1 className="text-2xl font-bold text-gray-800">Gestão de Vencedores</h1>
          <p className="text-gray-600">Declare e gerencie os vencedores das campanhas</p>
        </div>
        <button
          onClick={() => setShowDeclareModal(true)}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600"
        >
          <FiAward className="w-5 h-5 mr-2" />
          Declarar Vencedores
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Vencedores</p>
              <p className="text-2xl font-bold text-gray-900">{winners.length}</p>
            </div>
            <FiAward className="w-8 h-8 text-yellow-500 opacity-30" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Anunciados</p>
              <p className="text-2xl font-bold text-gray-900">
                {winners.filter(w => w.status === 'announced').length}
              </p>
            </div>
            <FiCheckCircle className="w-8 h-8 text-blue-500 opacity-30" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Prêmios Reivindicados</p>
              <p className="text-2xl font-bold text-gray-900">
                {winners.filter(w => w.status === 'claimed').length}
              </p>
            </div>
            <FiAward className="w-8 h-8 text-green-500 opacity-30" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total em Prêmios</p>
              <p className="text-2xl font-bold text-gray-900">R$ 17.000</p>
            </div>
            <span className="text-2xl">💰</span>
          </div>
        </div>
      </div>

      {/* Winners by Campaign */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Vencedores por Campanha</h3>
        
        {/* Group winners by campaign */}
        {campaigns.map(campaign => {
          const campaignWinners = winners.filter(w => w.campaignId === campaign.id);
          if (campaignWinners.length === 0) return null;
          
          return (
            <div key={campaign.id} className="mb-6 last:mb-0">
              <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center">
                <FiAward className="w-5 h-5 mr-2 text-purple-500" />
                {campaign.name}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {campaignWinners.sort((a, b) => a.position - b.position).map(winner => (
                  <div key={winner.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{getPositionMedal(winner.position)}</span>
                      {getStatusBadge(winner.status)}
                    </div>
                    <h5 className="font-semibold text-gray-900">{winner.participantName}</h5>
                    <p className="text-sm text-gray-600 mt-1">
                      <FiUser className="inline w-4 h-4 mr-1" />
                      {winner.votes.toLocaleString()} votos
                    </p>
                    <p className="text-sm text-gray-600">
                      <FiCalendar className="inline w-4 h-4 mr-1" />
                      {format(new Date(winner.announcedDate), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-lg font-bold text-green-600">{winner.prize}</p>
                    </div>
                    {winner.status === 'pending' && (
                      <button
                        onClick={() => handleAnnounceWinner(winner.id)}
                        className="mt-3 w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      >
                        Anunciar Vencedor
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Declare Winners Modal */}
      {showDeclareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Declarar Vencedores</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecione a Campanha
                </label>
                <select
                  value={selectedCampaign}
                  onChange={(e) => setSelectedCampaign(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Escolha uma campanha...</option>
                  {campaigns.map(campaign => (
                    <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
                  ))}
                </select>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Atenção:</strong> Esta ação irá declarar automaticamente os 3 participantes com mais votos como vencedores.
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeclareModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeclareWinners}
                  className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600"
                >
                  Declarar Vencedores
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WinnerManagement;