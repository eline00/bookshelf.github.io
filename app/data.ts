export interface Book {
  id: number;
  title: string;
  author: string;
  year: number;
  rating: number;
  pages: number;
  genre: string;
  date: string;
  dateStarted: string;
  datePub: string;
  readCount: number;
  avgRating: number;
  notes: string;
  coverColor: string | null;
}

// Helper function to get cover image URL
// Uses Cloudinary for image hosting with auto-format and auto-quality
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const basePath =
  process.env.NODE_ENV === "production" ? "/bookshelf.github.io" : "";

export const getBookCover = (book: Book): string => {
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${book.id}`;
};

// Generate Spotify daylist-style book description
// Mixes vibes, moods, and themes based on book attributes
export const getBookVibe = (book: Book): string => {
  // Seed random based on book id for consistency
  const seededRandom = (seed: number, index: number) => {
    const x = Math.sin(seed + index * 9999) * 10000;
    return x - Math.floor(x);
  };

  // Vibe words by genre
  const genreVibes: Record<string, string[]> = {
    Romantasy: [
      "fae courts",
      "starlit nights",
      "morally grey",
      "enemies to lovers",
      "forbidden magic",
      "midnight trysts",
      "cursed hearts",
      "velvet darkness",
      "throne room tension",
      "wings unfurling",
      "mate bonds",
      "ancient power",
    ],
    Fantasy: [
      "epic battles",
      "kingdom rising",
      "blood oath",
      "shadow realm",
      "fire and ruin",
      "crown heavy",
      "war drums",
      "ancient prophecy",
      "sword and sorcery",
      "chosen one",
      "dark magic",
      "rebellion brewing",
    ],
    "Dark Romance": [
      "obsessive",
      "dangerous",
      "possessive",
      "morally corrupt",
      "twisted devotion",
      "shadow stalker",
      "dark desire",
      "unhinged",
      "toxic allure",
      "no boundaries",
    ],
    Fanfic: [
      "what if",
      "alternate universe",
      "slow burn",
      "comfort read",
      "emotional damage",
      "found family",
      "angst central",
      "fix-it fic",
    ],
    Fiction: [
      "thought-provoking",
      "society mirror",
      "human nature",
      "timeless",
      "literary",
      "contemplative",
      "layered meaning",
      "classic energy",
    ],
  };

  // Mood words based on rating
  const ratingMoods: Record<number, string[]> = {
    5: [
      "obsessed",
      "unputdownable",
      "all-consuming",
      "peak fiction",
      "chef's kiss",
      "no thoughts just vibes",
      "core memory",
      "living in my head",
    ],
    4: [
      "thoroughly enjoyed",
      "would recommend",
      "solid choice",
      "satisfying",
      "well spent time",
      "good decisions only",
    ],
    3: [
      "mixed feelings",
      "it was fine",
      "mid but make it fashion",
      "situational",
      "had its moments",
      "complicated relationship",
    ],
    2: [
      "struggled through",
      "not for me",
      "questionable choices",
      "regrettable",
      "confusion",
      "why did I",
    ],
    1: ["pain", "suffering", "mistakes were made", "never again", "chaos"],
  };

  // Pace words based on pages
  const paceWords =
    book.pages > 700
      ? ["marathon read", "epic length", "commitment era", "long haul", "tome energy"]
      : book.pages > 500
        ? ["substantial", "meaty", "chunky", "deep dive"]
        : book.pages > 300
          ? ["perfect length", "balanced", "just right", "sweet spot"]
          : ["quick bite", "fast consume", "sprint read", "binge ready"];

  // Time of day vibes based on reading speed
  const startDate = new Date(book.dateStarted);
  const endDate = new Date(book.date);
  const daysToRead = Math.max(
    1,
    Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  );
  const pagesPerDay = book.pages / daysToRead;

  const speedVibes =
    pagesPerDay > 200
      ? ["speed demon", "hyperfocus", "consumed whole", "possessed reading"]
      : pagesPerDay > 100
        ? ["steady pace", "dedicated hours", "cozy sessions"]
        : ["savored slowly", "taking my time", "prolonged enjoyment"];

  // Re-read indicator
  const rereadVibes =
    book.readCount > 1
      ? ["comfort reread", "returning home", "familiar embrace", "nostalgia hit"]
      : [];

  // Build the vibe string
  const genre = book.genre || "Fiction";
  const genrePool = genreVibes[genre] || genreVibes["Fiction"];

  // Pick words using seeded random for consistency
  const pick = (arr: string[], index: number) =>
    arr[Math.floor(seededRandom(book.id, index) * arr.length)];

  const parts = [
    pick(genrePool, 0),
    pick(ratingMoods[book.rating] || ratingMoods[3], 1),
    pick(paceWords, 2),
    pick(speedVibes, 3),
  ];

  // Add re-read vibe if applicable
  if (rereadVibes.length > 0) {
    parts.push(pick(rereadVibes, 4));
  } else {
    parts.push(pick(genrePool, 5));
  }

  return parts.join(" // ");
};

export const genreGradients: Record<string, string> = {
  Fantasy: "linear-gradient(45deg, #134E5E, #71B280)",
  Fiction: "linear-gradient(45deg, #4b0000, #8E0E00)",
  Romance: "linear-gradient(45deg, #ee9ca7, #ffdde1)",
  "Dark Romance": "linear-gradient(45deg, #1a1a2e, #16213e)",
  Romantasy: "linear-gradient(45deg, #667eea, #764ba2)",
  Fanfic: "linear-gradient(45deg, #f093fb, #f5576c)",
  Thriller: "linear-gradient(45deg, #000428, #004e92)",
  "Non-Fiction": "linear-gradient(45deg, #FF8008, #FFC837)",
  default: "linear-gradient(45deg, #232526, #414345)",
};

