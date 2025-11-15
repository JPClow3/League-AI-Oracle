import React, { useState, useEffect, useRef } from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
  priority?: boolean; // For above-the-fold images
  onLoad?: () => void;
  onError?: () => void;
  blurPlaceholder?: string; // Base64 encoded blur placeholder
}

/**
 * Optimized Image Component
 *
 * Features:
 * - Lazy loading by default
 * - WebP/AVIF support with fallback
 * - Intersection Observer
 * - Progressive loading with blur placeholder
 * - Error handling
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  fallback,
  priority = false,
  className = '',
  onLoad,
  onError,
  blurPlaceholder,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(priority ? src : null);
  const [isLoading, setIsLoading] = useState(true);
  const [_hasError, setHasError] = useState(false);
  const [showBlur, setShowBlur] = useState(!!blurPlaceholder);
  const imgRef = useRef<HTMLImageElement>(null);

  // Generate WebP/AVIF sources with fallback
  const getOptimizedSources = (originalSrc: string): { webp?: string; avif?: string; fallback: string } => {
    // For external URLs (like DDragon), we can't convert formats, so return original
    if (originalSrc.startsWith('http://') || originalSrc.startsWith('https://')) {
      return { fallback: originalSrc };
    }

    // For local images, we could generate WebP versions
    // This is a placeholder - in production, you'd use a build-time tool or CDN
    const basePath = originalSrc.replace(/\.[^.]+$/, '');
    return {
      webp: `${basePath}.webp`,
      avif: `${basePath}.avif`,
      fallback: originalSrc,
    };
  };

  useEffect(() => {
    // Skip lazy loading for priority images
    if (priority) {
      return;
    }

    // Use Intersection Observer for lazy loading
    const img = imgRef.current;
    if (!img) {
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before visible
      }
    );

    observer.observe(img);

    return () => {
      observer.disconnect();
    };
  }, [src, priority]);

  const handleLoad = () => {
    setIsLoading(false);
    setShowBlur(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    setShowBlur(false);
    if (fallback) {
      setImageSrc(fallback);
    }
    onError?.();
  };

  const sources = imageSrc ? getOptimizedSources(imageSrc) : null;

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Blur placeholder */}
      {showBlur && blurPlaceholder && (
        <img
          src={blurPlaceholder}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-110 transition-opacity duration-300"
          style={{ opacity: isLoading ? 1 : 0 }}
        />
      )}

      {/* Progressive image loading */}
      <picture>
        {sources?.avif && <source srcSet={sources.avif} type="image/avif" />}
        {sources?.webp && <source srcSet={sources.webp} type="image/webp" />}
        <img
          ref={imgRef}
          src={imageSrc || sources?.fallback || undefined}
          alt={alt}
          className={`relative ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      </picture>
    </div>
  );
};

/**
 * Champion Image Component
 * Specialized for League champion images with CDN optimization
 */
interface ChampionImageProps {
  championId: string;
  alt: string;
  size?: 'small' | 'medium' | 'large' | 'splash';
  className?: string;
  priority?: boolean;
}

export const ChampionImage: React.FC<ChampionImageProps> = ({
  championId,
  alt,
  size = 'medium',
  className,
  priority = false,
}) => {
  const sizeMap = {
    small: 'loading',
    medium: 'square',
    large: 'champion',
    splash: 'splash',
  };

  const baseUrl = 'https://ddragon.leagueoflegends.com/cdn/img/champion';
  const sizePath = sizeMap[size];
  const src = `${baseUrl}/${sizePath}/${championId}.png`;

  // Fallback to a generic image
  const fallback = '/images/champion-placeholder.png';

  return <OptimizedImage src={src} alt={alt} fallback={fallback} className={className} priority={priority} />;
};

/**
 * Hook to preload critical images
 */
export function usePreloadImages(urls: string[]) {
  useEffect(() => {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
    });
  }, [urls]);
}
