import { Layout } from "@/components/layout/layout";
import { SEO } from "@/components/seo";
import { useBooks } from "@/hooks/use-books";
import { Link } from "wouter";

export default function Blog() {
  const { data: books = [], isLoading } = useBooks();

  // Aggregate all articles from all books that have them
  // Since we only have book index data here, we'd ideally load a blog index.
  // For static simulation, we will assume books have articleCount and we just list some placeholders if needed.

  return (
    <Layout>
      <SEO title="Blog - ReadHubs" description="Read articles, book summaries, and reading guides." />
      
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <h1 className="text-4xl font-bold font-serif mb-8">ReadHubs Blog</h1>
        
        {/* ADSTERRA_BETWEEN_ARTICLES */}
        <div id="adsterra-between" className="adsterra-banner my-8 flex justify-center">
          <div className="w-full max-w-[728px] h-[90px] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-sm border border-slate-200 dark:border-slate-700">
            Advertisement
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {isLoading ? (
            <p>Loading articles...</p>
          ) : (
            <Link href="/blog/atomic-habits/top-10-lessons">
              <div className="group cursor-pointer">
                <div className="aspect-[16/9] bg-amber-100 dark:bg-amber-900/30 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                  <span className="text-6xl group-hover:scale-110 transition-transform duration-300">📝</span>
                </div>
                <div className="text-sm text-primary font-medium mb-2">Habits & Discipline</div>
                <h2 className="text-2xl font-bold font-serif group-hover:text-primary transition-colors">Top 10 Lessons from Atomic Habits</h2>
                <p className="text-muted-foreground mt-2 line-clamp-2">Discover the key takeaways from James Clear's groundbreaking book on building good habits.</p>
              </div>
            </Link>
          )}
        </div>
      </div>
    </Layout>
  );
}
