import { useParams, Link } from "wouter";
import { useBookMeta, useBookContent } from "@/hooks/use-books";
import { Layout } from "@/components/layout/layout";
import { SEO } from "@/components/seo";
import { CoverGenerator } from "@/components/CoverGenerator";
import { Clock, Share2, Bookmark, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

export default function BookPage() {
  const params = useParams();
  const slug = params.slug || "";
  const { data: book, isLoading: metaLoading } = useBookMeta(slug);
  const { data: content, isLoading: contentLoading } = useBookContent(slug);
  const [bookmarked, setBookmarked] = useState(false);
  const [readProgress, setReadProgress] = useState(0);

  useEffect(() => {
    if (!slug) return;
    const saved = localStorage.getItem(`bookmark_${slug}`);
    setBookmarked(saved === "true");
    const progress = localStorage.getItem(`progress_${slug}`);
    if (progress) setReadProgress(Number(progress));
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (h <= 0) return;
      const pct = Math.round((window.scrollY / h) * 100);
      setReadProgress(pct);
      localStorage.setItem(`progress_${slug}`, String(pct));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [slug]);

  const toggleBookmark = () => {
    const next = !bookmarked;
    setBookmarked(next);
    localStorage.setItem(`bookmark_${slug}`, String(next));
  };

  const handleShare = () => {
    if (navigator.share && book) {
      navigator.share({ title: book.title, url: window.location.href });
    } else {
      navigator.clipboard?.writeText(window.location.href);
    }
  };

  if (metaLoading || contentLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  if (!book) {
    return <Layout><div className="p-8 text-center text-muted-foreground">Book not found.</div></Layout>;
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "Book",
    "name": book.title,
    "author": { "@type": "Person", "name": book.author },
    "description": book.description,
    "inLanguage": book.language,
    "genre": book.category,
    "url": `https://readhubs.github.io/book/${book.slug}`,
  };

  return (
    <Layout>
      <SEO
        title={`${book.title} — Read Free on ReadHubs`}
        description={book.description}
        schema={schema}
      />

      {/* Reading progress bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-amber-500 z-[60] transition-all duration-150"
        style={{ width: `${readProgress}%` }}
      />

      {/* Series banner */}
      {book.series && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800">
          <div className="container mx-auto px-4 py-2 flex items-center justify-between text-sm">
            <span className="text-amber-800 dark:text-amber-300 font-medium">
              Part {book.seriesOrder} of <Link href={`/series/${book.seriesSlug}`} className="underline hover:no-underline">{book.series}</Link>
            </span>
            {book.seriesOrder && book.seriesTotal && (
              <div className="flex items-center gap-2">
                <div className="w-32 h-1.5 bg-amber-200 dark:bg-amber-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${(book.seriesOrder / book.seriesTotal) * 100}%` }}
                  />
                </div>
                <span className="text-amber-700 dark:text-amber-400 text-xs">
                  {book.seriesOrder}/{book.seriesTotal}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="bg-slate-50 dark:bg-slate-900 border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-[200px] shrink-0">
              <div className="aspect-[2/3] w-full max-w-[200px] mx-auto md:mx-0 rounded-lg shadow-lg overflow-hidden">
                <CoverGenerator title={book.title} category={book.category} size="full" />
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <Link href={`/category/${book.category.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and')}`}>
                  <Badge variant="secondary" className="text-xs uppercase tracking-wider hover:bg-primary/10 cursor-pointer">
                    {book.category}
                  </Badge>
                </Link>
                {book.language === 'es' && (
                  <Badge variant="outline" className="text-xs">🇪🇸 Español</Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-5xl font-bold font-serif text-slate-900 dark:text-white mb-3 leading-tight">
                {book.title}
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-4">By {book.author}</p>

              <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{Math.round(book.readTime / 60)}h read</span>
                {book.articleCount && (
                  <span className="flex items-center gap-1.5">
                    <ChevronRight className="w-4 h-4" />{book.articleCount} articles
                  </span>
                )}
              </div>

              <p className="text-base leading-relaxed mb-8 max-w-2xl text-slate-700 dark:text-slate-300">
                {book.description}
              </p>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={toggleBookmark}
                  className={`gap-2 ${bookmarked ? 'bg-amber-600 hover:bg-amber-700' : 'bg-amber-500 hover:bg-amber-600'} text-white`}
                >
                  <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-white' : ''}`} />
                  {bookmarked ? 'Bookmarked' : 'Bookmark'}
                </Button>
                <Button variant="outline" className="gap-2" onClick={handleShare}>
                  <Share2 className="w-4 h-4" /> Share
                </Button>
                {book.series && (
                  <Link href={`/series/${book.seriesSlug}`}>
                    <Button variant="outline" className="gap-2">
                      View Full Series <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Book articles list */}
      {book.articles && book.articles.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border-b border-amber-100 dark:border-amber-900">
          <div className="container mx-auto px-4 py-6">
            <h2 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Related Articles</h2>
            <div className="flex flex-wrap gap-2">
              {book.articles.slice(0, 6).map(a => (
                <Link key={a.id} href={`/blog/${book.slug}/${a.id}`}>
                  <Button variant="outline" size="sm" className="text-xs border-amber-200 hover:border-amber-400 hover:bg-amber-50">
                    {a.title}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {content ? (
          <div
            className="prose prose-slate dark:prose-invert max-w-none prose-lg md:prose-xl font-serif prose-headings:font-sans"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg mb-2">Book content will appear here after processing.</p>
            <p className="text-sm">Upload the DOCX to <code className="bg-muted px-1 py-0.5 rounded">books-source/</code> and push to main.</p>
          </div>
        )}
      </div>

      {/* ADSTERRA_IN_CONTENT_1 */}
      <div id="adsterra-content-1" className="adsterra-in-content my-8 flex justify-center">
        <div className="w-full max-w-[728px] h-[90px] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-sm border border-slate-200 dark:border-slate-700">
          Advertisement
        </div>
      </div>

      {/* Next book in series CTA */}
      {book.series && book.seriesOrder && book.seriesTotal && book.seriesOrder < book.seriesTotal && (
        <div className="bg-slate-50 dark:bg-slate-900 border-t py-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground mb-4">You've reached the end of Book {book.seriesOrder}.</p>
            <Link href={`/series/${book.seriesSlug}`}>
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white gap-2 text-lg h-14 px-8">
                Continue to Book {book.seriesOrder + 1} <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </Layout>
  );
}
