import { useBooks } from "@/hooks/use-books";
import { Layout } from "@/components/layout/layout";
import { SEO } from "@/components/seo";
import { BookCard } from "@/components/ui/book-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, BookMarked, ArrowRight } from "lucide-react";
import { Link, useLocation } from "wouter";
import useEmblaCarousel from "embla-carousel-react";
import { useState } from "react";
import { motion } from "framer-motion";

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

export default function EnHome() {
  const { data: allBooks = [], isLoading } = useBooks();
  const [emblaRef] = useEmblaCarousel({ align: "start", dragFree: true });
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const books = allBooks.filter(b => b.language === 'en' || !b.language);
  const featuredBooks = books.filter(b => b.featured).slice(0, 6);
  const recentBooks = [...books].sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()).slice(0, 6);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) setLocation(`/search?q=${encodeURIComponent(searchQuery)}&lang=en`);
  };

  return (
    <Layout>
      <SEO
        title="English Books — Read Free | ReadHubs"
        description="Browse 300+ free English non-fiction books on ReadHubs. Self-help, finance, health, habits and more."
      />

      <div className="bg-slate-50 dark:bg-slate-900 border-b px-4 py-3 flex items-center justify-center gap-4">
        <span className="text-sm text-muted-foreground">Language:</span>
        <div className="flex rounded-full border overflow-hidden">
          <Link href="/en">
            <span className="px-4 py-1.5 text-sm font-semibold bg-primary text-primary-foreground cursor-pointer">🇬🇧 EN</span>
          </Link>
          <Link href="/es">
            <span className="px-4 py-1.5 text-sm text-muted-foreground hover:bg-muted cursor-pointer">🇪🇸 ES</span>
          </Link>
        </div>
      </div>

      <section className="relative overflow-hidden bg-slate-50 dark:bg-slate-900 border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-primary/5 pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 py-16 md:py-24 relative flex flex-col items-center text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-sm font-medium mb-6">
              <BookMarked className="w-4 h-4" />
              <span>English Library — Free forever</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-serif text-slate-900 dark:text-white mb-6 leading-tight">
              Free English Books<br />
              <span className="text-primary italic">Read anything, anytime.</span>
            </h1>
            <form onSubmit={handleSearch} className="w-full max-w-xl mx-auto relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search English books..."
                className="w-full pl-12 pr-24 py-6 text-base rounded-full border-border/50 shadow-sm bg-white dark:bg-slate-800/80"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" size="lg" className="absolute right-2 rounded-full px-6">Search</Button>
            </form>
          </motion.div>
        </div>
      </section>

      {featuredBooks.length > 0 && (
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold font-serif mb-6">Featured English Books</h2>
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

      <section className="py-12 bg-slate-50 dark:bg-slate-900/50 border-y border-border/50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold font-serif mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map(category => (
              <Link key={category} href={`/en/${category.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and')}`}>
                <div className="p-5 bg-white dark:bg-card border border-border/50 rounded-xl hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group flex flex-col h-full">
                  <h3 className="font-medium text-foreground group-hover:text-primary mb-2 text-sm">{category}</h3>
                  <div className="mt-auto pt-3 flex justify-end">
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold font-serif">Recently Added</h2>
            <Link href="/search?lang=en">
              <Button variant="ghost" className="text-primary group">
                View all <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {isLoading
              ? Array(6).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-slate-200 dark:bg-slate-800 aspect-[2/3] rounded-lg mb-3" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-2" />
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
