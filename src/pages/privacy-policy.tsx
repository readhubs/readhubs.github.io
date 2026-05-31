import { Layout } from "@/components/layout/layout";
import { SEO } from "@/components/seo";

export default function PrivacyPolicy() {
  return (
    <Layout>
      <SEO title="Privacy Policy - ReadHubs" description="Privacy policy and data collection disclosure for ReadHubs." />
      
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-4xl font-bold font-serif mb-8">Privacy Policy</h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2>1. Introduction</h2>
          <p>Welcome to ReadHubs. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website.</p>

          <h2>2. Data Collection</h2>
          <p>As a static website, we collect minimal personal data. Any data saved (like your reading progress, bookmarks, and theme preferences) is stored locally on your device using `localStorage`. We do not have a backend database to store this information.</p>

          <h2>3. Cookies and Advertising</h2>
          <p>To keep ReadHubs free, we use third-party advertising networks including Adsterra and Monetag. These networks may use cookies, web beacons, and other tracking technologies to collect information about your activities on our site and other websites to provide you targeted advertising based upon your interests.</p>
          
          <h2>4. Third-Party Links</h2>
          <p>This website may include links to third-party websites, plug-ins, and applications. Clicking on those links or enabling those connections may allow third parties to collect or share data about you. We do not control these third-party websites and are not responsible for their privacy statements.</p>

          <h2>5. Your Rights (GDPR)</h2>
          <p>Under the General Data Protection Regulation (GDPR), you have rights including:</p>
          <ul>
            <li>The right to access your personal data.</li>
            <li>The right to rectification.</li>
            <li>The right to erasure.</li>
            <li>The right to restrict processing.</li>
          </ul>
          <p>Since our site is primarily static and data is stored on your device, you can exercise most of these rights simply by clearing your browser's local storage and cookies.</p>

          <h2>6. Contact Us</h2>
          <p>If you have any questions about this privacy policy or our privacy practices, please contact us at: <a href="mailto:contact@readhubs.com">contact@readhubs.com</a></p>
        </div>
      </div>
    </Layout>
  );
}
