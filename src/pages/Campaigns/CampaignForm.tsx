import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiCalendar, FiDollarSign, FiUpload, FiX } from '../../utils/icons';

interface CampaignFormData {
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  targetAmount: number;
  image?: FileList;
}

const CampaignForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CampaignFormData>();

  const watchImage = watch('image');

  useEffect(() => {
    if (isEdit) {
      fetchCampaign();
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

  const fetchCampaign = async () => {
    try {
      // Simulated data - replace with actual API call
      const mockData = {
        title: 'Educação para Todos',
        description: 'Campanha para arrecadar fundos para materiais escolares',
        category: 'education',
        startDate: '2024-01-15',
        endDate: '2024-03-15',
        targetAmount: 50000,
      };

      Object.keys(mockData).forEach((key) => {
        setValue(key as keyof CampaignFormData, mockData[key as keyof typeof mockData]);
      });
    } catch (error) {
      console.error('Error fetching campaign:', error);
      toast.error('Erro ao carregar campanha');
    }
  };

  const onSubmit = async (data: CampaignFormData) => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (key === 'image' && data.image && data.image.length > 0) {
          formData.append('image', data.image[0]);
        } else if (key !== 'image') {
          formData.append(key, String(data[key as keyof CampaignFormData]));
        }
      });

      if (isEdit) {
        // await api.put(endpoints.campaigns.update(id), formData);
        toast.success('Campanha atualizada com sucesso');
      } else {
        // await api.post(endpoints.campaigns.create, formData);
        toast.success('Campanha criada com sucesso');
      }
      navigate('/campaigns');
    } catch (error) {
      console.error('Error saving campaign:', error);
      toast.error('Erro ao salvar campanha');
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
          {isEdit ? 'Editar Campanha' : 'Nova Campanha'}
        </h1>
        <p className="text-gray-600">
          {isEdit ? 'Atualize as informações da campanha' : 'Crie uma nova campanha de arrecadação'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Informações Básicas</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título da Campanha *
              </label>
              <input
                type="text"
                {...register('title', { required: 'Título é obrigatório' })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ex: Educação para Todos"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição *
              </label>
              <textarea
                {...register('description', { required: 'Descrição é obrigatória' })}
                rows={4}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Descreva os objetivos e benefícios da campanha..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
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
                <option value="education">Educação</option>
                <option value="health">Saúde</option>
                <option value="environment">Meio Ambiente</option>
                <option value="culture">Cultura</option>
                <option value="sports">Esporte</option>
                <option value="social">Social</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta de Arrecadação (R$) *
              </label>
              <div className="relative">
                <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  {...register('targetAmount', {
                    required: 'Meta é obrigatória',
                    min: { value: 100, message: 'Meta mínima é R$ 100' },
                  })}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.targetAmount ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="50000"
                />
              </div>
              {errors.targetAmount && (
                <p className="mt-1 text-sm text-red-600">{errors.targetAmount.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Campaign Period */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Período da Campanha</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Início *
              </label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  {...register('startDate', { required: 'Data de início é obrigatória' })}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.startDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Término *
              </label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  {...register('endDate', { required: 'Data de término é obrigatória' })}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.endDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Campaign Image */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Imagem da Campanha</h3>

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

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/campaigns')}
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
              'Atualizar Campanha'
            ) : (
              'Criar Campanha'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CampaignForm;
