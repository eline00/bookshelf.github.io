"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { books, yearlyGoals, genreGradients, Book } from "./data";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Sort books by date
  const sortedBooks = [...books].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Group by Year
  const grouped: Record<number, Book[]> = { 2024: [], 2025: [], 2026: [] };
  sortedBooks.forEach((b) => {
    if (grouped[b.year]) grouped[b.year].push(b);
  });

  // Kinetic scroll effect
  useEffect(() => {
    const proxy = { skew: 0 };
    const skewSetter = gsap.quickSetter(".book-item", "skewY", "deg");
    const clamp = gsap.utils.clamp(-20, 20);

    ScrollTrigger.create({
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
      ScrollTrigger.getAll().forEach((t: ScrollTrigger) => t.kill());
    };
  }, []);

  const handleMouseEnter = (genre: string) => {
    setIsHovering(true);
    if (bgRef.current) {
      bgRef.current.style.background =
        genreGradients[genre] || genreGradients["default"];
      bgRef.current.style.opacity = "0.6";
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

  const closeModal = () => {
    if (modalRef.current) {
      gsap.to(modalRef.current, {
        y: "100%",
        duration: 0.6,
        ease: "power3.in",
      });
      gsap.set("#modal-title", { opacity: 0, y: 20 });
      gsap.set(".reveal-text span", { opacity: 0, y: 20 });
      gsap.set("#modal-stats", { opacity: 0 });
      gsap.set("#modal-meta", { opacity: 0 });
    }
  };

  const getBookStyles = (book: Book) => {
    const weight = Math.max(100, Math.min(900, (book.rating / 5) * 900));
    const size = Math.max(3, Math.min(9, (book.pages / 100) * 1.5));
    return {
      fontWeight: weight,
      fontSize: `${size}vw`,
    };
  };

  return (
    <>
      <div id="ambient-bg" ref={bgRef}></div>

      {/* Headers */}
      <header className="fixed top-6 left-6 z-50 mix-blend-difference text-white">
        <h1 className="text-xs font-bold tracking-widest uppercase">
          Timeline View
        </h1>
      </header>

      <div className="fixed top-6 right-6 z-50 mix-blend-difference text-white text-right">
        <p className="text-[10px] text-gray-400">Sorted by Date</p>
        <p className="text-[10px] text-[#ccff00]">Lime = Goal</p>
      </div>

      {/* Main Stream */}
      <main
        id="stream-wrapper"
        ref={containerRef}
        className={isHovering ? "is-hovering" : ""}
      >
        <div id="timeline-rail"></div>

        {Object.keys(grouped).map((year) => {
          const yearNum = parseInt(year);
          const yearBooks = grouped[yearNum];
          const goal = yearlyGoals[yearNum as keyof typeof yearlyGoals];
          const booksRead = yearBooks.length;
          const isGoalMet = booksRead >= goal.target;

          return (
            <div key={year}>
              {/* Year Marker */}
              <div className="year-marker">
                <div className="year-title">{year}</div>
                <div className="year-goal">
                  GOAL: {goal.target} BOOKS // {goal.label.toUpperCase()}
                </div>
              </div>

              {/* Books */}
              {yearBooks.map((book) => (
                <div
                  key={book.id}
                  className="book-item cursor-pointer"
                  style={getBookStyles(book)}
                  onMouseEnter={() => handleMouseEnter(book.genre)}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => openModal(book)}
                >
                  {book.title}
                </div>
              ))}

              {/* Year Status */}
              <div
                className="year-status"
                style={{ borderColor: isGoalMet ? "#ccff00" : "#333" }}
              >
                <h3 style={{ color: isGoalMet ? "#ccff00" : "#666" }}>
                  {isGoalMet ? "MISSION ACCOMPLISHED" : "IN PROGRESS"}
                </h3>
                <span>
                  {booksRead} / {goal.target} BOOKS COMPLETED
                </span>
              </div>
            </div>
          );
        })}
      </main>

      {/* Modal */}
      <div id="modal" ref={modalRef}>
        <button
          id="close-modal"
          className="absolute top-6 right-6 text-white text-xl hover:text-red-500"
          onClick={closeModal}
        >
          &times; CLOSE
        </button>
        <div className="max-w-4xl mx-auto w-full">
          <div id="modal-meta" className="flex items-center mb-6 opacity-0">
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
            className="text-6xl md:text-8xl font-black uppercase text-white mb-12 leading-[0.8] opacity-0 translate-y-10"
          >
            {selectedBook?.title}
          </h2>
          <div className="border-t border-gray-800 pt-8">
            <p
              id="modal-notes"
              className="text-xl md:text-2xl text-gray-300 font-light leading-relaxed max-w-2xl reveal-text"
            >
              {selectedBook?.notes.split(" ").map((word, i) => (
                <span key={i}>{word} </span>
              ))}
            </p>
          </div>
          <div className="mt-12 flex gap-8 opacity-0" id="modal-stats">
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
    </>
  );
}
