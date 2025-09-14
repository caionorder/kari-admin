import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { 
  FiSave, 
  FiPlus, 
  FiTrash2, 
  FiUpload, 
  FiX,
  FiCalendar,
  FiTarget,
  FiInfo,
  FiArrowLeft
} from '../../utils/icons';
import apiSafe from '../../services/apiSafe';

interface AboutKariValue {
  icon: string;
  title: string;
  description: string;
}

interface AboutKariTimelineEvent {
  year: string;
  title: string;
  description: string;
}

interface AboutKariFormData {
  hero: {
    title: string;
    subtitle: string;
    image?: FileList;
    imageUrl?: string;
  };
  story: {
    content: string;
  };
  values: AboutKariValue[];
  timeline: AboutKariTimelineEvent[];
}

const AboutKariEditor: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
    reset,
  } = useForm<AboutKariFormData>({
    defaultValues: {
      hero: {
        title: '',
        subtitle: '',
      },
      story: {
        content: '',
      },
      values: [
        { icon: '', title: '', description: '' }
      ],
      timeline: [
        { year: '', title: '', description: '' }
      ],
    },
  });

  const { fields: valueFields, append: appendValue, remove: removeValue } = useFieldArray({
    control,
    name: 'values',
  });

  const { fields: timelineFields, append: appendTimeline, remove: removeTimeline } = useFieldArray({
    control,
    name: 'timeline',
  });

  const watchHeroImage = watch('hero.image');

  useEffect(() => {
    fetchAboutKariContent();
  }, []);

  useEffect(() => {
    if (watchHeroImage && watchHeroImage.length > 0) {
      const file = watchHeroImage[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [watchHeroImage]);

  const fetchAboutKariContent = async () => {
    setLoading(true);
    try {
      const response = await apiSafe.get('/pages/about-kari');
      const data = response.data;

      // Reset form with fetched data - API returns flat structure
      reset({
        hero: {
          title: data.hero_title || '',
          subtitle: data.hero_subtitle || '',
          imageUrl: data.hero_image || '',
        },
        story: {
          content: data.story_content || '',
        },
        values: data.values?.length > 0 ? data.values : [{ icon: '', title: '', description: '' }],
        timeline: data.timeline?.length > 0 ? data.timeline : [{ year: '', title: '', description: '' }],
      });

      // Set image preview if exists
      if (data.hero_image) {
        setImagePreview(data.hero_image);
      }
    } catch (error: any) {
      console.error('Error fetching about kari content:', error);
      if (error.response?.status === 404) {
        toast.info('Nenhum conteúdo encontrado. Criando novo...');
      } else {
        toast.error('Erro ao carregar conteúdo');
      }
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiSafe.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.url) {
        return response.data.url;
      }
      return null;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Erro ao fazer upload da imagem');
      return null;
    }
  };

  const onSubmit = async (data: AboutKariFormData) => {
    setSaving(true);
    try {
      let imageUrl = data.hero.imageUrl;

      // Upload new image if selected
      if (data.hero.image && data.hero.image.length > 0) {
        setUploadingImage(true);
        const uploadedUrl = await uploadImage(data.hero.image[0]);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
        setUploadingImage(false);
      }

      // Prepare data for API - API expects flat structure
      const payload = {
        hero_title: data.hero.title,
        hero_subtitle: data.hero.subtitle,
        hero_image: imageUrl || imagePreview,
        story_content: data.story.content,
        values: data.values.filter(v => v.title || v.description), // Remove empty values
        timeline: data.timeline.filter(t => t.year || t.title), // Remove empty timeline events
      };

      await apiSafe.put('/pages/about-kari', payload);
      toast.success('Conteúdo atualizado com sucesso!');
      
      // Reset dirty state
      reset(data);
    } catch (error: any) {
      console.error('Error saving about kari content:', error);
      toast.error(error.response?.data?.detail || 'Erro ao salvar conteúdo');
    } finally {
      setSaving(false);
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setValue('hero.image', undefined);
    setValue('hero.imageUrl', undefined);
  };

  const handleAddValue = () => {
    appendValue({ icon: '', title: '', description: '' });
  };

  const handleAddTimelineEvent = () => {
    appendTimeline({ year: '', title: '', description: '' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando conteúdo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <button
              onClick={() => navigate('/content')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Editar "Quem é Kari"</h1>
          </div>
          <p className="text-gray-600 ml-12">Gerencie o conteúdo da página sobre Kari</p>
        </div>
        {isDirty && (
          <span className="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
            Alterações não salvas
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FiInfo className="w-5 h-5 mr-2 text-purple-600" />
            Seção Hero
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título Principal *
              </label>
              <input
                type="text"
                {...register('hero.title', { required: 'Título é obrigatório' })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.hero?.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ex: Conheça Kari"
              />
              {errors.hero?.title && (
                <p className="mt-1 text-sm text-red-600">{errors.hero.title.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subtítulo *
              </label>
              <input
                type="text"
                {...register('hero.subtitle', { required: 'Subtítulo é obrigatório' })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.hero?.subtitle ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ex: Uma história de superação e dedicação"
              />
              {errors.hero?.subtitle && (
                <p className="mt-1 text-sm text-red-600">{errors.hero.subtitle.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagem Hero
              </label>
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Hero preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <label className="flex flex-col items-center justify-center cursor-pointer">
                    <FiUpload className="w-12 h-12 text-gray-400 mb-3" />
                    <span className="text-sm text-gray-600">
                      Clique para fazer upload ou arraste a imagem aqui
                    </span>
                    <span className="text-xs text-gray-500 mt-1">PNG, JPG até 5MB</span>
                    <input
                      type="file"
                      {...register('hero.image')}
                      accept="image/*"
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FiInfo className="w-5 h-5 mr-2 text-purple-600" />
            História
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conteúdo da História *
            </label>
            <textarea
              {...register('story.content', { required: 'Conteúdo da história é obrigatório' })}
              rows={8}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.story?.content ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Escreva a história de Kari aqui..."
            />
            {errors.story?.content && (
              <p className="mt-1 text-sm text-red-600">{errors.story.content.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Você pode usar quebras de linha para criar parágrafos
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FiTarget className="w-5 h-5 mr-2 text-purple-600" />
              Valores
            </h3>
            <button
              type="button"
              onClick={handleAddValue}
              className="px-3 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center text-sm"
            >
              <FiPlus className="w-4 h-4 mr-1" />
              Adicionar Valor
            </button>
          </div>

          <div className="space-y-4">
            {valueFields.map((field, index) => (
              <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-gray-700">Valor {index + 1}</span>
                  {valueFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeValue(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Ícone (emoji ou texto)
                    </label>
                    <input
                      type="text"
                      {...register(`values.${index}.icon` as const)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      placeholder="Ex: 💖"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Título *
                    </label>
                    <input
                      type="text"
                      {...register(`values.${index}.title` as const, { 
                        required: 'Título é obrigatório' 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      placeholder="Ex: Compromisso"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Descrição *
                    </label>
                    <textarea
                      {...register(`values.${index}.description` as const, { 
                        required: 'Descrição é obrigatória' 
                      })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      placeholder="Descreva este valor..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <FiCalendar className="w-5 h-5 mr-2 text-purple-600" />
              Linha do Tempo
            </h3>
            <button
              type="button"
              onClick={handleAddTimelineEvent}
              className="px-3 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center text-sm"
            >
              <FiPlus className="w-4 h-4 mr-1" />
              Adicionar Evento
            </button>
          </div>

          <div className="space-y-4">
            {timelineFields.map((field, index) => (
              <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-gray-700">Evento {index + 1}</span>
                  {timelineFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTimeline(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Ano *
                    </label>
                    <input
                      type="text"
                      {...register(`timeline.${index}.year` as const, { 
                        required: 'Ano é obrigatório' 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      placeholder="Ex: 2020"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Título *
                    </label>
                    <input
                      type="text"
                      {...register(`timeline.${index}.title` as const, { 
                        required: 'Título é obrigatório' 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      placeholder="Ex: Início do Projeto"
                    />
                  </div>

                  <div className="md:col-span-4">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Descrição *
                    </label>
                    <textarea
                      {...register(`timeline.${index}.description` as const, { 
                        required: 'Descrição é obrigatória' 
                      })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      placeholder="Descreva este evento..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4 pb-6">
          <button
            type="button"
            onClick={() => navigate('/content')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving || uploadingImage}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {uploadingImage ? 'Enviando imagem...' : 'Salvando...'}
              </>
            ) : (
              <>
                <FiSave className="w-5 h-5 mr-2" />
                Salvar Alterações
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AboutKariEditor;