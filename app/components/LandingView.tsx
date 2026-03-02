"use client";

import { useMemo } from "react";
import type { Book } from "../data";

// Consistent number formatting to avoid hydration mismatch
const formatNumber = (n: number): string => n.toLocaleString("en-US");

interface LandingViewProps {
  onNavigate: (view: "timeline" | "analytics" | "visuals") => void;
  books: Book[];
  yearlyGoals: Record<number, number>;
}

export default function LandingView({ onNavigate, books, yearlyGoals }: LandingViewProps) {
  // Calculate summary stats
  const stats = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const thisYearBooks = books.filter((b) => b.year === currentYear);
    const totalPages = books.reduce((sum, b) => sum + b.pages, 0);
    const totalBooks = books.length;
    const avgRating =
      books.length > 0
        ? Math.round((books.reduce((sum, b) => sum + b.rating, 0) / books.length) * 10) / 10
        : 0;

    // Recent books (last 5)
    const recentBooks = [...books]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    // Top rated books
    const topRated = [...books].sort((a, b) => b.rating - a.rating).slice(0, 3);

    // Genre breakdown
    const genreCounts: Record<string, number> = {};
    books.forEach((b) => {
      genreCounts[b.genre] = (genreCounts[b.genre] || 0) + 1;
    });
    const genres = Object.entries(genreCounts)
      .map(([genre, count]) => ({ genre, count, percent: Math.round((count / totalBooks) * 100) }))
      .sort((a, b) => b.count - a.count);

    // Author breakdown
    const authorCounts: Record<string, number> = {};
    books.forEach((b) => {
      authorCounts[b.author] = (authorCounts[b.author] || 0) + 1;
    });
    const topAuthor = Object.entries(authorCounts).sort((a, b) => b[1] - a[1])[0];

    // Current year progress
    const yearGoal = yearlyGoals[currentYear] || 0;
    const yearProgress = yearGoal > 0 ? Math.round((thisYearBooks.length / yearGoal) * 100) : 0;

    // Trees of paper
    const treesWorth = totalPages / 16666;

    return {
      totalBooks,
      totalPages,
      avgRating,
      recentBooks,
      topRated,
      genres,
      topAuthor: topAuthor ? { name: topAuthor[0], count: topAuthor[1] } : null,
      currentYear,
      thisYearBooks: thisYearBooks.length,
      yearGoal,
      yearProgress,
      treesWorth,
      uniqueAuthors: Object.keys(authorCounts).length,
    };
  }, [books, yearlyGoals]);

  return (
    <div id="landing-wrapper">
      {/* Hero Section */}
      <section className="landing-hero">
        <h1 className="landing-title">BOOKSHELF</h1>
        <p className="landing-subtitle">
          {stats.totalBooks} BOOKS / {formatNumber(stats.totalPages)} PAGES / {stats.uniqueAuthors} AUTHORS
        </p>
      </section>

      {/* Summary Sections Grid */}
      <div className="landing-grid">
        {/* TIMELINE SECTION */}
        <section
          className="landing-section timeline-section"
          onClick={() => onNavigate("timeline")}
        >
          <div className="section-header">
            <span className="section-label">01</span>
            <h2 className="section-title">TIMELINE</h2>
            <span className="section-arrow">-&gt;</span>
          </div>

          <div className="section-content">
            {/* Year Progress */}
            <div className="timeline-progress">
              <div className="progress-info">
                <span className="progress-year">{stats.currentYear}</span>
                <span className="progress-count">
                  {stats.thisYearBooks} / {stats.yearGoal}
                </span>
              </div>
              <div className="progress-bar-mini">
                <div
                  className="progress-fill-mini"
                  style={{ width: `${Math.min(100, stats.yearProgress)}%` }}
                />
              </div>
              <span className="progress-percent">{stats.yearProgress}%</span>
            </div>

            {/* Recent Books Preview */}
            <div className="recent-books">
              <span className="subsection-label">RECENTLY READ</span>
              <div className="recent-list">
                {stats.recentBooks.map((book, i) => (
                  <div key={book.id} className="recent-item">
                    <span className="recent-index">{String(i + 1).padStart(2, "0")}</span>
                    <span className="recent-title">{book.title}</span>
                    <span className="recent-rating">{"*".repeat(book.rating)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="section-cta">
            VIEW FULL TIMELINE
          </div>
        </section>

        {/* ANALYTICS SECTION */}
        <section
          className="landing-section analytics-section"
          onClick={() => onNavigate("analytics")}
        >
          <div className="section-header">
            <span className="section-label">02</span>
            <h2 className="section-title">ANALYTICS</h2>
            <span className="section-arrow">-&gt;</span>
          </div>

          <div className="section-content">
            {/* Key Stats Grid */}
            <div className="stats-grid">
              <div className="stat-box">
                <span className="stat-value-big">{stats.avgRating}</span>
                <span className="stat-label-small">AVG RATING</span>
              </div>
              <div className="stat-box">
                <span className="stat-value-big">{stats.uniqueAuthors}</span>
                <span className="stat-label-small">AUTHORS</span>
              </div>
              <div className="stat-box">
                <span className="stat-value-big">{stats.genres.length}</span>
                <span className="stat-label-small">GENRES</span>
              </div>
              <div className="stat-box">
                <span className="stat-value-big">{Math.round(stats.totalPages / stats.totalBooks)}</span>
                <span className="stat-label-small">AVG PAGES</span>
              </div>
            </div>

            {/* Genre Breakdown Mini */}
            <div className="genre-preview">
              <span className="subsection-label">GENRE MIX</span>
              <div className="genre-bars">
                {stats.genres.slice(0, 4).map((g) => (
                  <div key={g.genre} className="genre-bar-row">
                    <span className="genre-name">{g.genre}</span>
                    <div className="genre-bar-track">
                      <div className="genre-bar-fill" style={{ width: `${g.percent}%` }} />
                    </div>
                    <span className="genre-percent">{g.percent}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Author */}
            {stats.topAuthor && (
              <div className="top-author">
                <span className="subsection-label">TOP AUTHOR</span>
                <span className="author-name">{stats.topAuthor.name}</span>
                <span className="author-count">{stats.topAuthor.count} books</span>
              </div>
            )}
          </div>

          <div className="section-cta">
            VIEW WRAPPED STATS
          </div>
        </section>

        {/* VISUALS SECTION */}
        <section
          className="landing-section visuals-section"
          onClick={() => onNavigate("visuals")}
        >
          <div className="section-header">
            <span className="section-label">03</span>
            <h2 className="section-title">VISUALS</h2>
            <span className="section-arrow">-&gt;</span>
          </div>

          <div className="section-content">
            {/* Page Tower Preview */}
            <div className="tower-preview">
              <div className="tower-mini">
                {[...books]
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .slice(-12)
                  .map((book) => (
                    <div
                      key={book.id}
                      className="tower-block-mini"
                      style={{ height: `${Math.max(4, book.pages * 0.015)}px` }}
                      title={book.title}
                    />
                  ))}
              </div>
              <div className="tower-stats">
                <div className="tower-stat">
                  <span className="tower-value">{formatNumber(stats.totalPages)}</span>
                  <span className="tower-label">PAGES</span>
                </div>
                <div className="tower-stat">
                  <span className="tower-value">{stats.treesWorth.toFixed(1)}</span>
                  <span className="tower-label">TREES</span>
                </div>
              </div>
            </div>

            {/* View Mode Icons */}
            <div className="view-modes">
              <span className="subsection-label">EXPLORE AS</span>
              <div className="mode-icons">
                <div className="mode-icon">
                  <div className="icon-tower">
                    <div className="icon-block" />
                    <div className="icon-block" />
                    <div className="icon-block" />
                  </div>
                  <span>TOWER</span>
                </div>
                <div className="mode-icon">
                  <div className="icon-shelf">
                    <div className="icon-spine" />
                    <div className="icon-spine" />
                    <div className="icon-spine" />
                    <div className="icon-spine" />
                  </div>
                  <span>SHELF</span>
                </div>
                <div className="mode-icon">
                  <div className="icon-tree">
                    <div className="tree-top" />
                    <div className="tree-trunk" />
                  </div>
                  <span>FOREST</span>
                </div>
              </div>
            </div>
          </div>

          <div className="section-cta">
            EXPLORE VISUALIZATIONS
          </div>
        </section>
      </div>

      {/* Footer Stats */}
      <div className="landing-footer">
        <div className="footer-stat">
          <span className="footer-value">{stats.totalBooks}</span>
          <span className="footer-label">BOOKS READ</span>
        </div>
        <div className="footer-divider" />
        <div className="footer-stat">
          <span className="footer-value">{formatNumber(stats.totalPages)}</span>
          <span className="footer-label">PAGES CONSUMED</span>
        </div>
        <div className="footer-divider" />
        <div className="footer-stat">
          <span className="footer-value">{stats.avgRating}</span>
          <span className="footer-label">AVG RATING</span>
        </div>
      </div>
    </div>
  );
}
