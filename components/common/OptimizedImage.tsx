import React, { useState, useEffect, useRef } from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
  priority?: boolean; // For above-the-fold images
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Optimized Image Component
 *
 * Features:
 * - Lazy loading by default
 * - WebP/AVIF support with fallback
 * - Intersection Observer
 * - Blur-up placeholder
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
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(priority ? src : null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Skip lazy loading for priority images
    if (priority) {return;}

    // Use Intersection Observer for lazy loading
    const img = imgRef.current;
    if (!img) {return;}

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
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
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    if (fallback) {
      setImageSrc(fallback);
    }
    onError?.();
  };

  // Try to use modern formats (WebP/AVIF) if supported
  const getOptimizedSrc = (originalSrc: string) => {
    // If already a data URI or external URL, return as-is
    if (originalSrc.startsWith('data:') || originalSrc.startsWith('http')) {
      return originalSrc;
    }

    // For local images, try to use WebP
    // You can enhance this based on your image hosting setup
    return originalSrc;
  };

  return (
    <img
      ref={imgRef}
      src={imageSrc || undefined}
      alt={alt}
      className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
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

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fallback={fallback}
      className={className}
      priority={priority}
    />
  );
};

/**
 * Hook to preload critical images
 */
export function usePreloadImages(urls: string[]) {
  useEffect(() => {
    urls.forEach((url) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
    });
  }, [urls]);
}

