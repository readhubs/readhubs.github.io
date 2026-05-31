import { Link } from "wouter";
import { useSeriesList, useBooks } from "@/hooks/use-books";
import { Layout } from "@/components/layout/layout";
import { SEO } from "@/components/seo";
import { CoverGenerator } from "@/components/CoverGenerator";
import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SeriesIndex() {
  const { data: seriesList = [], isLoading } = useSeriesList();
  const { data: books = [] } = useBooks();

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Book Series - Complete Collections | ReadHubs",
    "description": "Browse complete book series available for free on ReadHubs.",
    "url": "https://readhubs.github.io/series",
  };

  const getFirstBook = (seriesMeta: { bookSlugs: string[]; category: string }) => {
    const firstSlug = seriesMeta.bookSlugs[0];
    return books.find(b => b.slug === firstSlug);
  };

  return (
    <Layout>
      <SEO
        title="Book Series - Complete Collections | ReadHubs"
        description="Browse complete book series available for free on ReadHubs. Read entire collections from start to finish."
        schema={schema}
      />

      <div className="container mx-auto px-4 py-10">
        <div className="mb-10">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary mb-4 inline-block">← Back to Home</Link>
          <h1 className="text-3xl md:text-4xl font-bold font-serif mb-2">Book Series</h1>
          <p className="text-muted-foreground">Complete collections — read every book free, in order.</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-slate-200 dark:bg-slate-800 aspect-[2/3] rounded-lg mb-4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-2" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : seriesList.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg mb-2">No series yet.</p>
            <p className="text-sm">Upload DOCX files into subfolders of <code className="bg-muted px-1 py-0.5 rounded">books-source/</code> to create a series.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {seriesList.map(series => {
              const firstBook = getFirstBook(series);
              return (
                <Link key={series.slug} href={`/series/${series.slug}`} className="group block">
                  <div className="bg-white dark:bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                    <div className="aspect-[2/3] relative overflow-hidden">
                      <CoverGenerator
                        title={series.name}
                        category={firstBook?.category ?? series.category}
                        size="card"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                        <span className="text-white text-xs font-medium">
                          Complete Series · {series.totalBooks} Books Free
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h2 className="font-serif font-bold text-base leading-tight mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {series.name}
                      </h2>
                      <Button size="sm" className="w-full bg-amber-500 hover:bg-amber-600 text-white gap-1 text-xs">
                        Start Reading <ArrowRight className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
