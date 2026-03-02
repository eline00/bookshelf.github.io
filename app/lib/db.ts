import postgres from "postgres";
import type { Book } from "../data";

const sql = postgres(process.env.CONNECTION_STRING!);

interface BookRow {
  id: string;
  title: string;
  author: string;
  year: number;
  rating: number;
  pages: number;
  genre: string;
  date: string;
  date_started: string;
  date_pub: string;
  read_count: number;
  avg_rating: string;
  notes: string;
  cover_color: string | null;
}

export async function fetchBooks(): Promise<Book[]> {
  const rows = await sql<BookRow[]>`SELECT * FROM books ORDER BY id`;

  return rows.map((row) => ({
    id: Number(row.id),
    title: row.title,
    author: row.author,
    year: row.year,
    rating: row.rating,
    pages: row.pages,
    genre: row.genre,
    date: row.date,
    dateStarted: row.date_started,
    datePub: row.date_pub,
    readCount: row.read_count,
    avgRating: Number(row.avg_rating),
    notes: row.notes,
    coverColor: row.cover_color,
  }));
}

export async function fetchYearlyGoals(): Promise<Record<number, number>> {
  const rows = await sql<{ year: number; goal: number }[]>`
    SELECT * FROM yearly_goals
  `;

  const goals: Record<number, number> = {};
  for (const row of rows) {
    goals[row.year] = row.goal;
  }
  return goals;
}

