
import { Champion } from '../types';

export const isChampion = (obj: any): obj is Champion => {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.key === 'string' &&
    typeof obj.name === 'string' &&
    obj.image &&
    typeof obj.image.full === 'string'
  );
};
