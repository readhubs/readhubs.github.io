import { useBooks, useSeriesList } from "@/hooks/use-books";
import { Layout } from "@/components/layout/layout";
import { SEO } from "@/components/seo";
import { BookCard } from "@/components/ui/book-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, BookMarked, ArrowRight, Library } from "lucide-react";
import { Link, useLocation } from "wouter";
import useEmblaCarousel from "embla-carousel-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CoverGenerator } from "@/components/CoverGenerator";

const CATEGORIES = [
  "Self-Help & Productivity",
  "Health & Nutrition",
  "Finance & Money",
  "Habits & Discipline",
  "Mental Health & Anxiety",
  "Diet & Weight Loss",
  "Language Learning",
  "Mindfulness & Meditation",
];

type LangFilter = "all" | "en" | "es";

export default function Home() {
  const { data: books = [], isLoading } = useBooks();
  const { data: seriesList = [] } = useSeriesList();
  const [emblaRef] = useEmblaCarousel({ align: "start", dragFree: true });
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();
  const [langFilter, setLangFilter] = useState<LangFilter>("all");

  useEffect(() => {
    const saved = localStorage.getItem("readhubs_lang_filter") as LangFilter | null;
    if (saved) setLangFilter(saved);
  }, []);

  const setLang = (l: LangFilter) => {
    setLangFilter(l);
    localStorage.setItem("readhubs_lang_filter", l);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const params = langFilter !== "all" ? `&lang=${langFilter}` : "";
      setLocation(`/search?q=${encodeURIComponent(searchQuery)}${params}`);
    }
  };

  const filtered = langFilter === "all" ? books : books.filter(b =>
    langFilter === "en" ? (b.language === "en" || !b.language) : b.language === "es"
  );

  const featuredBooks = filtered.filter(b => b.featured).slice(0, 6);
  const recentBooks = [...filtered].sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()).slice(0, 6);

  return (
    <Layout>
      <SEO
        title="ReadHubs - Read 300 Books Free Online"
        description="ReadHubs is a free digital library with 300 books on self-help, productivity, finance, health, mindfulness, and more. No sign-up. No cost. Read now."
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-50 dark:bg-slate-900 border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-primary/5 pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 py-20 md:py-32 relative flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl w-full"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-sm font-medium mb-6">
              <BookMarked className="w-4 h-4" />
              <span>Free forever. No paywalls.</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-serif text-slate-900 dark:text-white mb-6 leading-tight">
              A cozy place to read <br className="hidden md:block" />
              <span className="text-primary italic">great books.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              ReadHubs is a free digital library containing 300 of the world's best non-fiction books.
            </p>

            {/* Language Toggle */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <span className="text-sm text-muted-foreground">Show:</span>
              <div className="flex rounded-full border border-border overflow-hidden shadow-sm">
                {(["all", "en", "es"] as LangFilter[]).map(l => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                      langFilter === l
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {l === "all" ? "All" : l === "en" ? "🇬🇧 EN" : "🇪🇸 ES"}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSearch} className="w-full max-w-xl mx-auto relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search books, authors, topics..."
                className="w-full pl-12 pr-24 py-6 text-lg rounded-full border-border/50 shadow-sm focus-visible:ring-primary/20 bg-white dark:bg-slate-800/80"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" size="lg" className="absolute right-2 rounded-full px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
                Search
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Featured Carousel */}
      {featuredBooks.length > 0 && (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold font-serif">Featured Reads</h2>
            </div>
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex -ml-4 touch-pan-y">
                {featuredBooks.map(book => (
                  <div key={book.slug} className="flex-[0_0_80%] sm:flex-[0_0_40%] md:flex-[0_0_25%] lg:flex-[0_0_20%] min-w-0 pl-4">
                    <BookCard book={book} featured />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Series section */}
      {seriesList.length > 0 && (
        <section className="py-16 bg-slate-50 dark:bg-slate-900/30 border-y border-border/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Library className="w-6 h-6 text-primary" />
                <h2 className="text-2xl md:text-3xl font-bold font-serif">Book Series</h2>
              </div>
              <Link href="/series">
                <Button variant="ghost" className="text-primary hover:text-primary/80 group">
                  View all <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {seriesList.slice(0, 5).map(series => (
                <Link key={series.slug} href={`/series/${series.slug}`} className="group block">
                  <div className="bg-white dark:bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                    <div className="aspect-[2/3] relative overflow-hidden">
                      <CoverGenerator title={series.name} category={series.category} size="card" />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                        <span className="text-white text-xs font-medium">{series.totalBooks} Books</span>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">{series.name}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/50 border-y border-border/50">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-bold font-serif mb-8">Explore by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map(category => (
              <Link
                key={category}
                href={`/category/${category.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and')}`}
              >
                <div className="p-6 bg-white dark:bg-card border border-border/50 rounded-xl hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group flex flex-col h-full">
                  <h3 className="font-medium text-foreground group-hover:text-primary mb-2">{category}</h3>
                  <div className="mt-auto pt-4 flex justify-end">
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recently Added */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold font-serif">Recently Added</h2>
            <Link href="/search">
              <Button variant="ghost" className="text-primary hover:text-primary/80 group">
                View all <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {isLoading
              ? Array(6).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-slate-200 dark:bg-slate-800 aspect-[2/3] rounded-lg mb-4" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                  </div>
                ))
              : recentBooks.map(book => <BookCard key={book.slug} book={book} />)
            }
          </div>
        </div>
      </section>
    </Layout>
  );
}
