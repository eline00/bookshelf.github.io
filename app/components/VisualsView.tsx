"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { gsap } from "gsap";
import { books } from "../data";

type ViewMode = "tower" | "tree" | "shelf";

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
    { startWidth: 2, endWidth: 14, rows: 6 },   // Top tier (smallest)
    { startWidth: 8, endWidth: 22, rows: 7 },   // Second tier
    { startWidth: 14, endWidth: 32, rows: 8 },  // Third tier
    { startWidth: 20, endWidth: 44, rows: 9 },  // Bottom tier (largest)
  ];

  // Generate crown tiers
  for (const tier of tiers) {
    for (let row = 0; row < tier.rows; row++) {
      const progress = row / (tier.rows - 1);
      const width = Math.floor(tier.startWidth + (tier.endWidth - tier.startWidth) * progress);
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
  lines: { line: string; isLeaves: boolean; isFilled: boolean }[]
} {
  const baseLines = generateTreeLines();
  const totalLeafLines = baseLines.filter(l => l.isLeaves).length;
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
const viewDescriptions: Record<ViewMode, { title: string; subtitle: string }> = {
  tower: {
    title: "PAGE TOWER",
    subtitle: "Each book's height = its page count",
  },
  tree: {
    title: "PAPER FOREST",
    subtitle: "Your pages consumed as trees of paper",
  },
  shelf: {
    title: "BOOKSHELF",
    subtitle: "Books arranged by author, width = page count",
  },
};

export default function VisualsView() {
  const [viewMode, setViewMode] = useState<ViewMode>("tower");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [particlesInitialized, setParticlesInitialized] = useState(false);
  const [shelfStyleActive, setShelfStyleActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const particleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const treeContainerRef = useRef<HTMLDivElement>(null);

  const totalPages = books.reduce((sum, b) => sum + b.pages, 0);

  // Pre-generate book data
  const bookData = useMemo(() => generateBookData(), []);

  // Pixels per page for tower height calculation
  const PX_PER_PAGE = 0.8;

  // Calculate interesting comparisons
  const comparisons = useMemo(() => {
    const totalPagesNum = books.reduce((sum, b) => sum + b.pages, 0);

    // Average book is ~250 words per page
    const totalWords = totalPagesNum * 250;

    // Average tree produces ~8,333 sheets of paper (16,666 pages)
    const treesWorth = totalPagesNum / 16666;

    // Stacked paper height (0.1mm per page = 0.0001m)
    const stackedMeters = totalPagesNum * 0.0001;

    return {
      totalPages: totalPagesNum,
      totalWords,
      treesWorth,
      stackedMeters,
    };
  }, []);

  // Generate tree data for the forest view
  const treeData = useMemo(() => {
    const fullTrees = Math.floor(comparisons.treesWorth);
    const partialTree = comparisons.treesWorth - fullTrees;

    const trees: {
      lines: { line: string; isLeaves: boolean; isFilled: boolean }[];
      isFull: boolean;
      percent: number
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
      // TOWER: Stack vertically, height = pages
      let currentY = 0;
      const blockWidth = Math.min(800, containerWidth - 40);

      bookData.forEach((book, i) => {
        const h = book.pages * PX_PER_PAGE;

        positions.push({
          width: blockWidth,
          height: h,
          x: centerX - blockWidth / 2,
          y: currentY,
          rotation: 0,
          fontSize: "12px",
          paddingLeft: "20px",
          zIndex: bookData.length - i,
        });

        currentY += h;
      });
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
      const shelfPositions: Map<number, { x: number; y: number; width: number }> = new Map();

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
    }

    return positions;
  };

  // Get container height based on layout
  const getContainerHeight = (mode: ViewMode): number => {
    if (mode === "tower") {
      return bookData.reduce((sum, b) => sum + b.pages * PX_PER_PAGE, 0) + 200;
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
    }
    return 1200;
  };

  // Animate to new layout
  const animateToLayout = (newMode: ViewMode) => {
    if (isTransitioning || newMode === viewMode) return;

    setIsTransitioning(true);
    // Immediately remove special styling when leaving current view
    setShelfStyleActive(false);
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
      </div>

      {/* Context Card - Shows relevant comparison for current view */}
      <div className="comparison-card">
        {viewMode === "tower" && (
          <>
            <div className="comparison-stat">
              <span className="comparison-value">{comparisons.stackedMeters.toFixed(1)}m</span>
              <span className="comparison-label">IF STACKED</span>
            </div>
            <div className="comparison-divider" />
            <div className="comparison-stat">
              <span className="comparison-value">{totalPages.toLocaleString()}</span>
              <span className="comparison-label">PAGES TOTAL</span>
            </div>
          </>
        )}
        {viewMode === "tree" && (
          <>
            <div className="comparison-stat">
              <span className="comparison-value">{comparisons.treesWorth.toFixed(2)}</span>
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
              <span className="comparison-value">{Math.round(totalPages / books.length)}</span>
              <span className="comparison-label">AVG PAGES</span>
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
            className={`vis-particle ${shelfStyleActive ? "shelf-mode" : ""}`}
            title={`${book.title} by ${book.author} — ${book.pages} pages`}
          >
            <span className={`vis-title ${shelfStyleActive ? "vertical" : ""}`}>{book.title}</span>
            {book.texture}
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
              {totalPages.toLocaleString()} pages = {comparisons.treesWorth.toFixed(2)} trees
            </p>
            <p className="tree-legend-subtext">
              (1 tree ≈ 16,666 pages of paper)
            </p>
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
          <span className="stat-val">{Math.round(totalPages / books.length)}</span>
          <span className="stat-lbl">AVG LENGTH</span>
        </div>
        <div className="stat-item">
          <span className="stat-val">{Math.max(...books.map((b) => b.pages))}</span>
          <span className="stat-lbl">LONGEST</span>
        </div>
      </div>
    </div>
  );
}
