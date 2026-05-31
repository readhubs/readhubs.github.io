import { Layout } from "@/components/layout/layout";
import { SEO } from "@/components/seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { CoverGenerator } from "@/components/CoverGenerator";
import { Upload, CheckCircle2, Loader2 } from "lucide-react";

const CATEGORIES = [
  "Self-Help & Productivity",
  "Diet & Weight Loss",
  "Mental Health & Anxiety",
  "Finance & Money",
  "Habits & Discipline",
  "Language Learning",
  "Mindfulness & Meditation",
  "Health & Nutrition",
];

const CATEGORY_KEYWORDS: Record<string, RegExp> = {
  "Self-Help & Productivity": /habit|productivity|focus|discipline|procrastin|success|goal|motivation|mindset/i,
  "Diet & Weight Loss": /keto|diet|weight|nutrition|meal|fasting|food|recipe|cook|mediterranean|paleo|protein|calorie|detox/i,
  "Mental Health & Anxiety": /health|sleep|stress|anxiety|mental|mindful|meditat|calm|therapy|trauma|depress/i,
  "Finance & Money": /money|financ|invest|budget|wealth|debt|crypto|income|saving|retire|trading/i,
  "Habits & Discipline": /routine|morning|consistency|atomic|daily/i,
  "Language Learning": /english|spanish|french|italiano|language|grammar|vocabular|pronunciation/i,
  "Mindfulness & Meditation": /peace|breath|gratitude|zen|yoga|spiritual/i,
};

function detectCategoryFromFilename(name: string): string {
  for (const [cat, rx] of Object.entries(CATEGORY_KEYWORDS)) {
    if (rx.test(name)) return cat;
  }
  return "Self-Help & Productivity";
}

function cleanTitle(filename: string): string {
  return filename
    .replace(/\.docx$/i, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim();
}

export default function Admin() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [fileData, setFileData] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [language, setLanguage] = useState("en");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const REPO = "readhubs/readhubs.github.io";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setUploaded(false);

    const detected = detectCategoryFromFilename(file.name);
    setCategory(detected);
    setTitle(cleanTitle(file.name));
    setDescription("");
    setKeywords([detected.toLowerCase(), "free book", "read online"].join(", "));

    const reader = new FileReader();
    reader.onload = (ev) => {
      setFileData((ev.target?.result as string).split(",")[1]);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileData || !fileName) { toast.error("Please select a DOCX file first."); return; }
    if (!githubToken) { toast.error("GitHub Personal Access Token is required."); return; }

    setUploading(true);
    try {
      const path = `books-source/${fileName}`;
      const url = `https://api.github.com/repos/${REPO}/contents/${path}`;

      const checkRes = await fetch(url, {
        headers: { Authorization: `Bearer ${githubToken}`, "User-Agent": "ReadHubs-Admin" },
      });
      const sha = checkRes.ok ? (await checkRes.json()).sha : undefined;

      const res = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${githubToken}`,
          "Content-Type": "application/json",
          "User-Agent": "ReadHubs-Admin",
        },
        body: JSON.stringify({
          message: `Add book: ${title}`,
          content: fileData,
          ...(sha ? { sha } : {}),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "GitHub API error");
      }

      setUploaded(true);
      toast.success("Book uploaded! GitHub Actions will process it in ~2 minutes and generate 15 articles automatically.");
    } catch (err: unknown) {
      toast.error(`Upload failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <SEO title="Admin — ReadHubs" description="Admin panel for adding books to ReadHubs." />

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-3xl font-bold font-serif mb-2">Admin Panel</h1>
        <p className="text-muted-foreground mb-8">
          Upload a DOCX file to <code className="bg-muted px-1 py-0.5 rounded text-xs">books-source/</code> via the GitHub API.
          GitHub Actions will process it automatically and generate 15 SEO articles.
        </p>

        <form onSubmit={handleUpload} className="space-y-6">
          {/* DOCX Upload */}
          <div
            className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/20 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept=".docx" className="hidden" onChange={handleFileChange} />
            {fileName ? (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
                <p className="font-medium">{fileName}</p>
                <p className="text-sm text-muted-foreground">Click to change file</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Upload className="w-10 h-10 opacity-40" />
                <p className="font-medium">Drop your DOCX here or click to browse</p>
                <p className="text-sm">Only .docx files are supported</p>
              </div>
            )}
          </div>

          {/* Preview + Fields — shown once file selected */}
          {fileName && (
            <>
              <div className="flex gap-6">
                <div className="w-24 h-36 rounded-lg overflow-hidden shrink-0 shadow-md">
                  <CoverGenerator title={title || fileName} category={category || "Self-Help & Productivity"} size="card" />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="space-y-1">
                    <Label>Title</Label>
                    <Input value={title} onChange={e => setTitle(e.target.value)} required placeholder="Auto-detected from filename" />
                  </div>
                  <div className="space-y-1">
                    <Label>Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Language</Label>
                    <div className="flex rounded-lg border overflow-hidden w-fit">
                      <button type="button" onClick={() => setLanguage("en")}
                        className={`px-4 py-1.5 text-sm font-medium transition-colors ${language === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                        🇬🇧 English
                      </button>
                      <button type="button" onClick={() => setLanguage("es")}
                        className={`px-4 py-1.5 text-sm font-medium transition-colors ${language === "es" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                        🇪🇸 Spanish
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <Label>Description <span className="text-muted-foreground text-xs">(optional — auto-generated if blank)</span></Label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="First 155 characters of the book will be used..." />
              </div>

              <div className="space-y-1">
                <Label>Keywords <span className="text-muted-foreground text-xs">(comma separated)</span></Label>
                <Input value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="habits, productivity, free book" />
              </div>

              <div className="border-t border-border/50 pt-6 space-y-4">
                <div className="space-y-1">
                  <Label>GitHub Personal Access Token</Label>
                  <Input
                    type="password"
                    value={githubToken}
                    onChange={e => setGithubToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Needs <code className="bg-muted px-1 rounded">repo</code> scope. Generate at{" "}
                    <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                      github.com/settings/tokens
                    </a>
                  </p>
                </div>
              </div>
            </>
          )}

          <Button
            type="submit"
            disabled={!fileName || uploading || uploaded}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white h-12 text-base font-semibold gap-2"
          >
            {uploading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Uploading to GitHub...</>
            ) : uploaded ? (
              <><CheckCircle2 className="w-5 h-5" /> Uploaded — Processing in ~2 minutes</>
            ) : (
              <><Upload className="w-5 h-5" /> Upload Book</>
            )}
          </Button>

          {uploaded && (
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-sm text-green-800 dark:text-green-300">
              ✅ Book uploaded to <code>books-source/{fileName}</code>.<br />
              GitHub Actions will now process it automatically:<br />
              • Extract all text from DOCX<br />
              • Detect category &amp; language<br />
              • Generate 15 unique SEO articles<br />
              • Deploy the updated site<br />
              <strong>Estimated time: ~2 minutes.</strong>
            </div>
          )}
        </form>
      </div>
    </Layout>
  );
}
