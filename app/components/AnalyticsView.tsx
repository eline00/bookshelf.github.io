"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Chart, registerables } from "chart.js";
import { books } from "../data";

Chart.register(...registerables);

export default function AnalyticsView() {
  const radarChartRef = useRef<HTMLCanvasElement>(null);
  const barChartRef = useRef<HTMLCanvasElement>(null);
  const scatterChartRef = useRef<HTMLCanvasElement>(null);
  const [chartsInitialized, setChartsInitialized] = useState(false);
  const chartsRef = useRef<{
    radar?: Chart;
    bar?: Chart;
    scatter?: Chart;
  }>({});

  // Calculate stats
  const genreCounts: Record<string, number> = {};
  const yearPages: Record<number, number> = { 2024: 0, 2025: 0, 2026: 0 };
  let totalRating = 0;
  let totalPages = 0;

  books.forEach((b) => {
    genreCounts[b.genre] = (genreCounts[b.genre] || 0) + 1;
    if (yearPages[b.year] !== undefined) {
      yearPages[b.year] = (yearPages[b.year] || 0) + b.pages;
    }
    totalRating += b.rating;
    totalPages += b.pages;
  });

  const avgRating = books.length > 0 ? (totalRating / books.length).toFixed(1) : "0.0";

  useEffect(() => {
    if (chartsInitialized) return;

    const accent = "#ccff00";
    const grid = "#333";
    const text = "#888";

    Chart.defaults.font.family = "monospace";
    Chart.defaults.color = text;
    Chart.defaults.borderColor = grid;

    // Radar Chart
    if (radarChartRef.current && !chartsRef.current.radar) {
      chartsRef.current.radar = new Chart(radarChartRef.current, {
        type: "radar",
        data: {
          labels: Object.keys(genreCounts),
          datasets: [
            {
              label: "Reading Density",
              data: Object.values(genreCounts),
              backgroundColor: "rgba(204, 255, 0, 0.2)",
              borderColor: accent,
              pointBackgroundColor: accent,
              pointBorderColor: "#fff",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            r: {
              angleLines: { color: grid },
              grid: { color: grid },
              pointLabels: { color: "#fff", font: { size: 14 } },
              ticks: { display: false, backdropColor: "transparent" },
            },
          },
          plugins: { legend: { display: false } },
        },
      });
    }

    // Bar Chart
    if (barChartRef.current && !chartsRef.current.bar) {
      chartsRef.current.bar = new Chart(barChartRef.current, {
        type: "bar",
        data: {
          labels: Object.keys(yearPages),
          datasets: [
            {
              label: "Data Mass (Pages)",
              data: Object.values(yearPages),
              backgroundColor: accent,
              barThickness: 60,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true, grid: { display: false } },
            x: { grid: { display: false } },
          },
          plugins: { legend: { display: false } },
        },
      });
    }

    // Scatter Chart
    if (scatterChartRef.current && !chartsRef.current.scatter) {
      const scatterData = books.map((b) => ({
        x: b.pages,
        y: b.rating,
        title: b.title,
      }));

      chartsRef.current.scatter = new Chart(scatterChartRef.current, {
        type: "scatter",
        data: {
          datasets: [
            {
              label: "Books",
              data: scatterData,
              backgroundColor: "#fff",
              pointRadius: 8,
              pointHoverRadius: 12,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: { display: true, text: "PAGE COUNT" },
              grid: { color: grid },
            },
            y: {
              title: { display: true, text: "RATING" },
              min: 1,
              max: 5.5,
              grid: { color: grid },
            },
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: function (context) {
                  const raw = context.raw as { x: number; y: number; title: string };
                  return `${raw.title} (${raw.x}pg, ${raw.y}★)`;
                },
              },
            },
            legend: { display: false },
          },
        },
      });
    }

    setChartsInitialized(true);

    // GSAP Animations
    gsap.registerPlugin(ScrollTrigger);

    // Stats Hero: Fade out and explode on scroll down
    gsap.fromTo(
      "#section-stats .gs-reveal",
      { opacity: 1, y: 0, scale: 1 },
      {
        opacity: 0,
        y: -100,
        scale: 1.5,
        stagger: 0.1,
        ease: "power2.in",
        scrollTrigger: {
          trigger: "#section-stats",
          start: "top top",
          end: "bottom center",
          scrub: true,
        },
      }
    );

    // Chart animations
    const charts = gsap.utils.toArray<HTMLElement>(".gs-chart");
    charts.forEach((chart) => {
      // Enter animation
      gsap.fromTo(
        chart,
        { opacity: 0, y: 100, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: "expo.out",
          scrollTrigger: {
            trigger: chart.parentElement,
            start: "top center+=100",
            toggleActions: "play reverse play reverse",
          },
        }
      );

      // Leave animation (Parallax fade out)
      gsap.to(chart, {
        opacity: 0,
        y: -50,
        scale: 0.95,
        ease: "none",
        scrollTrigger: {
          trigger: chart.parentElement,
          start: "center top+=100",
          end: "bottom top",
          scrub: true,
        },
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [chartsInitialized, genreCounts, yearPages]);

  // Cleanup charts on unmount
  useEffect(() => {
    return () => {
      if (chartsRef.current.radar) chartsRef.current.radar.destroy();
      if (chartsRef.current.bar) chartsRef.current.bar.destroy();
      if (chartsRef.current.scatter) chartsRef.current.scatter.destroy();
    };
  }, []);

  return (
    <div id="analytics-wrapper">
      {/* SECTION 1: THE NUMBERS */}
      <section className="analytics-section" id="section-stats">
        <div className="stat-hero-container">
          <div className="stat-hero-item gs-reveal">
            <div className="stat-hero-val">
              {books.length.toString().padStart(2, "0")}
            </div>
            <div className="stat-hero-label">Total Modules</div>
          </div>
          <div className="stat-hero-item gs-reveal">
            <div className="stat-hero-val accent">
              {totalPages.toLocaleString()}
            </div>
            <div className="stat-hero-label">Total Mass (Pages)</div>
          </div>
          <div className="stat-hero-item gs-reveal">
            <div className="stat-hero-val">{avgRating}</div>
            <div className="stat-hero-label">Mean Rating</div>
          </div>
        </div>
      </section>

      {/* SECTION 2: GENRE MATRIX */}
      <section className="analytics-section" id="section-genre">
        <div className="chart-fullscreen-container gs-chart">
          <div className="chart-fullscreen-header">Genre Matrix</div>
          <canvas ref={radarChartRef}></canvas>
        </div>
      </section>

      {/* SECTION 3: TEMPORAL FLUX */}
      <section className="analytics-section" id="section-flux">
        <div className="chart-fullscreen-container gs-chart">
          <div className="chart-fullscreen-header">Temporal Flux</div>
          <canvas ref={barChartRef}></canvas>
        </div>
      </section>

      {/* SECTION 4: SCATTER PLOT */}
      <section className="analytics-section" id="section-scatter">
        <div className="chart-fullscreen-container gs-chart">
          <div className="chart-fullscreen-header">Effort vs. Reward</div>
          <canvas ref={scatterChartRef}></canvas>
        </div>
      </section>
    </div>
  );
}
