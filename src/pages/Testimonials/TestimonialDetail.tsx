import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'react-toastify';
import apiSafe from '../../services/apiSafe';
import { endpoints } from '../../services/api';
import { 
  FiArrowLeft, 
  FiCalendar, 
  FiEdit2, 
  FiStar, 
  FiTag, 
  FiTrash2, 
  FiUser,
  FiVideo,
  FiGift,
  FiTarget
} from '../../utils/icons';
import { getImageUrl } from '../../utils/imageUrl';

interface Testimonial {
  id: string;
  title: string;
  description: string;
  full_description: string;
  recipient_name: string;
  donor_name?: string;
  campaign_title?: string;
  image_url: string;
  video_url?: string;
  category: string;
  impact: string;
  delivery_date: string;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const TestimonialDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [testimonial, setTestimonial] = useState<Testimonial | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchTestimonial();
    }
  }, [id]);

  const fetchTestimonial = async () => {
    try {
      setLoading(true);
      const response = await apiSafe.get(endpoints.testimonials.detail(id!));
      setTestimonial(response.data);
    } catch (error) {
      console.error('Error fetching testimonial:', error);
      toast.error('Erro ao carregar entrega');
      navigate('/testimonials');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja excluir esta entrega?')) {
      try {
        await apiSafe.delete(endpoints.testimonials.delete(id!));
        toast.success('Entrega excluída com sucesso');
        navigate('/testimonials');
      } catch (error) {
        console.error('Error deleting testimonial:', error);
        toast.error('Erro ao excluir entrega');
      }
    }
  };

  const getCategoryBadge = (category: string) => {
    const styles: { [key: string]: string } = {
      moradia: 'bg-blue-100 text-blue-800',
      alimentacao: 'bg-green-100 text-green-800',
      educacao: 'bg-purple-100 text-purple-800',
      saude: 'bg-red-100 text-red-800',
      tecnologia: 'bg-indigo-100 text-indigo-800',
      essenciais: 'bg-yellow-100 text-yellow-800',
      financeiro: 'bg-gray-100 text-gray-800',
    };
    const labels: { [key: string]: string } = {
      moradia: 'Moradia',
      alimentacao: 'Alimentação',
      educacao: 'Educação',
      saude: 'Saúde',
      tecnologia: 'Tecnologia',
      essenciais: 'Essenciais',
      financeiro: 'Financeiro',
    };
    return (
      <span
        className={`px-3 py-1 text-sm font-semibold rounded-full ${
          styles[category] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {labels[category] || category}
      </span>
    );
  };

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!testimonial) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Entrega não encontrada</p>
        <button
          onClick={() => navigate('/testimonials')}
          className="mt-4 text-purple-600 hover:text-purple-800"
        >
          Voltar para lista
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/testimonials')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{testimonial.title}</h1>
            <p className="text-gray-600">{testimonial.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate(`/testimonials/${id}/edit`)}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center"
          >
            <FiEdit2 className="w-5 h-5 mr-2" />
            Editar
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center"
          >
            <FiTrash2 className="w-5 h-5 mr-2" />
            Excluir
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Image and Video */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src={testimonial.image_url ? getImageUrl(testimonial.image_url) : '/placeholder.jpg'}
              alt={testimonial.title}
              className="w-full h-96 object-cover"
            />
          </div>

          {/* Video */}
          {testimonial.video_url && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FiVideo className="w-5 h-5 mr-2 text-purple-600" />
                Vídeo do Depoimento
              </h3>
              {extractYouTubeId(testimonial.video_url) ? (
                <div className="aspect-w-16 aspect-h-9">
                  <iframe
                    src={`https://www.youtube.com/embed/${extractYouTubeId(testimonial.video_url)}`}
                    // title="Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-96 rounded-lg"
                  ></iframe>
                </div>
              ) : (
                <a
                  href={testimonial.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-800 underline"
                >
                  Assistir vídeo
                </a>
              )}
            </div>
          )}

          {/* Full Description */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Depoimento Completo</h3>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{testimonial.full_description}</p>
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Visibilidade:</span>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  testimonial.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {testimonial.is_active ? 'Ativa' : 'Inativa'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Destaque:</span>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full flex items-center ${
                  testimonial.is_featured 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  <FiStar className={`w-4 h-4 mr-1 ${testimonial.is_featured ? 'fill-current' : ''}`} />
                  {testimonial.is_featured ? 'Sim' : 'Não'}
                </span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Detalhes da Entrega</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center text-gray-600 mb-1">
                  <FiUser className="w-4 h-4 mr-2" />
                  <span className="font-medium">Beneficiado:</span>
                </div>
                <p className="text-gray-800 ml-6">{testimonial.recipient_name}</p>
              </div>

              {testimonial.donor_name && (
                <div>
                  <div className="flex items-center text-gray-600 mb-1">
                    <FiGift className="w-4 h-4 mr-2" />
                    <span className="font-medium">Doador:</span>
                  </div>
                  <p className="text-gray-800 ml-6">{testimonial.donor_name}</p>
                </div>
              )}

              <div>
                <div className="flex items-center text-gray-600 mb-1">
                  <FiTag className="w-4 h-4 mr-2" />
                  <span className="font-medium">Categoria:</span>
                </div>
                <div className="ml-6">{getCategoryBadge(testimonial.category)}</div>
              </div>

              {testimonial.campaign_title && (
                <div>
                  <div className="flex items-center text-gray-600 mb-1">
                    <FiTarget className="w-4 h-4 mr-2" />
                    <span className="font-medium">Campanha:</span>
                  </div>
                  <p className="text-gray-800 ml-6">{testimonial.campaign_title}</p>
                </div>
              )}

              <div>
                <div className="flex items-center text-gray-600 mb-1">
                  <FiCalendar className="w-4 h-4 mr-2" />
                  <span className="font-medium">Data da Entrega:</span>
                </div>
                <p className="text-gray-800 ml-6">
                  {format(new Date(testimonial.delivery_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>

              <div>
                <div className="flex items-center text-gray-600 mb-1">
                  <FiTarget className="w-4 h-4 mr-2" />
                  <span className="font-medium">Impacto:</span>
                </div>
                <p className="text-gray-800 ml-6 font-semibold">{testimonial.impact}</p>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Informações do Sistema</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">ID:</span>
                <span className="text-gray-800 font-mono">{testimonial.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Criado em:</span>
                <span className="text-gray-800">
                  {format(new Date(testimonial.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Atualizado em:</span>
                <span className="text-gray-800">
                  {format(new Date(testimonial.updated_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialDetail;