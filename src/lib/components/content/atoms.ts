import { atom } from 'jotai';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';

export interface MDXContent {
  mdxSource: MDXRemoteSerializeResult;
  frontmatter: {
    title?: string;
    description?: string;
    [key: string]: any;
  };
}

export const mdxContentCacheAtom = atom<Record<string, MDXContent>>({});
export const mdxLoadingStatesAtom = atom<Record<string, boolean>>({});
export const mdxErrorStatesAtom = atom<Record<string, Error | null>>({});

export const getMDXContentAtom = atom(
  null,
  async (get, set, filename: string) => {
    const cache = get(mdxContentCacheAtom);
    const loadingStates = get(mdxLoadingStatesAtom);
    
    if (cache[filename]) {
      return cache[filename];
    }
    
    set(mdxLoadingStatesAtom, { ...loadingStates, [filename]: true });
    set(mdxErrorStatesAtom, prev => ({ ...prev, [filename]: null }));
    
    try {
      const response = await fetch(`/api/mdx/${filename}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch MDX content: ${response.statusText}`);
      }
      
      const data: MDXContent = await response.json();
      
      set(mdxContentCacheAtom, prev => ({ ...prev, [filename]: data }));
      
      return data;
    } catch (error) {
      set(mdxErrorStatesAtom, prev => ({ 
        ...prev, 
        [filename]: error instanceof Error ? error : new Error('Unknown error') 
      }));
      throw error;
    } finally {
      set(mdxLoadingStatesAtom, prev => ({ ...prev, [filename]: false }));
    }
  }
);

export const prefetchMDXContentAtom = atom(
  null,
  async (get, set, filenames: string[]) => {
    const cache = get(mdxContentCacheAtom);
    const uncachedFiles = filenames.filter(filename => !cache[filename]);
    
    if (uncachedFiles.length === 0) {
      return;
    }
    
    await Promise.allSettled(
      uncachedFiles.map(filename => set(getMDXContentAtom, filename))
    );
  }
);

export const clearMDXCacheAtom = atom(
  null,
  (get, set) => {
    set(mdxContentCacheAtom, {});
    set(mdxLoadingStatesAtom, {});
    set(mdxErrorStatesAtom, {});
  }
);