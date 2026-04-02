import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Pencil, Trash2, Sparkles, Eye, BarChart3, Package, Upload, X, Image, Box } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { categories, Product } from '@/data/mockData';
import { useProducts } from '@/context/ProductContext';
import { toast } from 'sonner';

interface NewProduct {
  name: string;
  description: string;
  price: string;
  category: string;
  image: string;
  arEnabled: boolean;
  ingredients: string;
}

const emptyProduct: NewProduct = {
  name: '',
  description: '',
  price: '',
  category: 'starters',
  image: '',
  arEnabled: false,
  ingredients: '',
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { products: productList, setProducts: setProductList, addProduct, updateProduct, deleteProduct } = useProducts();
  const [activeTab, setActiveTab] = useState<'products' | 'analytics'>('products');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<NewProduct>(emptyProduct);
  const [glbFile, setGlbFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const glbInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const totalViews = productList.reduce((sum, p) => sum + p.views, 0);
  const arProducts = productList.filter((p) => p.arEnabled).length;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setForm(prev => ({ ...prev, image: url }));
    }
  };

  const handleGlbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.glb') && !file.name.toLowerCase().endsWith('.gltf')) {
        toast.error('Formato inválido. Use arquivos .GLB ou .GLTF');
        return;
      }
      setGlbFile(file);
      setForm(prev => ({ ...prev, arEnabled: true }));
      toast.success(`Modelo 3D carregado: ${file.name}`);
    }
  };

  const handleEdit = (product: Product) => {
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      category: product.category,
      image: product.image,
      arEnabled: product.arEnabled,
      ingredients: product.ingredients?.join(', ') || '',
    });
    setImagePreview(product.image);
    setEditingId(product.id);
    setGlbFile(null);
    setImageFile(null);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast.error('Nome do produto é obrigatório');
      return;
    }
    if (!form.price || isNaN(Number(form.price))) {
      toast.error('Preço inválido');
      return;
    }

    if (editingId) {
      updateProduct(editingId, {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        category: form.category,
        image: form.image || undefined,
        arEnabled: form.arEnabled,
        model3dUrl: glbFile ? URL.createObjectURL(glbFile) : undefined,
        ingredients: form.ingredients.split(',').map(i => i.trim()).filter(Boolean),
      });
      toast.success('Produto atualizado com sucesso!');
    } else {
      const newProduct: Product = {
        id: String(Date.now()),
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        category: form.category,
        image: form.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',
        arEnabled: form.arEnabled,
        model3dUrl: glbFile ? URL.createObjectURL(glbFile) : undefined,
        ingredients: form.ingredients.split(',').map(i => i.trim()).filter(Boolean),
        views: 0,
      };
      addProduct(newProduct);
      toast.success('Produto adicionado com sucesso!');
    }

    setShowForm(false);
    setEditingId(null);
    setForm(emptyProduct);
    setGlbFile(null);
    setImageFile(null);
    setImagePreview('');
  };

  const handleDelete = (id: string) => {
    setProductList(prev => prev.filter(p => p.id !== id));
    toast.success('Produto removido');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 pb-8">
        {/* Header */}
        <div className="flex items-center gap-4 py-4">
          <button
            onClick={() => navigate('/')}
            className="p-2.5 glass rounded-xl hover:bg-surface-hover transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-display font-bold text-foreground">Painel Admin</h1>
            <p className="text-xs text-muted-foreground">Gerencie seu cardápio</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-2">
          {[
            { label: 'Produtos', value: productList.length, icon: Package },
            { label: 'Visualizações', value: totalViews, icon: Eye },
            { label: 'Com AR', value: arProducts, icon: Sparkles },
          ].map(({ label, value, icon: Icon }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-4 text-center"
            >
              <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-6">
          {(['products', 'analytics'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'products' ? 'Produtos' : 'Analytics'}
            </button>
          ))}
        </div>

        {/* Product List */}
        {activeTab === 'products' && (
          <div className="mt-4 space-y-3">
            <button
              onClick={() => { setEditingId(null); setForm(emptyProduct); setImagePreview(''); setShowForm(true); }}
              className="w-full py-3 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-primary/50 hover:text-primary transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Adicionar Produto
            </button>

            {/* Add Product Form */}
            <AnimatePresence>
              {showForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="glass rounded-xl p-5 space-y-4 border border-primary/20">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-semibold text-foreground">{editingId ? 'Editar Produto' : 'Novo Produto'}</h3>
                      <button onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyProduct); setImagePreview(''); }} className="p-1.5 rounded-lg hover:bg-surface-hover transition-colors">
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>

                    {/* Name */}
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Nome *</label>
                      <input
                        value={form.name}
                        onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ex: Filé Mignon ao Molho"
                        className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Descrição</label>
                      <textarea
                        value={form.description}
                        onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descreva o prato..."
                        rows={2}
                        className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors resize-none"
                      />
                    </div>

                    {/* Price + Category */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Preço (R$) *</label>
                        <input
                          type="number"
                          step="0.01"
                          value={form.price}
                          onChange={e => setForm(prev => ({ ...prev, price: e.target.value }))}
                          placeholder="0.00"
                          className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Categoria</label>
                        <select
                          value={form.category}
                          onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:border-primary focus:outline-none transition-colors"
                        >
                          {categories.filter(c => c.id !== 'all').map(c => (
                            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Ingredients */}
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Ingredientes (separados por vírgula)</label>
                      <input
                        value={form.ingredients}
                        onChange={e => setForm(prev => ({ ...prev, ingredients: e.target.value }))}
                        placeholder="Carne, Batata, Molho..."
                        className="w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>

                    {/* Image Upload */}
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Imagem do Produto</label>
                      <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      <button
                        onClick={() => imageInputRef.current?.click()}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-lg bg-secondary border border-border hover:border-primary/50 transition-colors"
                      >
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                            <Image className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {imageFile ? imageFile.name : 'Clique para enviar imagem'}
                        </span>
                      </button>
                    </div>

                    {/* GLB Upload */}
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Modelo 3D (.GLB)</label>
                      <input ref={glbInputRef} type="file" accept=".glb,.gltf" onChange={handleGlbChange} className="hidden" />
                      <button
                        onClick={() => glbInputRef.current?.click()}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-lg bg-secondary border border-border hover:border-primary/50 transition-colors"
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${glbFile ? 'bg-primary/20' : 'bg-muted'}`}>
                          <Box className={`w-5 h-5 ${glbFile ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="text-left">
                          <span className="text-sm text-muted-foreground block">
                            {glbFile ? glbFile.name : 'Clique para enviar modelo .GLB'}
                          </span>
                          {glbFile && (
                            <span className="text-xs text-primary">AR será habilitado automaticamente</span>
                          )}
                        </div>
                        {glbFile && (
                          <Sparkles className="w-4 h-4 text-primary ml-auto" />
                        )}
                      </button>
                    </div>

                    {/* Submit */}
                    <button
                      onClick={handleSubmit}
                      className="w-full py-3 rounded-xl gold-gradient text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
                    >
                      {editingId ? 'Atualizar Produto' : 'Salvar Produto'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {productList.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-4 p-3 rounded-xl bg-card border border-border hover:border-primary/20 transition-all"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-foreground truncate">
                        {product.name}
                      </h3>
                      {product.arEnabled && (
                        <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {categories.find((c) => c.id === product.category)?.name} · {product.views} views
                    </p>
                    <p className="text-sm font-bold gold-text mt-0.5">
                      R$ {product.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => handleEdit(product)} className="p-2 glass rounded-lg hover:bg-surface-hover transition-colors">
                      <Pencil className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 glass rounded-lg hover:bg-destructive/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Analytics */}
        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 space-y-3"
          >
            <div className="glass rounded-xl p-6">
              <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Top Pratos
              </h3>
              <div className="space-y-3">
                {[...productList]
                  .sort((a, b) => b.views - a.views)
                  .slice(0, 5)
                  .map((p, i) => (
                    <div key={p.id} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-primary w-5">#{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-foreground">{p.name}</span>
                          <span className="text-xs text-muted-foreground">{p.views}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(p.views / (productList[0]?.views || 1)) * 100}%` }}
                            transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                            className="h-full rounded-full gold-gradient"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
