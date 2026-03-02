import { fetchBooks, fetchYearlyGoals } from "./lib/db";
import BookshelfApp from "./BookshelfApp";

export default async function Home() {
  const [books, yearlyGoals] = await Promise.all([
    fetchBooks(),
    fetchYearlyGoals(),
  ]);

  return <BookshelfApp books={books} yearlyGoals={yearlyGoals} />;
}
