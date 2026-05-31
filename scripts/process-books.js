#!/usr/bin/env node
/**
 * ReadHubs — Books Processing Script
 * Runs automatically in GitHub Actions on every push to main.
 * Reads /books-source/ → outputs to /public/books/ and /public/series/
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mammoth from 'mammoth';
import { randomUUID } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT       = path.resolve(__dirname, '..');
const SRC        = path.join(ROOT, 'books-source');
const OUT_BOOKS  = path.join(ROOT, 'public', 'books');
const OUT_SERIES = path.join(ROOT, 'public', 'series');

// ── Helpers ──────────────────────────────────────────────────────────────────

function slugify(str) {
  return str.toLowerCase().trim()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toTitleCase(str) {
  const smalls = new Set(['a','an','the','and','but','or','for','nor','on','at','to','by','in','of','up','as']);
  return str.replace(/[-_]+/g, ' ')
    .split(' ')
    .map((w, i) => (i === 0 || !smalls.has(w.toLowerCase()))
      ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
      : w.toLowerCase())
    .join(' ')
    .replace(/\.docx$/i, '');
}

// ── Category detection (from filename) ───────────────────────────────────────

const CATEGORY_RULES = [
  [/habit|productivity|focus|procrastin|success|goal|motivation|mindset|discipline|routine|morning|consistency|atomic|daily/i, 'Self-Help & Productivity'],
  [/keto|diet|weight|nutrition|meal|fasting|food|recipe|cook|mediterranean|paleo|protein|calorie|detox/i, 'Diet & Weight Loss'],
  [/stress|anxiety|mental|therapy|trauma|depress|burnout|wellbeing|well.being/i, 'Mental Health & Anxiety'],
  [/sleep|mindful|meditat|calm|breath|peace|zen|yoga|spiritual|gratitude/i, 'Mindfulness & Meditation'],
  [/money|financ|invest|budget|wealth|debt|crypto|income|saving|retire|trading|stock|market/i, 'Finance & Money'],
  [/health|body|fitness|exercise|workout|muscle|immune|vitamin|supplement/i, 'Health & Nutrition'],
  [/english|spanish|french|italiano|language|grammar|vocabular|pronunciation|lingua/i, 'Language Learning'],
];

function detectCategory(filename) {
  const name = filename.toLowerCase();
  for (const [rx, cat] of CATEGORY_RULES) {
    if (rx.test(name)) return cat;
  }
  return 'Self-Help & Productivity';
}

// ── Language detection (from first 500 words of text) ────────────────────────

const ES_WORDS = new Set([
  'de','la','el','en','que','es','por','con','para','como','una','los','las',
  'del','al','se','su','un','este','esta','lo','le','pero','más','si','ya',
  'yo','él','ella','nos','sin','sobre','entre','cuando','también','puede',
  'ser','han','hay','mi','tu','su','muy','bien','todo','cada','eso','esto',
]);

function detectLanguage(text) {
  const words = text.toLowerCase().replace(/[^a-záéíóúüñ\s]/gi, '').split(/\s+/).slice(0, 500);
  if (words.length === 0) return 'en';
  const spanishCount = words.filter(w => ES_WORDS.has(w)).length;
  return (spanishCount / words.length) > 0.28 ? 'es' : 'en';
}

// ── Stop words for keyword extraction ────────────────────────────────────────

const STOP_WORDS = new Set([
  'the','a','an','and','or','but','in','on','at','to','for','of','with',
  'this','that','is','are','was','were','be','been','have','has','had',
  'do','does','did','will','would','could','should','may','might','can',
  'it','its','they','them','their','we','us','our','you','your','he','she',
  'his','her','not','no','so','if','as','by','from','up','about','into',
  'through','during','before','after','above','below','between','each',
  'more','most','some','such','than','then','there','these','those','when',
  'where','which','while','who','whom','how','what','why','i','my','me',
  'el','la','de','en','que','es','por','con','para','como','una','los',
  'del','al','se','su','un','le','pero','más','si','ya','muy','bien',
]);

function extractKeywords(text, titleWords, category) {
  const freq = {};
  const words = text.toLowerCase().replace(/[^a-záéíóúüñ\s]/gi, ' ').split(/\s+/);
  for (const w of words) {
    if (w.length > 4 && !STOP_WORDS.has(w)) freq[w] = (freq[w] || 0) + 1;
  }
  const ranked = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([w]) => w);
  const extras = [...titleWords.map(w => w.toLowerCase()), category.toLowerCase(), 'free book', 'read online'];
  return [...new Set([...ranked, ...extras])].slice(0, 15);
}

// ── Article generators ────────────────────────────────────────────────────────

const ARTICLE_TEMPLATES = [
  {
    id: 'article-01',
    titleFn: (t) => `Top 10 Lessons from ${t}`,
    structure: 'numbered-list',
    opening: 'question',
  },
  {
    id: 'article-02',
    titleFn: (t) => `Complete Summary of ${t}`,
    structure: 'summary-paragraphs',
    opening: 'conclusion-first',
  },
  {
    id: 'article-03',
    titleFn: (_, topic) => `How to ${topic}: Complete Guide`,
    structure: 'step-by-step',
    opening: 'problem-statement',
  },
  {
    id: 'article-04',
    titleFn: (_, topic) => `The Science Behind ${topic}`,
    structure: 'data-heavy',
    opening: 'surprising-fact',
  },
  {
    id: 'article-05',
    titleFn: (_, topic) => `Step-by-Step Guide to ${topic}`,
    structure: 'numbered-steps',
    opening: 'outcome-first',
  },
  {
    id: 'article-06',
    titleFn: (_, topic) => `${topic} Tips That Actually Work`,
    structure: 'tip-cards',
    opening: 'empathy',
  },
  {
    id: 'article-07',
    titleFn: (_, topic) => `${topic} for Beginners`,
    structure: 'definition-mix',
    opening: 'reassurance',
  },
  {
    id: 'article-08',
    titleFn: (_, topic) => `Advanced ${topic}: Beyond Basics`,
    structure: 'concept-heavy',
    opening: 'challenge',
  },
  {
    id: 'article-09',
    titleFn: (_, topic) => `Common Mistakes in ${topic}`,
    structure: 'mistake-fix',
    opening: 'warning',
  },
  {
    id: 'article-10',
    titleFn: (t) => `Best Quotes from ${t}`,
    structure: 'quote-explanation',
    opening: 'inspirational',
  },
  {
    id: 'article-11',
    titleFn: (_, topic) => `Why ${topic} Changes Everything`,
    structure: 'argument',
    opening: 'bold-claim',
  },
  {
    id: 'article-12',
    titleFn: (_, topic) => `${topic} vs Traditional Methods`,
    structure: 'comparison',
    opening: 'contrast',
  },
  {
    id: 'article-13',
    titleFn: (t) => `Quick Wins from ${t}`,
    structure: 'short-punchy',
    opening: 'time-saving',
  },
  {
    id: 'article-14',
    titleFn: (_, topic) => `Long-Term Results with ${topic}`,
    structure: 'timeline',
    opening: 'vision',
  },
  {
    id: 'article-15',
    titleFn: (_, topic) => `Complete ${topic} Toolkit 2025`,
    structure: 'resource-list',
    opening: 'practical-need',
  },
];

const OPENINGS = {
  question: (title, topic) =>
    `<p>Have you ever wondered why some people achieve remarkable results with <strong>${topic}</strong> while others struggle despite their best efforts? The answer lies in understanding the core principles explored in <em>${title}</em>. This guide distills the most powerful lessons so you can start applying them immediately.</p>`,
  'conclusion-first': (title, topic) =>
    `<p>After reading <em>${title}</em>, one thing becomes clear: mastering <strong>${topic}</strong> is not about willpower or motivation — it is about building the right systems. This comprehensive summary captures every key insight so you get the full value without missing a single idea.</p>`,
  'problem-statement': (_, topic) =>
    `<p>Most people approach <strong>${topic}</strong> the wrong way. They rely on motivation that fades, follow advice that doesn't fit their lifestyle, and wonder why nothing sticks. This guide shows you the proven method that actually works — one built on strategy, not effort.</p>`,
  'surprising-fact': (_, topic) =>
    `<p>Research shows that 92% of people who try to improve their <strong>${topic}</strong> give up within three weeks. Not because the goal is too hard — but because they're missing the science. Understanding the evidence behind <strong>${topic}</strong> changes everything about how you approach it.</p>`,
  'outcome-first': (_, topic) =>
    `<p>Imagine having complete control over your <strong>${topic}</strong>. Imagine waking up every day knowing exactly what to do and why. This step-by-step guide gives you a clear, structured path from where you are now to the results you want — without the guesswork.</p>`,
  empathy: (_, topic) =>
    `<p>If you have tried to improve your <strong>${topic}</strong> and felt frustrated by slow progress, you are not alone. Millions of people struggle with the same challenges. The difference between those who succeed and those who don't is not talent — it's the right set of strategies. Here are the ones that actually work.</p>`,
  reassurance: (_, topic) =>
    `<p>Starting your journey with <strong>${topic}</strong> can feel overwhelming, especially with so much conflicting advice out there. The good news is you don't need to know everything to get started. This beginner-friendly guide breaks down exactly what you need to know in simple, clear steps.</p>`,
  challenge: (_, topic) =>
    `<p>Once you have mastered the basics of <strong>${topic}</strong>, the real growth begins. Most resources stop where this guide starts. This deep dive is for those who are ready to move beyond surface-level advice and engage with the ideas that separate good results from extraordinary ones.</p>`,
  warning: (_, topic) =>
    `<p>Warning: the most common approach to <strong>${topic}</strong> is also the most ineffective. Before you spend another month going in the wrong direction, read this guide. It covers the mistakes that hold people back — and more importantly, exactly how to avoid them.</p>`,
  inspirational: (title, _) =>
    `<p>Words have the power to shift perspectives, and the right quote at the right moment can change the course of your life. The quotes collected from <em>${title}</em> represent the sharpest, most actionable insights in the book — ideas that stay with you long after you've finished reading.</p>`,
  'bold-claim': (_, topic) =>
    `<p>Here is a bold statement: once you truly understand <strong>${topic}</strong>, you will look back on your life before and after as two completely different eras. That is not an exaggeration. The ideas explored here have helped thousands of people transform their approach to work, health, relationships, and more.</p>`,
  contrast: (_, topic) =>
    `<p>Traditional approaches to <strong>${topic}</strong> were designed for a different era. The methods most people still use today are outdated, inefficient, and often counterproductive. This guide compares the old way with what modern research and practice have proven to actually work.</p>`,
  'time-saving': (title, _) =>
    `<p>Short on time but want the full value of <em>${title}</em>? This guide gives you the highest-impact insights you can apply immediately — no lengthy setup, no prerequisite reading. Just practical, proven ideas you can start using today.</p>`,
  vision: (_, topic) =>
    `<p>Imagine where you could be six months from now if you committed to improving your <strong>${topic}</strong> consistently. Not perfect — just consistent. This guide maps out the long-term journey, showing you what real, lasting results look like and how to build toward them step by step.</p>`,
  'practical-need': (_, topic) =>
    `<p>The right tools make all the difference. Whether you are just starting your <strong>${topic}</strong> journey or looking to level up, this curated toolkit gives you everything you need — the best resources, strategies, and frameworks available in 2025.</p>`,
};

function generateCTA(bookSlug, bookTitle, pos) {
  const labels = [
    `Read ${bookTitle} Free`,
    'Continue Reading Free',
    `Get the Full Book — Free`,
  ];
  return `<div class="cta-block my-8 p-6 bg-amber-50 border border-amber-200 rounded-xl text-center not-prose">
  <p class="text-amber-900 font-semibold mb-4">${pos === 0 ? 'Enjoy this article?' : 'Want to go deeper?'} The full book is free on ReadHubs.</p>
  <a href="/book/${bookSlug}" class="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-3 rounded-full text-base transition-colors">
    ${labels[pos % 3]} →
  </a>
</div>`;
}

function generateInternalLinks(related) {
  if (!related.length) return '';
  return `<div class="related-books my-8 not-prose">
  <h4 class="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Related Free Books</h4>
  <ul class="space-y-1">
    ${related.slice(0, 3).map(b => `<li><a href="/book/${b.slug}" class="text-amber-600 hover:underline font-medium">${b.title}</a></li>`).join('\n')}
  </ul>
</div>`;
}

function pickSectionText(paragraphs, from = 0, to = 1) {
  const total = paragraphs.length;
  const start = Math.floor(total * from);
  const end   = Math.floor(total * to);
  return paragraphs.slice(start, end).join(' ');
}

function buildArticleContent(template, book, paragraphs, related, topic) {
  const { id, structure, opening } = template;
  const openingHtml = (OPENINGS[opening] || OPENINGS.question)(book.title, topic);
  const cta0 = generateCTA(book.slug, book.title, 0);
  const cta1 = generateCTA(book.slug, book.title, 1);
  const cta2 = generateCTA(book.slug, book.title, 2);
  const links = generateInternalLinks(related);

  const adBlock = `<div id="adsterra-content-1" class="my-8">
  <div class="w-full max-w-[728px] h-[90px] bg-slate-100 flex items-center justify-center text-slate-400 text-sm border border-slate-200 mx-auto">Advertisement</div>
</div>`;

  let body = '';

  if (structure === 'numbered-list') {
    const picks = pickSectionText(paragraphs, 0, 0.3);
    const sentences = picks.split(/[.!?]+/).filter(s => s.trim().length > 30).slice(0, 10);
    body = sentences.map((s, i) => `<h3>${i + 1}. ${toTitleCase(s.trim().slice(0, 60))}</h3>\n<p>${s.trim()}. Applying this lesson consistently creates compound improvements over time.</p>`).join('\n');
    if (!body) body = `<p>${picks.slice(0, 800)}</p>`;
  } else if (structure === 'summary-paragraphs') {
    const thirds = [
      pickSectionText(paragraphs, 0, 0.33),
      pickSectionText(paragraphs, 0.33, 0.66),
      pickSectionText(paragraphs, 0.66, 1),
    ];
    body = thirds.map((t, i) => {
      const labels = ['Foundation', 'Core Principles', 'Practical Application'];
      return `<h3>${labels[i]}</h3>\n<p>${t.slice(0, 350).trim()}...</p>`;
    }).join('\n');
  } else if (structure === 'step-by-step') {
    const picks = pickSectionText(paragraphs, 0.1, 0.9);
    const sentences = picks.split(/[.!?]+/).filter(s => s.trim().length > 20).slice(0, 6);
    body = sentences.map((s, i) => `<h2>Step ${i + 1}: ${toTitleCase(s.trim().slice(0, 50))}</h2>\n<p>${s.trim()}. This step builds the foundation for everything that follows.</p>`).join('\n');
    if (!body) body = `<p>${picks.slice(0, 800)}</p>`;
  } else if (structure === 'data-heavy') {
    const picks = pickSectionText(paragraphs, 0.2, 0.8);
    const sentences = picks.split(/[.!?]+/).filter(s => s.trim().length > 30).slice(0, 5);
    body = `<h2>What the Research Shows</h2>\n<p>${sentences[0] || picks.slice(0, 200)}</p>\n` +
      `<blockquote><p>"${sentences[1] || picks.slice(200, 350)}"</p></blockquote>\n` +
      `<h3>Key Findings</h3>\n<p>${sentences[2] || picks.slice(350, 550)}</p>\n` +
      `<h3>Practical Implications</h3>\n<p>${sentences[3] || picks.slice(550, 750)}</p>`;
  } else if (structure === 'tip-cards') {
    const picks = pickSectionText(paragraphs, 0.15, 0.85);
    const sentences = picks.split(/[.!?]+/).filter(s => s.trim().length > 25).slice(0, 8);
    body = sentences.map((s, i) => `<h3>Tip ${i + 1}: ${toTitleCase(s.trim().slice(0, 55))}</h3>\n<p>${s.trim()}.</p>`).join('\n');
    if (!body) body = `<p>${picks.slice(0, 800)}</p>`;
  } else if (structure === 'definition-mix') {
    const picks = pickSectionText(paragraphs, 0, 0.5);
    const sentences = picks.split(/[.!?]+/).filter(s => s.trim().length > 20).slice(0, 6);
    body = sentences.map((s, i) => {
      const tag = i % 3 === 0 ? 'h2' : i % 3 === 1 ? 'h3' : 'h4';
      return `<${tag}>${toTitleCase(s.trim().slice(0, 60))}</${tag}>\n<p>${s.trim()}. Understanding this concept is essential before moving forward.</p>`;
    }).join('\n');
    if (!body) body = `<p>${picks.slice(0, 800)}</p>`;
  } else if (structure === 'concept-heavy') {
    const picks = pickSectionText(paragraphs, 0.5, 1);
    const sentences = picks.split(/[.!?]+/).filter(s => s.trim().length > 40).slice(0, 4);
    body = sentences.map((s, i) => {
      const headers = ['Deep Dive', 'Advanced Framework', 'Expert Application', 'Mastery Principles'];
      return `<h2>${headers[i] || 'Further Exploration'}</h2>\n<p>${s.trim()}. This represents the advanced layer that most introductory resources never cover.</p>`;
    }).join('\n');
    if (!body) body = `<p>${picks.slice(0, 900)}</p>`;
  } else if (structure === 'mistake-fix') {
    const picks = pickSectionText(paragraphs, 0, 1);
    const sentences = picks.split(/[.!?]+/).filter(s => s.trim().length > 25).slice(0, 6);
    body = sentences.map((s, i) => `<h3>Mistake #${i + 1}</h3>\n<p><strong>The problem:</strong> ${s.trim()}.</p>\n<p><strong>The fix:</strong> Reframe this as an opportunity to build the habit differently, focusing on identity over outcome.</p>`).join('\n');
    if (!body) body = `<p>${picks.slice(0, 800)}</p>`;
  } else if (structure === 'quote-explanation') {
    const picks = pickSectionText(paragraphs, 0, 1);
    const sentences = picks.split(/[.!?]+/).filter(s => s.trim().length > 40).slice(0, 6);
    body = sentences.map((s, i) => `<blockquote><p>"${s.trim()}."</p></blockquote>\n<p>This insight reminds us that ${topic.toLowerCase()} is ultimately about consistent action aligned with clear values — not just knowledge.</p>`).join('\n');
    if (!body) body = `<p>${picks.slice(0, 800)}</p>`;
  } else if (structure === 'argument') {
    const picks = pickSectionText(paragraphs, 0.1, 0.4);
    const sentences = picks.split(/[.!?]+/).filter(s => s.trim().length > 30).slice(0, 4);
    body = [
      `<h2>The Core Argument</h2><p>${sentences[0] || picks.slice(0, 200)}</p>`,
      `<h2>Why This Matters Now</h2><p>${sentences[1] || picks.slice(200, 400)}</p>`,
      `<h2>The Evidence</h2><p>${sentences[2] || picks.slice(400, 600)}</p>`,
      `<h2>What You Can Do Today</h2><p>${sentences[3] || picks.slice(600, 800)}</p>`,
    ].join('\n');
  } else if (structure === 'comparison') {
    const old_ = pickSectionText(paragraphs, 0, 0.4);
    const new_ = pickSectionText(paragraphs, 0.4, 0.8);
    body = `<h2>The Old Way</h2>\n<p>${old_.slice(0, 300).trim()}</p>\n` +
      `<h2>The New Approach</h2>\n<p>${new_.slice(0, 300).trim()}</p>\n` +
      `<table class="w-full text-sm my-6 border-collapse"><thead><tr class="bg-slate-100"><th class="p-3 border text-left">Traditional</th><th class="p-3 border text-left">Modern Approach</th></tr></thead><tbody><tr><td class="p-3 border">Relies on motivation</td><td class="p-3 border">Builds systems</td></tr><tr><td class="p-3 border">Goal-focused</td><td class="p-3 border">Process-focused</td></tr><tr><td class="p-3 border">All-or-nothing</td><td class="p-3 border">1% daily improvement</td></tr></tbody></table>`;
  } else if (structure === 'short-punchy') {
    const picks = pickSectionText(paragraphs, 0, 1);
    const sentences = picks.split(/[.!?]+/).filter(s => s.trim().length > 20).slice(0, 8);
    body = sentences.map((s, i) => `<h3>Win #${i + 1}: ${toTitleCase(s.trim().slice(0, 50))}</h3>\n<p>${s.trim()}.</p>`).join('\n');
    if (!body) body = `<p>${picks.slice(0, 800)}</p>`;
  } else if (structure === 'timeline') {
    body = [
      `<h2>Week 1–2: Foundation</h2><p>${pickSectionText(paragraphs, 0, 0.25).slice(0, 250)}. These early days are about building the habit loop — cue, routine, reward.</p>`,
      `<h2>Month 1: Building Momentum</h2><p>${pickSectionText(paragraphs, 0.25, 0.5).slice(0, 250)}. By this point, the new behavior begins to feel automatic.</p>`,
      `<h2>Month 3: Compound Results</h2><p>${pickSectionText(paragraphs, 0.5, 0.75).slice(0, 250)}. The cumulative effect of small daily improvements becomes visible.</p>`,
      `<h2>Month 6+: Transformation</h2><p>${pickSectionText(paragraphs, 0.75, 1).slice(0, 250)}. This is where the long-term vision becomes reality.</p>`,
    ].join('\n');
  } else {
    const picks = pickSectionText(paragraphs, 0, 1);
    const sentences = picks.split(/[.!?]+/).filter(s => s.trim().length > 20).slice(0, 8);
    body = sentences.map((s, i) => `<h3>Resource ${i + 1}: ${toTitleCase(s.trim().slice(0, 55))}</h3>\n<p>${s.trim()}. Add this to your daily practice for best results.</p>`).join('\n');
    if (!body) body = `<p>${picks.slice(0, 800)}</p>`;
  }

  const conclusion = `<h2>Conclusion</h2>\n<p>The ideas covered here represent just a fraction of what you will discover in the full text. Whether you are just beginning your ${topic.toLowerCase()} journey or looking to deepen your practice, the book delivers insights that are both practical and immediately applicable.</p>`;

  return openingHtml + '\n' + cta0 + '\n' + body + '\n' + adBlock + '\n' + cta1 + '\n' + conclusion + '\n' + links + '\n' + cta2;
}

function generateArticles(book, paragraphs, allBooks) {
  const related = allBooks
    .filter(b => b.slug !== book.slug && b.category === book.category)
    .slice(0, 3);

  const topic = book.category.replace(' & ', ' and ').replace('Self-Help and Productivity', 'Your Habits');

  return ARTICLE_TEMPLATES.map((template) => {
    const title = template.titleFn(book.title, topic);
    const slug  = slugify(title);
    const content = buildArticleContent(template, book, paragraphs, related, topic);
    const metaTitle = title.length > 60 ? title.slice(0, 57) + '...' : title;
    const metaDescription = `${title} — Read this free guide on ReadHubs. Based on insights from "${book.title}" by ${book.author}.`.slice(0, 155);

    return {
      id: template.id,
      title,
      slug,
      metaTitle,
      metaDescription,
      content,
      bookSlug: book.slug,
      bookTitle: book.title,
      category: book.category,
      schema: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: metaTitle,
        description: metaDescription,
        author: { '@type': 'Organization', name: 'ReadHubs Editorial' },
        publisher: { '@type': 'Organization', name: 'ReadHubs', url: 'https://readhubs.github.io' },
        url: `https://readhubs.github.io/blog/${book.slug}/${template.id}`,
        isBasedOn: { '@type': 'Book', name: book.title, url: `https://readhubs.github.io/book/${book.slug}` },
      },
    };
  });
}

// ── Main processing ───────────────────────────────────────────────────────────

async function processDocx(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || '';
  } catch {
    return '';
  }
}

async function processDocxHtml(filePath) {
  try {
    const result = await mammoth.convertToHtml({ path: filePath });
    return result.value || '';
  } catch {
    return '';
  }
}

function getFirstMeaningfulParagraphs(text, charLimit = 155) {
  const paragraphs = text.split('\n').map(p => p.trim()).filter(p => p.length > 40);
  let desc = '';
  for (const p of paragraphs) {
    if ((desc + ' ' + p).trim().length <= charLimit) {
      desc = (desc + ' ' + p).trim();
    } else {
      desc = (desc + ' ' + p).trim().slice(0, charLimit - 3) + '...';
      break;
    }
  }
  return desc || text.slice(0, charLimit - 3) + '...';
}

async function main() {
  if (!fs.existsSync(SRC)) {
    fs.mkdirSync(SRC, { recursive: true });
    console.log('Created books-source/ directory.');
  }
  fs.mkdirSync(OUT_BOOKS,  { recursive: true });
  fs.mkdirSync(OUT_SERIES, { recursive: true });

  const allEntries = fs.readdirSync(SRC);
  const standaloneFiles = allEntries.filter(e => {
    const full = path.join(SRC, e);
    return fs.statSync(full).isFile() && e.toLowerCase().endsWith('.docx');
  });
  const seriesFolders = allEntries.filter(e => {
    const full = path.join(SRC, e);
    return fs.statSync(full).isDirectory();
  });

  const allBooks = [];
  const seriesMetas = [];
  let totalArticles = 0;
  let spanishCount = 0;
  let errors = 0;

  const totalFiles =
    standaloneFiles.length +
    seriesFolders.reduce((sum, f) => {
      const dir = path.join(SRC, f);
      return sum + fs.readdirSync(dir).filter(e => e.toLowerCase().endsWith('.docx')).length;
    }, 0);

  let processed = 0;

  // ── Process standalone books ────────────────────────────────────────────────

  for (const file of standaloneFiles) {
    processed++;
    const filePath = path.join(SRC, file);
    const baseName = path.basename(file, '.docx');
    const title = toTitleCase(baseName);
    const slug  = slugify(title);

    console.log(`\nProcessing: ${file} (${processed}/${totalFiles})`);

    let rawText = '';
    let htmlContent = '';
    try {
      rawText     = await processDocx(filePath);
      htmlContent = await processDocxHtml(filePath);
    } catch (e) {
      console.log(`  ✗ Error reading DOCX: ${e.message}`);
      errors++;
      continue;
    }

    const category = detectCategory(baseName);
    const language = detectLanguage(rawText);
    if (language === 'es') spanishCount++;

    const paragraphs = rawText.split('\n').filter(p => p.trim().length > 20);
    const description = getFirstMeaningfulParagraphs(rawText, 155);
    const keywords = extractKeywords(rawText, title.split(' '), category);
    const wordCount = rawText.split(/\s+/).length;
    const readTime = Math.max(60, Math.round(wordCount / 200) * 60);
    const featured = allBooks.length < 6;

    console.log(`  Category: ${category}`);
    console.log(`  Language: ${language === 'es' ? 'Spanish' : 'English'}`);
    console.log(`  Words: ${wordCount} (~${Math.round(readTime / 60)}h)`);

    const book = {
      slug,
      title,
      author: 'MICKY',
      category,
      description,
      keywords,
      language,
      featured,
      readTime,
      dateAdded: new Date().toISOString().split('T')[0],
      articleCount: 15,
    };

    allBooks.push(book);

    const bookDir = path.join(OUT_BOOKS, slug);
    const artDir  = path.join(bookDir, 'articles');
    fs.mkdirSync(artDir, { recursive: true });

    const articles = generateArticles(book, paragraphs, allBooks);
    for (const article of articles) {
      fs.writeFileSync(path.join(artDir, `${article.id}.json`), JSON.stringify(article, null, 2));
    }
    totalArticles += articles.length;

    const bookMeta = {
      ...book,
      articles: articles.map(a => ({ id: a.id, title: a.title, slug: a.slug })),
    };
    fs.writeFileSync(path.join(bookDir, 'meta.json'), JSON.stringify(bookMeta, null, 2));
    fs.writeFileSync(path.join(bookDir, 'content.html'), htmlContent || `<p>Content from ${title}.</p>`);

    console.log(`  Articles: 15 generated`);
    console.log(`  ✓ Done`);
  }

  // ── Process series ──────────────────────────────────────────────────────────

  for (const folder of seriesFolders) {
    const folderPath = path.join(SRC, folder);
    const docxFiles  = fs.readdirSync(folderPath)
      .filter(f => f.toLowerCase().endsWith('.docx'))
      .sort();

    if (docxFiles.length === 0) continue;

    const seriesName = toTitleCase(folder);
    const seriesSlug = slugify(seriesName);
    const seriesBookSlugs = [];
    let seriesCategory = 'Self-Help & Productivity';
    let seriesLanguage = 'en';

    console.log(`\n📚 Series: ${seriesName} (${docxFiles.length} books)`);

    for (let i = 0; i < docxFiles.length; i++) {
      processed++;
      const file     = docxFiles[i];
      const filePath = path.join(folderPath, file);
      const baseName = path.basename(file, '.docx');
      const title    = toTitleCase(baseName);
      const slug     = slugify(seriesSlug + '-' + (i + 1));

      console.log(`  Processing: ${file} (${processed}/${totalFiles})`);

      let rawText = '';
      let htmlContent = '';
      try {
        rawText     = await processDocx(filePath);
        htmlContent = await processDocxHtml(filePath);
      } catch (e) {
        console.log(`  ✗ Error: ${e.message}`);
        errors++;
        continue;
      }

      const category = detectCategory(baseName) || detectCategory(folder);
      const language = detectLanguage(rawText);
      if (i === 0) { seriesCategory = category; seriesLanguage = language; }
      if (language === 'es') spanishCount++;

      const paragraphs = rawText.split('\n').filter(p => p.trim().length > 20);
      const description = getFirstMeaningfulParagraphs(rawText, 155);
      const keywords = extractKeywords(rawText, title.split(' '), category);
      const wordCount = rawText.split(/\s+/).length;
      const readTime = Math.max(60, Math.round(wordCount / 200) * 60);
      const featured = allBooks.length < 6;

      const book = {
        slug,
        title,
        author: 'MICKY',
        category,
        description,
        keywords,
        language,
        featured,
        readTime,
        dateAdded: new Date().toISOString().split('T')[0],
        articleCount: 15,
        series: seriesName,
        seriesSlug,
        seriesOrder: i + 1,
        seriesTotal: docxFiles.length,
      };

      allBooks.push(book);
      seriesBookSlugs.push(slug);

      const bookDir = path.join(OUT_BOOKS, slug);
      const artDir  = path.join(bookDir, 'articles');
      fs.mkdirSync(artDir, { recursive: true });

      const articles = generateArticles(book, paragraphs, allBooks);
      for (const article of articles) {
        fs.writeFileSync(path.join(artDir, `${article.id}.json`), JSON.stringify(article, null, 2));
      }
      totalArticles += articles.length;

      const bookMeta = {
        ...book,
        articles: articles.map(a => ({ id: a.id, title: a.title, slug: a.slug })),
      };
      fs.writeFileSync(path.join(bookDir, 'meta.json'), JSON.stringify(bookMeta, null, 2));
      fs.writeFileSync(path.join(bookDir, 'content.html'), htmlContent || `<p>Book ${i + 1} of ${seriesName}.</p>`);

      console.log(`  Series book ${i + 1}/${docxFiles.length} — 15 articles ✓`);
    }

    const seriesMeta = {
      slug: seriesSlug,
      name: seriesName,
      bookSlugs: seriesBookSlugs,
      totalBooks: seriesBookSlugs.length,
      category: seriesCategory,
      language: seriesLanguage,
      dateAdded: new Date().toISOString().split('T')[0],
    };
    seriesMetas.push(seriesMeta);

    const seriesDir = path.join(OUT_SERIES, seriesSlug);
    fs.mkdirSync(seriesDir, { recursive: true });
    fs.writeFileSync(path.join(seriesDir, 'meta.json'), JSON.stringify(seriesMeta, null, 2));
  }

  // ── Write master index files ───────────────────────────────────────────────

  const existingIndex = (() => {
    try {
      return JSON.parse(fs.readFileSync(path.join(OUT_BOOKS, 'index.json'), 'utf8'));
    } catch { return []; }
  })();

  const newSlugs = new Set(allBooks.map(b => b.slug));
  const merged   = [
    ...allBooks,
    ...existingIndex.filter(b => !newSlugs.has(b.slug)),
  ];

  fs.writeFileSync(path.join(OUT_BOOKS, 'index.json'), JSON.stringify(merged, null, 2));
  fs.writeFileSync(path.join(OUT_SERIES, 'index.json'), JSON.stringify(seriesMetas, null, 2));

  // ── Generate sitemap ───────────────────────────────────────────────────────

  const base = 'https://readhubs.github.io';
  const today = new Date().toISOString().split('T')[0];
  const staticUrls = [
    { loc: base, priority: '1.0', freq: 'daily' },
    { loc: `${base}/en`, priority: '0.9', freq: 'weekly' },
    { loc: `${base}/es`, priority: '0.9', freq: 'weekly' },
    { loc: `${base}/series`, priority: '0.85', freq: 'weekly' },
    { loc: `${base}/blog`, priority: '0.7', freq: 'weekly' },
    { loc: `${base}/search`, priority: '0.6', freq: 'weekly' },
    { loc: `${base}/about`, priority: '0.5', freq: 'monthly' },
    { loc: `${base}/contact`, priority: '0.5', freq: 'monthly' },
    { loc: `${base}/privacy-policy`, priority: '0.5', freq: 'monthly' },
  ];

  const bookUrls = merged.map(b => ({ loc: `${base}/book/${b.slug}`, priority: '0.9', freq: 'monthly' }));
  const articleUrls = merged.flatMap(b =>
    ARTICLE_TEMPLATES.map(a => ({ loc: `${base}/blog/${b.slug}/${a.id}`, priority: '0.8', freq: 'monthly' }))
  );
  const seriesUrls = seriesMetas.map(s => ({ loc: `${base}/series/${s.slug}`, priority: '0.85', freq: 'weekly' }));

  const allUrls = [...staticUrls, ...bookUrls, ...articleUrls, ...seriesUrls];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.freq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync(path.join(ROOT, 'public', 'sitemap.xml'), sitemap);

  // ── Summary ────────────────────────────────────────────────────────────────

  const standalone = standaloneFiles.length;
  const seriesCount = seriesFolders.length;
  const englishCount = allBooks.length - spanishCount;

  console.log('\n════════════════════════════');
  console.log('PROCESSING COMPLETE');
  console.log('════════════════════════════');
  console.log(`Total books:       ${allBooks.length}`);
  console.log(`Standalone:        ${standalone}`);
  console.log(`Series:            ${seriesCount} folders detected`);
  console.log(`English books:     ${englishCount}`);
  console.log(`Spanish books:     ${spanishCount}`);
  console.log(`Articles generated:${totalArticles}`);
  console.log(`Sitemap URLs:      ${allUrls.length}`);
  console.log(`Errors:            ${errors}`);
  console.log('Build ready.');
  console.log('════════════════════════════');
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
