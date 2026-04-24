import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Eye,
  Layers,
  Map,
  MessageSquareText,
  Palette,
  Presentation,
  Route,
  SlidersHorizontal,
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
  ["tutorials", "Tutorials"],
  ["critique", "Critique"],
  ["featured", "Featured Graphics"],
  ["cases", "Case Studies"],
  ["about", "About"],
];

const learningPathway = [
  ["Observe", "Read the mapped pattern, identify the visual hierarchy, and notice what the design makes salient."],
  ["Modify", "Change classification, colour, opacity, labels, or mapped variable to test alternative interpretations."],
  ["Critique", "Evaluate representation, perception, interpretation, ethics, and communication from the map user's perspective."],
  ["Communicate", "Turn the strongest reading into a concise featured graphic with a clear geographic claim."],
];

const classroomActivities = [
  {
    title: "Classification and interpretation",
    text: "Compare equal-interval and quantile classes, then explain how each method changes the apparent geography of advantage or concern.",
  },
  {
    title: "Colour and perception",
    text: "Test sequential palettes and opacity. Discuss contrast, legibility, visual emphasis, and the risk of overstating small differences.",
  },
  {
    title: "User-centred map critique",
    text: "Review the map as a non-specialist reader. Identify the first impression, likely inference, and one design choice that may mislead.",
  },
  {
    title: "From map to featured graphic",
    text: "Select a defensible pattern, refine the title and annotation, and prepare a short visual argument for discussion.",
  },
];

const tutorials = [
  {
    title: "Map critique and cartographic design principles",
    summary:
      "Students read the Ordnance Survey cartographic design principles and apply lecture concepts to critique a map or geovisualisation.",
    tasks: [
      "Identify three things the map does very well.",
      "Identify three suggestions for improvement.",
      "Share and present the critique with the class.",
    ],
  },
  {
    title: "Bivariate mapping and cartograms",
    summary:
      "This tutorial introduces bivariate mapping and cartograms as advanced methods for visualising relationships and reshaping geographic representation.",
    tasks: [
      "Bivariate mapping: classify two variables into quantiles and assign colour combinations.",
      "Cartograms: resize or distort geographic regions according to a selected variable such as population.",
      "Compare how a conventional population gradient map and a population cartogram change interpretation.",
    ],
    note:
      "The bivariate mapping activity explores the relationship between per-capita new construction area and per-capita demolition area in Greater London.",
  },
];

const critiqueFramework = [
  ["Representation", "What data, geography, scale, and classification choices define the map's version of reality?"],
  ["Perception", "How do colour, contrast, symbols, labels, and layout guide attention?"],
  ["Interpretation", "What claim will a reader likely make from the map, and what alternatives remain plausible?"],
  ["Ethics", "Where might uncertainty, omission, aggregation, or audience assumptions affect responsible use?"],
  ["Communication", "Does the graphic make one clear geographic argument for its intended audience?"],
];

const featuredFramework = [
  ["Clear visual argument", "The graphic makes one geographic claim visible and memorable."],
  ["Appropriate data and method", "The dataset, classification, and visual technique fit the question."],
  ["Cartographic design quality", "Colour, hierarchy, typography, layout, and annotation support interpretation."],
  ["User-centred interpretation", "The intended audience can read the pattern without specialist explanation."],
  ["Critical reflection", "Uncertainty, limitations, omissions, and ethical implications are acknowledged."],
  ["Presentation readiness", "The takeaway can be explained clearly in a short spoken presentation."],
];

const featuredChecklist = [
  "The title states a geographic claim rather than only naming a variable.",
  "The classification and colour choices support the intended interpretation.",
  "The map hierarchy leads from pattern to explanation.",
  "Annotations clarify exceptions, uncertainty, or important local context.",
  "The final takeaway is concise enough for a short presentation.",
];

const caseStudies = [
  {
    title: "Construction enthusiasts versus demolition giants",
    theme: "Bivariate mapping, building footprints, construction and demolition, England.",
    summary:
      "This featured graphic uses building footprint data to identify newly constructed and demolished buildings from 2017 to 2023 and visualises construction/demolition patterns through bivariate colour mapping.",
    doi: "10.1177/23998083251317573",
  },
  {
    title: "Scotland's twin referendums",
    theme: "Bivariate population-weighted cartogram, electoral geography, Scotland.",
    summary:
      "This regional graphic compares Scotland's 2014 independence referendum and 2016 EU referendum using a bivariate population-weighted cartogram, showing how national aggregates can hide regional political heterogeneity.",
    doi: "10.1080/21681376.2026.2637381",
  },
  {
    title: "An Academy of Nations?",
    theme: "Proportional-symbol cartogram, cultural geography, global cinema.",
    summary:
      "This featured graphic maps nominations and wins for the Academy Award for Best International Feature Film, using proportional symbols and colour intensity to reveal geographic imbalance and Eurocentrism.",
    doi: "10.1177/23998083251381497",
  },
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
    <main className="page">
      <section className="home-layout">
        <div className="intro-panel">
          <p className="eyebrow">Open geomatics teaching studio</p>
          <h1>Atlas Praxis is an open geomatics teaching studio for visual reasoning.</h1>
          <p className="large">
            It helps students examine how maps represent geographic information, how visual perception shapes map use,
            and how design choices become defensible visual arguments.
          </p>
          <div className="button-row">
            <button className="primary" onClick={() => setActive("studio")}>
              Open Studio
            </button>
            <button className="secondary" onClick={() => setActive("critique")}>
              Use Critique Framework
            </button>
          </div>
        </div>
        <section className="teaching-flow" aria-label="Core teaching uses">
          <Feature icon={<Eye />} title="Visual reasoning" text="Compare how classification, colour, opacity, and labels shape visible spatial patterns." />
          <Feature icon={<MessageSquareText />} title="Map-user evaluation" text="Assess the map from the perspective of a reader, client, peer reviewer, or public audience." />
          <Feature icon={<Presentation />} title="Featured graphics" text="Move from exploration to a concise visual argument with hierarchy, annotation, and a clear takeaway." />
        </section>
      </section>

      <section className="section-block">
        <SectionHeader
          eyebrow="Learning pathway"
          title="Observe -> Modify -> Critique -> Communicate."
          text="Atlas Praxis structures practical map work as a repeatable studio cycle for postgraduate geomatics teaching."
        />
        <div className="pathway-grid">
          {learningPathway.map(([title, text], index) => (
            <article className="pathway-card" key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block course-band">
        <SectionHeader
          eyebrow="Course integration"
          title="Connected to GEOG5026 Visualisation & Map Use."
          text="Developed in connection with GEOG5026 Visualisation & Map Use at the University of Glasgow, the course focuses on applied map design, geographic information visualisation, map use, visual perception, critical analysis of geospatial representation, map-user evaluation, map production, and oral discussion of cartographic issues."
        />
      </section>

      <section className="section-block">
        <SectionHeader
          eyebrow="Classroom activities"
          title="Short activities for studio teaching."
          text="Each activity can be used as a seminar prompt, workshop exercise, or bridge between map exploration and discussion."
        />
        <div className="activity-grid">
          {classroomActivities.map((activity) => (
            <article className="activity-card" key={activity.title}>
              <CheckCircle2 size={20} aria-hidden="true" />
              <h3>{activity.title}</h3>
              <p>{activity.text}</p>
            </article>
          ))}
        </div>
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

function SectionHeader({ eyebrow, title, text }) {
  return (
    <div className="section-header">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
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
          <text x="46" y="54" className="map-context-label">Glasgow teaching geography, sample teaching data</text>
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

function Tutorials() {
  return (
    <main className="page">
      <SectionHeader
        eyebrow="Tutorials"
        title="Guided activities for map critique and advanced representation."
        text="The tutorials translate course themes into concise classroom tasks. They avoid private files and focus on public teaching concepts that can be reused in other geomatics settings."
      />
      <section className="tutorial-grid" aria-label="Tutorial activities">
        {tutorials.map((tutorial, index) => (
          <article className="tutorial-card" key={tutorial.title}>
            <div className="card-kicker">Tutorial {index + 1}</div>
            <h3>{tutorial.title}</h3>
            <p>{tutorial.summary}</p>
            <ul>
              {tutorial.tasks.map((task) => (
                <li key={task}>{task}</li>
              ))}
            </ul>
            {tutorial.note && <p className="note-text">{tutorial.note}</p>}
          </article>
        ))}
      </section>
    </main>
  );
}

function Critique() {
  return (
    <main className="page two-column">
      <section className="intro-panel compact">
        <p className="eyebrow">Critique framework</p>
        <h2>From looking at maps to reasoning with maps.</h2>
        <p>
          The framework helps students evaluate a map as a designed argument. It can be used during peer review,
          seminar discussion, or revision of a geographic visual.
        </p>
        <div className="button-row">
          <button className="secondary" onClick={() => window.print()}>
            Print Framework
          </button>
        </div>
      </section>
      <section className="prompt-list">
        {critiqueFramework.map(([title, text], idx) => (
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
    <main className="page">
      <section className="featured-layout">
        <div className="feature-poster">
          <p className="eyebrow">Featured graphics</p>
          <h2>From map exploration to a presentation-ready geographic visual.</h2>
          <div className="poster-box">
            <div className="poster-map" aria-hidden="true">
              <Map size={72} />
            </div>
            <div>
              <h3>Make one defensible claim visible.</h3>
              <p>
                Start with the Studio, test alternative encodings, choose the clearest interpretation, and refine the
                output into a graphic that can support short oral discussion.
              </p>
            </div>
          </div>
          <div className="featured-steps" aria-label="Featured graphics workflow">
            {["Explore the pattern", "Choose the claim", "Refine hierarchy", "Add context", "Present the takeaway"].map((step) => (
              <span key={step}>{step}</span>
            ))}
          </div>
        </div>
        <aside className="checklist">
          <h3>Publication checklist</h3>
          {featuredChecklist.map((item) => (
            <label key={item}>
              <input type="checkbox" /> {item}
            </label>
          ))}
          <button className="secondary" onClick={() => window.print()}>
            Print Page
          </button>
        </aside>
      </section>

      <section className="section-block">
        <SectionHeader
          eyebrow="Teaching framework"
          title="From map to featured graphic."
          text="This framework supports discussion, comparison, and revision as students turn an exploratory map into a communicative graphic."
        />
        <div className="framework-grid">
          {featuredFramework.map(([title, text]) => (
            <article className="framework-card" key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function CaseStudies() {
  return (
    <main className="page">
      <SectionHeader
        eyebrow="Case studies"
        title="Citation-style examples for featured graphics discussion."
        text="These cards point students toward published examples without embedding PDFs, screenshots, or third-party copyrighted figures."
      />
      <section className="case-grid" aria-label="Featured graphics case studies">
        {caseStudies.map((study, index) => (
          <article className="case-card" key={study.doi}>
            <div className="card-kicker">Case Study {String.fromCharCode(65 + index)}</div>
            <h3>{study.title}</h3>
            <p className="theme-text">{study.theme}</p>
            <p>{study.summary}</p>
            <a href={`https://doi.org/${study.doi}`} target="_blank" rel="noreferrer">
              DOI: {study.doi} <ExternalLink size={15} aria-hidden="true" />
            </a>
          </article>
        ))}
      </section>
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
          Atlas Praxis is developed in connection with GEOG5026 Visualisation & Map Use at the University of Glasgow.
          It supports applied map design, geographic information visualisation, map use, visual perception, critique,
          map production, and featured-graphics communication.
        </p>
        <p className="about-note">
          Current release: a browser-based studio with bundled teaching data, static pages, and reusable classroom
          frameworks for visual reasoning.
        </p>
      </section>
      <section className="roadmap">
        <Feature icon={<BookOpen />} title="Teaching alignment" text="Supports visual perception, representation, interpretation, user evaluation, critique, and oral discussion." />
        <Feature icon={<Layers />} title="Portable implementation" text="Runs as a static React/Vite application with bundled sample teaching data and no map token." />
        <Feature icon={<Route />} title="Learning pathway" text="Guides learners from observing a pattern to modifying a design, critiquing the result, and communicating a claim." />
        <Feature icon={<Palette />} title="Roadmap" text="Next modules: comparison mode, printable instructor materials, web mapping labs, and geodatabase design exercises." />
      </section>
    </main>
  );
}

/*
 * The block below is intentionally kept small: the app is a static teaching
 * product, so page changes are handled by local React state instead of routing.
 */
function App() {
  const [active, setActive] = useState("home");

  return (
    <div className="app-shell">
      <Header active={active} setActive={setActive} />
      {active === "home" && <Home setActive={setActive} />}
      {active === "studio" && <Studio />}
      {active === "tutorials" && <Tutorials />}
      {active === "critique" && <Critique />}
      {active === "featured" && <FeaturedGraphics />}
      {active === "cases" && <CaseStudies />}
      {active === "about" && <About />}
      <footer>Atlas Praxis | Open geomatics teaching studio | University of Glasgow</footer>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
