export const yearlyGoals: Record<number, number> = {
  2024: 20,
  2025: 40,
  2026: 60,
};

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

// Books extracted from Goodreads - organized by read date
// Only books from "A Court of Thorns and Roses" onwards
export const books: Book[] = [
  // 2024 Books
  {
    id: 6942919341,
    title: "A Court of Thorns and Roses",
    author: "Sarah J. Maas",
    year: 2024,
    rating: 3,
    pages: 419,
    genre: "Romantasy",
    date: "Oct 05, 2024",
    dateStarted: "Sep 30, 2024",
    datePub: "May 05, 2015",
    readCount: 2,
    avgRating: 4.16,
    notes: "None",
  },
  {
    id: 6942935033,
    title: "A Court of Mist and Fury",
    author: "Sarah J. Maas",
    year: 2024,
    rating: 5,
    pages: 626,
    genre: "Romantasy",
    date: "Oct 10, 2024",
    dateStarted: "Oct 05, 2024",
    datePub: "May 03, 2016",
    readCount: 2,
    avgRating: 4.64,
    notes: "None",
  },
  {
    id: 50659472,
    title: "A Court of Wings and Ruin",
    author: "Sarah J. Maas",
    year: 2024,
    rating: 4,
    pages: 699,
    genre: "Romantasy",
    date: "Oct 14, 2024",
    dateStarted: "Oct 09, 2024",
    datePub: "May 02, 2017",
    readCount: 1,
    avgRating: 4.46,
    notes: "None",
  },
  {
    id: 50659471,
    title: "A Court of Frost and Starlight",
    author: "Sarah J. Maas",
    year: 2024,
    rating: 3,
    pages: 272,
    genre: "Romantasy",
    date: "Oct 16, 2024",
    dateStarted: "Oct 14, 2024",
    datePub: "May 21, 2019",
    readCount: 1,
    avgRating: 3.72,
    notes: "None",
  },
  {
    id: 53138095,
    title: "A Court of Silver Flames",
    author: "Sarah J. Maas",
    year: 2024,
    rating: 5,
    pages: 757,
    genre: "Romantasy",
    date: "Oct 18, 2024",
    dateStarted: "Oct 16, 2024",
    datePub: "Feb 16, 2021",
    readCount: 1,
    avgRating: 4.45,
    notes: "None",
  },
  {
    id: 61431922,
    title: "Fourth Wing",
    author: "Rebecca Yarros",
    year: 2024,
    rating: 5,
    pages: 517,
    genre: "Romantasy",
    date: "Oct 20, 2024",
    dateStarted: "Oct 18, 2024",
    datePub: "May 02, 2023",
    readCount: 2,
    avgRating: 4.57,
    notes: "None",
  },
  {
    id: 202533930,
    title: "Iron Flame",
    author: "Rebecca Yarros",
    year: 2024,
    rating: 4,
    pages: 623,
    genre: "Romantasy",
    date: "Oct 31, 2024",
    dateStarted: "Oct 21, 2024",
    datePub: "Nov 07, 2023",
    readCount: 2,
    avgRating: 4.35,
    notes: "None",
  },
  {
    id: 76703559,
    title: "Throne of Glass",
    author: "Sarah J. Maas",
    year: 2024,
    rating: 3,
    pages: 406,
    genre: "Fantasy",
    date: "Nov 10, 2024",
    dateStarted: "Nov 03, 2024",
    datePub: "Aug 07, 2012",
    readCount: 1,
    avgRating: 4.18,
    notes: "None",
  },
  {
    id: 76705490,
    title: "Crown of Midnight",
    author: "Sarah J. Maas",
    year: 2024,
    rating: 3,
    pages: 420,
    genre: "Fantasy",
    date: "Nov 14, 2024",
    dateStarted: "Nov 10, 2024",
    datePub: "Aug 15, 2013",
    readCount: 1,
    avgRating: 4.36,
    notes: "None",
  },
  {
    id: 76706470,
    title: "Heir of Fire",
    author: "Sarah J. Maas",
    year: 2024,
    rating: 4,
    pages: 576,
    genre: "Fantasy",
    date: "Nov 18, 2024",
    dateStarted: "Nov 14, 2024",
    datePub: "Sep 02, 2014",
    readCount: 1,
    avgRating: 4.45,
    notes: "None",
  },
  {
    id: 126062562,
    title: "The Assassin's Blade",
    author: "Sarah J. Maas",
    year: 2024,
    rating: 3,
    pages: 451,
    genre: "Fantasy",
    date: "Nov 21, 2024",
    dateStarted: "Nov 18, 2024",
    datePub: "Mar 04, 2014",
    readCount: 1,
    avgRating: 4.20,
    notes: "None",
  },
  {
    id: 76707900,
    title: "Queen of Shadows",
    author: "Sarah J. Maas",
    year: 2024,
    rating: 4,
    pages: 648,
    genre: "Fantasy",
    date: "Nov 25, 2024",
    dateStarted: "Nov 21, 2024",
    datePub: "Sep 01, 2015",
    readCount: 1,
    avgRating: 4.62,
    notes: "None",
  },
  {
    id: 76713323,
    title: "Empire of Storms",
    author: "Sarah J. Maas",
    year: 2024,
    rating: 5,
    pages: 733,
    genre: "Fantasy",
    date: "Nov 30, 2024",
    dateStarted: "Nov 25, 2024",
    datePub: "Sep 06, 2016",
    readCount: 1,
    avgRating: 4.63,
    notes: "None",
  },
  {
    id: 76714487,
    title: "Tower of Dawn",
    author: "Sarah J. Maas",
    year: 2024,
    rating: 5,
    pages: 688,
    genre: "Fantasy",
    date: "Nov 30, 2024",
    dateStarted: "Nov 25, 2024",
    datePub: "Sep 05, 2017",
    readCount: 1,
    avgRating: 4.28,
    notes: "None",
  },
  {
    id: 76715522,
    title: "Kingdom of Ash",
    author: "Sarah J. Maas",
    year: 2024,
    rating: 5,
    pages: 984,
    genre: "Fantasy",
    date: "Dec 05, 2024",
    dateStarted: "Nov 30, 2024",
    datePub: "Oct 23, 2018",
    readCount: 1,
    avgRating: 4.71,
    notes: "None",
  },
  {
    id: 217536270,
    title: "Quicksilver",
    author: "Callie Hart",
    year: 2024,
    rating: 5,
    pages: 624,
    genre: "Romantasy",
    date: "Dec 26, 2024",
    dateStarted: "Dec 22, 2024",
    datePub: "Jun 04, 2024",
    readCount: 1,
    avgRating: 4.34,
    notes: "None",
  },

  // 2025 Books
  {
    id: 44778083,
    title: "House of Earth and Blood",
    author: "Sarah J. Maas",
    year: 2025,
    rating: 3,
    pages: 803,
    genre: "Romantasy",
    date: "Jan 07, 2025",
    dateStarted: "Dec 27, 2024",
    datePub: "Mar 03, 2020",
    readCount: 1,
    avgRating: 4.25,
    notes: "None",
  },
  {
    id: 40132775,
    title: "House of Sky and Breath",
    author: "Sarah J. Maas",
    year: 2025,
    rating: 4,
    pages: 805,
    genre: "Romantasy",
    date: "Jan 15, 2025",
    dateStarted: "Jan 07, 2025",
    datePub: "Feb 15, 2022",
    readCount: 1,
    avgRating: 4.31,
    notes: "None",
  },
  {
    id: 52857700,
    title: "House of Flame and Shadow",
    author: "Sarah J. Maas",
    year: 2025,
    rating: 5,
    pages: 835,
    genre: "Romantasy",
    date: "Jan 26, 2025",
    dateStarted: "Jan 15, 2025",
    datePub: "Jan 30, 2024",
    readCount: 1,
    avgRating: 4.18,
    notes: "None",
  },
  {
    id: 61431923,
    title: "Fourth Wing",
    author: "Rebecca Yarros",
    year: 2025,
    rating: 5,
    pages: 517,
    genre: "Romantasy",
    date: "Feb 01, 2025",
    dateStarted: "Jan 26, 2025",
    datePub: "May 02, 2023",
    readCount: 2,
    avgRating: 4.57,
    notes: "Re-read",
  },
  {
    id: 202533931,
    title: "Iron Flame",
    author: "Rebecca Yarros",
    year: 2025,
    rating: 4,
    pages: 623,
    genre: "Romantasy",
    date: "Feb 10, 2025",
    dateStarted: "Feb 01, 2025",
    datePub: "Nov 07, 2023",
    readCount: 2,
    avgRating: 4.35,
    notes: "Re-read",
  },
  {
    id: 209439446,
    title: "Onyx Storm",
    author: "Rebecca Yarros",
    year: 2025,
    rating: 4,
    pages: 544,
    genre: "Romantasy",
    date: "Feb 18, 2025",
    dateStarted: "Feb 10, 2025",
    datePub: "Jan 21, 2025",
    readCount: 1,
    avgRating: 4.21,
    notes: "None",
  },
  {
    id: 202507554,
    title: "When the Moon Hatched",
    author: "Sarah A. Parker",
    year: 2025,
    rating: 3,
    pages: 718,
    genre: "Romantasy",
    date: "Mar 06, 2025",
    dateStarted: "Feb 19, 2025",
    datePub: "Nov 24, 2024",
    readCount: 1,
    avgRating: 3.99,
    notes: "None",
  },
  {
    id: 60039506,
    title: "Manacled",
    author: "SenLinYu",
    year: 2025,
    rating: 4,
    pages: 945,
    genre: "Fanfic",
    date: "Mar 15, 2025",
    dateStarted: "Mar 04, 2025",
    datePub: "Aug 19, 2019",
    readCount: 2,
    avgRating: 4.63,
    notes: "Re-read",
  },
  {
    id: 58340706,
    title: "One Dark Window",
    author: "Rachel Gillig",
    year: 2025,
    rating: 5,
    pages: 432,
    genre: "Romantasy",
    date: "Mar 18, 2025",
    dateStarted: "Mar 16, 2025",
    datePub: "Sep 27, 2022",
    readCount: 1,
    avgRating: 4.27,
    notes: "None",
  },
  {
    id: 63910262,
    title: "Two Twisted Crowns",
    author: "Rachel Gillig",
    year: 2025,
    rating: 5,
    pages: 437,
    genre: "Romantasy",
    date: "Mar 23, 2025",
    dateStarted: "Mar 19, 2025",
    datePub: "Oct 17, 2023",
    readCount: 1,
    avgRating: 4.39,
    notes: "None",
  },
  {
    id: 58763686,
    title: "Haunting Adeline",
    author: "H.D. Carlton",
    year: 2025,
    rating: 2,
    pages: 583,
    genre: "Dark Romance",
    date: "Mar 28, 2025",
    dateStarted: "Mar 23, 2025",
    datePub: "Aug 12, 2021",
    readCount: 1,
    avgRating: 3.94,
    notes: "None",
  },
  {
    id: 59050133,
    title: "Hunting Adeline",
    author: "H.D. Carlton",
    year: 2025,
    rating: 2,
    pages: 684,
    genre: "Dark Romance",
    date: "Apr 09, 2025",
    dateStarted: "Mar 28, 2025",
    datePub: "Jan 25, 2022",
    readCount: 1,
    avgRating: 4.07,
    notes: "None",
  },
  {
    id: 60714999,
    title: "The Serpent and the Wings of Night",
    author: "Carissa Broadbent",
    year: 2025,
    rating: 5,
    pages: 504,
    genre: "Romantasy",
    date: "Apr 12, 2025",
    dateStarted: "Apr 10, 2025",
    datePub: "Aug 16, 2022",
    readCount: 1,
    avgRating: 4.27,
    notes: "None",
  },
  {
    id: 217454286,
    title: "The Ashes and the Star-Cursed King",
    author: "Carissa Broadbent",
    year: 2025,
    rating: 4,
    pages: 737,
    genre: "Romantasy",
    date: "Apr 25, 2025",
    dateStarted: "Apr 13, 2025",
    datePub: "Apr 14, 2023",
    readCount: 1,
    avgRating: 4.07,
    notes: "None",
  },
  {
    id: 7406308212,
    title: "The Book of Azrael",
    author: "Amber V. Nicole",
    year: 2025,
    rating: 5,
    pages: 572,
    genre: "Romantasy",
    date: "May 01, 2025",
    dateStarted: "Apr 26, 2025",
    datePub: "Apr 26, 2022",
    readCount: 1,
    avgRating: 4.12,
    notes: "None",
  },
  {
    id: 7484619744,
    title: "The Throne of Broken Gods",
    author: "Amber V. Nicole",
    year: 2025,
    rating: 5,
    pages: 728,
    genre: "Romantasy",
    date: "May 08, 2025",
    dateStarted: "May 01, 2025",
    datePub: "May 18, 2023",
    readCount: 1,
    avgRating: 4.21,
    notes: "None",
  },
  {
    id: 7484619994,
    title: "The Dawn of the Cursed Queen",
    author: "Amber V. Nicole",
    year: 2025,
    rating: 5,
    pages: 581,
    genre: "Romantasy",
    date: "May 21, 2025",
    dateStarted: "May 10, 2025",
    datePub: "May 28, 2024",
    readCount: 1,
    avgRating: 4.32,
    notes: "None",
  },
  {
    id: 7623814621,
    title: "Animal Farm",
    author: "George Orwell",
    year: 2025,
    rating: 5,
    pages: 141,
    genre: "Fiction",
    date: "Jun 03, 2025",
    dateStarted: "Jun 01, 2025",
    datePub: "Aug 17, 1945",
    readCount: 1,
    avgRating: 4.01,
    notes: "None",
  },
  {
    id: 6942919342,
    title: "A Court of Thorns and Roses",
    author: "Sarah J. Maas",
    year: 2025,
    rating: 3,
    pages: 419,
    genre: "Romantasy",
    date: "Jun 24, 2025",
    dateStarted: "Jun 22, 2025",
    datePub: "May 05, 2015",
    readCount: 2,
    avgRating: 4.16,
    notes: "Re-read",
  },
  {
    id: 6942935034,
    title: "A Court of Mist and Fury",
    author: "Sarah J. Maas",
    year: 2025,
    rating: 5,
    pages: 626,
    genre: "Romantasy",
    date: "Jun 30, 2025",
    dateStarted: "Jun 25, 2025",
    datePub: "May 03, 2016",
    readCount: 2,
    avgRating: 4.64,
    notes: "Re-read",
  },
  {
    id: 7406314349,
    title: "Yellowface",
    author: "R.F. Kuang",
    year: 2025,
    rating: 3,
    pages: 319,
    genre: "Fiction",
    date: "Jul 04, 2025",
    dateStarted: "Jul 01, 2025",
    datePub: "May 16, 2023",
    readCount: 1,
    avgRating: 3.93,
    notes: "None",
  },
  {
    id: 7633325425,
    title: "Heartless Hunter",
    author: "Kristen Ciccarelli",
    year: 2025,
    rating: 5,
    pages: 406,
    genre: "Romantasy",
    date: "Jul 10, 2025",
    dateStarted: "Jul 05, 2025",
    datePub: "Apr 30, 2024",
    readCount: 1,
    avgRating: 4.15,
    notes: "None",
  },
  {
    id: 7406309737,
    title: "Rebel Witch",
    author: "Kristen Ciccarelli",
    year: 2025,
    rating: 5,
    pages: 464,
    genre: "Romantasy",
    date: "Jul 12, 2025",
    dateStarted: "Jul 10, 2025",
    datePub: "Feb 04, 2025",
    readCount: 1,
    avgRating: 4.42,
    notes: "None",
  },
  {
    id: 7406309075,
    title: "The Awakening",
    author: "Caroline Peckham",
    year: 2025,
    rating: 5,
    pages: 436,
    genre: "Romantasy",
    date: "Jul 15, 2025",
    dateStarted: "Jul 12, 2025",
    datePub: "Aug 14, 2019",
    readCount: 1,
    avgRating: 4.02,
    notes: "None",
  },
  {
    id: 7772482866,
    title: "Ruthless Fae",
    author: "Caroline Peckham",
    year: 2025,
    rating: 4,
    pages: 475,
    genre: "Romantasy",
    date: "Jul 20, 2025",
    dateStarted: "Jul 15, 2025",
    datePub: "Oct 31, 2019",
    readCount: 1,
    avgRating: 4.15,
    notes: "None",
  },
  {
    id: 7772483376,
    title: "The Reckoning",
    author: "Caroline Peckham",
    year: 2025,
    rating: 5,
    pages: 562,
    genre: "Romantasy",
    date: "Jul 25, 2025",
    dateStarted: "Jul 20, 2025",
    datePub: "Jan 28, 2020",
    readCount: 1,
    avgRating: 4.22,
    notes: "None",
  },
  {
    id: 7772484327,
    title: "Dark Fae",
    author: "Caroline Peckham",
    year: 2025,
    rating: 3,
    pages: 536,
    genre: "Romantasy",
    date: "Jul 28, 2025",
    dateStarted: "Jul 25, 2025",
    datePub: "Nov 30, 2019",
    readCount: 1,
    avgRating: 4.21,
    notes: "None",
  },
  {
    id: 7779097113,
    title: "Savage Fae",
    author: "Caroline Peckham",
    year: 2025,
    rating: 2,
    pages: 513,
    genre: "Romantasy",
    date: "Jul 28, 2025",
    dateStarted: "Jul 28, 2025",
    datePub: "Jan 31, 2020",
    readCount: 1,
    avgRating: 4.18,
    notes: "None",
  },
  {
    id: 7797888957,
    title: "Vicious Fae",
    author: "Caroline Peckham",
    year: 2025,
    rating: 2,
    pages: 678,
    genre: "Romantasy",
    date: "Aug 05, 2025",
    dateStarted: "Jul 28, 2025",
    datePub: "Feb 21, 2020",
    readCount: 1,
    avgRating: 4.22,
    notes: "None",
  },
  {
    id: 7830749722,
    title: "Broken Fae",
    author: "Caroline Peckham",
    year: 2025,
    rating: 2,
    pages: 664,
    genre: "Romantasy",
    date: "Aug 14, 2025",
    dateStarted: "Aug 04, 2025",
    datePub: "Aug 31, 2020",
    readCount: 1,
    avgRating: 4.27,
    notes: "None",
  },
  {
    id: 7830750304,
    title: "Warrior Fae",
    author: "Caroline Peckham",
    year: 2025,
    rating: 2,
    pages: 680,
    genre: "Romantasy",
    date: "Sep 19, 2025",
    dateStarted: "Aug 14, 2025",
    datePub: "Apr 30, 2021",
    readCount: 1,
    avgRating: 4.28,
    notes: "None",
  },
  {
    id: 7955981318,
    title: "Shadow Princess",
    author: "Caroline Peckham",
    year: 2025,
    rating: 4,
    pages: 724,
    genre: "Romantasy",
    date: "Sep 24, 2025",
    dateStarted: "Sep 20, 2025",
    datePub: "Jan 13, 2020",
    readCount: 1,
    avgRating: 4.27,
    notes: "None",
  },
  {
    id: 7955983836,
    title: "Cursed Fates",
    author: "Caroline Peckham",
    year: 2025,
    rating: 4,
    pages: 886,
    genre: "Romantasy",
    date: "Sep 28, 2025",
    dateStarted: "Sep 24, 2025",
    datePub: "Dec 21, 2020",
    readCount: 1,
    avgRating: 4.31,
    notes: "None",
  },
  {
    id: 7955985284,
    title: "Fated Throne",
    author: "Caroline Peckham",
    year: 2025,
    rating: 4,
    pages: 823,
    genre: "Romantasy",
    date: "Oct 07, 2025",
    dateStarted: "Sep 28, 2025",
    datePub: "Dec 25, 2020",
    readCount: 1,
    avgRating: 4.32,
    notes: "None",
  },
];

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

// Book cover dominant colors - extracted from cover images
// Used for ambient background effects on hover
export const bookCoverColors: Record<number, string> = {
  // ACOTAR Series - deep reds and blacks
  6942919341: "#8B0000", // A Court of Thorns and Roses - dark red
  6942919342: "#8B0000", // A Court of Thorns and Roses (re-read)
  6942935033: "#1a1a3e", // A Court of Mist and Fury - deep blue/purple
  6942935034: "#1a1a3e", // A Court of Mist and Fury (re-read)
  50659472: "#8B4513", // A Court of Wings and Ruin - bronze/brown
  50659471: "#2F4F4F", // A Court of Frost and Starlight - dark slate
  53138095: "#800020", // A Court of Silver Flames - burgundy
  // Empyrean Series - blacks and golds
  61431922: "#1a1a1a", // Fourth Wing - black with gold accents
  61431923: "#1a1a1a", // Fourth Wing (re-read)
  202533930: "#8B4513", // Iron Flame - copper/bronze
  202533931: "#8B4513", // Iron Flame (re-read)
  209439446: "#0a0a0a", // Onyx Storm - deep black
  // Throne of Glass Series - greens and golds
  76703559: "#2d5a27", // Throne of Glass - forest green
  76705490: "#1a1a3e", // Crown of Midnight - midnight blue
  76706470: "#8B4513", // Heir of Fire - fiery orange/brown
  126062562: "#2d2d2d", // The Assassin's Blade - dark gray
  76707900: "#4a0e4e", // Queen of Shadows - deep purple
  76713323: "#1a3a5c", // Empire of Storms - stormy blue
  76714487: "#c4a35a", // Tower of Dawn - golden
  76715522: "#1a1a1a", // Kingdom of Ash - charcoal black
  // Crescent City Series - vibrant colors
  44778083: "#8B0000", // House of Earth and Blood - crimson
  40132775: "#1e3a5f", // House of Sky and Breath - navy blue
  52857700: "#4a0e4e", // House of Flame and Shadow - purple/flame
  // Other Books
  217536270: "#c0c0c0", // Quicksilver - silver
  202507554: "#2d3436", // When the Moon Hatched - dark teal
  58340706: "#1a1a2e", // One Dark Window - dark navy
  63910262: "#2d1f3d", // Two Twisted Crowns - deep purple
  58763686: "#1a1a1a", // Haunting Adeline - black
  59050133: "#8B0000", // Hunting Adeline - blood red
  60714999: "#0d1b2a", // The Serpent and the Wings of Night - midnight
  217454286: "#3d1c02", // The Ashes and the Star-Cursed King - burnt orange
  7623814621: "#90EE90", // Animal Farm - pastoral green
  7406314349: "#FFD700", // Yellowface - yellow
  7633325425: "#8B0000", // Heartless Hunter - crimson
  7406309737: "#4a0e4e", // Rebel Witch - purple
  // Zodiac Academy Series - cosmic purples and blues
  7406309075: "#1a1a3e", // The Awakening - cosmic blue
  7772482866: "#4a0e4e", // Ruthless Fae - purple
  7772483376: "#1a3a5c", // The Reckoning - stormy blue
  7955981318: "#2d1f3d", // Shadow Princess - dark purple
  7955983836: "#0d1b2a", // Cursed Fates - midnight blue
  7955985284: "#c4a35a", // Fated Throne - golden
  // Ruthless Boys Series
  7772484327: "#1a1a2e", // Dark Fae - dark navy
  7779097113: "#4a0e4e", // Savage Fae - purple
  7797888957: "#8B0000", // Vicious Fae - crimson
  7830749722: "#2d2d2d", // Broken Fae - charcoal
  7830750304: "#3d1c02", // Warrior Fae - bronze
  // Gods & Monsters Series
  7406308212: "#0d1b2a", // The Book of Azrael - midnight
  7484619744: "#c4a35a", // The Throne of Broken Gods - gold
  7484619994: "#4a0e4e", // The Dawn of the Cursed Queen - purple
  // Fanfic
  60039506: "#1a1a1a", // Manacled - black
};
