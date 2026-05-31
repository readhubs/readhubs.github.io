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
  "Autoayuda y Productividad",
  "Salud y Nutrición",
  "Finanzas y Dinero",
  "Hábitos y Disciplina",
  "Salud Mental y Ansiedad",
  "Dieta y Pérdida de Peso",
  "Aprendizaje de Idiomas",
  "Mindfulness y Meditación"
];

export default function EsHome() {
  const { data: allBooks = [], isLoading } = useBooks();
  const [emblaRef] = useEmblaCarousel({ align: "start", dragFree: true });
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const books = allBooks.filter(b => b.language === 'es');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery)}&lang=es`);
    }
  };

  const featuredBooks = books.filter(b => b.featured).slice(0, 6);
  const recentBooks = [...books].sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()).slice(0, 6);

  return (
    <Layout>
      <SEO 
        title="ReadHubs - Biblioteca de Libros Gratis" 
        description="Accede a 300 libros gratuitos que cambiarán tu vida. ReadHubs es una biblioteca digital cálida y acogedora donde cualquiera puede leer gratis."
        lang="es"
      />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-50 dark:bg-slate-900 border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-primary/5 pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 py-20 md:py-32 relative flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-sm font-medium mb-6">
              <BookMarked className="w-4 h-4" />
              <span>Gratis para siempre. Sin muros de pago.</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-serif text-slate-900 dark:text-white mb-6 leading-tight">
              Un lugar acogedor para leer <br className="hidden md:block" />
              <span className="text-primary italic">grandes libros.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              ReadHubs es una biblioteca digital gratuita que contiene 300 de los mejores libros de no ficción del mundo. Encuentra tu próxima lectura favorita a continuación.
            </p>
            
            <form onSubmit={handleSearch} className="w-full max-w-xl mx-auto relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-muted-foreground" />
              <Input 
                type="search"
                placeholder="Buscar libros, autores, temas..." 
                className="w-full pl-12 pr-24 py-6 text-lg rounded-full border-border/50 shadow-sm focus-visible:ring-primary/20 bg-white dark:bg-slate-800/80"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                type="submit" 
                size="lg" 
                className="absolute right-2 rounded-full px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              >
                Buscar
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
              <h2 className="text-2xl md:text-3xl font-bold font-serif flex items-center gap-3">
                Lecturas Destacadas
              </h2>
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

      {/* Categories */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/50 border-y border-border/50">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-bold font-serif mb-8">Explorar por Categoría</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map(category => (
              <Link 
                key={category} 
                href={`/es/category/${category.toLowerCase().replace(/ /g, '-').replace(/&/g, 'y')}`}
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
            <h2 className="text-2xl md:text-3xl font-bold font-serif">Agregados Recientemente</h2>
            <Link href="/search?lang=es">
              <Button variant="ghost" className="text-primary hover:text-primary/80 group">
                Ver todos <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-slate-200 dark:bg-slate-800 aspect-[2/3] rounded-lg mb-4"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                </div>
              ))
            ) : (
              recentBooks.map(book => (
                <BookCard key={book.slug} book={book} />
              ))
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
