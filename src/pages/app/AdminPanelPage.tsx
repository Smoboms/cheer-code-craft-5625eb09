import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Pencil, Trash2, Image, Save, X, Building, Tag, MapPin, Phone, Globe, Star, Upload, Megaphone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { loadBannerConfig, saveBannerConfig, PublicBannerConfig } from '@/data/publicBanner';

interface AdminPanelPageProps {
  onBack: () => void;
  accessToken: string;
}

type AdminTab = 'partners' | 'categories' | 'cities' | 'banner';


interface PartnerForm {
  id?: string;
  name: string;
  category: string;
  discount: string;
  description: string;
  address: string;
  city: string;
  phone: string;
  whatsapp: string;
  maps_link: string;
  responsible: string;
  is_active: boolean;
  logo_url: string;
  banner_url: string;
  profile_image_url: string;
}

const emptyPartner: PartnerForm = {
  name: '', category: '', discount: '', description: '', address: '',
  city: '', phone: '', whatsapp: '', maps_link: '', responsible: '',
  is_active: true, logo_url: '', banner_url: '', profile_image_url: '',
};

const DEFAULT_CATEGORIES = ['Alimentação', 'Saúde', 'Moda', 'Serviços', 'Hotel', 'Casa & Decor', 'Eventos', 'Academias', 'Celular e Acessórios', 'Materiais de Construção', 'Personalizados', 'Seguros'];

export function AdminPanelPage({ onBack }: AdminPanelPageProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('partners');
  const [partners, setPartners] = useState<any[]>([]);
  const [partnerBenefits, setPartnerBenefits] = useState<any[]>([]);
  const [partnerPhotos, setPartnerPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPartner, setEditingPartner] = useState<PartnerForm | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Categories & Cities from DB partners
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [cities, setCities] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [newCity, setNewCity] = useState('');

  // Benefits editing
  const [editingBenefits, setEditingBenefits] = useState<string | null>(null);
  const [benefitTitle, setBenefitTitle] = useState('');
  const [benefitDiscount, setBenefitDiscount] = useState('');
  const [benefitDescription, setBenefitDescription] = useState('');

  // Photo upload
  const [uploadingPhoto, setUploadingPhoto] = useState<string | null>(null);

  // Public home banner
  const [banner, setBanner] = useState<PublicBannerConfig>(() => loadBannerConfig());


  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [partnersRes, benefitsRes, photosRes] = await Promise.all([
        supabase.from('partners').select('*').order('name'),
        supabase.from('partner_benefits').select('*'),
        supabase.from('partner_photos').select('*').order('sort_order'),
      ]);
      
      setPartners(partnersRes.data || []);
      setPartnerBenefits(benefitsRes.data || []);
      setPartnerPhotos(photosRes.data || []);

      // Extract unique categories and cities
      const allCategories = new Set(DEFAULT_CATEGORIES);
      const allCities = new Set<string>();
      (partnersRes.data || []).forEach((p: any) => {
        if (p.category) allCategories.add(p.category);
        if (p.city) allCities.add(p.city);
      });
      setCategories(Array.from(allCategories).sort());
      setCities(Array.from(allCities).sort());
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePartner = async () => {
    if (!editingPartner) return;
    const { id, ...data } = editingPartner;
    
    try {
      if (id) {
        const { error } = await supabase.from('partners').update(data).eq('id', id);
        if (error) throw error;
        toast.success('Parceiro atualizado!');
      } else {
        const { error } = await supabase.from('partners').insert({ ...data, created_by: user?.id });
        if (error) throw error;
        toast.success('Parceiro criado!');
      }
      setEditingPartner(null);
      setIsCreating(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar');
    }
  };

  const handleDeletePartner = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este parceiro?')) return;
    try {
      const { error } = await supabase.from('partners').delete().eq('id', id);
      if (error) throw error;
      toast.success('Parceiro excluído!');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao excluir');
    }
  };

  const handleAddBenefit = async (partnerId: string) => {
    if (!benefitTitle || !benefitDiscount) return;
    try {
      const { error } = await supabase.from('partner_benefits').insert({
        partner_id: partnerId,
        title: benefitTitle,
        discount: benefitDiscount,
        description: benefitDescription,
      });
      if (error) throw error;
      setBenefitTitle(''); setBenefitDiscount(''); setBenefitDescription('');
      toast.success('Benefício adicionado!');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Erro');
    }
  };

  const handleDeleteBenefit = async (id: string) => {
    try {
      const { error } = await supabase.from('partner_benefits').delete().eq('id', id);
      if (error) throw error;
      toast.success('Benefício removido');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Erro');
    }
  };

  const handlePhotoUpload = async (partnerId: string, file: File) => {
    setUploadingPhoto(partnerId);
    try {
      const ext = file.name.split('.').pop();
      const path = `${partnerId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('partner-images').upload(path, file);
      if (uploadError) throw uploadError;
      
      const { data: urlData } = supabase.storage.from('partner-images').getPublicUrl(path);
      const { error } = await supabase.from('partner_photos').insert({
        partner_id: partnerId,
        photo_url: urlData.publicUrl,
        sort_order: partnerPhotos.filter(p => p.partner_id === partnerId).length,
      });
      if (error) throw error;
      toast.success('Foto adicionada!');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Erro no upload');
    } finally {
      setUploadingPhoto(null);
    }
  };

  const handleDeletePhoto = async (id: string) => {
    try {
      const { error } = await supabase.from('partner_photos').delete().eq('id', id);
      if (error) throw error;
      toast.success('Foto removida');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Erro');
    }
  };

  const handleLogoUpload = async (file: File, field: 'logo_url' | 'banner_url' | 'profile_image_url') => {
    if (!editingPartner) return;
    try {
      const ext = file.name.split('.').pop();
      const path = `logos/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('partner-images').upload(path, file);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('partner-images').getPublicUrl(path);
      setEditingPartner({ ...editingPartner, [field]: urlData.publicUrl });
      toast.success('Imagem carregada!');
    } catch (err: any) {
      toast.error(err.message || 'Erro no upload');
    }
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    if (categories.includes(newCategory.trim())) {
      toast.error('Categoria já existe');
      return;
    }
    setCategories(prev => [...prev, newCategory.trim()].sort());
    setNewCategory('');
    toast.success('Categoria adicionada!');
  };

  const handleRemoveCategory = (cat: string) => {
    const usedBy = partners.filter(p => p.category === cat);
    if (usedBy.length > 0) {
      toast.error(`Categoria em uso por ${usedBy.length} parceiro(s)`);
      return;
    }
    setCategories(prev => prev.filter(c => c !== cat));
    toast.success('Categoria removida');
  };

  const handleAddCity = () => {
    if (!newCity.trim()) return;
    if (cities.includes(newCity.trim())) {
      toast.error('Cidade já existe');
      return;
    }
    setCities(prev => [...prev, newCity.trim()].sort());
    setNewCity('');
    toast.success('Cidade adicionada!');
  };

  const handleRemoveCity = (city: string) => {
    const usedBy = partners.filter(p => p.city === city);
    if (usedBy.length > 0) {
      toast.error(`Cidade em uso por ${usedBy.length} parceiro(s)`);
      return;
    }
    setCities(prev => prev.filter(c => c !== city));
    toast.success('Cidade removida');
  };

  const tabs: { key: AdminTab; label: string; icon: any }[] = [
    { key: 'partners', label: 'Parceiros', icon: Building },
    { key: 'categories', label: 'Categorias', icon: Tag },
    { key: 'cities', label: 'Cidades', icon: MapPin },
    { key: 'banner', label: 'Banner Home', icon: Megaphone },
  ];

  const handleSaveBanner = () => {
    saveBannerConfig(banner);
    toast.success('Banner salvo!');
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-2xl mx-auto min-h-screen bg-black">
        {/* Header */}
        <div className="bg-black p-4 border-b border-gray-800 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="w-10 h-10 bg-gray-900 flex items-center justify-center hover:bg-gray-800 transition-colors">
              <ArrowLeft className="text-white" size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Painel Administrativo</h1>
              <p className="text-sm text-gray-400">RARQUES ASSOCIATION</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all ${
                  activeTab === t.key ? 'bg-white text-black' : 'bg-gray-900 text-gray-300 border border-gray-800'
                }`}>
                <t.icon size={16} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="text-center py-12 text-gray-400">Carregando...</div>
          ) : (
            <>
              {/* PARTNERS TAB */}
              {activeTab === 'partners' && !editingPartner && (
                <div>
                  <button onClick={() => { setEditingPartner({ ...emptyPartner }); setIsCreating(true); }}
                    className="w-full mb-4 bg-white text-black font-bold py-3 flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors">
                    <Plus size={20} /> Adicionar Parceiro
                  </button>

                  <div className="space-y-3">
                    {partners.map(p => (
                      <div key={p.id} className="bg-gray-900 border border-gray-800 p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {p.logo_url ? (
                              <img src={p.logo_url} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <Building size={20} className="text-gray-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-bold text-sm truncate">{p.name}</h3>
                            <p className="text-gray-400 text-xs">{p.category} · {p.city || 'Sem cidade'}</p>
                            <p className="text-green-400 text-xs font-bold">{p.discount}</p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <button onClick={() => setEditingPartner({ ...p })}
                              className="w-9 h-9 bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors">
                              <Pencil size={16} className="text-white" />
                            </button>
                            <button onClick={() => handleDeletePartner(p.id)}
                              className="w-9 h-9 bg-red-900/50 flex items-center justify-center hover:bg-red-800 transition-colors">
                              <Trash2 size={16} className="text-red-400" />
                            </button>
                          </div>
                        </div>

                        {/* Photos */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Fotos</p>
                            <label className="cursor-pointer text-xs text-white bg-gray-800 px-3 py-1 hover:bg-gray-700 flex items-center gap-1">
                              <Upload size={12} /> Adicionar
                              <input type="file" accept="image/*" className="hidden"
                                onChange={e => e.target.files?.[0] && handlePhotoUpload(p.id, e.target.files[0])} />
                            </label>
                          </div>
                          <div className="flex gap-2 overflow-x-auto">
                            {partnerPhotos.filter(ph => ph.partner_id === p.id).map(ph => (
                              <div key={ph.id} className="relative flex-shrink-0 w-20 h-20 bg-gray-800">
                                <img src={ph.photo_url} alt="" className="w-full h-full object-cover" />
                                <button onClick={() => handleDeletePhoto(ph.id)}
                                  className="absolute top-0 right-0 bg-red-600 w-5 h-5 flex items-center justify-center">
                                  <X size={12} className="text-white" />
                                </button>
                              </div>
                            ))}
                            {uploadingPhoto === p.id && (
                              <div className="flex-shrink-0 w-20 h-20 bg-gray-800 flex items-center justify-center">
                                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Benefits */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Benefícios</p>
                            <button onClick={() => setEditingBenefits(editingBenefits === p.id ? null : p.id)}
                              className="text-xs text-white bg-gray-800 px-3 py-1 hover:bg-gray-700">
                              {editingBenefits === p.id ? 'Fechar' : 'Gerenciar'}
                            </button>
                          </div>
                          {partnerBenefits.filter(b => b.partner_id === p.id).map(b => (
                            <div key={b.id} className="flex items-center justify-between bg-gray-800/50 px-3 py-2 mb-1">
                              <div>
                                <p className="text-white text-xs font-bold">{b.title}</p>
                                <p className="text-green-400 text-xs">{b.discount}</p>
                              </div>
                              <button onClick={() => handleDeleteBenefit(b.id)}
                                className="text-red-400 hover:text-red-300">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                          {editingBenefits === p.id && (
                            <div className="mt-2 space-y-2 bg-gray-800/30 p-3">
                              <input value={benefitTitle} onChange={e => setBenefitTitle(e.target.value)}
                                placeholder="Título do benefício" className="w-full px-3 py-2 bg-black border border-gray-700 text-white text-sm" />
                              <input value={benefitDiscount} onChange={e => setBenefitDiscount(e.target.value)}
                                placeholder="Desconto (ex: 15%)" className="w-full px-3 py-2 bg-black border border-gray-700 text-white text-sm" />
                              <input value={benefitDescription} onChange={e => setBenefitDescription(e.target.value)}
                                placeholder="Descrição (opcional)" className="w-full px-3 py-2 bg-black border border-gray-700 text-white text-sm" />
                              <button onClick={() => handleAddBenefit(p.id)}
                                className="w-full bg-white text-black font-bold py-2 text-sm">
                                Adicionar Benefício
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PARTNER EDIT FORM */}
              {activeTab === 'partners' && editingPartner && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white">{isCreating ? 'Novo Parceiro' : 'Editar Parceiro'}</h2>
                    <button onClick={() => { setEditingPartner(null); setIsCreating(false); }}
                      className="text-gray-400 hover:text-white"><X size={24} /></button>
                  </div>

                  {/* Image uploads */}
                  <div className="grid grid-cols-3 gap-3">
                    {(['logo_url', 'banner_url', 'profile_image_url'] as const).map(field => (
                      <div key={field} className="text-center">
                        <p className="text-xs text-gray-500 mb-1">{field === 'logo_url' ? 'Logo' : field === 'banner_url' ? 'Banner' : 'Perfil'}</p>
                        <label className="cursor-pointer block w-full h-20 bg-gray-900 border border-gray-700 flex items-center justify-center overflow-hidden hover:border-gray-500">
                          {editingPartner[field] ? (
                            <img src={editingPartner[field]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Image size={20} className="text-gray-600" />
                          )}
                          <input type="file" accept="image/*" className="hidden"
                            onChange={e => e.target.files?.[0] && handleLogoUpload(e.target.files[0], field)} />
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <input value={editingPartner.name} onChange={e => setEditingPartner({...editingPartner, name: e.target.value})}
                      placeholder="Nome da empresa" className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white text-sm" />
                    
                    <select value={editingPartner.category} onChange={e => setEditingPartner({...editingPartner, category: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white text-sm">
                      <option value="">Selecionar categoria</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>

                    <input value={editingPartner.discount} onChange={e => setEditingPartner({...editingPartner, discount: e.target.value})}
                      placeholder="Desconto (ex: Até 20% OFF)" className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white text-sm" />

                    <textarea value={editingPartner.description} onChange={e => setEditingPartner({...editingPartner, description: e.target.value})}
                      placeholder="Descrição" rows={3} className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white text-sm resize-none" />

                    <input value={editingPartner.address} onChange={e => setEditingPartner({...editingPartner, address: e.target.value})}
                      placeholder="Endereço" className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white text-sm" />

                    <select value={editingPartner.city} onChange={e => setEditingPartner({...editingPartner, city: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white text-sm">
                      <option value="">Selecionar cidade</option>
                      {cities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>

                    <input value={editingPartner.phone} onChange={e => setEditingPartner({...editingPartner, phone: e.target.value})}
                      placeholder="Telefone" className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white text-sm" />

                    <input value={editingPartner.whatsapp} onChange={e => setEditingPartner({...editingPartner, whatsapp: e.target.value})}
                      placeholder="WhatsApp (com DDD)" className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white text-sm" />

                    <input value={editingPartner.maps_link} onChange={e => setEditingPartner({...editingPartner, maps_link: e.target.value})}
                      placeholder="Link Google Maps" className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white text-sm" />

                    <input value={editingPartner.responsible} onChange={e => setEditingPartner({...editingPartner, responsible: e.target.value})}
                      placeholder="Responsável" className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white text-sm" />

                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                        <input type="checkbox" checked={editingPartner.is_active}
                          onChange={e => setEditingPartner({...editingPartner, is_active: e.target.checked})}
                          className="w-5 h-5" />
                        Ativo
                      </label>
                    </div>
                  </div>

                  <button onClick={handleSavePartner}
                    className="w-full bg-white text-black font-bold py-3 flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors">
                    <Save size={20} /> {isCreating ? 'Criar Parceiro' : 'Salvar Alterações'}
                  </button>
                </div>
              )}

              {/* CATEGORIES TAB */}
              {activeTab === 'categories' && (
                <div>
                  <div className="flex gap-2 mb-4">
                    <input value={newCategory} onChange={e => setNewCategory(e.target.value)}
                      placeholder="Nova categoria" className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 text-white text-sm"
                      onKeyDown={e => e.key === 'Enter' && handleAddCategory()} />
                    <button onClick={handleAddCategory}
                      className="bg-white text-black font-bold px-4 py-3 flex items-center gap-2">
                      <Plus size={18} /> Adicionar
                    </button>
                  </div>

                  <div className="space-y-2">
                    {categories.map(cat => {
                      const count = partners.filter(p => p.category === cat).length;
                      return (
                        <div key={cat} className="flex items-center justify-between bg-gray-900 border border-gray-800 px-4 py-3">
                          <div>
                            <p className="text-white text-sm font-bold">{cat}</p>
                            <p className="text-gray-500 text-xs">{count} parceiro(s)</p>
                          </div>
                          <button onClick={() => handleRemoveCategory(cat)}
                            className="text-red-400 hover:text-red-300">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CITIES TAB */}
              {activeTab === 'cities' && (
                <div>
                  <div className="flex gap-2 mb-4">
                    <input value={newCity} onChange={e => setNewCity(e.target.value)}
                      placeholder="Nova cidade" className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 text-white text-sm"
                      onKeyDown={e => e.key === 'Enter' && handleAddCity()} />
                    <button onClick={handleAddCity}
                      className="bg-white text-black font-bold px-4 py-3 flex items-center gap-2">
                      <Plus size={18} /> Adicionar
                    </button>
                  </div>

                  <div className="space-y-2">
                    {cities.map(city => {
                      const count = partners.filter(p => p.city === city).length;
                      return (
                        <div key={city} className="flex items-center justify-between bg-gray-900 border border-gray-800 px-4 py-3">
                          <div>
                            <p className="text-white text-sm font-bold">{city}</p>
                            <p className="text-gray-500 text-xs">{count} parceiro(s)</p>
                          </div>
                          <button onClick={() => handleRemoveCity(city)}
                            className="text-red-400 hover:text-red-300">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      );
                    })}
                    {cities.length === 0 && (
                      <p className="text-gray-500 text-sm text-center py-8">Nenhuma cidade cadastrada. Adicione cidades acima.</p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
