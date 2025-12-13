"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { books, Book } from "../data";

gsap.registerPlugin(ScrollTrigger);

interface YearStats {
  year: number;
  books: Book[];
  totalBooks: number;
  totalPages: number;
  avgRating: number;
  bestRatedBooks: Book[];
  worstRatedBook: Book | null;
  longestBook: Book | null;
  shortestBook: Book | null;
  favoriteAuthor: { name: string; count: number };
  favoriteGenre: { name: string; count: number };
  genreBreakdown: { genre: string; count: number; percent: number }[];
  authorBreakdown: { author: string; count: number }[];
  avgPagesPerDay: number;
  fastestRead: { book: Book; days: number; pagesPerDay: number } | null;
  slowestRead: { book: Book; days: number; pagesPerDay: number } | null;
  monthlyBreakdown: { month: string; count: number }[];
  ratingDistribution: { rating: number; count: number }[];
  totalReadingDays: number;
  avgDaysPerBook: number;
  rereadCount: number;
  weekdayBreakdown: { day: string; count: number }[];
  quarterBreakdown: { quarter: string; count: number; percent: number }[];
  avgPagesPerBook: number;
  longestStreak: number;
  uniqueAuthors: number;
  uniqueGenres: number;
}

function calculateYearStats(year: number): YearStats {
  const yearBooks = books.filter((b) => b.year === year);

  // Sort by rating for best/worst
  const sortedByRating = [...yearBooks].sort((a, b) => b.rating - a.rating);
  const bestRatedBooks = sortedByRating.filter(
    (b) => b.rating === sortedByRating[0]?.rating
  );
  const worstRatedBook = sortedByRating[sortedByRating.length - 1] || null;

  // Sort by pages for longest/shortest
  const sortedByPages = [...yearBooks].sort((a, b) => b.pages - a.pages);
  const longestBook = sortedByPages[0] || null;
  const shortestBook = sortedByPages[sortedByPages.length - 1] || null;

  // Author counts
  const authorCounts: Record<string, number> = {};
  yearBooks.forEach((b) => {
    authorCounts[b.author] = (authorCounts[b.author] || 0) + 1;
  });
  const authorBreakdown = Object.entries(authorCounts)
    .map(([author, count]) => ({ author, count }))
    .sort((a, b) => b.count - a.count);
  const favoriteAuthor = authorBreakdown[0] || { name: "N/A", count: 0 };

  // Genre counts
  const genreCounts: Record<string, number> = {};
  yearBooks.forEach((b) => {
    genreCounts[b.genre] = (genreCounts[b.genre] || 0) + 1;
  });
  const genreBreakdown = Object.entries(genreCounts)
    .map(([genre, count]) => ({
      genre,
      count,
      percent: Math.round((count / yearBooks.length) * 100),
    }))
    .sort((a, b) => b.count - a.count);
  const favoriteGenre = genreBreakdown[0] || { name: "N/A", count: 0 };

  // Reading speed calculations
  const booksWithSpeed = yearBooks.map((b) => {
    const start = new Date(b.dateStarted);
    const end = new Date(b.date);
    const days = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    );
    return { book: b, days, pagesPerDay: Math.round(b.pages / days) };
  });

  const sortedBySpeed = [...booksWithSpeed].sort(
    (a, b) => b.pagesPerDay - a.pagesPerDay
  );
  const fastestRead = sortedBySpeed[0] || null;
  const slowestRead = sortedBySpeed[sortedBySpeed.length - 1] || null;

  const totalReadingDays = booksWithSpeed.reduce((sum, b) => sum + b.days, 0);
  const avgDaysPerBook =
    yearBooks.length > 0 ? Math.round(totalReadingDays / yearBooks.length) : 0;
  const totalPages = yearBooks.reduce((sum, b) => sum + b.pages, 0);
  const avgPagesPerDay =
    totalReadingDays > 0 ? Math.round(totalPages / totalReadingDays) : 0;

  // Monthly breakdown
  const monthNames = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  const monthCounts: Record<number, number> = {};
  yearBooks.forEach((b) => {
    const month = new Date(b.date).getMonth();
    monthCounts[month] = (monthCounts[month] || 0) + 1;
  });
  const monthlyBreakdown = monthNames.map((month, i) => ({
    month,
    count: monthCounts[i] || 0,
  }));

  // Rating distribution
  const ratingCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  yearBooks.forEach((b) => {
    ratingCounts[b.rating] = (ratingCounts[b.rating] || 0) + 1;
  });
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: ratingCounts[rating] || 0,
  }));

  // Reread count
  const rereadCount = yearBooks.filter((b) => b.readCount > 1).length;

  // Average rating
  const totalRating = yearBooks.reduce((sum, b) => sum + b.rating, 0);
  const avgRating =
    yearBooks.length > 0
      ? Math.round((totalRating / yearBooks.length) * 10) / 10
      : 0;

  // Weekday breakdown (when books were finished)
  const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const weekdayCounts: Record<number, number> = {};
  yearBooks.forEach((b) => {
    const day = new Date(b.date).getDay();
    weekdayCounts[day] = (weekdayCounts[day] || 0) + 1;
  });
  const weekdayBreakdown = dayNames.map((day, i) => ({
    day,
    count: weekdayCounts[i] || 0,
  }));

  // Quarter breakdown
  const quarterCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  yearBooks.forEach((b) => {
    const month = new Date(b.date).getMonth();
    const quarter = Math.floor(month / 3) + 1;
    quarterCounts[quarter] = (quarterCounts[quarter] || 0) + 1;
  });
  const quarterBreakdown = [1, 2, 3, 4].map((q) => ({
    quarter: `Q${q}`,
    count: quarterCounts[q] || 0,
    percent:
      yearBooks.length > 0
        ? Math.round((quarterCounts[q] / yearBooks.length) * 100)
        : 0,
  }));

  // Average pages per book
  const avgPagesPerBook =
    yearBooks.length > 0 ? Math.round(totalPages / yearBooks.length) : 0;

  // Unique authors and genres
  const uniqueAuthors = Object.keys(authorCounts).length;
  const uniqueGenres = Object.keys(genreCounts).length;

  // Calculate longest reading streak (consecutive days with reading activity)
  const readingDates = new Set<string>();
  yearBooks.forEach((b) => {
    const start = new Date(b.dateStarted);
    const end = new Date(b.date);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      readingDates.add(d.toISOString().split("T")[0]);
    }
  });
  const sortedDates = [...readingDates].sort();
  let longestStreak = 0;
  let currentStreak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]);
    const curr = new Date(sortedDates[i]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      currentStreak++;
    } else {
      longestStreak = Math.max(longestStreak, currentStreak);
      currentStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, currentStreak);

  return {
    year,
    books: yearBooks,
    totalBooks: yearBooks.length,
    totalPages,
    avgRating,
    bestRatedBooks,
    worstRatedBook,
    longestBook,
    shortestBook,
    favoriteAuthor: {
      name: favoriteAuthor.author || "N/A",
      count: favoriteAuthor.count,
    },
    favoriteGenre: {
      name: favoriteGenre.genre || "N/A",
      count: favoriteGenre.count,
    },
    genreBreakdown,
    authorBreakdown: authorBreakdown.map((a) => ({
      author: a.author,
      count: a.count,
    })),
    avgPagesPerDay,
    fastestRead,
    slowestRead,
    monthlyBreakdown,
    ratingDistribution,
    totalReadingDays,
    avgDaysPerBook,
    rereadCount,
    weekdayBreakdown,
    quarterBreakdown,
    avgPagesPerBook,
    longestStreak,
    uniqueAuthors,
    uniqueGenres,
  };
}

export default function AnalyticsView() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const slidesRef = useRef<HTMLDivElement>(null);

  // Get available years
  const availableYears = useMemo(() => {
    const years = [...new Set(books.map((b) => b.year))].sort((a, b) => b - a);
    return years;
  }, []);

  // Get stats for selected year
  const stats = useMemo(() => {
    if (!selectedYear) return null;
    return calculateYearStats(selectedYear);
  }, [selectedYear]);

  // Setup scroll-triggered animations when year is selected
  useEffect(() => {
    if (!selectedYear || !slidesRef.current) return;

    const slides = gsap.utils.toArray<HTMLElement>(".wrapped-slide");

    // Kill existing triggers
    ScrollTrigger.getAll().forEach((t) => t.kill());

    // Animate each slide
    slides.forEach((slide, i) => {
      // Content elements
      const statNumbers = slide.querySelectorAll(".stat-number");
      const statLabels = slide.querySelectorAll(".stat-label");
      const statDetails = slide.querySelectorAll(".stat-detail");
      const barFills = slide.querySelectorAll(".bar-fill");
      const slideContent = slide.querySelector(".slide-content");

      // Initial state
      gsap.set(statNumbers, { opacity: 0, y: 50, scale: 0.8 });
      gsap.set(statLabels, { opacity: 0, y: 20 });
      gsap.set(statDetails, { opacity: 0, x: -30 });
      gsap.set(barFills, { scaleX: 0 });

      // Create timeline for this slide
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: slide,
          start: "top center",
          end: "center center",
          toggleActions: "play none none reverse",
          onEnter: () => setCurrentSlide(i),
          onEnterBack: () => setCurrentSlide(i),
        },
      });

      tl.to(statNumbers, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: "back.out(1.4)",
      })
        .to(
          statLabels,
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.05,
          },
          "-=0.4"
        )
        .to(
          statDetails,
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            stagger: 0.1,
          },
          "-=0.3"
        )
        .to(
          barFills,
          {
            scaleX: 1,
            duration: 1,
            stagger: 0.05,
            ease: "power2.out",
          },
          "-=0.5"
        );

      // Parallax exit
      gsap.to(slideContent, {
        y: -100,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: slide,
          start: "center top",
          end: "bottom top",
          scrub: true,
        },
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [selectedYear]);

  // Year selector animation
  useEffect(() => {
    if (selectedYear) return;

    const yearButtons = gsap.utils.toArray<HTMLElement>(".year-btn");
    gsap.fromTo(
      yearButtons,
      { opacity: 0, y: 50, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: "back.out(1.7)",
      }
    );
  }, [selectedYear]);

  // Back button handler
  const handleBack = () => {
    gsap.to(wrapperRef.current, {
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        setSelectedYear(null);
        setCurrentSlide(0);
        gsap.to(wrapperRef.current, { opacity: 1, duration: 0.3 });
      },
    });
  };

  // Render year selector
  if (!selectedYear) {
    return (
      <div id="analytics-wrapper" ref={wrapperRef}>
        <div className="year-selector">
          <h1 className="year-selector-title">YOUR READING</h1>
          <h2 className="year-selector-subtitle">WRAPPED</h2>
          <p className="year-selector-desc">Select a year to see your stats</p>

          <div className="year-buttons">
            {availableYears.map((year) => {
              const yearBooks = books.filter((b) => b.year === year);
              return (
                <button
                  key={year}
                  className="year-btn"
                  onClick={() => setSelectedYear(year)}
                >
                  <span className="year-btn-year">{year}</span>
                  <span className="year-btn-count">
                    {yearBooks.length} books
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Render wrapped slides
  if (!stats) return null;

  return (
    <div id="analytics-wrapper" ref={wrapperRef}>
      {/* Back button */}
      <button className="wrapped-back-btn" onClick={handleBack}>
        ← BACK
      </button>

      {/* Progress indicator */}
      <div className="wrapped-progress">
        {[...Array(14)].map((_, i) => (
          <div
            key={i}
            className={`progress-dot ${i <= currentSlide ? "active" : ""}`}
          />
        ))}
      </div>

      {/* Slides container */}
      <div className="wrapped-slides" ref={slidesRef}>
        {/* SLIDE 1: Year Intro */}
        <section className="wrapped-slide slide-intro">
          <div className="slide-content">
            {/* Decorative grid lines */}
            <div className="intro-grid-lines stat-detail">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="grid-line-h"
                  style={{ top: `${20 + i * 15}%` }}
                />
              ))}
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="grid-line-v"
                  style={{ left: `${20 + i * 15}%` }}
                />
              ))}
            </div>
            <div className="slide-year-huge">{stats.year}</div>
            <p className="stat-label">YOUR YEAR IN BOOKS</p>
            {/* Summary preview badges */}
            <div className="intro-badges stat-detail">
              <span className="intro-badge">{stats.totalBooks} BOOKS</span>
              <span className="intro-badge">
                {stats.totalPages.toLocaleString()} PAGES
              </span>
              <span className="intro-badge">{stats.uniqueAuthors} AUTHORS</span>
            </div>
          </div>
        </section>

        {/* SLIDE 2: Total Books with Book Stack Visualization */}
        <section className="wrapped-slide slide-total-books">
          <div className="slide-content">
            <p className="stat-label">YOU READ</p>
            <div className="stat-number huge">{stats.totalBooks}</div>
            <p className="stat-label">BOOKS THIS YEAR</p>

            {/* Book Stack Visualization */}
            <div className="book-stack-viz stat-detail">
              {stats.books
                .slice(0, Math.min(stats.totalBooks, 20))
                .map((book, i) => (
                  <div
                    key={book.id}
                    className="stack-book bar-fill"
                    style={{
                      width: `${Math.max(40, Math.min(100, book.pages / 5))}%`,
                      animationDelay: `${i * 0.05}s`,
                    }}
                    title={book.title}
                  />
                ))}
              {stats.totalBooks > 20 && (
                <div className="stack-overflow">
                  +{stats.totalBooks - 20} more
                </div>
              )}
            </div>

            {/* Quarterly breakdown mini chart */}
            <div className="quarter-mini-chart stat-detail">
              {stats.quarterBreakdown.map((q) => (
                <div key={q.quarter} className="quarter-block">
                  <div className="quarter-bar-container">
                    <div
                      className="quarter-bar bar-fill"
                      style={{ height: `${Math.max(10, q.percent)}%` }}
                    />
                  </div>
                  <span className="quarter-label">{q.quarter}</span>
                  <span className="quarter-count">{q.count}</span>
                </div>
              ))}
            </div>

            {stats.rereadCount > 0 && (
              <p className="stat-detail">
                Including {stats.rereadCount} reread
                {stats.rereadCount > 1 ? "s" : ""}
              </p>
            )}
          </div>
        </section>

        {/* SLIDE 3: Total Pages with Page Counter Visualization */}
        <section className="wrapped-slide slide-pages">
          <div className="slide-content">
            <p className="stat-label">THAT&apos;S A TOTAL OF</p>
            <div className="stat-number huge accent">
              {stats.totalPages.toLocaleString()}
            </div>
            <p className="stat-label">PAGES CONSUMED</p>

            {/* Page Lines Visualization */}
            <div className="page-lines-viz stat-detail">
              {[...Array(Math.min(50, Math.ceil(stats.totalPages / 100)))].map(
                (_, i) => (
                  <div
                    key={i}
                    className="page-line bar-fill"
                    style={{ animationDelay: `${i * 0.02}s` }}
                  />
                )
              )}
            </div>
            <p className="stat-detail page-lines-label">
              Each line = 100 pages
            </p>

            {/* Page Stats Grid */}
            <div className="page-stats-grid stat-detail">
              <div className="page-stat-cell">
                <span className="page-stat-value">{stats.avgPagesPerBook}</span>
                <span className="page-stat-label">AVG PAGES/BOOK</span>
              </div>
              <div className="page-stat-cell">
                <span className="page-stat-value">
                  {(stats.totalPages * 0.0001).toFixed(1)}m
                </span>
                <span className="page-stat-label">PAPER STACKED</span>
              </div>
            </div>
          </div>
        </section>

        {/* SLIDE 4: Reading Pace with Speedometer */}
        <section className="wrapped-slide slide-pace">
          <div className="slide-content">
            <p className="stat-label">YOUR READING PACE</p>

            {/* Speedometer Gauge */}
            <div className="speedometer-container stat-detail">
              <svg viewBox="0 0 200 120" className="speedometer-svg">
                {/* Background arc */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="#222"
                  strokeWidth="12"
                  strokeLinecap="round"
                />
                {/* Filled arc based on pages per day (assuming 100 is max) */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="var(--accent-color)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${
                    Math.min(stats.avgPagesPerDay, 100) * 2.51
                  } 251`}
                  className="bar-fill"
                />
                {/* Tick marks */}
                {[0, 25, 50, 75, 100].map((tick, i) => {
                  const angle = (180 - tick * 1.8) * (Math.PI / 180);
                  const x1 = 100 + 70 * Math.cos(angle);
                  const y1 = 100 - 70 * Math.sin(angle);
                  const x2 = 100 + 60 * Math.cos(angle);
                  const y2 = 100 - 60 * Math.sin(angle);
                  return (
                    <g key={tick}>
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#444"
                        strokeWidth="2"
                      />
                      <text
                        x={100 + 50 * Math.cos(angle)}
                        y={100 - 50 * Math.sin(angle)}
                        fill="#666"
                        fontSize="8"
                        textAnchor="middle"
                      >
                        {tick}
                      </text>
                    </g>
                  );
                })}
                {/* Center value */}
                <text
                  x="100"
                  y="85"
                  fill="#fff"
                  fontSize="24"
                  fontWeight="900"
                  textAnchor="middle"
                >
                  {stats.avgPagesPerDay}
                </text>
                <text
                  x="100"
                  y="100"
                  fill="#666"
                  fontSize="8"
                  textAnchor="middle"
                >
                  PAGES/DAY
                </text>
              </svg>
            </div>

            <div className="pace-stats">
              <div className="pace-stat">
                <div className="stat-number">{stats.avgDaysPerBook}</div>
                <p className="stat-label">DAYS / BOOK</p>
              </div>
              <div className="pace-stat">
                <div className="stat-number">{stats.longestStreak}</div>
                <p className="stat-label">DAY STREAK</p>
              </div>
              <div className="pace-stat">
                <div className="stat-number">{stats.totalReadingDays}</div>
                <p className="stat-label">READING DAYS</p>
              </div>
            </div>

            {/* Speed comparison bars */}
            <div className="speed-comparison stat-detail">
              {stats.fastestRead && (
                <div className="speed-bar-row">
                  <span className="speed-label">FASTEST</span>
                  <div className="speed-bar-track">
                    <div
                      className="speed-bar bar-fill fast"
                      style={{ width: "100%" }}
                    />
                  </div>
                  <span className="speed-value">
                    {stats.fastestRead.pagesPerDay} p/d
                  </span>
                </div>
              )}
              {stats.slowestRead && stats.slowestRead !== stats.fastestRead && (
                <div className="speed-bar-row">
                  <span className="speed-label">SLOWEST</span>
                  <div className="speed-bar-track">
                    <div
                      className="speed-bar bar-fill slow"
                      style={{
                        width: `${
                          stats.fastestRead
                            ? (stats.slowestRead.pagesPerDay /
                                stats.fastestRead.pagesPerDay) *
                              100
                            : 50
                        }%`,
                      }}
                    />
                  </div>
                  <span className="speed-value">
                    {stats.slowestRead.pagesPerDay} p/d
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SLIDE 5: Best Rated with Podium Visualization */}
        <section className="wrapped-slide slide-best">
          <div className="slide-content">
            <p className="stat-label">YOUR RATINGS</p>

            {/* Star Rating Radial */}
            <div className="rating-radial-large stat-detail">
              <svg viewBox="0 0 100 100" className="radial-svg">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#222"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="var(--accent-color)"
                  strokeWidth="8"
                  strokeDasharray={`${(stats.avgRating / 5) * 283} 283`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                  className="bar-fill"
                />
                <text
                  x="50"
                  y="45"
                  fill="#fff"
                  fontSize="20"
                  fontWeight="900"
                  textAnchor="middle"
                >
                  {stats.avgRating}
                </text>
                <text
                  x="50"
                  y="60"
                  fill="#666"
                  fontSize="6"
                  textAnchor="middle"
                >
                  AVG RATING
                </text>
              </svg>
            </div>

            {/* Podium for top 3 books */}
            <div className="podium-container stat-detail">
              {stats.bestRatedBooks.slice(0, 3).map((book, i) => {
                const heights = [120, 150, 100]; // 2nd, 1st, 3rd
                const order = [1, 0, 2]; // Arrange as 2nd, 1st, 3rd
                const positions = ["SILVER", "GOLD", "BRONZE"];
                return (
                  <div
                    key={book.id}
                    className={`podium-spot podium-${i + 1}`}
                    style={{ order: order[i] }}
                  >
                    <div className="podium-book-title">
                      {book.title.substring(0, 20)}
                      {book.title.length > 20 ? "..." : ""}
                    </div>
                    <div className="podium-rating">★ {book.rating}</div>
                    <div
                      className="podium-block bar-fill"
                      style={{ height: `${heights[i]}px` }}
                    >
                      <span className="podium-position">{positions[i]}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Rating distribution mini */}
            <div className="rating-dots-grid stat-detail">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count =
                  stats.ratingDistribution.find((r) => r.rating === rating)
                    ?.count || 0;
                return (
                  <div key={rating} className="rating-dots-row">
                    <span className="rating-dots-label">
                      {"★".repeat(rating)}
                    </span>
                    <div className="rating-dots">
                      {[...Array(count)].map((_, i) => (
                        <span key={i} className="rating-dot" />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SLIDE 6: Favorite Author with Radial Chart */}
        <section className="wrapped-slide slide-author">
          <div className="slide-content">
            <p className="stat-label">YOUR TOP AUTHOR</p>
            <div className="stat-number author-name">
              {stats.favoriteAuthor.name}
            </div>
            <p className="stat-detail">
              You read {stats.favoriteAuthor.count} book
              {stats.favoriteAuthor.count > 1 ? "s" : ""} by them
            </p>

            {/* Author Pie Chart */}
            <div className="author-pie-container stat-detail">
              <svg viewBox="0 0 100 100" className="pie-svg">
                {(() => {
                  let cumulativePercent = 0;
                  const colors = [
                    "var(--accent-color)",
                    "#666",
                    "#444",
                    "#333",
                    "#222",
                  ];
                  return stats.authorBreakdown.slice(0, 5).map((a, i) => {
                    const percent = (a.count / stats.totalBooks) * 100;
                    const startAngle =
                      cumulativePercent * 3.6 * (Math.PI / 180);
                    cumulativePercent += percent;
                    const endAngle = cumulativePercent * 3.6 * (Math.PI / 180);
                    const largeArc = percent > 50 ? 1 : 0;
                    const x1 = 50 + 40 * Math.sin(startAngle);
                    const y1 = 50 - 40 * Math.cos(startAngle);
                    const x2 = 50 + 40 * Math.sin(endAngle);
                    const y2 = 50 - 40 * Math.cos(endAngle);
                    return (
                      <path
                        key={a.author}
                        d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                        fill={colors[i]}
                        className="bar-fill"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    );
                  });
                })()}
                <circle cx="50" cy="50" r="20" fill="#050505" />
                <text
                  x="50"
                  y="52"
                  fill="#fff"
                  fontSize="12"
                  fontWeight="900"
                  textAnchor="middle"
                >
                  {stats.uniqueAuthors}
                </text>
                <text
                  x="50"
                  y="60"
                  fill="#666"
                  fontSize="4"
                  textAnchor="middle"
                >
                  AUTHORS
                </text>
              </svg>
            </div>

            {/* Author Legend */}
            <div className="author-legend stat-detail">
              {stats.authorBreakdown.slice(0, 5).map((a, i) => {
                const colors = [
                  "var(--accent-color)",
                  "#666",
                  "#444",
                  "#333",
                  "#222",
                ];
                return (
                  <div key={a.author} className="legend-row">
                    <span
                      className="legend-color"
                      style={{ background: colors[i] }}
                    />
                    <span className="legend-name">{a.author}</span>
                    <span className="legend-count">{a.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SLIDE 7: Favorite Genre with Donut Chart */}
        <section className="wrapped-slide slide-genre">
          <div className="slide-content">
            <p className="stat-label">YOU WERE ALL ABOUT</p>
            <div className="stat-number genre-name">
              {stats.favoriteGenre.name}
            </div>
            <p className="stat-detail">
              {stats.genreBreakdown[0]?.percent}% of your reads
            </p>

            {/* Genre Donut Chart */}
            <div className="genre-donut-container stat-detail">
              <svg viewBox="0 0 100 100" className="donut-svg">
                {(() => {
                  let cumulativePercent = 0;
                  return stats.genreBreakdown.map((g, i) => {
                    const percent = g.percent;
                    const strokeDasharray = `${percent * 2.51} ${
                      251 - percent * 2.51
                    }`;
                    const strokeDashoffset = -cumulativePercent * 2.51;
                    cumulativePercent += percent;
                    const hue = (i * 60) % 360;
                    return (
                      <circle
                        key={g.genre}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={
                          i === 0
                            ? "var(--accent-color)"
                            : `hsl(${hue}, 30%, ${30 - i * 5}%)`
                        }
                        strokeWidth="15"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        transform="rotate(-90 50 50)"
                        className="bar-fill"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    );
                  });
                })()}
                <text
                  x="50"
                  y="52"
                  fill="#fff"
                  fontSize="14"
                  fontWeight="900"
                  textAnchor="middle"
                >
                  {stats.uniqueGenres}
                </text>
                <text
                  x="50"
                  y="60"
                  fill="#666"
                  fontSize="5"
                  textAnchor="middle"
                >
                  GENRES
                </text>
              </svg>
            </div>

            {/* Genre breakdown bars */}
            <div className="genre-breakdown">
              <p className="stat-label">GENRE MIX</p>
              {stats.genreBreakdown.map((g, i) => (
                <div key={g.genre} className="breakdown-bar stat-detail">
                  <span className="breakdown-label">{g.genre}</span>
                  <div className="breakdown-bar-bg">
                    <div
                      className="bar-fill"
                      style={{ width: `${g.percent}%` }}
                    />
                  </div>
                  <span className="breakdown-value">{g.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SLIDE 8: Book Extremes with Size Comparison */}
        <section className="wrapped-slide slide-extremes">
          <div className="slide-content">
            <p className="stat-label">THE EXTREMES</p>

            {/* Book Size Comparison Visual */}
            <div className="book-size-comparison stat-detail">
              {stats.longestBook && stats.shortestBook && (
                <>
                  <div className="size-book longest">
                    <div
                      className="size-book-visual bar-fill"
                      style={{
                        height: "180px",
                        width: `${Math.min(
                          80,
                          stats.longestBook.pages / 10
                        )}px`,
                      }}
                    />
                    <div className="size-book-info">
                      <span className="size-book-pages">
                        {stats.longestBook.pages}
                      </span>
                      <span className="size-book-label">PAGES</span>
                    </div>
                  </div>
                  <div className="size-divider">
                    <span className="size-diff">
                      {stats.longestBook.pages - stats.shortestBook.pages}
                    </span>
                    <span className="size-diff-label">PAGE DIFFERENCE</span>
                  </div>
                  <div className="size-book shortest">
                    <div
                      className="size-book-visual bar-fill"
                      style={{
                        height: `${
                          (stats.shortestBook.pages / stats.longestBook.pages) *
                          180
                        }px`,
                        width: `${Math.min(
                          80,
                          stats.shortestBook.pages / 10
                        )}px`,
                      }}
                    />
                    <div className="size-book-info">
                      <span className="size-book-pages">
                        {stats.shortestBook.pages}
                      </span>
                      <span className="size-book-label">PAGES</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="extreme-cards">
              {stats.longestBook && (
                <div className="extreme-card stat-detail">
                  <span className="extreme-type">LONGEST</span>
                  <span className="extreme-title">
                    {stats.longestBook.title}
                  </span>
                  <span className="extreme-author">
                    {stats.longestBook.author}
                  </span>
                </div>
              )}
              {stats.shortestBook && (
                <div className="extreme-card stat-detail">
                  <span className="extreme-type">SHORTEST</span>
                  <span className="extreme-title">
                    {stats.shortestBook.title}
                  </span>
                  <span className="extreme-author">
                    {stats.shortestBook.author}
                  </span>
                </div>
              )}
            </div>

            {/* Page Distribution Histogram */}
            <div className="page-histogram stat-detail">
              <p className="stat-label">PAGE DISTRIBUTION</p>
              <div className="histogram-bars">
                {(() => {
                  const ranges = [
                    { min: 0, max: 100, label: "0-100" },
                    { min: 100, max: 200, label: "100-200" },
                    { min: 200, max: 300, label: "200-300" },
                    { min: 300, max: 400, label: "300-400" },
                    { min: 400, max: 1000, label: "400+" },
                  ];
                  const counts = ranges.map(
                    (r) =>
                      stats.books.filter(
                        (b) => b.pages >= r.min && b.pages < r.max
                      ).length
                  );
                  const maxCount = Math.max(...counts);
                  return ranges.map((r, i) => (
                    <div key={r.label} className="histogram-bar-container">
                      <div
                        className="histogram-bar bar-fill"
                        style={{
                          height:
                            maxCount > 0
                              ? `${(counts[i] / maxCount) * 100}%`
                              : "0%",
                        }}
                      />
                      <span className="histogram-label">{r.label}</span>
                      <span className="histogram-count">{counts[i]}</span>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </section>

        {/* SLIDE 9: Monthly Activity with Calendar Heatmap */}
        <section className="wrapped-slide slide-monthly">
          <div className="slide-content">
            <p className="stat-label">YOUR READING CALENDAR</p>

            {/* Monthly Bar Chart */}
            <div className="monthly-chart">
              {stats.monthlyBreakdown.map((m) => {
                const maxCount = Math.max(
                  ...stats.monthlyBreakdown.map((x) => x.count)
                );
                const height = maxCount > 0 ? (m.count / maxCount) * 100 : 0;
                return (
                  <div
                    key={m.month}
                    className="month-bar-container stat-detail"
                  >
                    <div
                      className="month-bar bar-fill"
                      style={{ height: `${height}%` }}
                    />
                    <span className="month-label">{m.month}</span>
                    {m.count > 0 && (
                      <span className="month-count">{m.count}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Weekday Distribution */}
            <div className="weekday-chart stat-detail">
              <p className="stat-label">FINISH DAY PREFERENCE</p>
              <div className="weekday-bars">
                {stats.weekdayBreakdown.map((w) => {
                  const maxCount = Math.max(
                    ...stats.weekdayBreakdown.map((x) => x.count)
                  );
                  const height = maxCount > 0 ? (w.count / maxCount) * 100 : 0;
                  return (
                    <div key={w.day} className="weekday-bar-container">
                      <div
                        className="weekday-bar bar-fill"
                        style={{ height: `${height}%` }}
                      />
                      <span className="weekday-label">{w.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quarter Summary */}
            <div className="quarter-summary stat-detail">
              {stats.quarterBreakdown.map((q) => (
                <div key={q.quarter} className="quarter-item">
                  <span className="quarter-name">{q.quarter}</span>
                  <div className="quarter-ring">
                    <svg viewBox="0 0 36 36">
                      <circle
                        cx="18"
                        cy="18"
                        r="15"
                        fill="none"
                        stroke="#222"
                        strokeWidth="3"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="15"
                        fill="none"
                        stroke="var(--accent-color)"
                        strokeWidth="3"
                        strokeDasharray={`${q.percent * 0.94} 94`}
                        transform="rotate(-90 18 18)"
                        className="bar-fill"
                      />
                    </svg>
                    <span className="quarter-ring-value">{q.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SLIDE 11: Reading Diversity */}
        <section className="wrapped-slide slide-diversity">
          <div className="slide-content">
            <p className="stat-label">YOUR READING DIVERSITY</p>

            {/* Diversity Stats Grid */}
            <div className="diversity-grid stat-detail">
              <div className="diversity-stat">
                <div className="diversity-value">{stats.uniqueAuthors}</div>
                <div className="diversity-label">UNIQUE AUTHORS</div>
                <div className="diversity-ratio">
                  {(stats.totalBooks / stats.uniqueAuthors).toFixed(1)}{" "}
                  books/author
                </div>
              </div>
              <div className="diversity-stat">
                <div className="diversity-value">{stats.uniqueGenres}</div>
                <div className="diversity-label">GENRES EXPLORED</div>
                <div className="diversity-ratio">
                  {(stats.totalBooks / stats.uniqueGenres).toFixed(1)}{" "}
                  books/genre
                </div>
              </div>
            </div>

            {/* Author diversity visualization - dots */}
            <div className="author-dots stat-detail">
              <p className="stat-label">AUTHOR VARIETY</p>
              <div className="dots-container">
                {stats.authorBreakdown.map((a, i) =>
                  [...Array(a.count)].map((_, j) => (
                    <span
                      key={`${a.author}-${j}`}
                      className={`author-dot ${i === 0 ? "primary" : ""}`}
                      title={a.author}
                    />
                  ))
                )}
              </div>
              <p className="stat-detail dots-legend">
                <span className="dot-legend-item">
                  <span className="author-dot primary" /> Top Author
                </span>
                <span className="dot-legend-item">
                  <span className="author-dot" /> Others
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* SLIDE 12: Speed vs Length Scatter */}
        <section className="wrapped-slide slide-scatter">
          <div className="slide-content">
            <p className="stat-label">READING PATTERNS</p>

            {/* Scatter-like visualization */}
            <div className="scatter-container stat-detail">
              <div className="scatter-grid">
                {stats.books.map((book, i) => {
                  const start = new Date(book.dateStarted);
                  const end = new Date(book.date);
                  const days = Math.max(
                    1,
                    Math.ceil(
                      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
                    )
                  );
                  const pagesPerDay = Math.round(book.pages / days);
                  const maxPages = stats.longestBook?.pages || 500;
                  const maxSpeed = stats.fastestRead?.pagesPerDay || 100;
                  return (
                    <div
                      key={book.id}
                      className="scatter-point bar-fill"
                      style={{
                        left: `${(book.pages / maxPages) * 90}%`,
                        bottom: `${Math.min(
                          (pagesPerDay / maxSpeed) * 90,
                          90
                        )}%`,
                        animationDelay: `${i * 0.05}s`,
                      }}
                      title={`${book.title}: ${book.pages}p, ${pagesPerDay}p/d`}
                    />
                  );
                })}
              </div>
              <div className="scatter-x-label">BOOK LENGTH →</div>
              <div className="scatter-y-label">READING SPEED →</div>
            </div>

            {/* Correlation insight */}
            <div className="pattern-insights stat-detail">
              <div className="insight-box">
                <span className="insight-icon">⚡</span>
                <span className="insight-text">
                  {stats.fastestRead
                    ? `Fastest: "${stats.fastestRead.book.title.substring(
                        0,
                        25
                      )}..." at ${stats.fastestRead.pagesPerDay}p/day`
                    : "N/A"}
                </span>
              </div>
              <div className="insight-box">
                <span className="insight-icon">🐢</span>
                <span className="insight-text">
                  {stats.slowestRead
                    ? `Slowest: "${stats.slowestRead.book.title.substring(
                        0,
                        25
                      )}..." at ${stats.slowestRead.pagesPerDay}p/day`
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* SLIDE 13: Year Summary Dashboard */}
        <section className="wrapped-slide slide-dashboard">
          <div className="slide-content">
            <p className="stat-label">{stats.year} AT A GLANCE</p>

            {/* Dashboard grid */}
            <div className="dashboard-grid stat-detail">
              <div className="dash-cell large">
                <span className="dash-value">{stats.totalBooks}</span>
                <span className="dash-label">BOOKS</span>
              </div>
              <div className="dash-cell">
                <span className="dash-value">
                  {stats.totalPages.toLocaleString()}
                </span>
                <span className="dash-label">PAGES</span>
              </div>
              <div className="dash-cell">
                <span className="dash-value">{stats.avgRating}</span>
                <span className="dash-label">AVG RATING</span>
              </div>
              <div className="dash-cell">
                <span className="dash-value">{stats.avgPagesPerDay}</span>
                <span className="dash-label">PAGES/DAY</span>
              </div>
              <div className="dash-cell">
                <span className="dash-value">{stats.uniqueAuthors}</span>
                <span className="dash-label">AUTHORS</span>
              </div>
              <div className="dash-cell">
                <span className="dash-value">{stats.uniqueGenres}</span>
                <span className="dash-label">GENRES</span>
              </div>
              <div className="dash-cell">
                <span className="dash-value">{stats.longestStreak}</span>
                <span className="dash-label">DAY STREAK</span>
              </div>
              <div className="dash-cell">
                <span className="dash-value">{stats.avgDaysPerBook}</span>
                <span className="dash-label">DAYS/BOOK</span>
              </div>
            </div>

            {/* Mini charts row */}
            <div className="mini-charts-row stat-detail">
              <div className="mini-chart">
                <span className="mini-chart-title">MONTHLY</span>
                <div className="mini-bars">
                  {stats.monthlyBreakdown.map((m) => {
                    const max = Math.max(
                      ...stats.monthlyBreakdown.map((x) => x.count)
                    );
                    return (
                      <div
                        key={m.month}
                        className="mini-bar bar-fill"
                        style={{
                          height: max > 0 ? `${(m.count / max) * 100}%` : "0%",
                        }}
                      />
                    );
                  })}
                </div>
              </div>
              <div className="mini-chart">
                <span className="mini-chart-title">RATINGS</span>
                <div className="mini-bars">
                  {stats.ratingDistribution.map((r) => {
                    const max = Math.max(
                      ...stats.ratingDistribution.map((x) => x.count)
                    );
                    return (
                      <div
                        key={r.rating}
                        className="mini-bar bar-fill"
                        style={{
                          height: max > 0 ? `${(r.count / max) * 100}%` : "0%",
                        }}
                      />
                    );
                  })}
                </div>
              </div>
              <div className="mini-chart">
                <span className="mini-chart-title">QUARTERS</span>
                <div className="mini-bars">
                  {stats.quarterBreakdown.map((q) => {
                    const max = Math.max(
                      ...stats.quarterBreakdown.map((x) => x.count)
                    );
                    return (
                      <div
                        key={q.quarter}
                        className="mini-bar bar-fill"
                        style={{
                          height: max > 0 ? `${(q.count / max) * 100}%` : "0%",
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SLIDE 14: Finale */}
        <section className="wrapped-slide slide-finale">
          <div className="slide-content">
            <p className="stat-label">THAT WAS</p>
            <div className="slide-year-huge">{stats.year}</div>

            {/* Finale stats icons */}
            <div className="finale-icons stat-detail">
              <div className="finale-icon-stat">
                <span className="finale-icon-glyph">◼</span>
                <span className="finale-icon-value">{stats.totalBooks}</span>
                <span className="finale-icon-label">BOOKS</span>
              </div>
              <div className="finale-icon-stat">
                <span className="finale-icon-glyph">▤</span>
                <span className="finale-icon-value">
                  {stats.totalPages.toLocaleString()}
                </span>
                <span className="finale-icon-label">PAGES</span>
              </div>
              <div className="finale-icon-stat">
                <span className="finale-icon-glyph">★</span>
                <span className="finale-icon-value">{stats.avgRating}</span>
                <span className="finale-icon-label">AVG</span>
              </div>
              <div className="finale-icon-stat">
                <span className="finale-icon-glyph">◉</span>
                <span className="finale-icon-value">{stats.uniqueAuthors}</span>
                <span className="finale-icon-label">AUTHORS</span>
              </div>
            </div>

            <div className="finale-summary">
              <span className="finale-stat">{stats.favoriteGenre.name}</span>
              <span className="finale-divider">•</span>
              <span className="finale-stat">{stats.favoriteAuthor.name}</span>
            </div>

            <p className="stat-detail finale-message">
              See you next year, bookworm.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
