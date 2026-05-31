import { HelmetProvider } from 'react-helmet-async';
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import EnHome from "@/pages/en-home";
import EsHome from "@/pages/es-home";
import CategoryPage from "@/pages/category";
import LangCategoryPage from "@/pages/lang-category";
import BookPage from "@/pages/book";
import SearchPage from "@/pages/search";
import Blog from "@/pages/blog";
import ArticlePage from "@/pages/article";
import About from "@/pages/about";
import PrivacyPolicy from "@/pages/privacy-policy";
import Contact from "@/pages/contact";
import Admin from "@/pages/admin";
import SeriesIndex from "@/pages/series-index";
import SeriesPage from "@/pages/series-page";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/en" component={EnHome} />
      <Route path="/es" component={EsHome} />
      <Route path="/en/:category" component={() => <LangCategoryPage lang="en" />} />
      <Route path="/es/:category" component={() => <LangCategoryPage lang="es" />} />
      <Route path="/series" component={SeriesIndex} />
      <Route path="/series/:slug" component={SeriesPage} />
      <Route path="/search" component={SearchPage} />
      <Route path="/category/:slug" component={CategoryPage} />
      <Route path="/book/:slug" component={BookPage} />
      <Route path="/blog" component={Blog} />
      <Route path="/blog/:bookSlug/:articleId" component={ArticlePage} />
      <Route path="/about" component={About} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/contact" component={Contact} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
