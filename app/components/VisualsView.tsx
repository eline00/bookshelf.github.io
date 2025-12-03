"use client";

import { useEffect, useRef, useState } from "react";
import { books, Book } from "../data";

const genreTextures: Record<string, string> = {
  "Sci-Fi": "01010101[]{}<>/\\|#*_",
  Fantasy: "§¶†‡?abcdefghijklmnopqrstuvwxyz",
  Classic: "ABCDEFGHIJKLMNOPQRSTUVWXYZ.,:;",
  "Non-Fiction": "1234567890.#@$%&+=",
  Fiction: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  Romantasy: "♡♥❤✿❀✧★☆·.·´¯`·.·",
  "Dark Romance": "▓▒░█▄▀■□●○◆◇",
  Fanfic: "~*^°•●○◆◇♠♣♥♦",
  Thriller: "!?@#$%&*()_+-=[]{}|;:",
  default: "..........",
};

function getTexture(genre: string, length: number): string {
  const chars = genreTextures[genre] || genreTextures.default;
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function VisualsView() {
  const [rendered, setRendered] = useState(false);
  const towerRef = useRef<HTMLDivElement>(null);
  const rulerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<HTMLDivElement>(null);

  const totalPages = books.reduce((sum, b) => sum + b.pages, 0);
  const PX_PER_PAGE = 1; // Scale down for reasonable height

  useEffect(() => {
    if (rendered || !towerRef.current || !rulerRef.current) return;
    setRendered(true);

    const towerContainer = towerRef.current;
    const ruler = rulerRef.current;
    const markers = markersRef.current;
    const towerSection = towerContainer.parentElement;

    // Calculate tower height first
    const towerHeight = totalPages * PX_PER_PAGE;

    // Set the tower section height to contain everything
    if (towerSection) {
      towerSection.style.height = `${towerHeight + 100}px`;
    }

    // Sort books by date for chronological stacking
    const sortedBooks = [...books].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Render Texture Tower
    sortedBooks.forEach((b) => {
      const block = document.createElement("div");
      block.className = "tower-block";

      const weight = Math.max(100, Math.min(900, (b.rating / 5) * 900));
      block.style.fontWeight = String(weight);

      // Calculate height based on pages
      const blockHeight = b.pages * PX_PER_PAGE;
      block.style.height = `${blockHeight}px`;

      // Generate texture content
      let content = `<span class="tower-title-inline">${b.title}</span>`;
      const linesNeeded = Math.ceil(blockHeight / 12); // 12px line height

      for (let i = 0; i < linesNeeded; i++) {
        // Vary line lengths significantly for ragged right edge
        const len = Math.floor(Math.random() * (220 - 80 + 1)) + 80;
        const line = getTexture(b.genre, len);
        content += line + "\n";
      }

      block.innerHTML = content;
      block.title = `${b.title} - ${b.pages} pages`;
      towerContainer.appendChild(block);
    });

    // Render Ruler
    // Set ruler height to match tower
    ruler.style.height = `${towerHeight}px`;

    for (let i = 0; i <= towerHeight; i += 1000 * PX_PER_PAGE) {
      const tickContainer = document.createElement("div");
      tickContainer.style.position = "absolute";
      tickContainer.style.bottom = `${i}px`;
      tickContainer.style.right = "0";
      tickContainer.style.width = "100%";
      tickContainer.innerHTML = `
        <div class="ruler-tick"></div>
        <div class="ruler-label">${i / PX_PER_PAGE}</div>
      `;
      ruler.appendChild(tickContainer);
    }

    // Context Markers
    if (markers) {
      // Set markers container height to match tower
      markers.style.height = `${towerHeight}px`;

      const comparisons = [
        { val: 300, label: "Avg. Novel" },
        { val: 1200, label: "The Bible" },
        { val: 5000, label: "War & Peace x5" },
        { val: 10000, label: "Encyclopedia Vol" },
      ];

      comparisons.forEach((c) => {
        const pxVal = c.val * PX_PER_PAGE;
        if (pxVal < towerHeight) {
          const m = document.createElement("div");
          m.className = "context-marker";
          m.style.bottom = `${pxVal}px`;
          m.innerText = `< ${c.label}`;
          markers.appendChild(m);
        }
      });
    }
  }, [rendered, totalPages]);

  return (
    <div id="visuals-wrapper">
      {/* Header Stats */}
      <div className="visuals-header">
        <h2 className="visuals-title">THE PAGE TOWER</h2>
        <p className="visuals-subtitle">{totalPages.toLocaleString()} pages</p>
      </div>

      {/* The Tower */}
      <div className="tower-section">
        <div className="tower-label">FIG B: THE TOWER (1:1 LINE SCALE)</div>

        {/* Ruler (Left) */}
        <div id="tower-ruler" className="tower-ruler" ref={rulerRef}></div>

        {/* The Stack (Center) */}
        <div
          id="tower-container"
          className="tower-container"
          ref={towerRef}
        ></div>

        {/* Comparison Markers (Right) */}
        <div id="context-markers" ref={markersRef}></div>
      </div>

      {/* Legend */}
      <div className="tower-legend">
        <div className="legend-title">TEXTURE KEY</div>
        <div className="legend-items">
          {Object.entries(genreTextures)
            .filter(([key]) => key !== "default")
            .slice(0, 6)
            .map(([genre, texture]) => (
              <div key={genre} className="legend-item">
                <span className="legend-texture">{texture.slice(0, 10)}</span>
                <span className="legend-genre">{genre}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
