import { useState } from "react";
import { useBooks } from "@/hooks/use-books";
import { Layout } from "@/components/layout/layout";
import { SEO } from "@/components/seo";
import { Input } from "@/components/ui/input";
import { BookCard } from "@/components/ui/book-card";
import { Search as SearchIcon } from "lucide-react";
import { useLocation } from "wouter";

export default function SearchPage() {
  const { data: books = [] } = useBooks();
  const [query, setQuery] = useState("");
  
  const searchResults = query.trim() === "" 
    ? books 
    : books.filter(b => 
        b.title.toLowerCase().includes(query.toLowerCase()) || 
        b.author.toLowerCase().includes(query.toLowerCase()) ||
        b.description.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <Layout>
      <SEO title="Search Books - ReadHubs" description="Search for your next free book to read." />
      
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <h1 className="text-4xl font-bold font-serif mb-8 text-center">Search Library</h1>
        
        <div className="max-w-2xl mx-auto mb-12 relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            type="search"
            placeholder="Type to search books, authors..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 py-6 text-lg rounded-full shadow-sm"
            autoFocus
          />
        </div>

        <div className="mb-4 text-muted-foreground">
          Found {searchResults.length} books
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {searchResults.map(book => (
            <BookCard key={book.slug} book={book} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
