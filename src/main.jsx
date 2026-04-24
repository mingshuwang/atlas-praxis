import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BookOpen,
  Eye,
  Layers,
  Map,
  MessageSquareText,
  Presentation,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import geojsonText from "./data/glasgow-learning-districts.geojson?raw";
import "./style.css";

const geojson = JSON.parse(geojsonText);

const palettes = {
  Praxis: ["#eef6f4", "#b9d8cf", "#72afa7", "#2f7f86", "#173d4c"],
  Civic: ["#f7f3e8", "#dfc37d", "#ba8f3a", "#7d6757", "#2c3432"],
  Viridis: ["#440154", "#3b528b", "#21918c", "#5ec962", "#fde725"],
  Mono: ["#f5f7f8", "#d8dee2", "#9aa6ad", "#56636a", "#1f2933"],
};

const metrics = {
  accessibility: {
    label: "Transit accessibility",
    short: "Access",
    unit: "index score",
    description: "A teaching index for access to public transport, services, and central destinations.",
    prompt: "Where would a reader infer the strongest everyday accessibility, and why?",
  },
  density: {
    label: "Urban intensity",
    short: "Intensity",
    unit: "index score",
    description: "A proxy for built-form intensity, activity concentration, and mixed urban use.",
    prompt: "Does the classification emphasise a compact core or a wider urban gradient?",
  },
  green: {
    label: "Green space access",
    short: "Green",
    unit: "index score",
    description: "A simplified access measure for parks, open space, and environmental amenity.",
    prompt: "Which districts look comparatively underserved, and how confident is that reading?",
  },
  uncertainty: {
    label: "Interpretive uncertainty",
    short: "Uncertainty",
    unit: "index score",
    description: "A deliberate reminder that mapped values carry modelling and interpretation limits.",
    prompt: "How should uncertainty change the claim made by the map title?",
  },
};

const pages = [
  ["home", "Home"],
  ["studio", "Studio"],
  ["critique", "Critique"],
  ["featured", "Featured Graphics"],
  ["about", "About"],
];

function valuesFor(metric) {
  return geojson.features.map((feature) => feature.properties[metric]);
}

function getBreaks(metric, classes, method) {
  const vals = valuesFor(metric).slice().sort((a, b) => a - b);
  const min = vals[0];
  const max = vals[vals.length - 1];

  if (max === min) {
    return Array.from({ length: classes }, () => max);
  }

  if (method === "Quantile") {
    return Array.from({ length: classes }, (_, index) => {
      const rank = Math.ceil(((index + 1) / classes) * vals.length) - 1;
      return vals[Math.min(vals.length - 1, rank)];
    });
  }

  const width = (max - min) / classes;
  return Array.from({ length: classes }, (_, index) => min + width * (index + 1));
}

function classify(value, breaks) {
  const index = breaks.findIndex((threshold) => value <= threshold);
  return index === -1 ? breaks.length - 1 : index;
}

function getFill(value, breaks, paletteName) {
  const palette = palettes[paletteName];
  const idx = classify(value, breaks);
  const scaledIndex = Math.round((idx / Math.max(1, breaks.length - 1)) * (palette.length - 1));
  return palette[scaledIndex];
}

function formatNumber(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function buildLegend(metric, classes, method, paletteName) {
  const vals = valuesFor(metric);
  const sorted = vals.slice().sort((a, b) => a - b);
  const min = sorted[0];
  const breaks = getBreaks(metric, classes, method);
  const palette = palettes[paletteName];

  return breaks.map((upper, index) => {
    const lower = index === 0 ? min : breaks[index - 1];
    const colorIndex = Math.round((index / Math.max(1, classes - 1)) * (palette.length - 1));
    const count = geojson.features.filter((feature) => classify(feature.properties[metric], breaks) === index).length;
    return {
      color: palette[colorIndex],
      count,
      label: index === 0 ? `<= ${formatNumber(upper)}` : `${formatNumber(lower)}-${formatNumber(upper)}`,
    };
  });
}

function metricExtent(metric) {
  const vals = valuesFor(metric);
  return [Math.min(...vals), Math.max(...vals)];
}

function project([lon, lat]) {
  const minLon = -4.36;
  const maxLon = -4.16;
  const minLat = 55.82;
  const maxLat = 55.91;
  const x = ((lon - minLon) / (maxLon - minLon)) * 700 + 30;
  const y = 420 - ((lat - minLat) / (maxLat - minLat)) * 360;
  return [x, y];
}

function polygonToPoints(coords) {
  return coords[0]
    .map((pt) => project(pt))
    .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
}

function centroidFor(feature) {
  const projected = feature.geometry.coordinates[0].map((pt) => project(pt));
  return projected
    .reduce((acc, pt) => [acc[0] + pt[0], acc[1] + pt[1]], [0, 0])
    .map((value) => value / projected.length);
}

function Header({ active, setActive }) {
  return (
    <header className="site-header">
      <button className="brand" onClick={() => setActive("home")} aria-label="Open Atlas Praxis home">
        <span className="brand-mark">AP</span>
        <span>
          <strong>Atlas Praxis</strong>
          <small>Open geomatics teaching studio</small>
        </span>
      </button>
      <nav aria-label="Primary navigation">
        {pages.map(([key, label]) => (
          <button key={key} className={active === key ? "active" : ""} onClick={() => setActive(key)}>
            {label}
          </button>
        ))}
      </nav>
    </header>
  );
}

function Home({ setActive }) {
  return (
    <main className="page home-layout">
      <section className="intro-panel">
        <p className="eyebrow">CATCON 9 initial prototype | GEOG5026 Visualisation & Map Use</p>
        <h1>An open geomatics studio for visual reasoning.</h1>
        <p className="large">
          Atlas Praxis supports postgraduate teaching in map design, geovisualisation, and cartographic critique.
          The prototype turns map production into an iterative studio practice: test an encoding, read the pattern,
          critique the result, and refine the argument.
        </p>
        <div className="button-row">
          <button className="primary" onClick={() => setActive("studio")}>
            Open Studio
          </button>
          <button className="secondary" onClick={() => setActive("critique")}>
            Review Critique Prompts
          </button>
        </div>
      </section>
      <section className="teaching-flow" aria-label="Teaching flow">
        <Feature icon={<Eye />} title="See" text="Compare how classification, colour, opacity, and labels shape visible spatial patterns." />
        <Feature icon={<MessageSquareText />} title="Critique" text="Evaluate the map from the perspective of a reader, client, or peer reviewer." />
        <Feature icon={<Presentation />} title="Share" text="Prepare a featured graphic with a clear claim, visual hierarchy, and concise takeaway." />
      </section>
    </main>
  );
}

function Feature({ icon, title, text }) {
  return (
    <article className="feature-card">
      <div className="feature-icon" aria-hidden="true">
        {icon}
      </div>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </article>
  );
}

function SegmentedControl({ label, value, options, onChange, renderOption }) {
  return (
    <fieldset className="segmented-field">
      <legend>{label}</legend>
      <div className="segmented-options">
        {options.map((option) => {
          const optionValue = typeof option === "string" ? option : option.value;
          const optionLabel = typeof option === "string" ? option : option.label;
          return (
            <button
              type="button"
              key={optionValue}
              className={value === optionValue ? "selected" : ""}
              onClick={() => onChange(optionValue)}
            >
              {renderOption ? renderOption(option, value === optionValue) : optionLabel}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function Studio() {
  const [metric, setMetric] = useState("accessibility");
  const [palette, setPalette] = useState("Praxis");
  const [method, setMethod] = useState("Equal interval");
  const [classes, setClasses] = useState(5);
  const [opacity, setOpacity] = useState(0.88);
  const [labels, setLabels] = useState(true);
  const [selected, setSelected] = useState("centre");
  const [hovered, setHovered] = useState(null);

  const breaks = useMemo(() => getBreaks(metric, Number(classes), method), [metric, classes, method]);
  const legend = useMemo(() => buildLegend(metric, Number(classes), method, palette), [metric, classes, method, palette]);
  const activeFeature = useMemo(
    () => geojson.features.find((feature) => feature.properties.id === (hovered || selected)) || geojson.features[0],
    [hovered, selected]
  );
  const [minValue, maxValue] = metricExtent(metric);
  const activeValue = activeFeature.properties[metric];
  const activeClass = classify(activeValue, breaks) + 1;

  const methodNote =
    method === "Quantile"
      ? "Quantile classes balance district counts. Useful for comparison, but it can exaggerate small numeric differences."
      : "Equal intervals preserve numeric distance. Useful for scale reading, but sparse extremes may dominate the visual pattern.";

  return (
    <main className="page studio-layout">
      <section className="map-panel" aria-labelledby="studio-heading">
        <div className="panel-title-row">
          <div>
            <p className="eyebrow">Visual Reasoning Studio</p>
            <h2 id="studio-heading">{metrics[metric].label}</h2>
            <p className="panel-copy">{metrics[metric].description}</p>
          </div>
          <span className="pill">Static Vite map</span>
        </div>

        <svg viewBox="0 0 780 460" className="map-svg" role="img" aria-label="Interactive choropleth map of Glasgow learning districts">
          <rect x="0" y="0" width="780" height="460" className="map-bg" />
          <path d="M42 332 C 150 284, 232 312, 344 270 S 560 216, 725 118" className="river" />
          <text x="46" y="54" className="map-context-label">Glasgow teaching geography, demonstration data</text>
          {geojson.features.map((feature) => {
            const p = feature.properties;
            const isSelected = selected === p.id;
            const isHovered = hovered === p.id;
            const fill = getFill(p[metric], breaks, palette);
            const centroid = centroidFor(feature);
            return (
              <g key={p.id}>
                <polygon
                  points={polygonToPoints(feature.geometry.coordinates)}
                  fill={fill}
                  opacity={opacity}
                  className={isSelected ? "district selected" : isHovered ? "district hovered" : "district"}
                  onClick={() => setSelected(p.id)}
                  onPointerEnter={() => setHovered(p.id)}
                  onPointerLeave={() => setHovered(null)}
                  onFocus={() => setHovered(p.id)}
                  onBlur={() => setHovered(null)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelected(p.id);
                    }
                  }}
                  role="button"
                  tabIndex="0"
                  aria-label={`${p.name}: ${metrics[metric].label} ${p[metric]} out of 100`}
                />
                <title>{`${p.name}: ${p[metric]} / 100`}</title>
                {labels && (
                  <text x={centroid[0]} y={centroid[1]} className="map-label">
                    {p.short}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        <div className="studio-bottom-grid">
          <section className="legend-panel" aria-label="Choropleth legend">
            <h3>Legend</h3>
            <p>{method}, {classes} classes, {metrics[metric].unit}</p>
            <div className="legend-list">
              {legend.map((item) => (
                <div className="legend-row" key={item.label}>
                  <span className="legend-swatch" style={{ background: item.color }} />
                  <span>{item.label}</span>
                  <strong>{item.count}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="reading-panel" aria-label="Selected district reading">
            <p className="eyebrow">Current reading</p>
            <h3>{activeFeature.properties.name}</h3>
            <p>
              {activeValue} / 100, class {activeClass} of {classes}. Dataset range: {minValue}-{maxValue}.
            </p>
            <p className="prompt-text">{metrics[metric].prompt}</p>
          </section>
        </div>
      </section>

      <aside className="control-panel" aria-label="Studio design controls">
        <div className="control-title">
          <SlidersHorizontal size={18} aria-hidden="true" />
          <span>Design controls</span>
        </div>

        <SegmentedControl
          label="Mapped variable"
          value={metric}
          onChange={setMetric}
          options={Object.entries(metrics).map(([value, config]) => ({ value, label: config.short }))}
        />

        <SegmentedControl
          label="Colour palette"
          value={palette}
          onChange={setPalette}
          options={Object.keys(palettes)}
          renderOption={(name) => (
            <>
              <span>{name}</span>
              <span className="palette-strip" aria-hidden="true">
                {palettes[name].map((color) => (
                  <span key={color} style={{ background: color }} />
                ))}
              </span>
            </>
          )}
        />

        <SegmentedControl
          label="Classification"
          value={method}
          onChange={setMethod}
          options={["Equal interval", "Quantile"]}
        />

        <label className="range-control">
          <span>Number of classes: {classes}</span>
          <input type="range" min="3" max="5" value={classes} onChange={(event) => setClasses(Number(event.target.value))} />
        </label>

        <label className="range-control">
          <span>Layer opacity: {Math.round(opacity * 100)}%</span>
          <input
            type="range"
            min="0.35"
            max="1"
            step="0.01"
            value={opacity}
            onChange={(event) => setOpacity(Number(event.target.value))}
          />
        </label>

        <label className="toggle">
          <input type="checkbox" checked={labels} onChange={(event) => setLabels(event.target.checked)} />
          <span>Show district labels</span>
        </label>

        <div className="method-note">
          <strong>Classification note</strong>
          <p>{methodNote}</p>
        </div>

        <div className="reflection-box">
          <strong>Studio prompt</strong>
          <p>
            Change one setting, then state what became more visible, what became less visible, and whether the map
            still supports a defensible geographic claim.
          </p>
        </div>
      </aside>
    </main>
  );
}

function Critique() {
  const prompts = [
    ["Purpose", "What claim is the map designed to support, and is that claim visible without explanation?"],
    ["Perception", "Which colours, symbols, labels, or contrasts guide attention first?"],
    ["Data portrayal", "Is the classification method appropriate for the data and the teaching question?"],
    ["Map user", "What would a non-specialist reader infer, and where might they be misled?"],
    ["Revision", "What single design change would most improve interpretation?"],
  ];

  return (
    <main className="page two-column">
      <section className="intro-panel compact">
        <p className="eyebrow">Structured map critique</p>
        <h2>From looking at maps to reasoning with maps.</h2>
        <p>
          These prompts support seminar discussion, peer review, and revision of postgraduate mapping work. They
          focus attention on evidence, interpretation, audience, and design responsibility.
        </p>
      </section>
      <section className="prompt-list">
        {prompts.map(([title, text], idx) => (
          <article className="prompt-card" key={title}>
            <span>{String(idx + 1).padStart(2, "0")}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

function FeaturedGraphics() {
  return (
    <main className="page featured-layout">
      <section className="feature-poster">
        <p className="eyebrow">Featured graphics</p>
        <h2>One visual argument, clearly framed.</h2>
        <div className="poster-box">
          <div className="poster-map" aria-hidden="true">
            <Map size={72} />
          </div>
          <div>
            <h3>Where does accessibility concentrate?</h3>
            <p>
              A strong featured graphic combines a purposeful map, a precise title, selected annotation, and a
              concise interpretation for a defined audience.
            </p>
          </div>
        </div>
      </section>
      <aside className="checklist">
        <h3>Publication checklist</h3>
        {[
          "The title states the geographic argument.",
          "The classification method is defensible.",
          "The hierarchy leads from pattern to interpretation.",
          "Annotations explain important exceptions.",
          "The takeaway is ready for oral presentation.",
        ].map((item) => (
          <label key={item}>
            <input type="checkbox" /> {item}
          </label>
        ))}
        <button className="secondary" onClick={() => window.print()}>
          Print Page
        </button>
      </aside>
    </main>
  );
}

function About() {
  return (
    <main className="page about-grid">
      <section className="intro-panel compact">
        <p className="eyebrow">Open-source teaching software</p>
        <h2>Built for postgraduate geomatics education.</h2>
        <p>
          Atlas Praxis is aligned with GEOG5026 Visualisation & Map Use at the University of Glasgow. The prototype
          supports applied map design, geovisualisation, map use, critique, and featured-graphics communication.
        </p>
      </section>
      <section className="roadmap">
        <Feature icon={<BookOpen />} title="Pedagogical alignment" text="Supports visual perception, data portrayal, map user evaluation, and seminar discussion." />
        <Feature icon={<Layers />} title="Portable implementation" text="Runs as a static React/Vite application with bundled demonstration data and no map token." />
        <Feature icon={<Sparkles />} title="Roadmap" text="Next modules: side-by-side comparison, critique export, web mapping labs, and geodatabase design exercises." />
      </section>
    </main>
  );
}

function App() {
  const [active, setActive] = useState("home");

  return (
    <div className="app-shell">
      <Header active={active} setActive={setActive} />
      {active === "home" && <Home setActive={setActive} />}
      {active === "studio" && <Studio />}
      {active === "critique" && <Critique />}
      {active === "featured" && <FeaturedGraphics />}
      {active === "about" && <About />}
      <footer>Atlas Praxis | CATCON 9 prototype | Dr Mingshu Wang, University of Glasgow</footer>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
