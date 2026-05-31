import { Layout } from "@/components/layout/layout";
import { SEO } from "@/components/seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function Contact() {
  return (
    <Layout>
      <SEO title="Contact Us - ReadHubs" description="Get in touch with the ReadHubs team." />
      
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-serif mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground">
            Have a question, suggestion, or just want to say hi? We'd love to hear from you.
          </p>
          <div className="mt-4">
            <a href="mailto:contact@readhubs.com" className="text-primary hover:underline font-medium">
              contact@readhubs.com
            </a>
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-6 md:p-8 shadow-sm">
          <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST" className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="Your name" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="your@email.com" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea 
                id="message" 
                name="message" 
                placeholder="How can we help you?" 
                rows={5} 
                required 
              />
            </div>
            
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-lg font-medium">
              Send Message
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
