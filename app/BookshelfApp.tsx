"use client";

import { useState, Suspense, lazy } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Book } from "./data";

const LandingView = lazy(() => import("./components/LandingView"));
const TimelineView = lazy(() => import("./components/TimelineView"));
const AnalyticsView = lazy(() => import("./components/AnalyticsView"));
const VisualsView = lazy(() => import("./components/VisualsView"));

type ViewType = "landing" | "timeline" | "analytics" | "visuals";

interface BookshelfAppProps {
  books: Book[];
  yearlyGoals: Record<number, number>;
}

export default function BookshelfApp({
  books,
  yearlyGoals,
}: BookshelfAppProps) {
  const [activeView, setActiveView] = useState<ViewType>("landing");

  const switchView = (view: ViewType) => {
    setActiveView(view);
    window.scrollTo(0, 0);
    // Refresh ScrollTrigger after view change
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);
  };

  return (
    <>
      {/* Header Logo */}
      <button
        className="home-icon"
        onClick={() => switchView("landing")}
        aria-label="Go to home"
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="4" width="4" height="16" rx="1" fill="currentColor" />
          <rect
            x="9"
            y="6"
            width="4"
            height="14"
            rx="1"
            fill="currentColor"
            opacity="0.7"
          />
          <rect
            x="15"
            y="2"
            width="4"
            height="18"
            rx="1"
            fill="currentColor"
            opacity="0.4"
          />
        </svg>
      </button>

      {/* Navigation Tabs */}
      <nav
        className={`nav-wrapper ${activeView === "landing" ? "nav-landing" : ""}`}
      >
        <button
          className={`nav-tab ${activeView === "landing" ? "active" : ""}`}
          onClick={() => switchView("landing")}
        >
          HOME
        </button>
        <button
          className={`nav-tab ${activeView === "timeline" ? "active" : ""}`}
          onClick={() => switchView("timeline")}
        >
          Timeline
        </button>
        <button
          className={`nav-tab ${activeView === "analytics" ? "active" : ""}`}
          onClick={() => switchView("analytics")}
        >
          ANALYTICS
        </button>
        <button
          className={`nav-tab ${activeView === "visuals" ? "active" : ""}`}
          onClick={() => switchView("visuals")}
        >
          VISUALS
        </button>
      </nav>

      {/* VIEW 0: LANDING */}
      <div
        className={`view-section ${activeView === "landing" ? "active" : ""}`}
      >
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen">
              <span className="text-accent-color">Loading...</span>
            </div>
          }
        >
          {activeView === "landing" && (
            <LandingView
              onNavigate={switchView}
              books={books}
              yearlyGoals={yearlyGoals}
            />
          )}
        </Suspense>
      </div>

      {/* VIEW 1: TIMELINE */}
      <div
        className={`view-section ${activeView === "timeline" ? "active" : ""}`}
      >
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen">
              <span className="text-accent-color">Loading Timeline...</span>
            </div>
          }
        >
          {activeView === "timeline" && (
            <TimelineView
              books={books}
              yearlyGoals={yearlyGoals}
            />
          )}
        </Suspense>
      </div>

      {/* VIEW 2: STATS */}
      <div
        className={`view-section ${activeView === "analytics" ? "active" : ""}`}
      >
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen">
              <span className="text-accent-color">Loading Analytics...</span>
            </div>
          }
        >
          {activeView === "analytics" && <AnalyticsView books={books} />}
        </Suspense>
      </div>

      {/* VIEW 3: PAGE TOWER */}
      <div
        className={`view-section ${activeView === "visuals" ? "active" : ""}`}
      >
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen">
              <span className="text-accent-color">Loading Page Tower...</span>
            </div>
          }
        >
          {activeView === "visuals" && <VisualsView books={books} />}
        </Suspense>
      </div>
    </>
  );
}
