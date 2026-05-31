#!/usr/bin/env node

/**
 * ReadHubs Bulk Upload Script
 * 
 * Usage:
 *   node scripts/bulk-upload.js
 * 
 * Reads:
 *   /input/books/     - DOCX files
 *   /input/covers/    - PNG, JPG, JPEG cover images
 *   /input/metadata.csv - 5-column CSV: filename, cover_filename, title, author, category
 * 
 * Outputs:
 *   /public/books/index.json
 *   /public/books/[slug]/meta.json
 *   /public/books/[slug]/content.html
 *   /public/books/[slug]/cover.webp
 *   /public/books/[slug]/articles/article-01.json ... article-15.json
 *   /public/sitemap.xml
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';
import mammoth from 'mammoth';
import sharp from 'sharp';
import { franc } from 'franc';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const INPUT_BOOKS = path.join(ROOT, 'input', 'books');
const INPUT_COVERS = path.join(ROOT, 'input', 'covers');
const INPUT_META = path.join(ROOT, 'input', 'metadata.csv');
const OUTPUT_BOOKS = path.join(ROOT, 'public', 'books');
const OUTPUT_SITEMAP = path.join(ROOT, 'public', 'sitemap.xml');

// ─── STOP WORDS ──────────────────────────────────────────────────────────────
const STOP_WORDS = new Set([
  'the','a','an','and','or','but','in','on','at','to','for','of','with',
  'by','from','as','is','are','was','were','be','been','being','have',
  'has','had','do','does','did','will','would','could','should','may',
  'might','can','this','that','these','those','i','you','he','she','it',
  'we','they','my','your','his','her','its','our','their','what','which',
  'who','when','where','why','how','all','any','both','each','few','more',
  'most','other','some','such','no','nor','not','only','own','same','so',
  'than','too','very','just','about','after','before','into','through',
  'during','up','down','out','off','over','under','again','further','then',
  'once','here','there','while','if','because','as','until','although',
  'also','its','de','la','el','en','los','las','un','una','que','se',
  'del','al','por','con','para','una','como','más','pero','sus','me',
  'si','ya','tu','te','le','lo','yo','mi','su','ha','hay'
]);

// ─── UTILS ────────────────────────────────────────────────────────────────────

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80);
}

function extractKeywords(text, title, category) {
  const words = text
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !STOP_WORDS.has(w));

  const freq = {};
  for (const w of words) {
    freq[w] = (freq[w] || 0) + 1;
  }

  const titleWords = title.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(w => w.length > 2);
  const catWords = category.toLowerCase().replace(/[^a-z\s&]/g, ' ').split(/[\s&]+/).filter(w => w.length > 2);

  const sorted = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 13)
    .map(([w]) => w);

  const all = [...new Set([...titleWords, ...catWords, ...sorted])].slice(0, 15);
  return all;
}

function extractDescription(htmlContent) {
  const textContent = htmlContent
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const sentences = textContent.split(/[.!?]+/).filter(s => s.trim().length > 30);
  const desc = sentences.slice(0, 3).join('. ').trim();
  return desc.substring(0, 155) + (desc.length > 155 ? '...' : '');
}

function detectLanguage(text) {
  const sample = text.substring(0, 1000);
  const lang = franc(sample, { only: ['eng', 'spa'] });
  return lang === 'spa' ? 'es' : 'en';
}

function extractSections(htmlContent) {
  const paragraphs = htmlContent
    .split(/<\/p>|<\/h[1-6]>|<br\s*\/?>/)
    .map(p => p.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim())
    .filter(p => p.length > 50);

  const total = paragraphs.length;
  const chunkSize = Math.max(1, Math.floor(total / 15));

  return Array.from({ length: 15 }, (_, i) => {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, total);
    return paragraphs.slice(start, end).join('\n\n');
  });
}

function buildArticleHtml(content, type) {
  const paras = content.split('\n\n').filter(Boolean);
  switch (type % 5) {
    case 0:
      return paras.map((p, i) =>
        i === 0 ? `<h2>${p.substring(0, 60)}</h2><p>${p}</p>` : `<p>${p}</p>`
      ).join('\n');
    case 1:
      return paras.map((p, i) =>
        `<h3>Point ${i + 1}</h3><p>${p}</p>`
      ).join('\n');
    case 2:
      return `<blockquote>${paras[0]}</blockquote>\n` + paras.slice(1).map(p => `<p>${p}</p>`).join('\n');
    case 3:
      return paras.map((p, i) =>
        `<h4>Step ${i + 1}</h4><p>${p}</p>`
      ).join('\n');
    default:
      return paras.map(p => `<p>${p}</p>`).join('\n');
  }
}

// ─── ARTICLE TEMPLATES ────────────────────────────────────────────────────────

const ARTICLE_TEMPLATES = [
  {
    title: (book) => `Top 10 Lessons from ${book.title}`,
    metaTitle: (book) => `Top 10 Lessons from ${book.title} | ReadHubs`,
    structure: 'numbered-list',
    opening: 'question',
    section: 0,
  },
  {
    title: (book) => `Complete Summary of ${book.title}`,
    metaTitle: (book) => `Complete Summary: ${book.title} | ReadHubs`,
    structure: 'summary-h3',
    opening: 'conclusion-first',
    section: 14,
  },
  {
    title: (book) => `How to Use ${book.category}: Complete Guide`,
    metaTitle: (book) => `${book.category} Complete Guide from ${book.title}`,
    structure: 'step-by-step',
    opening: 'problem-statement',
    section: 2,
  },
  {
    title: (book) => `The Science Behind ${book.category}`,
    metaTitle: (book) => `Science of ${book.category} - ${book.title} Analysis`,
    structure: 'data-heavy',
    opening: 'surprising-fact',
    section: 3,
  },
  {
    title: (book) => `Step-by-Step Guide to ${book.category}`,
    metaTitle: (book) => `Step-by-Step ${book.category} Guide | ${book.title}`,
    structure: 'numbered-steps',
    opening: 'outcome-first',
    section: 4,
  },
  {
    title: (book) => `${book.category} Tips That Actually Work`,
    metaTitle: (book) => `Real ${book.category} Tips from ${book.title} | ReadHubs`,
    structure: 'tip-cards',
    opening: 'empathy',
    section: 7,
  },
  {
    title: (book) => `${book.category} for Beginners`,
    metaTitle: (book) => `Beginner's Guide to ${book.category} | ${book.title}`,
    structure: 'definition-mix',
    opening: 'reassurance',
    section: 1,
  },
  {
    title: (book) => `Advanced ${book.category}: Beyond Basics`,
    metaTitle: (book) => `Advanced ${book.category} Strategies | ${book.title}`,
    structure: 'concept-heavy',
    opening: 'challenge',
    section: 8,
  },
  {
    title: (book) => `Common Mistakes in ${book.category}`,
    metaTitle: (book) => `${book.category} Mistakes to Avoid | ${book.title}`,
    structure: 'mistake-fix',
    opening: 'warning',
    section: 9,
  },
  {
    title: (book) => `Best Quotes from ${book.title}`,
    metaTitle: (book) => `Most Powerful Quotes: ${book.title} | ReadHubs`,
    structure: 'quote-explanation',
    opening: 'inspirational',
    section: 5,
  },
  {
    title: (book) => `Why ${book.category} Changes Everything`,
    metaTitle: (book) => `Why ${book.category} Is Life-Changing | ${book.title}`,
    structure: 'argument-based',
    opening: 'bold-claim',
    section: 6,
  },
  {
    title: (book) => `${book.category} vs Traditional Methods`,
    metaTitle: (book) => `${book.category} vs Old Methods | ${book.title}`,
    structure: 'comparison',
    opening: 'contrast',
    section: 10,
  },
  {
    title: (book) => `Quick Wins from ${book.title}`,
    metaTitle: (book) => `Quick Wins & Fast Results | ${book.title} | ReadHubs`,
    structure: 'punchy-h3',
    opening: 'time-saving',
    section: 11,
  },
  {
    title: (book) => `Long-Term Results with ${book.category}`,
    metaTitle: (book) => `Long-Term ${book.category} Results | ${book.title}`,
    structure: 'timeline',
    opening: 'vision',
    section: 12,
  },
  {
    title: (book) => `Complete ${book.category} Toolkit 2025`,
    metaTitle: (book) => `${book.category} Toolkit & Resources 2025 | ReadHubs`,
    structure: 'resource-list',
    opening: 'practical-need',
    section: 13,
  },
];

const OPENINGS = {
  question: (title) => `<p>Have you ever wondered what truly separates people who succeed at ${title.split(' ').slice(-2).join(' ')} from those who struggle? The answer might surprise you — and it's all laid out in this remarkable book.</p>`,
  'conclusion-first': (title) => `<p>After reading ${title}, one thing becomes crystal clear: the strategies within have the power to fundamentally change how you approach life. Here is everything you need to know.</p>`,
  'problem-statement': (title) => `<p>If you have been struggling to make real progress, you are not alone. Millions of people face the same challenges — and ${title} was written specifically to solve them.</p>`,
  'surprising-fact': () => `<p>Research shows that most people approach this topic completely backward. The counterintuitive insights packed into this book challenge everything you thought you knew.</p>`,
  'outcome-first': (title) => `<p>Imagine waking up six months from now with everything having changed for the better. That transformation is exactly what readers of ${title} consistently report.</p>`,
  empathy: () => `<p>We get it — you have tried before and it did not stick. But the tips in this section are different. They are practical, tested, and designed for real people with real lives.</p>`,
  reassurance: () => `<p>If you are new to this topic, take a breath. Everyone starts somewhere. This guide breaks everything down into simple, manageable steps — no experience required.</p>`,
  challenge: () => `<p>You have mastered the basics. Now it is time to push further. The advanced concepts in this section separate good results from extraordinary ones.</p>`,
  warning: () => `<p>Warning: Most people unknowingly make these critical mistakes every single day. Identifying and correcting them can mean the difference between frustration and real breakthrough.</p>`,
  inspirational: (title) => `<p>Words have the power to shift perspective in an instant. The quotes collected from ${title} represent the book's most potent ideas, distilled to their essence.</p>`,
  'bold-claim': () => `<p>This is not just another self-improvement topic. The approach outlined in this book has the potential to completely rewire how you think, act, and achieve.</p>`,
  contrast: () => `<p>Old methods are failing people. While traditional approaches demand massive effort for minimal results, the framework in this book operates on entirely different principles.</p>`,
  'time-saving': (title) => `<p>Short on time? These are the highest-leverage ideas from ${title} — the ones you can apply today and see results from this week.</p>`,
  vision: () => `<p>Close your eyes and picture where you want to be in two years. The long-term strategies in this section are the bridge between where you are now and that vision.</p>`,
  'practical-need': () => `<p>Theory is great. But what you actually need are tools — specific, actionable resources that make the work easier. This section delivers exactly that.</p>`,
};

function buildCTA(bookTitle, bookSlug) {
  return `
<div class="read-cta" style="text-align:center;margin:2rem 0">
  <a href="/book/${bookSlug}" style="display:inline-block;background:#f59e0b;color:#000;padding:1rem 2rem;border-radius:8px;font-weight:bold;text-decoration:none;font-size:1.1rem">
    Read ${bookTitle} Free &rarr;
  </a>
</div>`;
}

function buildContinueCTA(bookSlug) {
  return `
<div class="read-cta" style="text-align:center;margin:2rem 0">
  <a href="/book/${bookSlug}" style="display:inline-block;background:#f59e0b;color:#000;padding:1rem 2rem;border-radius:8px;font-weight:bold;text-decoration:none;font-size:1.1rem">
    Continue Reading Free &rarr;
  </a>
</div>`;
}

function buildFinalCTA(bookTitle, bookSlug) {
  return `
<div class="read-cta" style="text-align:center;margin:2rem 0">
  <a href="/book/${bookSlug}" style="display:inline-block;background:#f59e0b;color:#000;padding:1rem 2rem;border-radius:8px;font-weight:bold;text-decoration:none;font-size:1.1rem">
    Read the Full Book Free &rarr;
  </a>
</div>`;
}

function generateArticle(book, sections, templateIndex) {
  const tpl = ARTICLE_TEMPLATES[templateIndex];
  const sectionContent = sections[tpl.section] || sections[0] || 'Content from this book section.';
  const title = tpl.title(book);
  const metaTitle = tpl.metaTitle(book).substring(0, 60);
  const paragraphs = sectionContent.split('\n\n').filter(p => p.trim().length > 20);
  const openingFn = OPENINGS[tpl.opening] || OPENINGS['question'];
  const opening = openingFn(book.title);

  const bodyParagraphs = [...paragraphs];
  const mid = Math.floor(bodyParagraphs.length / 2);
  const bodyHtml = buildArticleHtml(bodyParagraphs.join('\n\n'), templateIndex);

  const fullContent = `
${opening}
${buildCTA(book.title, book.slug)}
<h2>Key Insights</h2>
${bodyHtml}
${buildContinueCTA(book.slug)}
<h2>Putting It Into Practice</h2>
<p>The ideas presented in this section are most powerful when applied consistently. Start with the smallest possible action today — momentum builds from there.</p>
<p>Remember that real change comes from consistent application of these principles over time. Every expert was once a beginner who simply refused to stop.</p>
${buildFinalCTA(book.title, book.slug)}
  `.trim();

  const description = paragraphs.slice(0, 2).join(' ')
    .replace(/<[^>]+>/g, '')
    .substring(0, 155);

  const schemaJson = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "keywords": book.keywords.join(', '),
    "articleSection": book.category,
    "about": {
      "@type": "Book",
      "name": book.title
    },
    "author": {
      "@type": "Person",
      "name": book.author
    }
  });

  return {
    id: `article-${String(templateIndex + 1).padStart(2, '0')}`,
    bookSlug: book.slug,
    bookTitle: book.title,
    title,
    metaTitle,
    metaDescription: description,
    category: book.category,
    keywords: book.keywords,
    content: fullContent,
    schema: schemaJson,
    readTime: Math.ceil(fullContent.replace(/<[^>]+>/g, '').split(/\s+/).length / 200),
    datePublished: book.dateAdded,
    relatedBookSlugs: [],
  };
}

// ─── SITEMAP ──────────────────────────────────────────────────────────────────

function buildSitemap(books, baseUrl = 'https://readhubs.github.io') {
  const today = new Date().toISOString().split('T')[0];
  const bookUrls = books.map(b => `
  <url>
    <loc>${baseUrl}/book/${b.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`).join('');

  const categories = [...new Set(books.map(b => b.category))];
  const catSlugs = categories.map(c => c.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
  const catUrls = catSlugs.map(s => `
  <url>
    <loc>${baseUrl}/category/${s}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('');

  const articleUrls = books.flatMap(b =>
    Array.from({ length: 15 }, (_, i) => `
  <url>
    <loc>${baseUrl}/blog/${b.slug}/article-${String(i + 1).padStart(2, '0')}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`)
  ).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/privacy-policy</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/search</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
${catUrls}
${bookUrls}
${articleUrls}
</urlset>`;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n📚 ReadHubs Bulk Upload Script\n');
  console.log('─'.repeat(50));

  // Check required files
  if (!fs.existsSync(INPUT_META)) {
    console.error('❌ metadata.csv not found at:', INPUT_META);
    process.exit(1);
  }
  if (!fs.existsSync(INPUT_BOOKS)) {
    console.error('❌ Input books folder not found at:', INPUT_BOOKS);
    process.exit(1);
  }

  // Read metadata
  const csvContent = fs.readFileSync(INPUT_META, 'utf-8');
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  const total = records.length;
  console.log(`\n✅ Found ${total} books in metadata.csv\n`);

  fs.mkdirSync(OUTPUT_BOOKS, { recursive: true });

  const booksIndex = [];
  let totalArticles = 0;
  const errors = [];

  for (let i = 0; i < records.length; i++) {
    const row = records[i];
    const { filename, cover_filename, title, author, category } = row;

    process.stdout.write(`\nProcessing book ${i + 1} of ${total}: "${title}" ...`);

    const docxPath = path.join(INPUT_BOOKS, filename);
    const coverPath = path.join(INPUT_COVERS, cover_filename);

    if (!fs.existsSync(docxPath)) {
      errors.push(`⚠️  DOCX not found: ${filename}`);
      continue;
    }
    if (!fs.existsSync(coverPath)) {
      errors.push(`⚠️  Cover not found: ${cover_filename}`);
    }

    try {
      // Parse DOCX
      const result = await mammoth.convertToHtml({ path: docxPath });
      const htmlContent = result.value;
      const plainText = htmlContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

      // Auto-generate fields
      const slug = slugify(title);
      const description = extractDescription(htmlContent);
      const keywords = extractKeywords(plainText, title, category);
      const language = detectLanguage(plainText);
      const featured = i < 6;
      const dateAdded = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
      const readTime = Math.ceil(plainText.split(/\s+/).length / 200);

      const bookDir = path.join(OUTPUT_BOOKS, slug);
      const articlesDir = path.join(bookDir, 'articles');
      fs.mkdirSync(articlesDir, { recursive: true });

      // Save content.html
      fs.writeFileSync(path.join(bookDir, 'content.html'), htmlContent, 'utf-8');

      // Convert and save cover
      if (fs.existsSync(coverPath)) {
        await sharp(coverPath)
          .resize(400, 600, { fit: 'cover' })
          .webp({ quality: 85 })
          .toFile(path.join(bookDir, 'cover.webp'));
      }

      // Generate 15 articles
      const sections = extractSections(htmlContent);
      const articles = [];
      for (let a = 0; a < 15; a++) {
        const article = generateArticle({ slug, title, author, category, keywords, dateAdded }, sections, a);
        const articleFile = path.join(articlesDir, `article-${String(a + 1).padStart(2, '0')}.json`);
        fs.writeFileSync(articleFile, JSON.stringify(article, null, 2), 'utf-8');
        articles.push({
          id: article.id,
          title: article.title,
          slug: `${slug}/${article.id}`,
          metaTitle: article.metaTitle,
        });
        totalArticles++;
      }

      // Build meta.json
      const meta = {
        slug,
        title,
        author,
        category,
        description,
        keywords,
        cover: `/books/${slug}/cover.webp`,
        language,
        featured,
        readTime,
        dateAdded,
        articleCount: 15,
        articles,
        schema: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Book",
          "name": title,
          "description": description,
          "image": `/books/${slug}/cover.webp`,
          "inLanguage": language,
          "genre": category,
          "keywords": keywords.join(', '),
          "author": { "@type": "Person", "name": author }
        }),
      };

      fs.writeFileSync(path.join(bookDir, 'meta.json'), JSON.stringify(meta, null, 2), 'utf-8');

      booksIndex.push({
        slug,
        title,
        author,
        category,
        description,
        keywords,
        cover: `/books/${slug}/cover.webp`,
        language,
        featured,
        readTime,
        dateAdded,
        articleCount: 15,
      });

      process.stdout.write(' ✓');

    } catch (err) {
      errors.push(`❌ Error processing "${title}": ${err.message}`);
      process.stdout.write(' ✗');
    }
  }

  // Save books index
  fs.writeFileSync(
    path.join(OUTPUT_BOOKS, 'index.json'),
    JSON.stringify(booksIndex, null, 2),
    'utf-8'
  );

  // Generate sitemap
  const sitemap = buildSitemap(booksIndex);
  fs.writeFileSync(OUTPUT_SITEMAP, sitemap, 'utf-8');

  // Summary
  console.log('\n\n' + '─'.repeat(50));
  console.log(`✅ ${booksIndex.length} books processed successfully.`);
  console.log(`📝 ${totalArticles} articles generated.`);
  console.log(`🗺️  sitemap.xml updated (${booksIndex.length * 16 + 6} URLs)`);

  if (errors.length > 0) {
    console.log(`\n⚠️  Warnings (${errors.length}):`);
    errors.forEach(e => console.log('  ', e));
  }

  console.log('\n🚀 Ready to push to GitHub.');
  console.log('   Run: git add . && git commit -m "Add books" && git push\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
