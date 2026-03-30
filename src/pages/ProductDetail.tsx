import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Eye, Share2 } from 'lucide-react';
import { products } from '@/data/mockData';
import { useState } from 'react';
import ProductViewer3D from '@/components/ar/ProductViewer3D';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showAR, setShowAR] = useState(false);

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Produto não encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 glass rounded-xl hover:bg-surface-hover transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <button className="p-2.5 glass rounded-xl hover:bg-surface-hover transition-colors">
            <Share2 className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Image or 3D Viewer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="px-4"
        >
          {showAR ? (
            <ProductViewer3D product={product} />
          ) : (
            <div className="relative aspect-square rounded-2xl overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
            </div>
          )}
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="px-4 mt-6 pb-8 space-y-4"
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">{product.name}</h1>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-2xl font-bold gold-text">
                  R$ {product.price.toFixed(2)}
                </span>
                <span className="flex items-center gap-1 text-muted-foreground text-sm">
                  <Eye className="w-4 h-4" /> {product.views}
                </span>
              </div>
            </div>
          </div>

          <p className="text-muted-foreground leading-relaxed">{product.description}</p>

          {/* Ingredients */}
          {product.ingredients && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Ingredientes</h3>
              <div className="flex flex-wrap gap-2">
                {product.ingredients.map((ing) => (
                  <span
                    key={ing}
                    className="glass px-3 py-1.5 rounded-full text-xs text-secondary-foreground"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AR Button */}
          {product.arEnabled && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowAR(!showAR)}
              className={`w-full py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                showAR
                  ? 'bg-secondary text-secondary-foreground'
                  : 'gold-gradient text-primary-foreground gold-glow'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              {showAR ? 'Ver Foto' : 'Ver em 3D / AR'}
            </motion.button>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetail;
