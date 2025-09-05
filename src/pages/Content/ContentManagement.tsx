import React, { useState, useEffect } from 'react';
import { FiEdit2, FiSave, FiX, FiImage, FiType, FiAlignLeft } from '../../utils/icons';
import { toast } from 'react-toastify';

interface ContentSection {
  id: string;
  key: string;
  title: string;
  type: 'hero' | 'about' | 'features' | 'testimonials' | 'footer';
  content: {
    title?: string;
    subtitle?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
    image?: string;
    items?: any[];
  };
  lastUpdated: string;
}

const ContentManagement: React.FC = () => {
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      // Simulated data
      const mockSections: ContentSection[] = [
        {
          id: '1',
          key: 'hero',
          title: 'Seção Hero',
          type: 'hero',
          content: {
            title: 'Transforme Vidas com Kari Ajuda',
            subtitle: 'Juntos podemos fazer a diferença',
            description: 'Participe de campanhas solidárias e ajude a transformar a vida de quem precisa.',
            buttonText: 'Começar Agora',
            buttonLink: '/campaigns',
            image: '/images/hero-bg.jpg',
          },
          lastUpdated: '2024-01-30',
        },
        {
          id: '2',
          key: 'about',
          title: 'Sobre Nós',
          type: 'about',
          content: {
            title: 'Nossa Missão',
            description: 'O Kari Ajuda é uma plataforma dedicada a conectar pessoas que querem ajudar com causas que precisam de apoio. Acreditamos no poder da solidariedade e na força da união para transformar realidades.',
            image: '/images/about.jpg',
          },
          lastUpdated: '2024-01-28',
        },
        {
          id: '3',
          key: 'features',
          title: 'Funcionalidades',
          type: 'features',
          content: {
            title: 'Como Funciona',
            subtitle: 'Simples, transparente e eficaz',
            items: [
              {
                icon: '🎯',
                title: 'Escolha uma Campanha',
                description: 'Navegue pelas campanhas ativas e escolha a que mais toca seu coração.',
              },
              {
                icon: '💖',
                title: 'Faça sua Contribuição',
                description: 'Contribua com qualquer valor ou vote no seu participante favorito.',
              },
              {
                icon: '🏆',
                title: 'Acompanhe os Resultados',
                description: 'Veja em tempo real o impacto da sua contribuição.',
              },
            ],
          },
          lastUpdated: '2024-01-25',
        },
      ];
      setSections(mockSections);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching content:', error);
      setLoading(false);
    }
  };

  const handleEdit = (section: ContentSection) => {
    setEditingSection(section.id);
    setFormData(section.content);
  };

  const handleSave = async (sectionId: string) => {
    try {
      // API call to save content
      setSections(sections.map(s => 
        s.id === sectionId 
          ? { ...s, content: formData, lastUpdated: new Date().toISOString().split('T')[0] }
          : s
      ));
      setEditingSection(null);
      toast.success('Conteúdo atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar conteúdo');
    }
  };

  const handleCancel = () => {
    setEditingSection(null);
    setFormData({});
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const items = [...(formData.items || [])];
    items[index] = { ...items[index], [field]: value };
    setFormData({ ...formData, items });
  };

  const addItem = () => {
    const items = [...(formData.items || []), { icon: '', title: '', description: '' }];
    setFormData({ ...formData, items });
  };

  const removeItem = (index: number) => {
    const items = formData.items.filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, items });
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
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Gestão de Conteúdo</h1>
        <p className="text-gray-600">Edite o conteúdo das páginas do site</p>
      </div>

      {/* Content Sections */}
      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.id} className="bg-white rounded-lg shadow-md">
            {editingSection === section.id ? (
              // Edit Mode
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">{section.title}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSave(section.id)}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      <FiSave className="inline w-4 h-4 mr-1" />
                      Salvar
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      <FiX className="inline w-4 h-4 mr-1" />
                      Cancelar
                    </button>
                  </div>
                </div>

                {/* Dynamic Form Fields */}
                {formData.title !== undefined && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FiType className="inline w-4 h-4 mr-1" />
                      Título
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                )}

                {formData.subtitle !== undefined && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FiType className="inline w-4 h-4 mr-1" />
                      Subtítulo
                    </label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => handleInputChange('subtitle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                )}

                {formData.description !== undefined && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FiAlignLeft className="inline w-4 h-4 mr-1" />
                      Descrição
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                )}

                {formData.buttonText !== undefined && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Texto do Botão
                      </label>
                      <input
                        type="text"
                        value={formData.buttonText}
                        onChange={(e) => handleInputChange('buttonText', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Link do Botão
                      </label>
                      <input
                        type="text"
                        value={formData.buttonLink}
                        onChange={(e) => handleInputChange('buttonLink', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                )}

                {formData.image !== undefined && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FiImage className="inline w-4 h-4 mr-1" />
                      URL da Imagem
                    </label>
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => handleInputChange('image', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                )}

                {formData.items !== undefined && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Items
                      </label>
                      <button
                        onClick={addItem}
                        className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
                      >
                        Adicionar Item
                      </button>
                    </div>
                    <div className="space-y-3">
                      {formData.items.map((item: any, index: number) => (
                        <div key={index} className="border rounded-lg p-3 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Item {index + 1}</span>
                            <button
                              onClick={() => removeItem(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <input
                              type="text"
                              placeholder="Ícone"
                              value={item.icon}
                              onChange={(e) => handleItemChange(index, 'icon', e.target.value)}
                              className="px-2 py-1 border rounded text-sm"
                            />
                            <input
                              type="text"
                              placeholder="Título"
                              value={item.title}
                              onChange={(e) => handleItemChange(index, 'title', e.target.value)}
                              className="px-2 py-1 border rounded text-sm col-span-2"
                            />
                          </div>
                          <textarea
                            placeholder="Descrição"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            rows={2}
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // View Mode
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{section.title}</h3>
                    <p className="text-sm text-gray-500">
                      Última atualização: {new Date(section.lastUpdated).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleEdit(section)}
                    className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                  >
                    <FiEdit2 className="inline w-4 h-4 mr-1" />
                    Editar
                  </button>
                </div>

                {/* Content Preview */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  {section.content.title && (
                    <p><strong>Título:</strong> {section.content.title}</p>
                  )}
                  {section.content.subtitle && (
                    <p><strong>Subtítulo:</strong> {section.content.subtitle}</p>
                  )}
                  {section.content.description && (
                    <p><strong>Descrição:</strong> {section.content.description}</p>
                  )}
                  {section.content.buttonText && (
                    <p><strong>Botão:</strong> {section.content.buttonText} → {section.content.buttonLink}</p>
                  )}
                  {section.content.image && (
                    <p><strong>Imagem:</strong> {section.content.image}</p>
                  )}
                  {section.content.items && (
                    <div>
                      <strong>Items:</strong>
                      <ul className="ml-4 mt-1">
                        {section.content.items.map((item: any, index: number) => (
                          <li key={index} className="text-sm">
                            {item.icon} {item.title} - {item.description}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentManagement;