import { useState, useEffect } from 'react';
import { ArrowLeft, Users, Store, Plus, Edit2, Trash2, X, Eye, EyeOff } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { mockPartners } from '@/components/app/data/partnersData';

interface AdminPanelPageProps {
  onBack: () => void;
  accessToken: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  photo: string | null;
  createdAt: string;
}

interface Partner {
  id: string;
  name: string;
  category: string;
  discount: string;
  distance: string;
  rating: number;
  image: string;
  bannerImage?: string;
  logo?: string;
  benefits: Array<{
    id: number;
    title: string;
    description: string;
    discount: string;
  }>;
  createdAt: string;
}

// Mock users data
const mockUsers: User[] = [
  {
    id: '1',
    email: 'imobiliario454@gmail.com',
    name: 'Admin Principal',
    photo: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'rarquesmatriz@gmail.com',
    name: 'Admin Matriz',
    photo: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    email: 'usuario@exemplo.com',
    name: 'Usuário Exemplo',
    photo: null,
    createdAt: new Date().toISOString(),
  },
];

// Convert mock partners to the expected format
const mockPartnersFormatted: Partner[] = mockPartners.map((p) => ({
  id: String(p.id),
  name: p.name,
  category: p.category,
  discount: p.discount,
  distance: p.distance,
  rating: p.rating,
  image: p.image,
  bannerImage: p.bannerImage,
  logo: p.profileImage,
  benefits: p.benefits || [],
  createdAt: new Date().toISOString(),
}));

export function AdminPanelPage({ onBack, accessToken }: AdminPanelPageProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'partners'>('users');
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [partners, setPartners] = useState<Partner[]>(mockPartnersFormatted);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Formulário de usuário
  const [userForm, setUserForm] = useState({
    email: '',
    password: '',
    name: '',
    photo: '',
  });

  // Formulário de parceiro
  const [partnerForm, setPartnerForm] = useState({
    name: '',
    category: '',
    discount: '',
    distance: '',
    rating: 0,
    image: '',
    bannerImage: '',
    logo: '',
    benefits: [] as Array<{ id: number; title: string; description: string; discount: string }>,
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    loadUsers();
    loadPartners();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-852ad853/admin/users`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const loadPartners = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-852ad853/partners`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      if (data.partners) {
        setPartners(data.partners);
      }
    } catch (error) {
      console.error('Error loading partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-852ad853/admin/users`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify(userForm),
        }
      );

      const data = await response.json();
      if (response.ok) {
        alert('Usuário criado com sucesso!');
        setShowModal(false);
        setUserForm({ email: '', password: '', name: '', photo: '' });
        loadUsers();
      } else {
        alert(`Erro: ${data.error}`);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Erro ao criar usuário');
    }
  };

  const handleUpdateUser = async () => {
    if (!editingItem) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-852ad853/admin/users/${editingItem.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            name: userForm.name,
            photo: userForm.photo,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        alert('Usuário atualizado com sucesso!');
        setShowModal(false);
        setEditingItem(null);
        setUserForm({ email: '', password: '', name: '', photo: '' });
        loadUsers();
      } else {
        alert(`Erro: ${data.error}`);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Erro ao atualizar usuário');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja deletar este usuário?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-852ad853/admin/users/${userId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        alert('Usuário deletado com sucesso!');
        loadUsers();
      } else {
        const data = await response.json();
        alert(`Erro: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Erro ao deletar usuário');
    }
  };

  const handleCreatePartner = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-852ad853/admin/partners`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify(partnerForm),
        }
      );

      const data = await response.json();
      if (response.ok) {
        alert('Parceiro criado com sucesso!');
        setShowModal(false);
        setPartnerForm({
          name: '',
          category: '',
          discount: '',
          distance: '',
          rating: 0,
          image: '',
          bannerImage: '',
          logo: '',
          benefits: [],
        });
        loadPartners();
      } else {
        alert(`Erro: ${data.error}`);
      }
    } catch (error) {
      console.error('Error creating partner:', error);
      alert('Erro ao criar parceiro');
    }
  };

  const handleUpdatePartner = async () => {
    if (!editingItem) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-852ad853/admin/partners/${editingItem.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify(partnerForm),
        }
      );

      const data = await response.json();
      if (response.ok) {
        alert('Parceiro atualizado com sucesso!');
        setShowModal(false);
        setEditingItem(null);
        setPartnerForm({
          name: '',
          category: '',
          discount: '',
          distance: '',
          rating: 0,
          image: '',
          bannerImage: '',
          logo: '',
          benefits: [],
        });
        loadPartners();
      } else {
        alert(`Erro: ${data.error}`);
      }
    } catch (error) {
      console.error('Error updating partner:', error);
      alert('Erro ao atualizar parceiro');
    }
  };

  const handleDeletePartner = async (partnerId: string) => {
    if (!confirm('Tem certeza que deseja deletar este parceiro?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-852ad853/admin/partners/${partnerId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        alert('Parceiro deletado com sucesso!');
        loadPartners();
      } else {
        const data = await response.json();
        alert(`Erro: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting partner:', error);
      alert('Erro ao deletar parceiro');
    }
  };

  const openCreateUserModal = () => {
    setEditingItem(null);
    setUserForm({ email: '', password: '', name: '', photo: '' });
    setShowModal(true);
  };

  const openEditUserModal = (user: User) => {
    setEditingItem(user);
    setUserForm({
      email: user.email,
      password: '',
      name: user.name,
      photo: user.photo || '',
    });
    setShowModal(true);
  };

  const openCreatePartnerModal = () => {
    setEditingItem(null);
    setPartnerForm({
      name: '',
      category: '',
      discount: '',
      distance: '',
      rating: 0,
      image: '',
      bannerImage: '',
      logo: '',
      benefits: [],
    });
    setShowModal(true);
  };

  const openEditPartnerModal = (partner: Partner) => {
    setEditingItem(partner);
    setPartnerForm({
      name: partner.name,
      category: partner.category,
      discount: partner.discount,
      distance: partner.distance,
      rating: partner.rating,
      image: partner.image,
      bannerImage: partner.bannerImage || '',
      logo: partner.logo || '',
      benefits: partner.benefits || [],
    });
    setShowModal(true);
  };

  const addBenefit = () => {
    setPartnerForm({
      ...partnerForm,
      benefits: [
        ...partnerForm.benefits,
        { id: Date.now(), title: '', description: '', discount: '' },
      ],
    });
  };

  const removeBenefit = (id: number) => {
    setPartnerForm({
      ...partnerForm,
      benefits: partnerForm.benefits.filter((b) => b.id !== id),
    });
  };

  const updateBenefit = (id: number, field: string, value: string) => {
    setPartnerForm({
      ...partnerForm,
      benefits: partnerForm.benefits.map((b) =>
        b.id === id ? { ...b, [field]: value } : b
      ),
    });
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto min-h-screen bg-black">
        {/* Header */}
        <div className="bg-black p-4 border-b border-gray-800 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="w-10 h-10 bg-gray-900 flex items-center justify-center hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft className="text-white" size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Painel Administrativo</h1>
              <p className="text-sm text-gray-400">RARQUES ASSOCIATION</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-900 border-b border-gray-800">
          <div className="flex">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 font-bold transition-colors ${
                activeTab === 'users'
                  ? 'bg-black text-white border-b-2 border-green-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Users size={20} />
              <span>Usuários ({users.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('partners')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 font-bold transition-colors ${
                activeTab === 'partners'
                  ? 'bg-black text-white border-b-2 border-green-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Store size={20} />
              <span>Parceiros ({partners.length})</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-lg font-bold text-white">Gerenciar Usuários</h2>
                <button
                  onClick={openCreateUserModal}
                  className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 font-bold hover:bg-green-600 transition-colors"
                >
                  <Plus size={20} />
                  ADICIONAR USUÁRIO
                </button>
              </div>

              {loading ? (
                <p className="text-gray-400">Carregando...</p>
              ) : users.length === 0 ? (
                <p className="text-gray-400">Nenhum usuário encontrado</p>
              ) : (
                <div className="space-y-3">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="bg-gray-900 border border-gray-800 p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-800 flex items-center justify-center overflow-hidden">
                          {user.photo ? (
                            <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <Users className="text-gray-600" size={24} />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white">{user.name}</p>
                          <p className="text-sm text-gray-400">{user.email}</p>
                          <p className="text-xs text-gray-500">
                            Criado em: {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditUserModal(user)}
                          className="w-10 h-10 bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
                        >
                          <Edit2 className="text-white" size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="w-10 h-10 bg-red-900 flex items-center justify-center hover:bg-red-800 transition-colors"
                        >
                          <Trash2 className="text-white" size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Partners Tab */}
          {activeTab === 'partners' && (
            <div>
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-lg font-bold text-white">Gerenciar Parceiros</h2>
                <button
                  onClick={openCreatePartnerModal}
                  className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 font-bold hover:bg-green-600 transition-colors"
                >
                  <Plus size={20} />
                  ADICIONAR PARCEIRO
                </button>
              </div>

              {loading ? (
                <p className="text-gray-400">Carregando...</p>
              ) : partners.length === 0 ? (
                <p className="text-gray-400">Nenhum parceiro encontrado</p>
              ) : (
                <div className="space-y-3">
                  {partners.map((partner) => (
                    <div
                      key={partner.id}
                      className="bg-gray-900 border border-gray-800 p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-bold text-white text-lg">{partner.name}</p>
                          <p className="text-sm text-gray-400">{partner.category}</p>
                          <div className="flex gap-4 mt-2 text-sm text-gray-500">
                            <span>Desconto: {partner.discount}</span>
                            <span>Avaliação: {partner.rating} ⭐</span>
                            <span>Benefícios: {partner.benefits?.length || 0}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditPartnerModal(partner)}
                            className="w-10 h-10 bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
                          >
                            <Edit2 className="text-white" size={16} />
                          </button>
                          <button
                            onClick={() => handleDeletePartner(partner.id)}
                            className="w-10 h-10 bg-red-900 flex items-center justify-center hover:bg-red-800 transition-colors"
                          >
                            <Trash2 className="text-white" size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-black p-4 flex items-center justify-between border-b border-gray-800 sticky top-0">
              <h2 className="text-lg font-bold text-white">
                {activeTab === 'users'
                  ? editingItem
                    ? 'Editar Usuário'
                    : 'Adicionar Usuário'
                  : editingItem
                  ? 'Editar Parceiro'
                  : 'Adicionar Parceiro'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingItem(null);
                }}
                className="w-8 h-8 bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <X className="text-white" size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {activeTab === 'users' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-white mb-2">Email *</label>
                    <input
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      disabled={!!editingItem}
                      className="w-full p-3 bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                      placeholder="usuario@email.com"
                    />
                  </div>

                  {!editingItem && (
                    <div>
                      <label className="block text-sm font-bold text-white mb-2">Senha *</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={userForm.password}
                          onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                          className="w-full p-3 pr-12 bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-white mb-2">Nome *</label>
                    <input
                      type="text"
                      value={userForm.name}
                      onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                      className="w-full p-3 bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Nome do usuário"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white mb-2">URL da Foto</label>
                    <input
                      type="text"
                      value={userForm.photo}
                      onChange={(e) => setUserForm({ ...userForm, photo: e.target.value })}
                      className="w-full p-3 bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="https://..."
                    />
                  </div>

                  <button
                    onClick={editingItem ? handleUpdateUser : handleCreateUser}
                    className="w-full bg-green-500 text-white py-3 font-bold hover:bg-green-600 transition-colors"
                  >
                    {editingItem ? 'ATUALIZAR USUÁRIO' : 'CRIAR USUÁRIO'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-white mb-2">Nome do Parceiro *</label>
                    <input
                      type="text"
                      value={partnerForm.name}
                      onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })}
                      className="w-full p-3 bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Ex: Restaurante Sabor da Terra"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white mb-2">Categoria *</label>
                    <input
                      type="text"
                      value={partnerForm.category}
                      onChange={(e) => setPartnerForm({ ...partnerForm, category: e.target.value })}
                      className="w-full p-3 bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Ex: Alimentação"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-white mb-2">Desconto *</label>
                      <input
                        type="text"
                        value={partnerForm.discount}
                        onChange={(e) => setPartnerForm({ ...partnerForm, discount: e.target.value })}
                        className="w-full p-3 bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Ex: 15% OFF"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-white mb-2">Distância</label>
                      <input
                        type="text"
                        value={partnerForm.distance}
                        onChange={(e) => setPartnerForm({ ...partnerForm, distance: e.target.value })}
                        className="w-full p-3 bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Ex: 0.8 km"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white mb-2">Avaliação (0-5)</label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={partnerForm.rating}
                      onChange={(e) =>
                        setPartnerForm({ ...partnerForm, rating: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full p-3 bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white mb-2">Termos de Busca da Imagem</label>
                    <input
                      type="text"
                      value={partnerForm.image}
                      onChange={(e) => setPartnerForm({ ...partnerForm, image: e.target.value })}
                      className="w-full p-3 bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Ex: restaurant food"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Termos usados para buscar a imagem no Unsplash
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white mb-2">Imagem de Banner</label>
                    <input
                      type="text"
                      value={partnerForm.bannerImage}
                      onChange={(e) => setPartnerForm({ ...partnerForm, bannerImage: e.target.value })}
                      className="w-full p-3 bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Ex: https://..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white mb-2">Logo</label>
                    <input
                      type="text"
                      value={partnerForm.logo}
                      onChange={(e) => setPartnerForm({ ...partnerForm, logo: e.target.value })}
                      className="w-full p-3 bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Ex: https://..."
                    />
                  </div>

                  {/* Benefícios */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-bold text-white">Benefícios</label>
                      <button
                        type="button"
                        onClick={addBenefit}
                        className="flex items-center gap-1 bg-gray-800 text-white px-3 py-1 text-sm font-bold hover:bg-gray-700 transition-colors"
                      >
                        <Plus size={16} />
                        ADICIONAR
                      </button>
                    </div>

                    <div className="space-y-3">
                      {partnerForm.benefits.map((benefit, index) => (
                        <div key={benefit.id} className="bg-gray-800 border border-gray-700 p-3">
                          <div className="flex items-start justify-between mb-2">
                            <p className="text-sm font-bold text-gray-400">Benefício #{index + 1}</p>
                            <button
                              type="button"
                              onClick={() => removeBenefit(benefit.id)}
                              className="text-red-500 hover:text-red-400"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={benefit.title}
                              onChange={(e) => updateBenefit(benefit.id, 'title', e.target.value)}
                              placeholder="Título"
                              className="w-full p-2 bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            <input
                              type="text"
                              value={benefit.description}
                              onChange={(e) => updateBenefit(benefit.id, 'description', e.target.value)}
                              placeholder="Descrição"
                              className="w-full p-2 bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            <input
                              type="text"
                              value={benefit.discount}
                              onChange={(e) => updateBenefit(benefit.id, 'discount', e.target.value)}
                              placeholder="Desconto (ex: 15% OFF)"
                              className="w-full p-2 bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={editingItem ? handleUpdatePartner : handleCreatePartner}
                    className="w-full bg-green-500 text-white py-3 font-bold hover:bg-green-600 transition-colors"
                  >
                    {editingItem ? 'ATUALIZAR PARCEIRO' : 'CRIAR PARCEIRO'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}