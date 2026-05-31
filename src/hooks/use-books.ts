import { useQuery } from '@tanstack/react-query';
import { Book, BookMeta, Article, SeriesMeta } from '@/lib/types';

export function useBooks() {
  return useQuery({
    queryKey: ['books'],
    queryFn: async (): Promise<Book[]> => {
      try {
        const response = await fetch('/books/index.json');
        if (!response.ok) throw new Error('Failed to fetch books');
        return await response.json();
      } catch (err) {
        console.error("Error fetching books index.", err);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useBookMeta(slug: string) {
  return useQuery({
    queryKey: ['book', slug],
    queryFn: async (): Promise<BookMeta> => {
      const response = await fetch(`/books/${slug}/meta.json`);
      if (!response.ok) throw new Error(`Failed to fetch book meta for ${slug}`);
      return await response.json();
    },
    enabled: !!slug,
  });
}

export function useBookContent(slug: string) {
  return useQuery({
    queryKey: ['book-content', slug],
    queryFn: async (): Promise<string> => {
      const response = await fetch(`/books/${slug}/content.html`);
      if (!response.ok) throw new Error(`Failed to fetch book content for ${slug}`);
      return await response.text();
    },
    enabled: !!slug,
  });
}

export function useArticle(bookSlug: string, articleId: string) {
  return useQuery({
    queryKey: ['article', bookSlug, articleId],
    queryFn: async (): Promise<Article> => {
      const response = await fetch(`/books/${bookSlug}/articles/${articleId}.json`);
      if (!response.ok) throw new Error(`Failed to fetch article ${articleId}`);
      return await response.json();
    },
    enabled: !!bookSlug && !!articleId,
  });
}

export function useSeriesList() {
  return useQuery({
    queryKey: ['series'],
    queryFn: async (): Promise<SeriesMeta[]> => {
      try {
        const response = await fetch('/series/index.json');
        if (!response.ok) return [];
        return await response.json();
      } catch {
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useSeriesMeta(slug: string) {
  return useQuery({
    queryKey: ['series', slug],
    queryFn: async (): Promise<SeriesMeta> => {
      const response = await fetch(`/series/${slug}/meta.json`);
      if (!response.ok) throw new Error(`Failed to fetch series meta for ${slug}`);
      return await response.json();
    },
    enabled: !!slug,
  });
}
