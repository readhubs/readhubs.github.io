import { Layout } from "@/components/layout/layout";
import { SEO } from "@/components/seo";

export default function About() {
  return (
    <Layout>
      <SEO title="About Us - ReadHubs" description="Learn about ReadHubs and our mission to provide free knowledge for everyone." />
      
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold font-serif mb-8 text-center">About ReadHubs</h1>
        
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="lead text-xl text-muted-foreground text-center mb-12">
            We believe that life-changing knowledge should be accessible to everyone, everywhere, for free.
          </p>
          
          <h2>Who We Are</h2>
          <p>
            ReadHubs is a digital library dedicated to hosting the world's best non-fiction books. We are a small team of avid readers and technologists who grew tired of paywalls and subscription models standing between people and education.
          </p>

          <h2>Our Mission</h2>
          <p>
            Our mission is simple: <strong>Free knowledge for everyone.</strong>
          </p>
          <p>
            We've carefully curated a collection of 300 transformational books covering self-help, finance, health, productivity, and mindfulness. Every single book on our platform is available to read in its entirety, completely free of charge.
          </p>

          <h2>How We Stay Free</h2>
          <p>
            Running a global digital library requires resources. To keep ReadHubs free forever without charging our readers, we display unobtrusive advertisements throughout the site. We carefully select our ad partners to ensure the reading experience remains clean, safe, and enjoyable.
          </p>

          <div className="bg-amber-50 dark:bg-amber-900/20 p-8 rounded-2xl mt-12 text-center">
            <h3 className="text-2xl font-serif font-bold text-amber-900 dark:text-amber-100 mb-4 mt-0">Ready to start reading?</h3>
            <p className="text-amber-800/80 dark:text-amber-200/80 mb-6">Join thousands of readers discovering their next favorite book.</p>
            <a href="/search" className="inline-flex items-center justify-center rounded-full bg-amber-500 px-8 py-3 text-sm font-medium text-white hover:bg-amber-600 transition-colors">
              Browse the Library
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
