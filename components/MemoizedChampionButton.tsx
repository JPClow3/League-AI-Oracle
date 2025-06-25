
import React from 'react';
import { DDragonChampionInfo, ChampionStaticInfo } from '../types';
import { getChampionImageURL } from '../services/ddragonService';
import { LoadingSpinner } from './LoadingSpinner';
import { BanIcon } from './icons/index';
import { MetaTierBadge } from './MetaTierBadge';

interface MemoizedChampionButtonProps {
  champion: DDragonChampionInfo;
  ddragonVersion: string;
  isDisabled: boolean;
  isImageLoading?: boolean;
  details?: { primaryRole?: string; metaTier?: ChampionStaticInfo['metaTier'] };
  onSelect?: (champion: DDragonChampionInfo) => void;
  onDragStart?: (event: React.DragEvent<HTMLButtonElement>, champion: DDragonChampionInfo) => void;
  onImageLoad?: (championId: string) => void;
  onImageError?: (championId: string) => void;
  className?: string;
  imageClassName?: string;
  textClassName?: string;
  title?: string;
}

const ChampionButtonComponent: React.FC<MemoizedChampionButtonProps> = ({
  champion,
  ddragonVersion,
  isDisabled,
  isImageLoading,
  details,
  onSelect,
  onDragStart,
  onImageLoad,
  onImageError,
  className = '',
  imageClassName = '',
  textClassName = '',
  title,
}) => {
  const handleImageLoad = () => {
    if (onImageLoad) onImageLoad(champion.id);
  };
  const handleImageError = () => {
    if (onImageError) onImageError(champion.id);
  };

  const handleClick = () => {
    if (onSelect && !isDisabled) {
      onSelect(champion);
    }
  };

  const handleDragStartInternal = (event: React.DragEvent<HTMLButtonElement>) => {
    if (onDragStart && !isDisabled) {
      onDragStart(event, champion);
    }
  };

  return (
    <button
      key={champion.id}
      onClick={handleClick}
      draggable={!!onDragStart && !isDisabled}
      onDragStart={handleDragStartInternal}
      disabled={isDisabled}
      className={`relative aspect-square rounded-xl overflow-hidden transition-all duration-200 ease-in-out group focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800
        ${isDisabled ? 'opacity-30 cursor-not-allowed filter grayscale' : 
                      (onDragStart ? 'hover:scale-105 hover:shadow-lg champion-card bg-slate-700 cursor-grab active:cursor-grabbing' : 
                                     'hover:scale-105 hover:shadow-lg champion-card bg-slate-700 cursor-pointer')}
        ${className}
      `}
      aria-label={title || champion.name + (isDisabled ? ' (disabled)' : '')}
      title={title || champion.name}
    >
      {isImageLoading && !isDisabled && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-700">
          <LoadingSpinner />
        </div>
      )}
      <img
        src={getChampionImageURL(ddragonVersion, champion.id)}
        alt={champion.name}
        className={`w-full h-full object-cover transition-opacity duration-300 ${isImageLoading && !isDisabled ? 'opacity-0' : 'opacity-100'} ${imageClassName}`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy" // Added lazy loading
      />
      {isDisabled && (
        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
          <BanIcon className="w-1/2 h-1/2 text-red-500 opacity-75" />
        </div>
      )}
      {details?.metaTier && !isDisabled && (
        <MetaTierBadge tier={details.metaTier} className="absolute top-0.5 right-0.5 text-[9px] px-1 py-0 leading-none" /> /* Adjusted size */
      )}
      <div className={`absolute bottom-0 left-0 right-0 p-1 bg-gradient-to-t from-black/90 to-transparent transition-opacity duration-200
                      ${isDisabled ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus:opacity-100'}`}>
        <p className={`text-white text-[10px] sm:text-[11px] font-semibold text-center truncate ${isDisabled ? 'text-slate-400 line-through' : ''} ${textClassName}`}>{champion.name}</p> {/* Increased font size */}
      </div>
    </button>
  );
};

export const MemoizedChampionButton = React.memo(ChampionButtonComponent);