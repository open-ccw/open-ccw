import type { SearchTypes } from './searchTypes';

export function parseType(type: string): SearchTypes {
  const types: SearchTypes[] = ['all', 'creation', 'hashtag', 'post', 'students'];
  if (!types.includes(type as SearchTypes)) {
    return 'all';
  }
  return type as SearchTypes;
}
