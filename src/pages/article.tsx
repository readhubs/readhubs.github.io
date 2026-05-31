import { useParams, Link } from "wouter";
import { Layout } from "@/components/layout/layout";
import { SEO } from "@/components/seo";
import { useArticle } from "@/hooks/use-books";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight } from "lucide-react";

export default function ArticlePage() {
  const params = useParams();
  const bookSlug = params.bookSlug || "";
  const articleId = params.articleId || "";
  const { data: article, isLoading, error } = useArticle(bookSlug, articleId);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (h <= 0) return;
      setProgress((window.scrollY / h) * 100);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  if (error || !article) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">
          <p className="text-lg mb-4">Article not found.</p>
          <Link href={`/book/${bookSlug}`}>
            <Button className="bg-amber-500 hover:bg-amber-600 text-white">Back to Book</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const ctaButton = (
    <div className="my-8 not-prose">
      <Link href={`/book/${bookSlug}`}>
        <Button size="lg" className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white gap-2 font-bold text-base h-12">
          Read {article.bookTitle || "the Book"} Free <ArrowRight className="w-5 h-5" />
        </Button>
      </Link>
    </div>
  );

  return (
    <Layout>
      <SEO
        title={article.metaTitle || `${article.title} | ReadHubs`}
        description={article.metaDescription || `Read this article about ${article.bookTitle} on ReadHubs.`}
        schema={article.schema}
      />

      <div
        className="fixed top-0 left-0 h-1 bg-amber-500 z-[60] transition-all duration-150"
        style={{ width: `${progress}%` }}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center text-sm text-muted-foreground mb-8">
          <Link href="/blog" className="hover:text-primary">Blog</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <Link href={`/book/${bookSlug}`} className="hover:text-primary">{article.bookTitle}</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-foreground line-clamp-1 max-w-[200px]">{article.title}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1 max-w-3xl">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-4">{article.category}</div>
            <h1 className="text-3xl md:text-5xl font-bold font-serif mb-6 leading-tight">{article.title}</h1>
            <div className="flex items-center gap-4 text-muted-foreground text-sm mb-10 pb-8 border-b">
              <span>By ReadHubs Editorial</span>
              <span>•</span>
              <span>5 min read</span>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none font-serif">
              {ctaButton}

              {article.content ? (
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
              ) : (
                <p>Content will appear here after books are processed from <code>books-source/</code>.</p>
              )}

              {/* ADSTERRA_IN_CONTENT_1 */}
              <div id="adsterra-content-1" className="adsterra-in-content my-8 flex justify-center not-prose">
                <div className="w-full max-w-[728px] h-[90px] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-sm border border-slate-200 dark:border-slate-700">
                  Advertisement
                </div>
              </div>

              {ctaButton}
            </div>
          </div>

          <aside className="w-full lg:w-72 shrink-0">
            {/* MONETAG_SIDEBAR */}
            <div id="monetag-sidebar" className="monetag-sidebar hidden lg:block sticky top-24 mb-8">
              <div className="w-[160px] h-[600px] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-sm border border-slate-200 dark:border-slate-700 mx-auto">
                Sidebar Ad
              </div>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
}
