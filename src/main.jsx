import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { GeoJSON, MapContainer, TileLayer } from "react-leaflet";
import * as ss from "simple-statistics";
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
import "leaflet/dist/leaflet.css";
import geojsonText from "./data/glasgow-learning-districts.geojson?raw";
import "./style.css";

const fallbackGeojson = JSON.parse(geojsonText);

const palettes = {
  Blues: {
    type: "Sequential",
    note: "Good for ordered values where higher scores should read as stronger intensity.",
    colors: ["#eff6ff", "#bfdbfe", "#60a5fa", "#2563eb", "#1e3a8a"],
  },
  Greens: {
    type: "Sequential",
    note: "Useful for environmental or access variables when the data increase in one direction.",
    colors: ["#f0fdf4", "#bbf7d0", "#4ade80", "#16a34a", "#14532d"],
  },
  Purples: {
    type: "Sequential",
    note: "A compact ordered palette that can work well for density or pressure indicators.",
    colors: ["#faf5ff", "#e9d5ff", "#c084fc", "#7e22ce", "#3b0764"],
  },
  Viridis: {
    type: "Sequential",
    note: "Perceptually ordered and broadly readable across many screens.",
    colors: ["#440154", "#3b528b", "#21918c", "#5ec962", "#fde725"],
  },
  Cividis: {
    type: "Accessibility-aware sequential",
    note: "Designed to remain legible for many readers with colour-vision differences.",
    colors: ["#00224e", "#414d6b", "#7c7b78", "#b8ad6d", "#fee838"],
  },
  "Blue-Orange diverging": {
    type: "Diverging",
    note: "Best when values are interpreted around a meaningful middle point.",
    colors: ["#2166ac", "#92c5de", "#f7f7f7", "#f4a582", "#b2182b"],
  },
  "Purple-Green diverging": {
    type: "Diverging",
    note: "Useful for contrasting two sides of a balanced conceptual scale.",
    colors: ["#762a83", "#af8dc3", "#f7f7f7", "#7fbf7b", "#1b7837"],
  },
  "Colour-blind-aware": {
    type: "Accessibility-aware",
    note: "A restrained palette selected for stronger separability under common colour-vision constraints.",
    colors: ["#fef0d9", "#fdcc8a", "#fc8d59", "#d7301f", "#7f0000"],
  },
};

const metrics = {
  accessibility: {
    label: "Accessibility index",
    short: "Access",
    unit: "index score",
    description: "An illustrative teaching variable for access to services, destinations, and everyday opportunities.",
    prompt: "Where would a reader infer stronger accessibility, and how much does the classification support that reading?",
  },
  green: {
    label: "Green space access",
    short: "Green",
    unit: "index score",
    description: "An illustrative teaching variable for parks, open space, and environmental amenity.",
    prompt: "Which districts look comparatively underserved, and how confident is that reading?",
  },
  housing: {
    label: "Housing pressure",
    short: "Housing",
    unit: "index score",
    description: "An illustrative teaching variable combining urban intensity and limited environmental amenity.",
    prompt: "Which areas appear under stronger housing pressure, and what could be hidden by the chosen geography?",
  },
  transit: {
    label: "Transit intensity",
    short: "Transit",
    unit: "index score",
    description: "An illustrative teaching variable for transport activity and centrality.",
    prompt: "Does the map imply a compact core, a corridor pattern, or several local centres?",
  },
};

const classificationMethods = {
  "Equal interval": "Equal intervals preserve numeric distance, but sparse extreme values can dominate the apparent pattern.",
  Quantile: "Quantiles put a similar number of areas in each class, which supports comparison but can exaggerate small differences.",
  "Natural breaks / Jenks": "Jenks grouping follows clusters in the data, often producing intuitive classes but making comparisons less standardised.",
  "Standard deviation": "Standard deviation classes show distance from the mean, which foregrounds unusual areas and central tendency.",
};

const pages = [
  ["home", "Home"],
  ["studio", "Studio"],
  ["tutorials", "Tutorials"],
  ["concepts", "Concepts"],
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
    link: "https://proceedings.esri.com/library/userconf/proc13/papers/1015_20.pdf",
    tasks: [
      "Read the Ordnance Survey cartographic design principles.",
      "Apply lecture concepts and OS principles to critique a map or geovisualisation.",
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
      "Use colour combinations to read where both variables are high, both are low, or the relationship is uneven.",
      "Cartograms: resize or distort geographic regions according to a selected variable such as population.",
      "Compare how a conventional population gradient map and a population cartogram change interpretation.",
    ],
    note:
      "The bivariate mapping activity explores the relationship between per-capita new construction area and per-capita demolition area in Greater London.",
  },
];

const concepts = [
  {
    title: "Map communication",
    text: "A map is a communication system. The cartographer selects information, turns objects or phenomena into symbols, and designs conditions for users to retrieve, compare, and interpret geographic information.",
  },
  {
    title: "Visual perception",
    text: "Map reading depends on detection, discrimination, and recognition: noticing marks, distinguishing differences, and connecting visual forms to meaningful geographic categories or patterns.",
  },
  {
    title: "Visual thinking to visual communication",
    text: "Visual work moves between exploration, confirmation, synthesis, and presentation. Early maps help analysts think; finished graphics help audiences understand a focused claim.",
  },
  {
    title: "Geovisualisation",
    text: "Geovisualisation combines visual exploration, analysis, synthesis, and presentation of geospatial data. It treats maps as tools for reasoning as well as communication.",
  },
  {
    title: "Data type and structure",
    text: "Design choices depend on whether data are categorical, numerical, temporal, networked, flowing, or topological. Data structure also matters: wide tables support comparison across fields, while long tables often support time series and grouped analysis.",
  },
  {
    title: "Choosing visualisation by purpose",
    text: "Distribution, composition, temporal change, network or flow, and combined visualisations each ask for different graphic strategies. The purpose should guide the visual form, not the reverse.",
  },
  {
    title: "Interaction",
    text: "Interactive maps extend visual reasoning through navigation, filtering, linking, and brushing. Interaction should reveal structure without forcing users to hunt for the main interpretation.",
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
    pdf: "/pdfs/construction-demolition-england-2025-epb.pdf",
    prompts: [
      "How does the bivariate palette encode construction and demolition at the same time?",
      "Which places are visually framed as outliers, and why?",
      "What does building footprint data reveal that an aggregate table would hide?",
    ],
  },
  {
    title: "Scotland's twin referendums",
    theme: "Bivariate population-weighted cartogram, electoral geography, Scotland.",
    summary:
      "This regional graphic compares Scotland's 2014 independence referendum and 2016 EU referendum using a bivariate population-weighted cartogram, showing how national aggregates can hide regional political heterogeneity.",
    doi: "10.1080/21681376.2026.2637381",
    pdf: "/pdfs/scotland-twin-referendums-2026-rsrs.pdf",
    prompts: [
      "How does the population-weighted cartogram change the perceived importance of regions?",
      "Where do the two referendum geographies align or diverge?",
      "What political interpretation would be harder to see on a conventional map?",
    ],
  },
  {
    title: "An Academy of Nations?",
    theme: "Proportional-symbol cartogram, cultural geography, global cinema.",
    summary:
      "This featured graphic maps nominations and wins for the Academy Award for Best International Feature Film, using proportional symbols and colour intensity to reveal geographic imbalance and Eurocentrism.",
    doi: "10.1177/23998083251381497",
    pdf: "/pdfs/academy-nations-2025-epb.pdf",
    prompts: [
      "How do proportional symbols and colour intensity divide attention?",
      "What spatial imbalance becomes visible at global scale?",
      "How does the graphic connect cultural geography with critique of representation?",
    ],
  },
];

function deterministicScore(index, seed, min = 24, max = 96) {
  const raw = Math.sin((index + 1) * seed) * 10000;
  return Math.round(min + (raw - Math.floor(raw)) * (max - min));
}

function numericValue(...values) {
  const found = values.find((value) => Number.isFinite(Number(value)));
  return found === undefined ? undefined : Number(found);
}

function getFeatureName(feature, index) {
  const properties = feature.properties || {};
  return (
    properties._atlasName ||
    properties.name ||
    properties.Name ||
    properties.WD13NM ||
    properties.WD23NM ||
    properties.ward_name ||
    properties.WardName ||
    `Area ${index + 1}`
  );
}

function enrichFeature(feature, index, source) {
  const properties = feature.properties || {};
  const accessibility = numericValue(properties.accessibility, properties.Accessibility, deterministicScore(index, 3.11));
  const green = numericValue(properties.green, properties.Green, deterministicScore(index, 5.37));
  const transit = numericValue(properties.transit, properties.Transit, properties.density, deterministicScore(index, 7.19));
  const housing = numericValue(
    properties.housing,
    properties.Housing,
    Math.round(transit * 0.58 + (100 - green) * 0.42)
  );

  return {
    ...feature,
    properties: {
      ...properties,
      _atlasId: properties._atlasId || properties.id || properties.ID || `atlas-${source}-${index}`,
      _atlasName: getFeatureName(feature, index),
      _atlasLayerSource: source,
      accessibility,
      green,
      housing,
      transit,
    },
  };
}

function prepareStudioGeojson(collection, source) {
  return {
    ...collection,
    features: (collection.features || []).map((feature, index) => enrichFeature(feature, index, source)),
  };
}

const fallbackStudioGeojson = prepareStudioGeojson(fallbackGeojson, "fallback");

function valuesFor(collection, metric) {
  return collection.features.map((feature) => Number(feature.properties[metric])).filter(Number.isFinite);
}

function standardDeviationBreaks(vals, classes) {
  const sorted = vals.slice().sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const mean = ss.mean(sorted);
  const sd = ss.standardDeviation(sorted) || 1;
  const offsets = {
    3: [-0.5, 0.5],
    4: [-1, 0, 1],
    5: [-1.5, -0.5, 0.5, 1.5],
  }[classes];
  const thresholds = offsets.map((offset) => Math.max(min, Math.min(max, mean + offset * sd))).sort((a, b) => a - b);
  return [...thresholds, max];
}

function getBreaks(collection, metric, classes, method) {
  const vals = valuesFor(collection, metric).slice().sort((a, b) => a - b);
  const min = vals[0];
  const max = vals[vals.length - 1];

  if (!vals.length) {
    return Array.from({ length: classes }, () => 0);
  }

  if (max === min) {
    return Array.from({ length: classes }, () => max);
  }

  if (method === "Quantile") {
    return Array.from({ length: classes }, (_, index) => {
      const rank = Math.ceil(((index + 1) / classes) * vals.length) - 1;
      return vals[Math.min(vals.length - 1, rank)];
    });
  }

  if (method === "Natural breaks / Jenks") {
    try {
      const breaks = ss.jenks(vals, Math.min(classes, vals.length));
      const upperBreaks = breaks.slice(1);
      return upperBreaks.length === classes ? upperBreaks : getBreaks(collection, metric, classes, "Equal interval");
    } catch {
      return getBreaks(collection, metric, classes, "Equal interval");
    }
  }

  if (method === "Standard deviation") {
    return standardDeviationBreaks(vals, classes);
  }

  const width = (max - min) / classes;
  return Array.from({ length: classes }, (_, index) => min + width * (index + 1));
}

function classify(value, breaks) {
  const index = breaks.findIndex((threshold) => value <= threshold);
  return index === -1 ? breaks.length - 1 : index;
}

function getFill(value, breaks, paletteName) {
  const palette = palettes[paletteName].colors;
  const idx = classify(value, breaks);
  const scaledIndex = Math.round((idx / Math.max(1, breaks.length - 1)) * (palette.length - 1));
  return palette[scaledIndex];
}

function formatNumber(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function buildLegend(collection, metric, classes, method, paletteName) {
  const vals = valuesFor(collection, metric);
  const sorted = vals.slice().sort((a, b) => a - b);
  const min = sorted[0];
  const breaks = getBreaks(collection, metric, classes, method);
  const palette = palettes[paletteName].colors;

  return breaks.map((upper, index) => {
    const lower = index === 0 ? min : breaks[index - 1];
    const colorIndex = Math.round((index / Math.max(1, classes - 1)) * (palette.length - 1));
    const count = collection.features.filter((feature) => classify(feature.properties[metric], breaks) === index).length;
    return {
      color: palette[colorIndex],
      count,
      label: index === 0 ? `<= ${formatNumber(upper)}` : `${formatNumber(lower)}-${formatNumber(upper)}`,
    };
  });
}

function metricExtent(collection, metric) {
  const vals = valuesFor(collection, metric);
  return [Math.min(...vals), Math.max(...vals)];
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

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => (
    {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[char]
  ));
}

function Studio() {
  const [metric, setMetric] = useState("accessibility");
  const [palette, setPalette] = useState("Blues");
  const [method, setMethod] = useState("Equal interval");
  const [classes, setClasses] = useState(5);
  const [opacity, setOpacity] = useState(0.88);
  const [labels, setLabels] = useState(true);
  const [selected, setSelected] = useState("centre");
  const [hovered, setHovered] = useState(null);
  const [studioGeojson, setStudioGeojson] = useState(fallbackStudioGeojson);
  const [layerStatus, setLayerStatus] = useState("Fallback teaching layer");

  useEffect(() => {
    let ignore = false;

    fetch("/data/glasgow-wards.geojson")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Glasgow ward GeoJSON not available");
        }
        return response.json();
      })
      .then((data) => {
        if (!ignore && data?.features?.length) {
          const prepared = prepareStudioGeojson(data, "glasgow-wards");
          setStudioGeojson(prepared);
          setLayerStatus("Glasgow ward boundary layer");
          setSelected(prepared.features[0].properties._atlasId);
        }
      })
      .catch(() => {
        if (!ignore) {
          setStudioGeojson(fallbackStudioGeojson);
          setLayerStatus("Fallback teaching layer");
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!studioGeojson.features.some((feature) => feature.properties._atlasId === selected)) {
      setSelected(studioGeojson.features[0]?.properties._atlasId || "");
    }
  }, [selected, studioGeojson]);

  const breaks = useMemo(
    () => getBreaks(studioGeojson, metric, Number(classes), method),
    [studioGeojson, metric, classes, method]
  );
  const legend = useMemo(
    () => buildLegend(studioGeojson, metric, Number(classes), method, palette),
    [studioGeojson, metric, classes, method, palette]
  );
  const activeFeature = useMemo(
    () =>
      studioGeojson.features.find((feature) => feature.properties._atlasId === (hovered || selected)) ||
      studioGeojson.features[0],
    [studioGeojson, hovered, selected]
  );
  const [minValue, maxValue] = metricExtent(studioGeojson, metric);
  const activeValue = activeFeature.properties[metric];
  const activeClass = classify(activeValue, breaks) + 1;
  const layerKey = `${layerStatus}-${metric}-${palette}-${method}-${classes}-${opacity}-${labels}`;
  const layerNote =
    layerStatus === "Fallback teaching layer"
      ? "No public Glasgow ward GeoJSON was found at /data/glasgow-wards.geojson, so the Studio is using synthetic learning districts as a fallback teaching layer."
      : "The Studio is using the public Glasgow ward GeoJSON supplied in /data/glasgow-wards.geojson with illustrative teaching variables.";

  const styleFeature = (feature) => {
    const id = feature.properties._atlasId;
    const isSelected = selected === id;
    const isHovered = hovered === id;

    return {
      color: isSelected || isHovered ? "#1f2933" : "#ffffff",
      fillColor: getFill(Number(feature.properties[metric]), breaks, palette),
      fillOpacity: opacity,
      opacity: 1,
      weight: isSelected ? 4 : isHovered ? 3 : 1.5,
    };
  };

  const bindFeature = (feature, layer) => {
    const properties = feature.properties;
    const id = properties._atlasId;
    const name = properties._atlasName;
    const value = properties[metric];

    layer.on({
      click: () => setSelected(id),
      mouseover: () => {
        setHovered(id);
        layer.bringToFront?.();
      },
      mouseout: () => setHovered(null),
    });

    layer.bindPopup(
      `<strong>${escapeHtml(name)}</strong><br>${escapeHtml(metrics[metric].label)}: ${escapeHtml(value)} / 100`
    );

    if (labels) {
      layer.bindTooltip(escapeHtml(name), {
        className: "district-tooltip",
        direction: "center",
        permanent: true,
      });
    }
  };

  return (
    <main className="page studio-layout">
      <section className="map-panel" aria-labelledby="studio-heading">
        <div className="panel-title-row">
          <div>
            <p className="eyebrow">Visual Reasoning Studio</p>
            <h2 id="studio-heading">{metrics[metric].label}</h2>
            <p className="panel-copy">{metrics[metric].description}</p>
          </div>
          <span className="pill">Leaflet + OpenStreetMap</span>
        </div>

        <div className="map-status-row">
          <span className="pill muted-pill">{layerStatus}</span>
          <span>Illustrative teaching variables, not operational city indicators.</span>
        </div>

        <div className="leaflet-shell" aria-label="Interactive Leaflet choropleth map centred on Glasgow">
          <MapContainer center={[55.8642, -4.2518]} zoom={11} scrollWheelZoom className="leaflet-map">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <GeoJSON key={layerKey} data={studioGeojson} style={styleFeature} onEachFeature={bindFeature} />
          </MapContainer>
        </div>

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
            <h3>{activeFeature.properties._atlasName}</h3>
            <p>
              {activeValue} / 100, class {activeClass} of {classes}. Dataset range: {minValue}-{maxValue}.
            </p>
            <p className="prompt-text">{metrics[metric].prompt}</p>
            <p>{layerNote}</p>
          </section>
        </div>
      </section>

      <aside className="control-panel" aria-label="Studio design controls">
        <div className="control-title">
          <SlidersHorizontal size={18} aria-hidden="true" />
          <span>Design controls</span>
        </div>

        <SegmentedControl
          label="Illustrative teaching variable"
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
                {palettes[name].colors.map((color) => (
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
          options={Object.keys(classificationMethods)}
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
          <p>{classificationMethods[method]}</p>
        </div>

        <div className="method-note">
          <strong>{palettes[palette].type} palette</strong>
          <p>{palettes[palette].note}</p>
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
            {tutorial.link && (
              <a className="inline-link" href={tutorial.link} target="_blank" rel="noreferrer">
                Read the OS principles <ExternalLink size={15} aria-hidden="true" />
              </a>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}

function Concepts() {
  return (
    <main className="page">
      <SectionHeader
        eyebrow="Concepts"
        title="Core ideas for map use and geovisualisation."
        text="These concise concept blocks distil lecture themes into public teaching text for classroom discussion and independent revision."
      />
      <section className="concept-grid" aria-label="Map use and geovisualisation concepts">
        {concepts.map((concept) => (
          <article className="concept-card" key={concept.title}>
            <h3>{concept.title}</h3>
            <p>{concept.text}</p>
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

      <section className="section-block publication-panel">
        <SectionHeader
          eyebrow="Publication model"
          title="A concise format for visual explanation."
          text="In Environment and Planning B, Featured Graphics are reviewed by the Graphics Editor and commonly centre on one graphic, a short commentary of about 400 words, and a brief reference list. Atlas Praxis uses this publication format as a teaching model: students move from exploratory mapping to concise, publication-style visual explanation."
        />
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
            <div className="case-actions">
              <a href={`https://doi.org/${study.doi}`} target="_blank" rel="noreferrer">
                DOI: {study.doi} <ExternalLink size={15} aria-hidden="true" />
              </a>
              <a className="pdf-button" href={study.pdf} target="_blank" rel="noreferrer">
                Open PDF <ExternalLink size={15} aria-hidden="true" />
              </a>
            </div>
            <div className="reading-prompts">
              <strong>How to read this graphic</strong>
              <ul>
                {study.prompts.map((prompt) => (
                  <li key={prompt}>{prompt}</li>
                ))}
              </ul>
            </div>
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
      {active === "concepts" && <Concepts />}
      {active === "critique" && <Critique />}
      {active === "featured" && <FeaturedGraphics />}
      {active === "cases" && <CaseStudies />}
      {active === "about" && <About />}
      <footer>Atlas Praxis | Open geomatics teaching studio | University of Glasgow</footer>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
