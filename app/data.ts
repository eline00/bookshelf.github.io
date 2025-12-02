export const yearlyGoals = {
  2024: { target: 12, label: "Habit Formation" },
  2025: { target: 15, label: "Deep Dive Sci-Fi" },
  2026: { target: 20, label: "Consistency" }
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
  notes: string;
}

export const books: Book[] = [
  // 2024 Books
  { id: 1, title: "Dune", author: "Frank Herbert", year: 2024, rating: 5, pages: 412, genre: "Sci-Fi", date: "2024-01-15", notes: "Masterpiece world building." },
  { id: 2, title: "The Hobbit", author: "J.R.R. Tolkien", year: 2024, rating: 4, pages: 310, genre: "Fantasy", date: "2024-02-10", notes: "Comfort read." },
  { id: 3, title: "1984", author: "George Orwell", year: 2024, rating: 4.5, pages: 328, genre: "Classic", date: "2024-03-12", notes: "Chillingly relevant." },
  { id: 4, title: "Sapiens", author: "Yuval Noah Harari", year: 2024, rating: 5, pages: 443, genre: "Non-Fiction", date: "2024-04-20", notes: "Changed my perspective." },
  { id: 10, title: "Name of the Wind", author: "Patrick Rothfuss", year: 2024, rating: 5, pages: 662, genre: "Fantasy", date: "2024-05-20", notes: "Beautiful prose." },
  { id: 12, title: "Educated", author: "Tara Westover", year: 2024, rating: 5, pages: 352, genre: "Non-Fiction", date: "2024-07-18", notes: "Heartbreaking memoir." },

  // 2025 Books
  { id: 5, title: "Mistborn", author: "Brandon Sanderson", year: 2025, rating: 5, pages: 541, genre: "Fantasy", date: "2025-01-22", notes: "Great magic system." },
  { id: 6, title: "Foundation", author: "Isaac Asimov", year: 2025, rating: 4, pages: 255, genre: "Sci-Fi", date: "2025-02-28", notes: "Grand scope." },
  { id: 7, title: "Pride & Prejudice", author: "Jane Austen", year: 2025, rating: 4, pages: 279, genre: "Classic", date: "2025-03-10", notes: "Witty banter." },
  { id: 11, title: "Hyperion", author: "Dan Simmons", year: 2025, rating: 4.5, pages: 482, genre: "Sci-Fi", date: "2025-06-15", notes: "Unique structure." },

  // 2026 Books
  { id: 8, title: "Three-Body Problem", author: "Cixin Liu", year: 2026, rating: 5, pages: 400, genre: "Sci-Fi", date: "2026-01-18", notes: "Mind bending." },
  { id: 9, title: "Atomic Habits", author: "James Clear", year: 2026, rating: 4.5, pages: 320, genre: "Non-Fiction", date: "2026-02-10", notes: "Practical advice." }
];

export const genreGradients: Record<string, string> = {
  'Sci-Fi': 'linear-gradient(45deg, #000428, #004e92)',
  'Fantasy': 'linear-gradient(45deg, #134E5E, #71B280)',
  'Classic': 'linear-gradient(45deg, #4b0000, #8E0E00)',
  'Non-Fiction': 'linear-gradient(45deg, #FF8008, #FFC837)',
  'default': 'linear-gradient(45deg, #232526, #414345)'
};
