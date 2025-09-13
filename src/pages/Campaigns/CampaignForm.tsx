import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiSafe from '../../services/apiSafe';
import { endpoints } from '../../services/api';
import { FiUpload, FiX } from '../../utils/icons';
import { getImageUrl } from '../../utils/imageUrl';

interface CampaignFormData {
  title: string;
  description: string;
  full_description: string;
  category: string;
  goal: number; // Meta de participantes
  is_active: boolean;
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
      const response = await apiSafe.get(endpoints.campaigns.detail(id!));
      const campaign = response.data;

      // Map API fields to form fields
      setValue('title', campaign.title);
      setValue('description', campaign.description);
      setValue('full_description', campaign.full_description || '');
      setValue('category', campaign.category || '');
      setValue('goal', campaign.goal || 5000);
      setValue('is_active', campaign.status === 'active');
      
      if (campaign.image_url) {
        setImagePreview(getImageUrl(campaign.image_url));
      }
    } catch (error) {
      console.error('Error fetching campaign:', error);
      toast.error('Erro ao carregar campanha');
      navigate('/campaigns');
    }
  };

  const onSubmit = async (data: CampaignFormData) => {
    setLoading(true);
    try {
      // Prepare data for API
      const campaignData: any = {
        title: data.title,
        description: data.description,
        full_description: data.full_description,
        category: data.category,
        goal: Number(data.goal),
        status: data.is_active ? 'active' : 'draft'
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
            // Use only the path without domain (like /microondas.png)
            campaignData.image_url = uploadResponse.data.url;
          }
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          toast.warning('Erro ao fazer upload da imagem, mas a campanha será salva');
        }
      }

      if (isEdit) {
        await apiSafe.put(endpoints.campaigns.update(id!), campaignData);
        toast.success('Campanha atualizada com sucesso');
      } else {
        await apiSafe.post(endpoints.campaigns.create, campaignData);
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
                Descrição Curta *
              </label>
              <textarea
                {...register('description', { required: 'Descrição é obrigatória' })}
                rows={2}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Descrição breve que aparece na listagem de campanhas..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição Completa *
              </label>
              <textarea
                {...register('full_description', { required: 'Descrição completa é obrigatória' })}
                rows={5}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.full_description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Descrição detalhada com objetivos e benefícios da campanha..."
              />
              {errors.full_description && (
                <p className="mt-1 text-sm text-red-600">{errors.full_description.message}</p>
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
                <option value="eletrodomesticos">Eletrodomésticos</option>
                <option value="alimentacao">Alimentação</option>
                <option value="financeiro">Financeiro</option>
                <option value="essenciais">Essenciais</option>
                <option value="eletronicos">Eletrônicos</option>
                <option value="tecnologia">Tecnologia</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta de Participantes *
              </label>
              <input
                type="number"
                {...register('goal', {
                  required: 'Meta de participantes é obrigatória',
                  min: { value: 100, message: 'Meta mínima é 100 participantes' },
                })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.goal ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="5000"
              />
              <p className="mt-1 text-xs text-gray-500">Número de participantes necessários para atingir a meta</p>
              {errors.goal && (
                <p className="mt-1 text-sm text-red-600">{errors.goal.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status da Campanha
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  {...register('is_active')}
                  defaultChecked={true}
                  className="form-checkbox h-4 w-4 text-purple-600 transition duration-150 ease-in-out"
                />
                <span className="ml-2 text-sm text-gray-700">Campanha Ativa</span>
              </label>
              <p className="mt-1 text-xs text-gray-500">Desmarque para salvar como rascunho</p>
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
