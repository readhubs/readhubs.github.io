interface CoverGeneratorProps {
  title: string;
  category: string;
  size?: "card" | "full" | "thumb";
  className?: string;
}

const GRADIENTS: Record<string, [string, string]> = {
  "Self-Help & Productivity": ["#1e3a8a", "#7c3aed"],
  "Health & Nutrition":       ["#065f46", "#0d9488"],
  "Finance & Money":          ["#78350f", "#d97706"],
  "Habits & Discipline":      ["#1f2937", "#475569"],
  "Mental Health & Anxiety":  ["#4c1d95", "#db2777"],
  "Diet & Weight Loss":       ["#9a3412", "#ea580c"],
  "Language Learning":        ["#164e63", "#2563eb"],
  "Mindfulness & Meditation": ["#312e81", "#6d28d9"],
};

function getGradient(category: string): [string, string] {
  return GRADIENTS[category] ?? ["#1e3a8a", "#1e40af"];
}

function wrapTitle(title: string, maxChars = 18): string[] {
  const words = title.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > maxChars) {
      if (current) lines.push(current.trim());
      current = word;
    } else {
      current = (current + " " + word).trim();
    }
    if (lines.length === 2 && current) {
      lines.push(current.trim());
      current = "";
      break;
    }
  }
  if (current) lines.push(current.trim());
  return lines.slice(0, 3);
}

function CategoryPattern({ category, color }: { category: string; color: string }) {
  const c = category.toLowerCase();
  if (c.includes("self-help") || c.includes("productivity")) {
    return (
      <g fill={color} opacity="0.12">
        <rect x="20" y="170" width="14" height="30" rx="2" />
        <rect x="42" y="155" width="14" height="45" rx="2" />
        <rect x="64" y="140" width="14" height="60" rx="2" />
        <rect x="86" y="125" width="14" height="75" rx="2" />
        <rect x="108" y="110" width="14" height="90" rx="2" />
        <rect x="130" y="135" width="14" height="65" rx="2" />
        <rect x="152" y="150" width="14" height="50" rx="2" />
        <rect x="174" y="160" width="14" height="40" rx="2" />
      </g>
    );
  }
  if (c.includes("health") || c.includes("nutrition")) {
    return (
      <g fill={color} opacity="0.12">
        <circle cx="100" cy="150" r="70" />
        <circle cx="100" cy="150" r="50" />
        <circle cx="100" cy="150" r="30" />
        <ellipse cx="100" cy="80" rx="18" ry="30" />
        <ellipse cx="100" cy="220" rx="18" ry="30" />
      </g>
    );
  }
  if (c.includes("finance") || c.includes("money")) {
    return (
      <g fill={color} opacity="0.12">
        <polygon points="100,80 140,150 100,220 60,150" />
        <polygon points="100,100 130,150 100,200 70,150" />
        <line x1="60" y1="150" x2="140" y2="150" stroke={color} strokeWidth="2" />
        <line x1="100" y1="80" x2="100" y2="220" stroke={color} strokeWidth="2" />
      </g>
    );
  }
  if (c.includes("habit") || c.includes("discipline")) {
    return (
      <g stroke={color} strokeWidth="1.5" opacity="0.12" fill="none">
        {[80, 100, 120, 140, 160].map(y =>
          [60, 80, 100, 120, 140, 160].map(x => (
            <rect key={`${x}-${y}`} x={x} y={y} width="16" height="16" rx="2" />
          ))
        )}
      </g>
    );
  }
  if (c.includes("mental") || c.includes("anxiety")) {
    return (
      <g fill={color} opacity="0.12">
        {[0, 1, 2, 3, 4].map(i => (
          <path
            key={i}
            d={`M 30 ${130 + i * 20} Q 100 ${110 + i * 20} 170 ${130 + i * 20}`}
            stroke={color}
            strokeWidth="2"
            fill="none"
          />
        ))}
      </g>
    );
  }
  if (c.includes("diet") || c.includes("weight")) {
    return (
      <g fill={color} opacity="0.12">
        <ellipse cx="100" cy="150" rx="60" ry="40" />
        <ellipse cx="100" cy="130" rx="40" ry="25" />
        <ellipse cx="100" cy="110" rx="25" ry="15" />
      </g>
    );
  }
  if (c.includes("language") || c.includes("learning")) {
    return (
      <g fill={color} opacity="0.12">
        <rect x="50" y="110" width="90" height="60" rx="8" />
        <polygon points="70,170 80,185 90,170" />
        <rect x="120" y="140" width="70" height="50" rx="8" />
        <polygon points="135,190 145,205 155,190" />
        <text x="65" y="147" fontSize="20" fontFamily="serif" fill={color} opacity="0.3">A</text>
        <text x="132" y="170" fontSize="16" fontFamily="serif" fill={color} opacity="0.3">あ</text>
      </g>
    );
  }
  if (c.includes("mindful") || c.includes("meditation")) {
    return (
      <g stroke={color} strokeWidth="1.5" opacity="0.12" fill="none">
        {[20, 35, 50, 65, 80].map((r, i) => (
          <circle key={i} cx="100" cy="150" r={r} />
        ))}
        <line x1="100" y1="70" x2="100" y2="230" stroke={color} strokeWidth="1" />
        <line x1="20" y1="150" x2="180" y2="150" stroke={color} strokeWidth="1" />
        <line x1="43" y1="93" x2="157" y2="207" stroke={color} strokeWidth="1" />
        <line x1="43" y1="207" x2="157" y2="93" stroke={color} strokeWidth="1" />
      </g>
    );
  }
  return (
    <g fill={color} opacity="0.12">
      <polygon points="100,80 160,120 160,180 100,220 40,180 40,120" />
      <polygon points="100,100 145,125 145,175 100,200 55,175 55,125" />
    </g>
  );
}

export function CoverGenerator({ title, category, size = "card", className = "" }: CoverGeneratorProps) {
  const [from, to] = getGradient(category);
  const gradId = `grad-${category.replace(/\W/g, "")}-${title.slice(0, 4).replace(/\W/g, "")}`;

  const titleLines = wrapTitle(title, size === "thumb" ? 12 : 18);
  const titleFontSize = size === "thumb" ? 14 : size === "full" ? 22 : 17;
  const catFontSize = size === "thumb" ? 8 : size === "full" ? 13 : 10;
  const authorFontSize = size === "thumb" ? 7 : size === "full" ? 11 : 9;
  const lineHeight = titleFontSize * 1.3;
  const titleY = 130 - (titleLines.length - 1) * lineHeight * 0.5;

  return (
    <svg
      viewBox="0 0 200 300"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-full ${className}`}
      aria-label={`Book cover for ${title}`}
      role="img"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>

      <rect width="200" height="300" fill={`url(#${gradId})`} rx="4" />

      <CategoryPattern category={category} color="#ffffff" />

      <rect x="0" y="0" width="200" height="300" fill="rgba(0,0,0,0.25)" rx="4" />

      <rect x="16" y="16" width="168" height="268" rx="3" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

      {titleLines.map((line, i) => (
        <text
          key={i}
          x="100"
          y={titleY + i * lineHeight}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize={titleFontSize}
          fontFamily="Georgia, 'Times New Roman', serif"
          fontWeight="bold"
          style={{ letterSpacing: "0.01em" }}
        >
          {line}
        </text>
      ))}

      <text
        x="100"
        y="220"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="rgba(255,255,255,0.65)"
        fontSize={catFontSize}
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="500"
        style={{ letterSpacing: "0.08em", textTransform: "uppercase" }}
      >
        {category.toUpperCase()}
      </text>

      <line x1="70" y1="236" x2="130" y2="236" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />

      <text
        x="100"
        y="252"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="rgba(255,255,255,0.45)"
        fontSize={authorFontSize}
        fontFamily="Arial, Helvetica, sans-serif"
        style={{ letterSpacing: "0.15em" }}
      >
        MICKY
      </text>
    </svg>
  );
}
