"use client";

import { useState, Suspense, lazy } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Lazy load the views
const TimelineView = lazy(() => import("./components/TimelineView"));
const AnalyticsView = lazy(() => import("./components/AnalyticsView"));
const VisualsView = lazy(() => import("./components/VisualsView"));

type ViewType = "timeline" | "stats" | "page tower";

export default function Home() {
  const [activeView, setActiveView] = useState<ViewType>("timeline");

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
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen">
              <span className="text-accent-color">Loading Timeline...</span>
            </div>
          }
        >
          {activeView === "timeline" && <TimelineView />}
        </Suspense>
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
        className={`view-section ${activeView === "page tower" ? "active" : ""}`}
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
    </>
  );
}
