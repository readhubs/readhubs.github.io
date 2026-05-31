import { Link } from "wouter";
import { BookOpen } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-card border-t mt-auto">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="font-serif font-bold text-2xl tracking-tight text-primary">ReadHubs</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm mb-6 leading-relaxed">
              300 Books. Free Forever. A cozy digital library where anyone can access life-changing knowledge without paywalls or subscriptions.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">ReadHubs © {new Date().getFullYear()}</span>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground mb-4">Library</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/search" className="text-sm text-muted-foreground hover:text-primary transition-colors">Browse Books</Link>
              </li>
              <li>
                <Link href="/category/self-help-productivity" className="text-sm text-muted-foreground hover:text-primary transition-colors">Self-Help</Link>
              </li>
              <li>
                <Link href="/category/finance-money" className="text-sm text-muted-foreground hover:text-primary transition-colors">Finance & Money</Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors">Blog</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About Us</Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact</Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/admin" className="text-sm text-muted-foreground hover:text-primary transition-colors">Admin</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
