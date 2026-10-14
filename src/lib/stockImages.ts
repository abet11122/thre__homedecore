import stock from '../data/stock-images.json';
const sources: Record<string, string> = stock;
/** Fail a build rather than silently restoring a remote image dependency. */
export function localImageSource(src: string): string {
  if (!src.startsWith('photo-')) return src;
  const local = sources[src];
  if (!local) throw new Error(`Stock photo not localized: ${src}`);
  return local;
}
