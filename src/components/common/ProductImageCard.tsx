import React from 'react';
import { Product, UserRole } from '../../types';
import {
  getProductImageUrl,
  isProductCustomPhoto,
  DEFAULT_CATEGORY_IMAGES
} from '../../utils/productImages';

interface ProductImageCardProps {
  product: Product;
  userRole?: UserRole;
  onOpenPhotoManager?: (product: Product) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'responsive';
  showBadge?: boolean;
  showCameraButton?: boolean;
  aspectRatio?: 'square' | '4/3' | 'auto';
}

export const ProductImageCard: React.FC<ProductImageCardProps> = ({
  product,
  userRole = 'owner',
  onOpenPhotoManager,
  className = '',
  size = 'responsive',
  showBadge = true,
  showCameraButton = true,
  aspectRatio = 'square'
}) => {
  const canEdit = userRole === 'owner' || userRole === 'admin';
  const isCustom = isProductCustomPhoto(product);
  const imageUrl = getProductImageUrl(product, true);

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === '4/3'
      ? 'aspect-[4/3]'
      : '';

  const sizeClasses = {
    sm: 'w-10 h-10 rounded-lg',
    md: 'w-16 h-16 rounded-xl',
    lg: 'w-24 h-24 rounded-2xl',
    responsive: 'w-full rounded-xl'
  };

  const handleCameraClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenPhotoManager) {
      onOpenPhotoManager(product);
    }
  };

  return (
    <div
      className={`relative overflow-hidden bg-[#f0f3ff] border border-[#dee8ff] shrink-0 group ${aspectClass} ${sizeClasses[size]} ${className}`}
    >
      {/* Product Image with Fallback */}
      <img
        src={imageUrl}
        alt={product.name}
        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
        onError={(e) => {
          (e.target as HTMLImageElement).src =
            DEFAULT_CATEGORY_IMAGES[product.category] || DEFAULT_CATEGORY_IMAGES.lainnya;
        }}
      />

      {/* Default Photo / Not Custom Photo Badge (if small space allows or in catalog cards) */}
      {showBadge && !isCustom && size !== 'sm' && (
        <span
          title="Produk belum memiliki foto asli (menggunakan foto default kategori)"
          className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-[#00130a]/80 text-[#facc15] text-[9px] font-bold tracking-tight backdrop-blur-[2px] flex items-center gap-0.5 shadow-sm"
        >
          <span className="material-symbols-outlined text-[11px]">palette</span>
          <span>Default</span>
        </span>
      )}

      {/* Quick Camera Edit Button in Corner (Owners & Admins only) */}
      {showCameraButton && canEdit && onOpenPhotoManager && (
        <button
          type="button"
          onClick={handleCameraClick}
          title="Ganti Foto Produk (Upload / Kamera HP)"
          className="absolute top-1.5 right-1.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#00130a]/85 hover:bg-[#006c4a] text-white flex items-center justify-center shadow-md active:scale-90 transition-all cursor-pointer z-10 border border-white/30 hover:scale-105"
        >
          <span className="material-symbols-outlined text-[15px] sm:text-[17px] text-[#85f8c4]">
            photo_camera
          </span>
        </button>
      )}
    </div>
  );
};
