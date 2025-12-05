"use client";

import { useEffect, useRef, useState, Suspense, lazy } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  books,
  yearlyGoals,
  bookCoverColors,
  getBookCover,
  Book,
} from "./data";

gsap.registerPlugin(ScrollTrigger);

// Lazy load the views
const AnalyticsView = lazy(() => import("./components/AnalyticsView"));
const VisualsView = lazy(() => import("./components/VisualsView"));

type ViewType = "timeline" | "stats" | "page tower";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [coverLoaded, setCoverLoaded] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>("timeline");

  // Sort books by date
  const sortedBooks = [...books].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Group by Year (starting from 2024)
  const grouped: Record<number, Book[]> = { 2024: [], 2025: [], 2026: [] };
  sortedBooks.forEach((b) => {
    if (grouped[b.year]) grouped[b.year].push(b);
  });

  // Kinetic scroll effect - only for timeline view
  useEffect(() => {
    if (activeView !== "timeline") return;

    const proxy = { skew: 0 };
    const skewSetter = gsap.quickSetter(".book-item", "skewY", "deg");
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
            onUpdate: () => skewSetter(proxy.skew),
          });
        }
      },
    });

    return () => {
      trigger.kill();
    };
  }, [activeView]);

  const switchView = (view: ViewType) => {
    setActiveView(view);
    window.scrollTo(0, 0);
    // Refresh ScrollTrigger after view change
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);
  };

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
    setCoverLoaded(false);
    gsap.set("#modal-cover", { opacity: 0, scale: 0.9 });

    setSelectedBook(book);
    if (modalRef.current) {
      gsap.to(modalRef.current, { y: "0%", duration: 0.8, ease: "expo.out" });
      gsap.to("#modal-title", {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: 0.2,
        ease: "power3.out",
      });
      gsap.to("#modal-meta", { opacity: 1, duration: 0.8, delay: 0.3 });
      gsap.to(".reveal-text span", {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.02,
        delay: 0.4,
        ease: "back.out(1.7)",
      });
      gsap.to("#modal-stats", { opacity: 1, duration: 1, delay: 0.8 });
    }
  };

  const handleCoverLoad = () => {
    setCoverLoaded(true);
    gsap.to("#modal-cover", {
      opacity: 1,
      scale: 1,
      duration: 0.6,
      ease: "back.out(1.4)",
    });
  };

  const closeModal = () => {
    if (modalRef.current) {
      gsap.to(modalRef.current, {
        y: "100%",
        duration: 0.6,
        ease: "power3.in",
      });
      gsap.set("#modal-cover", { opacity: 0, scale: 0.9 });
      gsap.set("#modal-title", { opacity: 0, y: 20 });
      gsap.set(".reveal-text span", { opacity: 0, y: 20 });
      gsap.set("#modal-stats", { opacity: 0 });
      gsap.set("#modal-meta", { opacity: 0 });
    }
  };

  const getBookStyles = (book: Book): React.CSSProperties => {
    const baseSize = Math.max(2.5, Math.min(7, (book.pages / 100) * 1.2));
    const titleLengthFactor =
      book.title.length > 30 ? 0.7 : book.title.length > 20 ? 0.85 : 1;
    const size = baseSize * titleLengthFactor;
    return {
      fontWeight: 900, // Always bold for brutalist style
      fontSize: `clamp(1.5rem, ${size}vw, 6rem)`,
    };
  };

  const getRatingClass = (rating: number): string => {
    if (rating >= 5) return "rating-5"; // Solid white
    if (rating >= 4) return "rating-4"; // Solid gray
    if (rating >= 3) return "rating-3"; // Hollow white outline
    return "rating-low"; // Hollow gray outline
  };

  return (
    <>
      <div id="ambient-bg" ref={bgRef}></div>

      {/* Header */}
      <header className="fixed top-6 left-6 z-50 mix-blend-difference text-white">
        <h1 className="text-xs font-bold tracking-widest uppercase">
          Bookshelf
        </h1>
      </header>

      {/* Navigation Tabs */}
      <nav className="nav-wrapper">
        <button
          className={`nav-tab ${activeView === "timeline" ? "active" : ""}`}
          onClick={() => switchView("timeline")}
        >
          Timeline
        </button>
        <button
          className={`nav-tab ${activeView === "stats" ? "active" : ""}`}
          onClick={() => switchView("stats")}
        >
          Stats
        </button>
        <button
          className={`nav-tab ${activeView === "page tower" ? "active" : ""}`}
          onClick={() => switchView("page tower")}
        >
          Page Tower
        </button>
      </nav>

      {/* VIEW 1: TIMELINE */}
      <div
        className={`view-section ${activeView === "timeline" ? "active" : ""}`}
      >
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
              goal > 0
                ? Math.min(100, Math.round((booksRead / goal) * 100))
                : 0;

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
            const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
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
                          className={`book-item cursor-pointer ${getRatingClass(book.rating)}`}
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
      </div>

      {/* VIEW 2: STATS */}
      <div className={`view-section ${activeView === "stats" ? "active" : ""}`}>
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen">
              <span className="text-accent-color">Loading Analytics...</span>
            </div>
          }
        >
          {activeView === "stats" && <AnalyticsView />}
        </Suspense>
      </div>

      {/* VIEW 3: PAGE TOWER */}
      <div
        className={`view-section ${
          activeView === "page tower" ? "active" : ""
        }`}
      >
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen">
              <span className="text-accent-color">Loading Page Tower...</span>
            </div>
          }
        >
          {activeView === "page tower" && <VisualsView />}
        </Suspense>
      </div>

      {/* Modal */}
      <div id="modal" ref={modalRef}>
        <button
          id="close-modal"
          className="absolute top-6 right-6 text-white text-xl hover:text-red-500 z-10"
          onClick={closeModal}
        >
          &times; CLOSE
        </button>
        <div className="max-w-5xl mx-auto w-full flex flex-col md:flex-row gap-8 md:gap-12">
          {/* Book Cover */}
          {selectedBook && (
            <div id="modal-cover" className="flex-shrink-0 opacity-0">
              <img
                key={selectedBook.id}
                src={getBookCover(selectedBook)}
                alt={`${selectedBook.title} cover`}
                className="w-48 md:w-64 h-auto rounded-lg shadow-2xl mx-auto md:mx-0"
                style={{
                  boxShadow: `0 25px 50px -12px ${
                    bookCoverColors[selectedBook.id] || "#000"
                  }88`,
                }}
                onLoad={handleCoverLoad}
              />
            </div>
          )}
          {/* Book Details */}
          <div className="flex-1">
            <div
              id="modal-meta"
              className="flex flex-wrap items-center mb-6 opacity-0"
            >
              {selectedBook && (
                <>
                  <span className="meta-tag border-white text-white">
                    {selectedBook.year}
                  </span>
                  <span className="meta-tag">{selectedBook.genre}</span>
                  <span className="meta-tag">{selectedBook.author}</span>
                  <span className="meta-tag">{selectedBook.date}</span>
                </>
              )}
            </div>
            <h2
              id="modal-title"
              className="text-4xl md:text-6xl lg:text-7xl font-black uppercase text-white mb-8 leading-[0.85] opacity-0 translate-y-10"
            >
              {selectedBook?.title}
            </h2>
            <div className="border-t border-gray-800 pt-6">
              <p
                id="modal-notes"
                className="text-lg md:text-xl text-gray-300 font-light leading-relaxed max-w-2xl reveal-text"
              >
                {selectedBook?.notes
                  .split(" ")
                  .map((word: string, i: number) => (
                    <span key={i}>{word} </span>
                  ))}
              </p>
            </div>
            <div className="mt-8 flex gap-8 opacity-0" id="modal-stats">
              <div>
                <span className="block text-xs text-gray-500 uppercase">
                  Pages
                </span>
                <span className="text-xl font-bold">{selectedBook?.pages}</span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 uppercase">
                  Rating
                </span>
                <span className="text-xl font-bold text-amber-500">
                  {"★".repeat(Math.floor(selectedBook?.rating || 0))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
