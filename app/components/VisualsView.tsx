"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { gsap } from "gsap";
import { books } from "../data";

type ViewMode = "tower" | "tree" | "shelf" | "scroll";

// Genre-based typographic textures (text characters only)
const genreTextures: Record<string, string> = {
  Romantasy: "xoxoXOXO.,;:'\"~-_+=(){}[]<>/?!@#$%&*",
  Fantasy: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  "Dark Romance": "01234567890!@#$%^&*()-_=+[]{}|;:',.<>?/\\",
  Fanfic: "aeiouAEIOU.,;:'\"~-_+=(){}[]<>/?!@#$%&*12345",
  Fiction: "THEQUICKBROWNFOXJUMPSOVERTHELAZYDOGthequickbrownfox",
  default: "..........----------__________",
};

function getTexture(genre: string, length: number): string {
  const chars = genreTextures[genre] || genreTextures.default;
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Generate realistic tree shape with multiple tiers
function generateTreeLines(): { line: string; isLeaves: boolean }[] {
  const leafChars = "▓▒░█▄▀■□●○◆◇★☆";
  const trunkChars = "║│┃|!1lI";

  const lines: { line: string; isLeaves: boolean }[] = [];
  const maxWidth = 50;

  // Create a more realistic pine tree with multiple tiers
  const tiers = [
    { startWidth: 2, endWidth: 14, rows: 6 }, // Top tier (smallest)
    { startWidth: 8, endWidth: 22, rows: 7 }, // Second tier
    { startWidth: 14, endWidth: 32, rows: 8 }, // Third tier
    { startWidth: 20, endWidth: 44, rows: 9 }, // Bottom tier (largest)
  ];

  // Generate crown tiers
  for (const tier of tiers) {
    for (let row = 0; row < tier.rows; row++) {
      const progress = row / (tier.rows - 1);
      const width = Math.floor(
        tier.startWidth + (tier.endWidth - tier.startWidth) * progress
      );
      const padding = Math.floor((maxWidth - width) / 2);

      let line = " ".repeat(padding);
      for (let i = 0; i < width; i++) {
        line += leafChars.charAt(Math.floor(Math.random() * leafChars.length));
      }
      lines.push({ line, isLeaves: true });
    }
  }

  // Generate trunk
  const trunkWidth = 6;
  const trunkHeight = 8;
  for (let row = 0; row < trunkHeight; row++) {
    const padding = Math.floor((maxWidth - trunkWidth) / 2);
    let line = " ".repeat(padding);
    for (let i = 0; i < trunkWidth; i++) {
      line += trunkChars.charAt(Math.floor(Math.random() * trunkChars.length));
    }
    lines.push({ line, isLeaves: false });
  }

  return lines;
}

// Generate tree data structure for rendering with fill percentage
// Fill from bottom to top (tree grows from ground up)
function generateTreeData(fillPercent: number = 1): {
  lines: { line: string; isLeaves: boolean; isFilled: boolean }[];
} {
  const baseLines = generateTreeLines();
  const totalLeafLines = baseLines.filter((l) => l.isLeaves).length;
  const filledLeafLines = Math.floor(totalLeafLines * fillPercent);

  // Count leaf lines from bottom to fill from bottom up
  const leafIndices: number[] = [];
  baseLines.forEach((lineData, index) => {
    if (lineData.isLeaves) {
      leafIndices.push(index);
    }
  });

  // Reverse to get bottom-to-top order, then take the filled amount
  const filledIndices = new Set(leafIndices.slice(-filledLeafLines));

  const lines = baseLines.map((lineData, index) => {
    if (lineData.isLeaves) {
      const isFilled = filledIndices.has(index);
      return { ...lineData, isFilled };
    }
    // Trunk is always "filled"
    return { ...lineData, isFilled: true };
  });

  return { lines };
}

// Pre-calculate book data with consistent textures
function generateBookData() {
  const sortedBooks = [...books].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return sortedBooks.map((book, index) => {
    // Calculate texture length based on box dimensions
    const boxHeight = book.pages * 0.8;
    const linesNeeded = Math.ceil(boxHeight / 12) + 5;
    const charsPerLine = 120;
    const textureLength = linesNeeded * charsPerLine;

    const texture = getTexture(book.genre, textureLength);

    return {
      ...book,
      texture,
      index,
    };
  });
}

// View mode descriptions for context
const viewDescriptions: Record<ViewMode, { title: string; subtitle: string }> =
  {
    tower: {
      title: "BOOK STACK",
      subtitle: "Books stacked by read order, spine thickness = pages",
    },
    tree: {
      title: "PAPER FOREST",
      subtitle: "Your pages consumed as trees of paper",
    },
    shelf: {
      title: "BOOKSHELF",
      subtitle: "Books arranged by author, width = page count",
    },
    scroll: {
      title: "SCROLL",
      subtitle: "All the pages as one continuous paper scroll",
    },
  };

export default function VisualsView() {
  const [viewMode, setViewMode] = useState<ViewMode>("tower");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [particlesInitialized, setParticlesInitialized] = useState(false);
  const [shelfStyleActive, setShelfStyleActive] = useState(false);
  const [towerStyleActive, setTowerStyleActive] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const particleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const treeContainerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollAnimationRef = useRef<gsap.core.Tween | null>(null);

  const totalPages = books.reduce((sum, b) => sum + b.pages, 0);

  // Pre-generate book data
  const bookData = useMemo(() => generateBookData(), []);

  // Calculate interesting comparisons
  const comparisons = useMemo(() => {
    const totalPagesNum = books.reduce((sum, b) => sum + b.pages, 0);

    // Average book is ~250 words per page
    const totalWords = totalPagesNum * 250;

    // Average tree produces ~8,333 sheets of paper (16,666 pages)
    const treesWorth = totalPagesNum / 16666;

    // Stacked paper height (0.1mm per page = 0.0001m)
    const stackedMeters = totalPagesNum * 0.0001;

    // Scroll length: standard page is ~28cm tall (A4/Letter size)
    // All pages attached = totalPages * 0.28m
    const scrollLengthMeters = totalPagesNum * 0.28;
    const scrollLengthKm = scrollLengthMeters / 1000;

    // Fun comparisons for scroll length
    const titanics = scrollLengthMeters / 269; // Titanic = 269m
    const statuesOfLiberty = scrollLengthMeters / 93; // Statue of Liberty = 93m (to torch)
    const eiffelTowers = scrollLengthMeters / 330; // Eiffel Tower = 330m

    return {
      totalPages: totalPagesNum,
      totalWords,
      treesWorth,
      stackedMeters,
      scrollLengthMeters,
      scrollLengthKm,
      titanics,
      statuesOfLiberty,
      eiffelTowers,
    };
  }, []);

  // Generate scroll segments with distance markers every 100m
  const scrollSegments = useMemo(() => {
    const METERS_PER_PAGE = 0.28;
    const MARKER_INTERVAL = 100; // meters
    const segments: Array<
      | { type: "book"; book: (typeof bookData)[0] }
      | { type: "marker"; distance: number }
    > = [];

    let cumulativeMeters = 0;
    let nextMarkerAt = MARKER_INTERVAL;

    bookData.forEach((book) => {
      const bookMeters = book.pages * METERS_PER_PAGE;

      // Check if we need to insert marker(s) before or during this book
      while (cumulativeMeters + bookMeters >= nextMarkerAt) {
        segments.push({ type: "marker", distance: nextMarkerAt });
        nextMarkerAt += MARKER_INTERVAL;
      }

      segments.push({ type: "book", book });
      cumulativeMeters += bookMeters;
    });

    return segments;
  }, [bookData]);

  // Generate tree data for the forest view
  const treeData = useMemo(() => {
    const fullTrees = Math.floor(comparisons.treesWorth);
    const partialTree = comparisons.treesWorth - fullTrees;

    const trees: {
      lines: { line: string; isLeaves: boolean; isFilled: boolean }[];
      isFull: boolean;
      percent: number;
    }[] = [];

    // Generate full trees
    for (let i = 0; i < fullTrees; i++) {
      trees.push({
        ...generateTreeData(1),
        isFull: true,
        percent: 100,
      });
    }

    // Generate partial tree if there's a remainder
    if (partialTree > 0) {
      trees.push({
        ...generateTreeData(partialTree),
        isFull: false,
        percent: Math.round(partialTree * 100),
      });
    }

    return trees;
  }, [comparisons.treesWorth]);

  // Sort books by author for shelf view
  const shelfSortedBooks = useMemo(() => {
    return [...bookData].sort((a, b) => a.author.localeCompare(b.author));
  }, [bookData]);

  // Position type for layout calculations
  type LayoutPosition = {
    width: number;
    height: number;
    x: number;
    y: number;
    rotation: number;
    fontSize: string;
    paddingLeft: string;
    zIndex: number;
    borderRadius?: string;
    opacity?: number;
  };

  // Calculate positions for each layout mode
  const calculateLayout = (mode: ViewMode): LayoutPosition[] => {
    if (!containerRef.current) return [];

    const containerWidth = containerRef.current.offsetWidth;
    const centerX = containerWidth / 2;

    const positions: LayoutPosition[] = [];

    if (mode === "tower") {
      // TOWER: Books stacked like a pile, spine facing front
      // Height (spine thickness) based on page count
      const bookWidth = Math.min(500, containerWidth - 80); // Fixed width for all books
      let currentY = 0;

      // Stack from bottom to top (reverse order so newest on top)
      const reversedBooks = [...bookData].reverse();

      reversedBooks.forEach((book, i) => {
        // Spine thickness: min 12px, max 40px based on pages
        const spineHeight = Math.max(12, Math.min(40, book.pages * 0.06));

        positions.push({
          width: bookWidth,
          height: spineHeight,
          x: centerX - bookWidth / 2,
          y: currentY,
          rotation: 0,
          fontSize: "11px",
          paddingLeft: "16px",
          zIndex: bookData.length - i,
        });

        currentY += spineHeight;
      });

      // Reverse positions to match original bookData order
      positions.reverse();
    } else if (mode === "tree") {
      // TREE: Hide particles (fade out) and show ASCII tree overlay instead
      // Particles collapse to center and fade out
      bookData.forEach((_, index) => {
        positions[index] = {
          width: 5,
          height: 5,
          x: centerX - 2.5,
          y: 300,
          rotation: 0,
          fontSize: "0px",
          paddingLeft: "0px",
          zIndex: 0,
          borderRadius: "50%",
          opacity: 0,
        };
      });
    } else if (mode === "shelf") {
      // SHELF: Books arranged in rows like a bookshelf
      const shelfWidth = Math.min(950, containerWidth - 40);
      const startX = centerX - shelfWidth / 2;
      const spineHeight = 200;
      const shelfSpacing = 240; // Height between shelves
      const gap = 3;

      // Create a mapping from original index to shelf position
      const shelfPositions: Map<
        number,
        { x: number; y: number; width: number }
      > = new Map();

      let currentX = 0;
      let currentShelf = 0;

      shelfSortedBooks.forEach((book) => {
        const spineWidth = Math.max(25, Math.min(80, book.pages * 0.12));

        if (currentX + spineWidth > shelfWidth) {
          currentShelf++;
          currentX = 0;
        }

        shelfPositions.set(book.index, {
          x: startX + currentX,
          y: currentShelf * shelfSpacing,
          width: spineWidth,
        });

        currentX += spineWidth + gap;
      });

      // Now assign positions based on original bookData order
      bookData.forEach((book) => {
        const pos = shelfPositions.get(book.index);
        if (pos) {
          positions.push({
            width: pos.width,
            height: spineHeight,
            x: pos.x,
            y: pos.y,
            rotation: 0,
            fontSize: "6px",
            paddingLeft: "2px",
            zIndex: 1,
          });
        } else {
          positions.push({
            width: 0,
            height: 0,
            x: -1000,
            y: -1000,
            rotation: 0,
            fontSize: "0px",
            paddingLeft: "0px",
            zIndex: 0,
            opacity: 0,
          });
        }
      });
    } else if (mode === "scroll") {
      // SCROLL: Hide particles and show scroll overlay instead
      bookData.forEach((_, index) => {
        positions[index] = {
          width: 5,
          height: 5,
          x: centerX - 2.5,
          y: 300,
          rotation: 0,
          fontSize: "0px",
          paddingLeft: "0px",
          zIndex: 0,
          borderRadius: "50%",
          opacity: 0,
        };
      });
    }

    return positions;
  };

  // Get container height based on layout
  const getContainerHeight = (mode: ViewMode): number => {
    if (mode === "tower") {
      // Calculate total height based on spine thicknesses
      const totalSpineHeight = bookData.reduce((sum, b) => {
        return sum + Math.max(12, Math.min(40, b.pages * 0.06));
      }, 0);
      return totalSpineHeight + 100;
    } else if (mode === "tree") {
      return 650; // Crown height (450) + trunk (80) + padding
    } else if (mode === "shelf") {
      // Calculate number of shelves needed
      const containerWidth = containerRef.current?.offsetWidth || 1000;
      const shelfWidth = Math.min(950, containerWidth - 40);
      let currentX = 0;
      let shelfCount = 1;

      shelfSortedBooks.forEach((book) => {
        const spineWidth = Math.max(25, Math.min(80, book.pages * 0.12));
        if (currentX + spineWidth > shelfWidth) {
          shelfCount++;
          currentX = 0;
        }
        currentX += spineWidth + 3;
      });

      return shelfCount * 240 + 200;
    } else if (mode === "scroll") {
      return 1400; // Fixed height for scroll visualization with comparison cards
    }
    return 1200;
  };

  // Start the continuous scroll animation
  const startScrollAnimation = () => {
    const scrollRibbon = document.querySelector(
      ".scroll-ribbon"
    ) as HTMLElement;
    if (!scrollRibbon) return;

    // Reset position
    gsap.set(scrollRibbon, { x: 0 });

    // Calculate the width of one segment (half of total since we duplicate)
    const segmentWidth = scrollRibbon.scrollWidth / 2;

    // Create infinite scroll animation
    scrollAnimationRef.current = gsap.to(scrollRibbon, {
      x: -segmentWidth,
      duration: 60, // Slow, hypnotic scroll
      ease: "none",
      repeat: -1,
    });
  };

  // Animate to new layout
  const animateToLayout = (newMode: ViewMode) => {
    if (isTransitioning || newMode === viewMode) return;

    setIsTransitioning(true);
    // Immediately remove special styling when leaving current view
    setShelfStyleActive(false);
    setTowerStyleActive(false);
    setViewMode(newMode);

    const positions = calculateLayout(newMode);

    particleRefs.current.forEach((el, i) => {
      if (!el || !positions[i]) return;
      const pos = positions[i];

      gsap.to(el, {
        width: pos.width,
        height: pos.height,
        left: pos.x,
        top: pos.y,
        rotation: pos.rotation,
        fontSize: pos.fontSize,
        paddingLeft: pos.paddingLeft,
        zIndex: pos.zIndex,
        borderRadius: pos.borderRadius || "0px",
        opacity: pos.opacity !== undefined ? pos.opacity : 1,
        duration: 1.2,
        ease: "expo.inOut",
        overwrite: "auto",
      });
    });

    // Animate ASCII tree overlay (shows after particles fade out)
    if (treeContainerRef.current) {
      gsap.to(treeContainerRef.current, {
        opacity: newMode === "tree" ? 1 : 0,
        duration: 0.6,
        delay: newMode === "tree" ? 0.8 : 0,
        ease: "power2.inOut",
      });
    }

    // Animate scroll overlay
    if (scrollContainerRef.current) {
      gsap.to(scrollContainerRef.current, {
        opacity: newMode === "scroll" ? 1 : 0,
        duration: 0.6,
        delay: newMode === "scroll" ? 0.8 : 0,
        ease: "power2.inOut",
      });

      // Start/stop scroll animation
      if (newMode === "scroll") {
        // Start animation after fade in
        setTimeout(() => {
          startScrollAnimation();
        }, 1400);
      } else {
        // Stop animation
        if (scrollAnimationRef.current) {
          scrollAnimationRef.current.kill();
          scrollAnimationRef.current = null;
        }
      }
    }

    if (containerRef.current) {
      gsap.to(containerRef.current, {
        height: getContainerHeight(newMode),
        duration: 1.2,
        ease: "expo.inOut",
      });
    }

    setTimeout(() => {
      setIsTransitioning(false);
      // Apply special styling only AFTER transition completes
      if (newMode === "shelf") {
        setShelfStyleActive(true);
      } else if (newMode === "tower") {
        setTowerStyleActive(true);
      }
    }, 1200);
  };

  // Initialize particles and set initial layout
  useEffect(() => {
    if (particlesInitialized) return;

    const positions = calculateLayout(viewMode);

    particleRefs.current.forEach((el, i) => {
      if (!el || !positions[i]) return;
      const pos = positions[i];

      gsap.set(el, {
        width: pos.width,
        height: pos.height,
        left: pos.x,
        top: pos.y,
        rotation: pos.rotation,
        fontSize: pos.fontSize,
        paddingLeft: pos.paddingLeft,
        zIndex: pos.zIndex,
        borderRadius: pos.borderRadius || "0px",
        opacity: pos.opacity !== undefined ? pos.opacity : 1,
      });
    });

    if (containerRef.current) {
      containerRef.current.style.height = `${getContainerHeight(viewMode)}px`;
    }

    // Set initial overlay opacities
    if (treeContainerRef.current) {
      treeContainerRef.current.style.opacity = viewMode === "tree" ? "1" : "0";
    }
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.opacity =
        viewMode === "scroll" ? "1" : "0";
    }

    setParticlesInitialized(true);
  }, [particlesInitialized, viewMode, bookData]);

  // Recalculate on window resize
  useEffect(() => {
    const handleResize = () => {
      if (!particlesInitialized) return;
      const positions = calculateLayout(viewMode);

      particleRefs.current.forEach((el, i) => {
        if (!el || !positions[i]) return;
        const pos = positions[i];

        gsap.to(el, {
          width: pos.width,
          height: pos.height,
          left: pos.x,
          top: pos.y,
          duration: 0.5,
          ease: "power2.out",
        });
      });

      if (containerRef.current) {
        containerRef.current.style.height = `${getContainerHeight(viewMode)}px`;
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [particlesInitialized, viewMode, bookData]);

  const currentView = viewDescriptions[viewMode];

  return (
    <div id="visuals-wrapper">
      {/* Header */}
      <div className="visuals-header">
        <h2 className="visuals-title">{currentView.title}</h2>
        <p className="visuals-subtitle">{currentView.subtitle}</p>
      </div>

      {/* View Mode Controls */}
      <div className="visual-controls-wrapper">
        <button
          className={`vis-btn ${viewMode === "tower" ? "active" : ""}`}
          onClick={() => animateToLayout("tower")}
          disabled={isTransitioning}
        >
          Tower
        </button>
        <button
          className={`vis-btn ${viewMode === "shelf" ? "active" : ""}`}
          onClick={() => animateToLayout("shelf")}
          disabled={isTransitioning}
        >
          Shelf
        </button>
        <button
          className={`vis-btn ${viewMode === "tree" ? "active" : ""}`}
          onClick={() => animateToLayout("tree")}
          disabled={isTransitioning}
        >
          Forest
        </button>
        <button
          className={`vis-btn ${viewMode === "scroll" ? "active" : ""}`}
          onClick={() => animateToLayout("scroll")}
          disabled={isTransitioning}
        >
          Scroll
        </button>
      </div>

      {/* Context Card - Shows relevant comparison for current view */}
      <div className="comparison-card">
        {viewMode === "tower" && (
          <>
            <div className="comparison-stat">
              <span className="comparison-value">
                {comparisons.stackedMeters.toFixed(1)}m
              </span>
              <span className="comparison-label">IF STACKED</span>
            </div>
            <div className="comparison-divider" />
            <div className="comparison-stat">
              <span className="comparison-value">
                {totalPages.toLocaleString()}
              </span>
              <span className="comparison-label">PAGES TOTAL</span>
            </div>
          </>
        )}
        {viewMode === "tree" && (
          <>
            <div className="comparison-stat">
              <span className="comparison-value">
                {comparisons.treesWorth.toFixed(2)}
              </span>
              <span className="comparison-label">TREES OF PAPER</span>
            </div>
            <div className="comparison-divider" />
            <div className="comparison-stat">
              <span className="comparison-value">16,666</span>
              <span className="comparison-label">PAGES / TREE</span>
            </div>
          </>
        )}
        {viewMode === "shelf" && (
          <>
            <div className="comparison-stat">
              <span className="comparison-value">{books.length}</span>
              <span className="comparison-label">BOOKS</span>
            </div>
            <div className="comparison-divider" />
            <div className="comparison-stat">
              <span className="comparison-value">
                {Math.round(totalPages / books.length)}
              </span>
              <span className="comparison-label">AVG PAGES</span>
            </div>
          </>
        )}
        {viewMode === "scroll" && (
          <>
            <div className="comparison-stat">
              <span className="comparison-value">
                {comparisons.scrollLengthKm.toFixed(2)}km
              </span>
              <span className="comparison-label">SCROLL LENGTH</span>
            </div>
            <div className="comparison-divider" />
            <div className="comparison-stat">
              <span className="comparison-value">
                {Math.round(comparisons.eiffelTowers)}
              </span>
              <span className="comparison-label">EIFFEL TOWERS</span>
            </div>
          </>
        )}
      </div>

      {/* Dynamic Particle Container */}
      <div
        id="dynamic-visuals-container"
        ref={containerRef}
        className={`view-${viewMode}`}
      >
        {/* Book particles */}
        {bookData.map((book, index) => (
          <div
            key={book.id}
            ref={(el) => {
              particleRefs.current[index] = el;
            }}
            className={`vis-particle ${shelfStyleActive ? "shelf-mode" : ""} ${towerStyleActive ? "tower-mode" : ""}`}
            title={`${book.title} by ${book.author} — ${book.pages} pages`}
          >
            <span className={`vis-title ${shelfStyleActive ? "vertical" : ""}`}>
              {book.title}
            </span>
            {!towerStyleActive && book.texture}
          </div>
        ))}

        {/* ASCII Tree overlay - shows when in tree mode */}
        <div
          ref={treeContainerRef}
          className="tree-ascii-overlay"
          style={{ opacity: 0 }}
        >
          <div className="tree-ascii-row">
            {treeData.map((tree, i) => (
              <div key={i} className="tree-ascii-item">
                <pre className="tree-ascii">
                  {tree.lines.map((lineData, lineIndex) => (
                    <span
                      key={lineIndex}
                      className={
                        lineData.isLeaves
                          ? lineData.isFilled
                            ? "tree-leaves-filled"
                            : "tree-leaves-empty"
                          : "tree-trunk"
                      }
                    >
                      {lineData.line}
                      {"\n"}
                    </span>
                  ))}
                </pre>
                <div className="tree-percent-label">
                  {tree.isFull ? "100%" : `${tree.percent}%`}
                </div>
              </div>
            ))}
          </div>
          <div className="tree-legend">
            <p className="tree-legend-text">
              {totalPages.toLocaleString()} pages ={" "}
              {comparisons.treesWorth.toFixed(2)} trees
            </p>
            <p className="tree-legend-subtext">
              (1 tree ≈ 16,666 pages of paper)
            </p>
          </div>
        </div>

        {/* Scroll overlay - shows when in scroll mode */}
        <div
          ref={scrollContainerRef}
          className="scroll-overlay"
          style={{ opacity: 0 }}
        >
          {/* Length display */}
          <div className="scroll-length-display">
            <span className="scroll-length-value">
              {comparisons.scrollLengthKm.toFixed(2)}
            </span>
            <span className="scroll-length-unit">KILOMETERS</span>
            <span className="scroll-length-meters">
              ({Math.round(comparisons.scrollLengthMeters).toLocaleString()}m)
            </span>
          </div>

          {/* The animated scroll ribbon */}
          <div className="scroll-track">
            <div className="scroll-ribbon">
              {/* First set of books with distance markers */}
              {scrollSegments.map((segment) =>
                segment.type === "marker" ? (
                  <div
                    key={`a-marker-${segment.distance}`}
                    className="scroll-marker"
                  >
                    <span className="scroll-marker-line" />
                    <span className="scroll-marker-label">
                      {segment.distance}m
                    </span>
                  </div>
                ) : (
                  <div
                    key={`a-${segment.book.id}`}
                    className="scroll-segment"
                    style={{
                      width: `${segment.book.pages * 0.3}px`,
                      opacity: 0.3 + (segment.book.rating / 5) * 0.7,
                    }}
                  >
                    <span className="scroll-book-title">
                      {segment.book.title}
                    </span>
                    <span className="scroll-book-pages">
                      {segment.book.pages}p
                    </span>
                  </div>
                )
              )}
              {/* Duplicate for seamless loop */}
              {scrollSegments.map((segment) =>
                segment.type === "marker" ? (
                  <div
                    key={`b-marker-${segment.distance}`}
                    className="scroll-marker"
                  >
                    <span className="scroll-marker-line" />
                    <span className="scroll-marker-label">
                      {segment.distance}m
                    </span>
                  </div>
                ) : (
                  <div
                    key={`b-${segment.book.id}`}
                    className="scroll-segment"
                    style={{
                      width: `${segment.book.pages * 0.3}px`,
                      opacity: 0.3 + (segment.book.rating / 5) * 0.7,
                    }}
                  >
                    <span className="scroll-book-title">
                      {segment.book.title}
                    </span>
                    <span className="scroll-book-pages">
                      {segment.book.pages}p
                    </span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Comparison cards with multiple illustrations */}
          <div className="scroll-comparisons">
            {/* Titanics */}
            <div className="scroll-compare-item">
              <span className="scroll-compare-label">Titanics</span>
              <span className="scroll-compare-value">
                {Math.round(comparisons.titanics)}
              </span>
              <div className="scroll-illustration-grid titanic-grid">
                {Array.from({ length: Math.round(comparisons.titanics) }).map(
                  (_, i) => (
                    <svg
                      key={i}
                      viewBox="0 0 40 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="mini-icon"
                    >
                      {/* Hull */}
                      <path
                        d="M2 14 L5 18 L35 18 L38 14 L36 14 L34 10 L6 10 L4 14 Z"
                        stroke="currentColor"
                        strokeWidth="0.5"
                        fill="none"
                      />
                      {/* Deck structures */}
                      <rect
                        x="8"
                        y="6"
                        width="24"
                        height="4"
                        stroke="currentColor"
                        strokeWidth="0.4"
                        fill="none"
                      />
                      <rect
                        x="10"
                        y="3"
                        width="8"
                        height="3"
                        stroke="currentColor"
                        strokeWidth="0.3"
                        fill="none"
                      />
                      <rect
                        x="22"
                        y="3"
                        width="8"
                        height="3"
                        stroke="currentColor"
                        strokeWidth="0.3"
                        fill="none"
                      />
                      {/* Funnels */}
                      <rect
                        x="12"
                        y="0"
                        width="3"
                        height="3"
                        fill="currentColor"
                        opacity="0.4"
                      />
                      <rect
                        x="18"
                        y="0"
                        width="3"
                        height="3"
                        fill="currentColor"
                        opacity="0.4"
                      />
                      <rect
                        x="24"
                        y="0"
                        width="3"
                        height="3"
                        fill="currentColor"
                        opacity="0.4"
                      />
                      <rect
                        x="30"
                        y="1"
                        width="2"
                        height="2"
                        fill="currentColor"
                        opacity="0.3"
                      />
                      {/* Portholes */}
                      <circle
                        cx="10"
                        cy="12"
                        r="0.8"
                        fill="currentColor"
                        opacity="0.3"
                      />
                      <circle
                        cx="15"
                        cy="12"
                        r="0.8"
                        fill="currentColor"
                        opacity="0.3"
                      />
                      <circle
                        cx="20"
                        cy="12"
                        r="0.8"
                        fill="currentColor"
                        opacity="0.3"
                      />
                      <circle
                        cx="25"
                        cy="12"
                        r="0.8"
                        fill="currentColor"
                        opacity="0.3"
                      />
                      <circle
                        cx="30"
                        cy="12"
                        r="0.8"
                        fill="currentColor"
                        opacity="0.3"
                      />
                    </svg>
                  )
                )}
              </div>
            </div>

            {/* Statues of Liberty */}
            <div className="scroll-compare-item">
              <span className="scroll-compare-label">Statues of Liberty</span>
              <span className="scroll-compare-value">
                {Math.round(comparisons.statuesOfLiberty)}
              </span>
              <div className="scroll-illustration-grid statue-grid">
                {Array.from({
                  length: Math.round(comparisons.statuesOfLiberty),
                }).map((_, i) => (
                  <svg
                    key={i}
                    viewBox="0 0 16 28"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="mini-icon"
                  >
                    {/* Pedestal */}
                    <rect
                      x="4"
                      y="22"
                      width="8"
                      height="6"
                      stroke="currentColor"
                      strokeWidth="0.4"
                      fill="none"
                    />
                    <rect
                      x="5"
                      y="20"
                      width="6"
                      height="2"
                      stroke="currentColor"
                      strokeWidth="0.3"
                      fill="none"
                    />
                    {/* Body/Robe */}
                    <path
                      d="M8 20 L6 12 L5 12 L4 20 L8 20"
                      stroke="currentColor"
                      strokeWidth="0.4"
                      fill="none"
                    />
                    <path
                      d="M8 20 L10 12 L11 12 L12 20 L8 20"
                      stroke="currentColor"
                      strokeWidth="0.4"
                      fill="none"
                    />
                    {/* Torso */}
                    <path
                      d="M6 12 L7 8 L9 8 L10 12"
                      stroke="currentColor"
                      strokeWidth="0.4"
                      fill="none"
                    />
                    {/* Head with crown */}
                    <circle
                      cx="8"
                      cy="6"
                      r="2"
                      stroke="currentColor"
                      strokeWidth="0.4"
                      fill="none"
                    />
                    {/* Crown spikes */}
                    <line
                      x1="6"
                      y1="4"
                      x2="5"
                      y2="2"
                      stroke="currentColor"
                      strokeWidth="0.3"
                    />
                    <line
                      x1="7"
                      y1="4"
                      x2="6.5"
                      y2="1.5"
                      stroke="currentColor"
                      strokeWidth="0.3"
                    />
                    <line
                      x1="8"
                      y1="4"
                      x2="8"
                      y2="1"
                      stroke="currentColor"
                      strokeWidth="0.3"
                    />
                    <line
                      x1="9"
                      y1="4"
                      x2="9.5"
                      y2="1.5"
                      stroke="currentColor"
                      strokeWidth="0.3"
                    />
                    <line
                      x1="10"
                      y1="4"
                      x2="11"
                      y2="2"
                      stroke="currentColor"
                      strokeWidth="0.3"
                    />
                    {/* Torch arm */}
                    <line
                      x1="11"
                      y1="10"
                      x2="14"
                      y2="4"
                      stroke="currentColor"
                      strokeWidth="0.4"
                    />
                    {/* Torch */}
                    <ellipse
                      cx="14"
                      cy="3"
                      rx="1.5"
                      ry="2"
                      fill="currentColor"
                      opacity="0.5"
                    />
                    {/* Tablet arm */}
                    <line
                      x1="5"
                      y1="10"
                      x2="3"
                      y2="14"
                      stroke="currentColor"
                      strokeWidth="0.4"
                    />
                    <rect
                      x="2"
                      y="12"
                      width="2"
                      height="4"
                      stroke="currentColor"
                      strokeWidth="0.3"
                      fill="none"
                    />
                  </svg>
                ))}
              </div>
            </div>

            {/* Eiffel Towers */}
            <div className="scroll-compare-item">
              <span className="scroll-compare-label">Eiffel Towers</span>
              <span className="scroll-compare-value">
                {Math.round(comparisons.eiffelTowers)}
              </span>
              <div className="scroll-illustration-grid tower-grid">
                {Array.from({
                  length: Math.round(comparisons.eiffelTowers),
                }).map((_, i) => (
                  <svg
                    key={i}
                    viewBox="0 0 24 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="mini-icon"
                  >
                    {/* Antenna/spire */}
                    <line
                      x1="12"
                      y1="0"
                      x2="12"
                      y2="4"
                      stroke="currentColor"
                      strokeWidth="0.5"
                    />
                    {/* Top section */}
                    <path
                      d="M11 4 L10.5 8 L13.5 8 L13 4 Z"
                      stroke="currentColor"
                      strokeWidth="0.4"
                      fill="none"
                    />
                    {/* Upper platform */}
                    <rect
                      x="9.5"
                      y="8"
                      width="5"
                      height="1"
                      stroke="currentColor"
                      strokeWidth="0.3"
                      fill="currentColor"
                      opacity="0.2"
                    />
                    {/* Middle section with taper */}
                    <path
                      d="M10 9 L8 18 L16 18 L14 9 Z"
                      stroke="currentColor"
                      strokeWidth="0.4"
                      fill="none"
                    />
                    {/* Middle platform (main observation deck) */}
                    <rect
                      x="6.5"
                      y="18"
                      width="11"
                      height="1.5"
                      stroke="currentColor"
                      strokeWidth="0.3"
                      fill="currentColor"
                      opacity="0.2"
                    />
                    {/* Lower section - four legs spreading out */}
                    <path
                      d="M7 19.5 Q6 28 1 39"
                      stroke="currentColor"
                      strokeWidth="0.5"
                      fill="none"
                    />
                    <path
                      d="M17 19.5 Q18 28 23 39"
                      stroke="currentColor"
                      strokeWidth="0.5"
                      fill="none"
                    />
                    {/* Inner leg lines */}
                    <path
                      d="M9 19.5 Q9.5 28 7 39"
                      stroke="currentColor"
                      strokeWidth="0.4"
                      fill="none"
                    />
                    <path
                      d="M15 19.5 Q14.5 28 17 39"
                      stroke="currentColor"
                      strokeWidth="0.4"
                      fill="none"
                    />
                    {/* Arch between the legs */}
                    <path
                      d="M5 32 Q12 26 19 32"
                      stroke="currentColor"
                      strokeWidth="0.4"
                      fill="none"
                    />
                    {/* Cross bracing / lattice hints */}
                    <line
                      x1="3"
                      y1="35"
                      x2="7"
                      y2="32"
                      stroke="currentColor"
                      strokeWidth="0.3"
                      opacity="0.5"
                    />
                    <line
                      x1="21"
                      y1="35"
                      x2="17"
                      y2="32"
                      stroke="currentColor"
                      strokeWidth="0.3"
                      opacity="0.5"
                    />
                    <line
                      x1="4"
                      y1="37"
                      x2="8"
                      y2="34"
                      stroke="currentColor"
                      strokeWidth="0.3"
                      opacity="0.5"
                    />
                    <line
                      x1="20"
                      y1="37"
                      x2="16"
                      y2="34"
                      stroke="currentColor"
                      strokeWidth="0.3"
                      opacity="0.5"
                    />
                    {/* Base */}
                    <line
                      x1="0"
                      y1="39"
                      x2="8"
                      y2="39"
                      stroke="currentColor"
                      strokeWidth="0.5"
                    />
                    <line
                      x1="16"
                      y1="39"
                      x2="24"
                      y2="39"
                      stroke="currentColor"
                      strokeWidth="0.5"
                    />
                  </svg>
                ))}
              </div>
            </div>
          </div>

          {/* Page counter */}
          <div className="scroll-page-counter">
            <span className="scroll-counter-value">
              {totalPages.toLocaleString()}
            </span>
            <span className="scroll-counter-label">
              pages stitched together
            </span>
          </div>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="visuals-stats">
        <div className="stat-item">
          <span className="stat-val">{books.length}</span>
          <span className="stat-lbl">BOOKS</span>
        </div>
        <div className="stat-item">
          <span className="stat-val">{totalPages.toLocaleString()}</span>
          <span className="stat-lbl">PAGES</span>
        </div>
        <div className="stat-item">
          <span className="stat-val">
            {Math.round(totalPages / books.length)}
          </span>
          <span className="stat-lbl">AVG LENGTH</span>
        </div>
        <div className="stat-item">
          <span className="stat-val">
            {Math.max(...books.map((b) => b.pages))}
          </span>
          <span className="stat-lbl">LONGEST</span>
        </div>
      </div>
    </div>
  );
}
