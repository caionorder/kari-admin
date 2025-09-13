import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { endpoints } from '../../services/api';
import apiSafe from '../../services/apiSafe';
import {
  FiCalendar,
  FiEdit2,
  FiEye,
  FiPlus,
  FiSearch,
  FiStar,
  FiTag,
  FiTrash2,
  FiUser,
  FiVideo
} from '../../utils/icons';

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

const TestimonialList: React.FC = () => {
  const navigate = useNavigate();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchTestimonials();
  }, []);

  useEffect(() => {
    filterTestimonials();
  }, [testimonials, searchTerm, categoryFilter, statusFilter]);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await apiSafe.get(endpoints.testimonials.list);
      const data = Array.isArray(response.data) ? response.data : [];
      setTestimonials(data);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      toast.error('Erro ao carregar entregas');
    } finally {
      setLoading(false);
    }
  };

  const filterTestimonials = () => {
    let filtered = [...testimonials];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (testimonial) =>
          testimonial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          testimonial.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          testimonial.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (testimonial.donor_name && testimonial.donor_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((testimonial) => testimonial.category === categoryFilter);
    }

    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter((testimonial) => testimonial.is_active);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter((testimonial) => !testimonial.is_active);
    } else if (statusFilter === 'featured') {
      filtered = filtered.filter((testimonial) => testimonial.is_featured);
    }

    setFilteredTestimonials(filtered);
    setCurrentPage(1);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta entrega?')) {
      try {
        await apiSafe.delete(endpoints.testimonials.delete(id));
        setTestimonials(testimonials.filter((t) => t.id !== id));
        setFilteredTestimonials(filteredTestimonials.filter((t) => t.id !== id));
        toast.success('Entrega excluída com sucesso');
      } catch (error) {
        console.error('Error deleting testimonial:', error);
        toast.error('Erro ao excluir entrega');
      }
    }
  };

  const toggleFeatured = async (id: string, currentState: boolean) => {
    try {
      await apiSafe.patch(endpoints.testimonials.update(id), {
        is_featured: !currentState
      });
      setTestimonials(testimonials.map(t => 
        t.id === id ? { ...t, is_featured: !currentState } : t
      ));
      toast.success(`Entrega ${!currentState ? 'destacada' : 'removida dos destaques'} com sucesso`);
    } catch (error) {
      console.error('Error updating testimonial:', error);
      toast.error('Erro ao atualizar entrega');
    }
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    try {
      await apiSafe.patch(endpoints.testimonials.update(id), {
        is_active: !currentState
      });
      setTestimonials(testimonials.map(t => 
        t.id === id ? { ...t, is_active: !currentState } : t
      ));
      toast.success(`Entrega ${!currentState ? 'ativada' : 'desativada'} com sucesso`);
    } catch (error) {
      console.error('Error updating testimonial:', error);
      toast.error('Erro ao atualizar entrega');
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
        className={`px-2 py-1 text-xs font-semibold rounded-full ${
          styles[category] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {labels[category] || category}
      </span>
    );
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTestimonials.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTestimonials.length / itemsPerPage);

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
          <h1 className="text-2xl font-bold text-gray-800">Entregas e Depoimentos</h1>
          <p className="text-gray-600">Gerencie as entregas realizadas e depoimentos dos beneficiados</p>
        </div>
        <button
          onClick={() => navigate('/testimonials/new')}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors"
        >
          <FiPlus className="w-5 h-5 mr-2" />
          Nova Entrega
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar entregas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Todas as Categorias</option>
            <option value="moradia">Moradia</option>
            <option value="alimentacao">Alimentação</option>
            <option value="educacao">Educação</option>
            <option value="saude">Saúde</option>
            <option value="tecnologia">Tecnologia</option>
            <option value="essenciais">Essenciais</option>
            <option value="financeiro">Financeiro</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Todos os Status</option>
            <option value="active">Ativas</option>
            <option value="inactive">Inativas</option>
            <option value="featured">Destaques</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entrega
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Beneficiado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Impacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((testimonial) => (
                <tr key={testimonial.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-lg object-cover"
                          src={testimonial.image_url ? `https://api.kariajuda.com${testimonial.image_url}` : '/placeholder.jpg'}
                          alt={testimonial.title}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          {testimonial.title}
                          {testimonial.video_url && (
                            <FiVideo className="w-4 h-4 ml-2 text-purple-600" />
                          )}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {testimonial.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 flex items-center">
                      <FiUser className="w-4 h-4 mr-1 text-gray-400" />
                      {testimonial.recipient_name}
                    </div>
                    {testimonial.donor_name && (
                      <div className="text-xs text-gray-500 mt-1">
                        Doador: {testimonial.donor_name}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {getCategoryBadge(testimonial.category)}
                    {testimonial.campaign_title && (
                      <div className="text-xs text-gray-500 mt-1">
                        {testimonial.campaign_title}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 flex items-center">
                      <FiCalendar className="w-4 h-4 mr-1 text-gray-400" />
                      {format(new Date(testimonial.delivery_date), 'dd/MM/yyyy', { locale: ptBR })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{testimonial.impact}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => toggleFeatured(testimonial.id, testimonial.is_featured)}
                        className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors ${
                          testimonial.is_featured
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        // title={testimonial.is_featured ? 'Remover destaque' : 'Destacar'}
                      >
                        <FiStar className={`w-3 h-3 mr-1 ${testimonial.is_featured ? 'fill-current' : ''}`} />
                        {testimonial.is_featured ? 'Destaque' : 'Normal'}
                      </button>
                      <button
                        onClick={() => toggleActive(testimonial.id, testimonial.is_active)}
                        className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors ${
                          testimonial.is_active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {testimonial.is_active ? 'Ativa' : 'Inativa'}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/testimonials/${testimonial.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                        // title="Visualizar"
                      >
                        <FiEye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => navigate(`/testimonials/${testimonial.id}/edit`)}
                        className="text-yellow-600 hover:text-yellow-900"
                        // title="Editar"
                      >
                        <FiEdit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(testimonial.id)}
                        className="text-red-600 hover:text-red-900"
                        // title="Excluir"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredTestimonials.length)} de{' '}
              {filteredTestimonials.length} resultados
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Anterior
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  return (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  );
                })
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && <span className="px-2">...</span>}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded ${
                        currentPage === page
                          ? 'bg-purple-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Próximo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestimonialList;