import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiSafe from '../../services/apiSafe';
import { endpoints } from '../../services/api';
import { FiCalendar, FiStar, FiUpload, FiVideo, FiX } from '../../utils/icons';
import { getImageUrl } from '../../utils/imageUrl';

interface TestimonialFormData {
  title: string;
  description: string;
  full_description: string;
  recipient_name: string;
  donor_name?: string;
  campaign_title?: string;
  category: string;
  impact: string;
  delivery_date: string;
  video_url?: string;
  is_featured: boolean;
  is_active: boolean;
  image?: FileList;
}

const TestimonialForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TestimonialFormData>({
    defaultValues: {
      is_active: true,
      is_featured: false,
      delivery_date: new Date().toISOString().split('T')[0],
    }
  });

  const watchImage = watch('image');

  useEffect(() => {
    fetchCampaigns();
    if (isEdit) {
      fetchTestimonial();
    }
  }, [id]);

  useEffect(() => {
    if (watchImage && watchImage.length > 0) {
      const file = watchImage[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [watchImage]);

  const fetchCampaigns = async () => {
    try {
      const response = await apiSafe.get(endpoints.campaigns.list);
      setCampaigns(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const fetchTestimonial = async () => {
    try {
      const response = await apiSafe.get(endpoints.testimonials.detail(id!));
      const testimonial = response.data;

      // Map API fields to form fields
      setValue('title', testimonial.title);
      setValue('description', testimonial.description);
      setValue('full_description', testimonial.full_description || '');
      setValue('recipient_name', testimonial.recipient_name);
      setValue('donor_name', testimonial.donor_name || '');
      setValue('campaign_title', testimonial.campaign_title || '');
      setValue('category', testimonial.category);
      setValue('impact', testimonial.impact);
      setValue('delivery_date', testimonial.delivery_date ? testimonial.delivery_date.split('T')[0] : '');
      setValue('video_url', testimonial.video_url || '');
      setValue('is_featured', testimonial.is_featured);
      setValue('is_active', testimonial.is_active);
      
      if (testimonial.image_url) {
        setImagePreview(getImageUrl(testimonial.image_url));
      }
    } catch (error) {
      console.error('Error fetching testimonial:', error);
      toast.error('Erro ao carregar entrega');
      navigate('/testimonials');
    }
  };

  const onSubmit = async (data: TestimonialFormData) => {
    setLoading(true);
    try {
      // Prepare data for API
      const testimonialData: any = {
        title: data.title,
        description: data.description,
        full_description: data.full_description,
        recipient_name: data.recipient_name,
        donor_name: data.donor_name || null,
        campaign_title: data.campaign_title || null,
        category: data.category,
        impact: data.impact,
        delivery_date: data.delivery_date,
        video_url: data.video_url || null,
        is_featured: data.is_featured,
        is_active: data.is_active
      };

      // Handle image upload if present
      if (data.image && data.image.length > 0) {
        try {
          const imageFile = data.image[0];
          const formData = new FormData();
          formData.append('file', imageFile);
          
          // Upload image to server
          const uploadResponse = await apiSafe.post(endpoints.upload.image, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          
          // Get the URL from upload response
          if (uploadResponse.data && uploadResponse.data.url) {
            testimonialData.image_url = uploadResponse.data.url;
          }
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          toast.warning('Erro ao fazer upload da imagem, mas a entrega será salva');
        }
      }

      if (isEdit) {
        await apiSafe.put(endpoints.testimonials.update(id!), testimonialData);
        toast.success('Entrega atualizada com sucesso');
      } else {
        await apiSafe.post(endpoints.testimonials.create, testimonialData);
        toast.success('Entrega criada com sucesso');
      }
      navigate('/testimonials');
    } catch (error) {
      console.error('Error saving testimonial:', error);
      toast.error('Erro ao salvar entrega');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setValue('image', undefined);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {isEdit ? 'Editar Entrega' : 'Nova Entrega'}
        </h1>
        <p className="text-gray-600">
          {isEdit ? 'Atualize as informações da entrega' : 'Registre uma nova entrega realizada'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Informações da Entrega</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título da Entrega *
              </label>
              <input
                type="text"
                {...register('title', { required: 'Título é obrigatório' })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ex: Entrega de cestas básicas para família Silva"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição Curta *
              </label>
              <textarea
                {...register('description', { required: 'Descrição é obrigatória' })}
                rows={2}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Breve descrição da entrega realizada..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Depoimento Completo *
              </label>
              <textarea
                {...register('full_description', { required: 'Depoimento é obrigatório' })}
                rows={5}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.full_description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Depoimento detalhado sobre a entrega e seu impacto na vida do beneficiado..."
              />
              {errors.full_description && (
                <p className="mt-1 text-sm text-red-600">{errors.full_description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Beneficiado *
              </label>
              <input
                type="text"
                {...register('recipient_name', { required: 'Nome do beneficiado é obrigatório' })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.recipient_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nome completo do beneficiado"
              />
              {errors.recipient_name && (
                <p className="mt-1 text-sm text-red-600">{errors.recipient_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Doador
              </label>
              <input
                type="text"
                {...register('donor_name')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Nome do doador (opcional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria *
              </label>
              <select
                {...register('category', { required: 'Categoria é obrigatória' })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Selecione uma categoria</option>
                <option value="moradia">Moradia</option>
                <option value="alimentacao">Alimentação</option>
                <option value="educacao">Educação</option>
                <option value="saude">Saúde</option>
                <option value="tecnologia">Tecnologia</option>
                <option value="essenciais">Essenciais</option>
                <option value="financeiro">Financeiro</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campanha Relacionada
              </label>
              <select
                {...register('campaign_title')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Selecione uma campanha (opcional)</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.title}>
                    {campaign.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Impacto *
              </label>
              <input
                type="text"
                {...register('impact', { required: 'Impacto é obrigatório' })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.impact ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ex: 5 pessoas beneficiadas"
              />
              {errors.impact && (
                <p className="mt-1 text-sm text-red-600">{errors.impact.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiCalendar className="inline w-4 h-4 mr-1" />
                Data da Entrega *
              </label>
              <input
                type="date"
                {...register('delivery_date', { required: 'Data da entrega é obrigatória' })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.delivery_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.delivery_date && (
                <p className="mt-1 text-sm text-red-600">{errors.delivery_date.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiVideo className="inline w-4 h-4 mr-1" />
                URL do Vídeo
              </label>
              <input
                type="url"
                {...register('video_url')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="https://www.youtube.com/watch?v=... (opcional)"
              />
              <p className="mt-1 text-xs text-gray-500">Link do YouTube ou outra plataforma de vídeo</p>
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Imagem da Entrega</h3>

          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-64 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <label className="flex flex-col items-center justify-center cursor-pointer">
                <FiUpload className="w-12 h-12 text-gray-400 mb-3" />
                <span className="text-sm text-gray-600">Clique para fazer upload ou arraste a imagem aqui</span>
                <span className="text-xs text-gray-500 mt-1">PNG, JPG até 5MB</span>
                <input
                  type="file"
                  {...register('image')}
                  accept="image/*"
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* Status Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Configurações de Status</h3>

          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('is_featured')}
                className="form-checkbox h-4 w-4 text-purple-600 transition duration-150 ease-in-out"
              />
              <span className="ml-2 text-sm text-gray-700 flex items-center">
                <FiStar className="w-4 h-4 mr-1 text-yellow-500" />
                Destacar esta entrega
              </span>
            </label>
            <p className="text-xs text-gray-500 ml-6">Entregas destacadas aparecem em destaque na página inicial</p>

            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('is_active')}
                defaultChecked={true}
                className="form-checkbox h-4 w-4 text-purple-600 transition duration-150 ease-in-out"
              />
              <span className="ml-2 text-sm text-gray-700">Entrega Ativa</span>
            </label>
            <p className="text-xs text-gray-500 ml-6">Desmarque para ocultar esta entrega do site</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/testimonials')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : isEdit ? (
              'Atualizar Entrega'
            ) : (
              'Criar Entrega'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TestimonialForm;