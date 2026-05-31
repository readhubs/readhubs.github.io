import { useParams, Link } from "wouter";
import { useBooks } from "@/hooks/use-books";
import { Layout } from "@/components/layout/layout";
import { SEO } from "@/components/seo";
import { BookCard } from "@/components/ui/book-card";

export default function CategoryPage() {
  const params = useParams();
  const { data: books = [], isLoading } = useBooks();
  
  const categorySlug = params.slug || "";
  const categoryName = categorySlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  
  const categoryBooks = books.filter(b => b.category.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and') === categorySlug);

  return (
    <Layout>
      <SEO 
        title={`${categoryName} Books - ReadHubs`} 
        description={`Explore our collection of free books in the ${categoryName} category.`}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary mb-4 inline-block">← Back to Home</Link>
          <h1 className="text-3xl font-bold font-serif">{categoryName} Books</h1>
          <p className="text-muted-foreground mt-2">Showing {categoryBooks.length} books</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {isLoading ? (
            Array(10).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-slate-200 aspect-[2/3] rounded-lg mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))
          ) : (
            categoryBooks.map(book => (
              <BookCard key={book.slug} book={book} />
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
