import { useParams, Link } from "wouter";
import { useBooks } from "@/hooks/use-books";
import { Layout } from "@/components/layout/layout";
import { SEO } from "@/components/seo";
import { BookCard } from "@/components/ui/book-card";

interface LangCategoryPageProps {
  lang: "en" | "es";
}

export default function LangCategoryPage({ lang }: LangCategoryPageProps) {
  const params = useParams();
  const { data: books = [], isLoading } = useBooks();

  const categorySlug = params.category || "";
  const categoryName = categorySlug
    .split('-')
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .replace(/ And /gi, ' & ');

  const filteredBooks = books.filter(b => {
    const langMatch = lang === 'en' ? (b.language === 'en' || !b.language) : b.language === lang;
    const catSlug = b.category.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and');
    return langMatch && catSlug === categorySlug;
  });

  const langLabel = lang === 'en' ? 'English' : 'Spanish';
  const backHref = `/${lang}`;

  return (
    <Layout>
      <SEO
        title={`${categoryName} Books in ${langLabel} — ReadHubs`}
        description={`Browse free ${langLabel} books in ${categoryName} on ReadHubs. No cost, no sign-up.`}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href={backHref} className="text-sm text-muted-foreground hover:text-primary mb-4 inline-block">
            ← {langLabel} Books
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{lang === 'en' ? '🇬🇧' : '🇪🇸'}</span>
            <h1 className="text-3xl font-bold font-serif">{categoryName}</h1>
          </div>
          <p className="text-muted-foreground">
            {filteredBooks.length} free {langLabel} books
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {isLoading
            ? Array(10).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-slate-200 dark:bg-slate-800 aspect-[2/3] rounded-lg mb-4" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-2" />
                </div>
              ))
            : filteredBooks.map(book => <BookCard key={book.slug} book={book} />)
          }
          {!isLoading && filteredBooks.length === 0 && (
            <div className="col-span-full text-center py-16 text-muted-foreground">
              No {langLabel} books in this category yet.
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
