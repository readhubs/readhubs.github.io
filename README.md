# ReadHubs — Free Book Library

**Free forever. No paywalls.**

Live site: **https://readhubs.github.io**

---

## HOW TO ADD BOOKS

### First time setup:
Upload your DOCX files to `/books-source/` on GitHub. Subfolders = book series.
Push to main. Done.

### Adding new books later:
Upload new DOCX to `/books-source/` on GitHub and push.
Site updates automatically in ~2 minutes.

**You never need to run anything locally.** Everything happens in GitHub Actions.

### Folder structure:
```
books-source/
  standalone-book.docx          ← standalone book
  another-book.docx
  my-series/                    ← subfolder = series
    book-1.docx
    book-2.docx
    book-3.docx
```

### What happens automatically on every push:
1. Reads all DOCX in `books-source/` (including subfolders = series)
2. Detects category from filename keywords
3. Detects language (English/Spanish) from content
4. Generates title, description, keywords, slug, reading time
5. Generates 15 unique SEO articles per book
6. Builds the Vite site
7. Deploys to https://readhubs.github.io

---

## ORIGINAL DOCS

A production-ready, SEO-optimized book website built with React + Vite + TypeScript + Tailwind CSS. Designed for maximum ad revenue through longest possible user session time and highest SEO/GEO ranking.

---

## Quick Start

### 1. Install script dependencies

```bash
cd scripts
npm install
```

### 2. Fill metadata.csv

Only 5 columns required — everything else is auto-generated:

```csv
filename,cover_filename,title,author,category
your-book.docx,your-cover.jpg,Your Book Title,Author Name,Self-Help & Productivity
```

Available categories:
- Self-Help & Productivity
- Health & Nutrition
- Finance & Money
- Habits & Discipline
- Mental Health & Anxiety
- Diet & Weight Loss
- Language Learning
- Mindfulness & Meditation

### 3. Add your files

```
input/
  books/    ← Put all 300 DOCX files here
  covers/   ← Put all 300 cover images here (PNG, JPG, or JPEG)
```

### 4. Run the bulk upload script

```bash
cd scripts
node bulk-upload.js
```

Output:
```
✅ 300 books processed successfully.
📝 4,500 articles generated.
🗺️  sitemap.xml updated (4,806 URLs)
🚀 Ready to push to GitHub.
```

The script auto-generates for each book:
- Description (from first paragraphs of content)
- Keywords (from word frequency analysis)
- Language detection (en or es)
- Clean HTML from DOCX
- WebP cover image
- 15 unique SEO blog articles
- Schema.org JSON-LD

### 5. Configure GitHub Pages

**Edit `public/robots.txt`** — replace `YOUR-GITHUB-USERNAME` with your actual username.

**Edit `public/sitemap.xml`** — replace `YOUR-GITHUB-USERNAME` with your actual username.

**Edit `.github/workflows/deploy.yml`** — if your repo is NOT at root (e.g. `github.com/username/readhubs`), set:
```yaml
VITE_BASE_PATH: /readhubs/
```

### 6. Push to GitHub and deploy

```bash
git init
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git add .
git commit -m "Initial ReadHubs launch with [X] books"
git push -u origin main
```

GitHub Actions will automatically build and deploy to GitHub Pages.

Go to: **GitHub repo → Settings → Pages → Source: GitHub Actions**

Your site will be live at: `https://YOUR-USERNAME.github.io/`

---

## After Launch: Submit Your Sitemap

### Google Search Console
1. Go to https://search.google.com/search-console
2. Add property → URL prefix → enter your GitHub Pages URL
3. Verify ownership (HTML tag method works with GitHub Pages)
4. Sitemaps → Add sitemap → enter `sitemap.xml`

### Bing Webmaster Tools
1. Go to https://www.bing.com/webmasters
2. Add your site
3. Submit sitemap: `https://YOUR-USERNAME.github.io/sitemap.xml`

---

## Ad Network Applications

### When to Apply
Apply after you have:
- At least 10 books uploaded and indexed
- First organic traffic (at least 100 visitors/day recommended)
- About, Privacy Policy, and Contact pages live ✓

### Adsterra
1. Go to https://publishers.adsterra.com
2. Sign up as publisher
3. Add your GitHub Pages URL
4. Wait 1-3 days for approval
5. Get ad codes and replace the placeholder divs in components:
   - `<!-- ADSTERRA_HEADER_BANNER -->` → sticky header banner
   - `<!-- ADSTERRA_IN_CONTENT_1/2/3 -->` → in-content ads
   - `<!-- ADSTERRA_FOOTER_BANNER -->` → footer banner
   - `<!-- ADSTERRA_BETWEEN_ARTICLES -->` → between article cards

### Monetag
1. Go to https://monetag.com
2. Sign up and add your site
3. Get push notification code → replace `<!-- MONETAG_PUSH_NOTIFICATION -->` in `index.html`
4. Get sidebar code → replace `<!-- MONETAG_SIDEBAR -->` in sidebar component
5. Get between-books code → replace `<!-- MONETAG_BETWEEN_BOOKS -->` in book grid

---

## File Structure

```
public/
  books/
    index.json              ← Master index of all books
    [book-slug]/
      meta.json             ← Book metadata + article list
      content.html          ← Full book content (HTML)
      cover.webp            ← Cover image (converted to WebP)
      articles/
        article-01.json     ← "Top 10 Lessons from..."
        article-02.json     ← "Complete Summary of..."
        ...
        article-15.json     ← "Complete [Topic] Toolkit 2025"
  sitemap.xml              ← Auto-generated, 4,800+ URLs
  robots.txt               ← Allows all crawlers including AI bots
  manifest.json            ← PWA manifest
  sw.js                    ← Service worker (offline reading)

scripts/
  bulk-upload.js           ← Main processing script
  package.json             ← Script dependencies

input/
  metadata.csv             ← 5-column input (you fill this)
  books/                   ← Your DOCX files go here
  covers/                  ← Your cover images go here

src/
  pages/                   ← All 11 page components
  components/              ← Reusable UI components
  hooks/                   ← Data fetching hooks
```

---

## After build, dist folder should contain 4,800+ .html files, one per page.

This is achieved via Vite's static build output. All pages are pre-rendered as actual `.html` files for:
- Google indexing all pages correctly
- GPTBot reading content without JavaScript
- PerplexityBot scraping raw HTML instantly
- ClaudeBot and all AI crawlers
- Core Web Vitals scores

---

## PWA — Offline Reading

ReadHubs is installable as a Progressive Web App. Once a user opens a book, it's cached for offline reading. The service worker (`public/sw.js`) handles:
- Static asset caching
- Book content caching (offline reading)
- Push notifications (Monetag)

---

## SEO & GEO Features

Every page has:
- Unique title (60 chars max)
- Unique meta description (155 chars max)
- Canonical URL
- Open Graph tags
- Twitter Card tags
- hreflang en/es
- Schema.org JSON-LD (Book, Article, WebSite)

`robots.txt` explicitly allows:
- Googlebot, Bingbot, DuckDuckBot, Applebot
- GPTBot (ChatGPT), ClaudeBot, Google-Extended
- PerplexityBot, anthropic-ai, CCBot

---

## Adding Books After Launch

Go to `/admin` on your site for the single-book upload form, or re-run the bulk script with new entries added to `metadata.csv`.

---

## Tech Stack

- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS
- **Routing**: Wouter
- **Animations**: Framer Motion
- **SEO**: react-helmet-async
- **Fonts**: Inter (UI), Merriweather (content)
- **Hosting**: GitHub Pages (100% free, zero backend)
