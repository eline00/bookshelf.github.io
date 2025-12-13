"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  books,
  yearlyGoals,
  bookCoverColors,
  getBookCover,
  getBookVibe,
  Book,
} from "../data";

gsap.registerPlugin(ScrollTrigger);

export default function TimelineView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const coverWrapperRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Sort books by date
  const sortedBooks = useMemo(() => {
    return [...books].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, []);

  // Group by Year
  const grouped: Record<number, Book[]> = { 2024: [], 2025: [], 2026: [] };
  sortedBooks.forEach((b) => {
    if (grouped[b.year]) grouped[b.year].push(b);
  });

  // Calculate reading stats for modal
  const getReadingStats = (book: Book) => {
    const startDate = new Date(book.dateStarted);
    const endDate = new Date(book.date);
    const daysToRead = Math.max(
      1,
      Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      )
    );
    const pagesPerDay = Math.round(book.pages / daysToRead);

    return {
      daysToRead,
      pagesPerDay,
      startDate: book.dateStarted,
      endDate: book.date,
    };
  };


  // Generate duration spectrum bars for ALL books in chronological order
  const getDurationBars = (currentBook: Book) => {
    const allDurations = sortedBooks.map((b) => getReadingStats(b).daysToRead);
    const maxDuration = Math.max(...allDurations);

    // Return all books in chronological order (sortedBooks is already sorted by date)
    return sortedBooks.map((b) => {
      const stats = getReadingStats(b);
      const height = (stats.daysToRead / maxDuration) * 100;
      const isActive = b.id === currentBook.id;
      return { height, isActive, title: b.title, days: stats.daysToRead };
    });
  };

  // Generate JSON representation for hover effect
  const getBookJson = (book: Book) => {
    return JSON.stringify(
      {
        id: book.id,
        title: book.title,
        author: book.author,
        pages: book.pages,
        rating: book.rating,
        genre: book.genre,
        dateStarted: book.dateStarted,
        dateRead: book.date,
        avgRating: book.avgRating,
        readCount: book.readCount,
      },
      null,
      2
    );
  };

  // Kinetic scroll effect
  useEffect(() => {
    const proxy = { skew: 0 };
    const clamp = gsap.utils.clamp(-20, 20);

    const trigger = ScrollTrigger.create({
      onUpdate: (self: ScrollTrigger) => {
        const skew = clamp(self.getVelocity() / -300);
        if (Math.abs(skew) > Math.abs(proxy.skew)) {
          proxy.skew = skew;
          gsap.to(proxy, {
            skew: 0,
            duration: 0.8,
            ease: "power3.out",
            overwrite: true,
            onUpdate: () => {
              gsap.set(".book-item", { skewY: proxy.skew });
            },
          });
        }
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  // Mouse parallax on modal cover
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (selectedBook && coverWrapperRef.current) {
        // Use clientX/clientY (viewport-relative) instead of pageX/pageY (document-relative)
        const x = (window.innerWidth - e.clientX * 2) / 100;
        const y = (window.innerHeight - e.clientY * 2) / 100;
        coverWrapperRef.current.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
      }
    };

    if (selectedBook) {
      document.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [selectedBook]);

  const handleMouseEnter = (book: Book) => {
    setIsHovering(true);
    if (bgRef.current) {
      const color = bookCoverColors[book.id] || "#232526";
      bgRef.current.style.background = `radial-gradient(ellipse at center, ${color}aa 0%, ${color}44 50%, transparent 80%)`;
      bgRef.current.style.opacity = "0.8";
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (bgRef.current) {
      bgRef.current.style.opacity = "0";
    }
  };

  const openModal = (book: Book) => {
    setSelectedBook(book);

    if (modalRef.current) {
      // Animate modal in
      gsap.to(modalRef.current, { y: "0%", duration: 0.8, ease: "expo.out" });

      // Stagger in the content
      gsap.fromTo(
        ".artifact-title",
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: "power3.out" }
      );
      gsap.fromTo(
        ".info-matrix",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, delay: 0.4, ease: "power2.out" }
      );
      gsap.fromTo(
        ".artifact-notes",
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.6, delay: 0.6, ease: "power2.out" }
      );
      gsap.fromTo(
        ".artifact-cover",
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          delay: 0.3,
          ease: "back.out(1.4)",
        }
      );
    }
  };

  const closeModal = () => {
    if (modalRef.current) {
      gsap.to(modalRef.current, {
        y: "100%",
        duration: 0.6,
        ease: "power3.in",
        onComplete: () => setSelectedBook(null),
      });
    }
  };

  const getBookStyles = (book: Book): React.CSSProperties => {
    const baseSize = Math.max(2.5, Math.min(7, (book.pages / 100) * 1.2));
    const titleLengthFactor =
      book.title.length > 30 ? 0.7 : book.title.length > 20 ? 0.85 : 1;
    const size = baseSize * titleLengthFactor;

    return {
      fontWeight: 900,
      fontSize: `clamp(1.5rem, ${size}vw, 6rem)`,
    };
  };

  const getRatingClass = (rating: number): string => {
    if (rating >= 5) return "rating-5";
    if (rating >= 4) return "rating-4";
    if (rating >= 3) return "rating-3";
    if (rating >= 2) return "rating-2";
    return "rating-1";
  };

  const getGenreClass = (genre: string): string => {
    const genreMap: Record<string, string> = {
      "Romantasy": "genre-romantasy",
      "Fantasy": "genre-fantasy",
      "Dark Romance": "genre-dark-romance",
      "Fanfic": "genre-fanfic",
      "Fiction": "genre-fiction",
    };
    return genreMap[genre] || "genre-fiction";
  };

  // Get stats for selected book
  const stats = selectedBook ? getReadingStats(selectedBook) : null;
  const durationBars = selectedBook ? getDurationBars(selectedBook) : [];

  return (
    <>
      <div id="ambient-bg" ref={bgRef}></div>

      <main
        id="stream-wrapper"
        ref={containerRef}
        className={isHovering ? "is-hovering" : ""}
      >
        <div id="timeline-rail"></div>

        {Object.keys(grouped).map((year) => {
          const yearNum = parseInt(year);
          const yearBooks = grouped[yearNum];
          const goal = yearlyGoals[yearNum];
          const booksRead = yearBooks.length;
          const currentYear = new Date().getFullYear();
          const isYearOver = yearNum < currentYear;
          const isFutureYear = yearNum > currentYear;
          const isGoalMet = booksRead >= goal;
          const percent =
            goal > 0 ? Math.min(100, Math.round((booksRead / goal) * 100)) : 0;

          let status: string;
          let statusColor: string;
          let fillColor: string;

          if (isFutureYear) {
            status = "TBA";
            statusColor = "#666";
            fillColor = "#666";
          } else if (isGoalMet) {
            status = "COMPLETED";
            statusColor = "#ccff00";
            fillColor = "#ccff00";
          } else if (isYearOver) {
            status = "FAILED";
            statusColor = "#ff4444";
            fillColor = "#ff4444";
          } else {
            status = "IN PROGRESS";
            statusColor = "#ffee00";
            fillColor = "#ffee00";
          }

          // Group books by month
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
          const booksByMonth: Record<number, Book[]> = {};
          yearBooks.forEach((book) => {
            const monthIndex = new Date(book.date).getMonth();
            if (!booksByMonth[monthIndex]) {
              booksByMonth[monthIndex] = [];
            }
            booksByMonth[monthIndex].push(book);
          });

          return (
            <div key={year}>
              {/* Year Marker */}
              <div className="year-marker">
                <div className="year-title">{year}</div>
                <div className="year-goal">
                  GOAL: {isFutureYear ? "TBA" : `${goal} BOOKS`}
                </div>
              </div>

              {/* Books grouped by month */}
              {Object.keys(booksByMonth)
                .map(Number)
                .sort((a, b) => a - b)
                .map((monthIndex) => (
                  <div key={monthIndex} className="month-group">
                    <div className="month-marker">{monthNames[monthIndex]}</div>
                    {booksByMonth[monthIndex].map((book, index) => (
                      <div
                        key={`${book.id}-${index}`}
                        className={`book-item cursor-pointer ${getRatingClass(book.rating)} ${getGenreClass(book.genre)}`}
                        style={getBookStyles(book)}
                        onMouseEnter={() => handleMouseEnter(book)}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => openModal(book)}
                      >
                        {book.title}
                      </div>
                    ))}
                  </div>
                ))}

              {/* Progress Bar */}
              <div className="progress-wrapper">
                <div className="progress-header">
                  <span>STATUS: {status}</span>
                  <span>{isFutureYear ? "—" : `${percent}%`}</span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: fillColor,
                    }}
                  ></div>
                </div>
                <div className="status-text">
                  {isFutureYear ? (
                    <span style={{ color: "#666" }}>TBA</span>
                  ) : (
                    <>
                      <span style={{ color: statusColor }}>{booksRead}</span>
                      <span style={{ color: "#888" }}>
                        {" "}
                        / {goal} BOOKS READ
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </main>

      {/* Abstract Modal */}
      <div id="modal" ref={modalRef}>
        <div className="artifact-grid">
          {/* LEFT: VISUAL */}
          <div className="artifact-visual">
            {selectedBook && (
              <div className="artifact-cover-wrapper" ref={coverWrapperRef}>
                {/* JSON Background */}
                <div className="json-reveal">{getBookJson(selectedBook)}</div>
                {/* Cover Image */}
                <img
                  src={getBookCover(selectedBook)}
                  alt={`${selectedBook.title} cover`}
                  className="artifact-cover"
                  style={{
                    boxShadow: `0 20px 40px ${
                      bookCoverColors[selectedBook.id] || "#000"
                    }88`,
                  }}
                />
                {/* Scanner */}
                <div className="scan-line"></div>
              </div>
            )}
          </div>

          {/* RIGHT: DATA */}
          <div className="artifact-data">
            <button className="close-btn-abstract" onClick={closeModal}>
              Close Uplink
            </button>

            {selectedBook && (
              <>
                <div>
                  <div className="artifact-id-label">
                    ID: #{selectedBook.id}
                  </div>
                  <h1 className="artifact-title">{selectedBook.title}</h1>
                  <div className="text-sm text-gray-500 font-mono mb-4">
                    by {selectedBook.author} // {selectedBook.genre}
                  </div>
                </div>

                {/* Info Matrix Row 1 */}
                <div className="info-matrix">
                  {/* CELL 1: RATING COMPARISON - Radial Bar Chart */}
                  <div className="info-cell">
                    <span className="info-label">RATING</span>
                    <div className="rating-radial">
                      {/* Outer ring - My rating */}
                      <div className="rating-ring outer">
                        <svg viewBox="0 0 100 100">
                          <circle className="ring-bg" cx="50" cy="50" r="45" />
                          <circle
                            className="ring-fill mine"
                            cx="50"
                            cy="50"
                            r="45"
                            strokeDasharray={`${
                              (selectedBook.rating / 5) * 283
                            } 283`}
                          />
                        </svg>
                      </div>
                      {/* Inner ring - Avg rating */}
                      <div className="rating-ring inner">
                        <svg viewBox="0 0 100 100">
                          <circle className="ring-bg" cx="50" cy="50" r="45" />
                          <circle
                            className="ring-fill avg"
                            cx="50"
                            cy="50"
                            r="45"
                            strokeDasharray={`${
                              (selectedBook.avgRating / 5) * 283
                            } 283`}
                          />
                        </svg>
                      </div>
                      {/* Star icon center */}
                      <div className="rating-center">
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="star-icon"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="rating-legend">
                      <div className="rating-legend-item">
                        <div className="rating-legend-dot mine"></div>
                        <span>Mine: {selectedBook.rating}</span>
                      </div>
                      <div className="rating-legend-item">
                        <div className="rating-legend-dot avg"></div>
                        <span>Avg: {selectedBook.avgRating}</span>
                      </div>
                    </div>
                  </div>

                  {/* CELL 2: DENSITY */}
                  <div className="info-cell">
                    <span className="info-label">LENGTH</span>
                    <div className="text-3xl font-black text-white">
                      {selectedBook.pages}
                    </div>
                    <span className="text-xs text-[var(--accent-color)] font-mono">
                      PAGES TOTAL
                    </span>
                  </div>

                  {/* CELL 3: VELOCITY */}
                  <div className="info-cell">
                    <span className="info-label">READING SPEED</span>
                    <div className="text-3xl font-black text-white">
                      {stats?.pagesPerDay || 0}
                    </div>
                    <span className="text-xs text-[var(--accent-color)] font-mono">
                      PAGES / DAY
                    </span>
                  </div>
                </div>

                {/* Info Matrix Row 2: Temporal Context */}
                <div className="info-matrix">
                  <div className="info-cell" style={{ gridColumn: "span 3" }}>
                    <div className="flex justify-between items-end mb-2">
                      <span className="info-label">DURATION SPECTRUM</span>
                      <span className="text-xs font-mono text-[var(--accent-color)]">
                        {selectedBook.readCount > 1
                          ? `READ ${selectedBook.readCount}x`
                          : ""}
                      </span>
                    </div>

                    {/* Sparkline Chart */}
                    <div className="relative ml-4 mb-2">
                      <div className="absolute -left-7 top-1/2 -translate-y-1/2 -rotate-90 text-[8px] text-[#555] font-mono tracking-widest">
                        TIME(d)
                      </div>
                      <div className="duration-spectrum border-l border-b border-[#333] pl-1 pb-1">
                        {durationBars.map((bar, i) => (
                          <div
                            key={i}
                            className={`spec-bar ${
                              bar.isActive ? "active" : ""
                            }`}
                            style={{ height: `${bar.height}%` }}
                            title={bar.title}
                          ></div>
                        ))}
                      </div>
                      <div className="absolute -bottom-4 w-full text-center text-[8px] text-[#555] font-mono tracking-widest">
                        BOOKS
                      </div>
                    </div>

                    <div className="flex justify-between text-xs font-mono text-gray-500 mt-6">
                      <div>
                        START:{" "}
                        <span className="text-white">{stats?.startDate}</span>
                      </div>
                      <div>
                        END:{" "}
                        <span className="text-white">{stats?.endDate}</span>
                      </div>
                      <div>
                        TOTAL:{" "}
                        <span className="text-white">
                          {stats?.daysToRead} DAYS
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vibe Description */}
                <div className="mt-4">
                  <span className="info-label mb-2 block">
                    VIBE_CHECK // MOOD
                  </span>
                  <p className="artifact-notes">{getBookVibe(selectedBook)}</p>
                </div>

                {/* Publication Info */}
                <div className="mt-6 text-xs font-mono text-gray-600">
                  PUBLISHED: {selectedBook.datePub}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
