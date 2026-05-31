import { useParams, Link } from "wouter";
import { useSeriesMeta, useBooks } from "@/hooks/use-books";
import { Layout } from "@/components/layout/layout";
import { SEO } from "@/components/seo";
import { CoverGenerator } from "@/components/CoverGenerator";
import { BookCard } from "@/components/ui/book-card";
import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function SeriesPage() {
  const params = useParams();
  const slug = params.slug || "";
  const { data: series, isLoading } = useSeriesMeta(slug);
  const { data: allBooks = [] } = useBooks();
  const [booksRead, setBooksRead] = useState<string[]>([]);

  useEffect(() => {
    if (!series) return;
    const read = series.bookSlugs.filter(s => {
      const progress = localStorage.getItem(`progress_${s}`);
      return progress && Number(progress) > 80;
    });
    setBooksRead(read);
  }, [series]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  if (!series) {
    return <Layout><div className="p-8 text-center text-muted-foreground">Series not found.</div></Layout>;
  }

  const seriesBooks = series.bookSlugs
    .map((s, i) => allBooks.find(b => b.slug === s) ?? null)
    .filter(Boolean) as (typeof allBooks)[number][];

  const schema = {
    "@context": "https://schema.org",
    "@type": "BookSeries",
    "name": series.name,
    "numberOfItems": series.totalBooks,
    "url": `https://readhubs.github.io/series/${series.slug}`,
    "hasPart": seriesBooks.map((b, i) => ({
      "@type": "Book",
      "position": i + 1,
      "name": b.title,
      "url": `https://readhubs.github.io/book/${b.slug}`,
    })),
  };

  const completionPct = series.totalBooks > 0 ? Math.round((booksRead.length / series.totalBooks) * 100) : 0;

  return (
    <Layout>
      <SEO
        title={`${series.name} — Complete Series Free | ReadHubs`}
        description={`Read the complete ${series.name} series free on ReadHubs. All ${series.totalBooks} books available.`}
        schema={schema}
      />

      {/* Hero */}
      <div className="bg-slate-50 dark:bg-slate-900 border-b py-10">
        <div className="container mx-auto px-4">
          <Link href="/series" className="text-sm text-muted-foreground hover:text-primary mb-6 inline-block">← All Series</Link>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-[160px] shrink-0">
              <div className="aspect-[2/3] rounded-lg overflow-hidden shadow-lg max-w-[160px]">
                <CoverGenerator
                  title={series.name}
                  category={seriesBooks[0]?.category ?? series.category}
                  size="full"
                />
              </div>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-5xl font-bold font-serif mb-3">{series.name}</h1>
              <p className="text-xl text-muted-foreground mb-6">
                Complete Series — All {series.totalBooks} Books Free
              </p>

              {booksRead.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm text-muted-foreground mb-2">
                    You have read {booksRead.length} of {series.totalBooks} books in this series
                  </p>
                  <div className="w-full max-w-xs h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{ width: `${completionPct}%` }}
                    />
                  </div>
                </div>
              )}

              {seriesBooks.length > 0 && (
                <Link href={`/book/${seriesBooks[booksRead.length] ? seriesBooks[booksRead.length].slug : seriesBooks[0].slug}`}>
                  <Button className="bg-amber-500 hover:bg-amber-600 text-white gap-2">
                    {booksRead.length > 0 ? `Continue — Book ${booksRead.length + 1}` : 'Start Reading — Book 1'}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Books grid */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold font-serif mb-8">All Books in This Series</h2>
        {seriesBooks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="w-10 h-10 mx-auto mb-4 opacity-30" />
            <p>Books will appear here after processing.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {seriesBooks.map((book, i) => (
              <div key={book.slug} className="relative">
                <div className="absolute -top-3 -left-1 z-10 bg-slate-800 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {i + 1}
                </div>
                {booksRead.includes(book.slug) && (
                  <div className="absolute -top-3 -right-1 z-10 bg-green-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    ✓
                  </div>
                )}
                <BookCard book={book} />
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
