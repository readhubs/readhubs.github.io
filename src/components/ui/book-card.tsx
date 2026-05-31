import { Link } from "wouter";
import { Book } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { CoverGenerator } from "@/components/CoverGenerator";

interface BookCardProps {
  book: Book;
  featured?: boolean;
}

export function BookCard({ book, featured }: BookCardProps) {
  return (
    <Link href={`/book/${book.slug}`} className="group h-full block">
      <Card className="h-full border-none shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden bg-white dark:bg-card hover:-translate-y-1">
        <div className="relative aspect-[2/3] w-full overflow-hidden">
          <CoverGenerator title={book.title} category={book.category} size="card" />
          {featured && (
            <Badge className="absolute top-2 right-2 bg-amber-500 hover:bg-amber-600 text-white border-none z-10">
              Featured
            </Badge>
          )}
          {book.series && (
            <Badge className="absolute top-2 left-2 bg-slate-900/80 text-white border-none text-xs z-10">
              Series
            </Badge>
          )}
        </div>
        <CardContent className="p-4 flex flex-col gap-1">
          <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1 line-clamp-1">
            {book.category}
          </div>
          <h3 className="font-serif font-bold text-lg leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {book.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {book.author}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>{Math.round(book.readTime / 60)}h read</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
