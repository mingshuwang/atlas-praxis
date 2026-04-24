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
import "./style.css";

const SIMD_DATA_URL = "/data/glasgow-simd-2020v2.geojson";
const SIMD_MAX_RANK = 6976;
const SIMD_REVERSED_MAX = SIMD_MAX_RANK + 1;

const palettes = {
  "Official SIMD-style": {
    type: "Sequential",
    note: "A deprivation-intensity palette: darker red tones indicate higher relative deprivation.",
    colors: ["#fff7ec", "#fdd49e", "#fdbb84", "#ef6548", "#990000"],
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
  Blues: {
    type: "Sequential",
    note: "A familiar ordered palette for low-to-high intensity mapping.",
    colors: ["#eff6ff", "#bfdbfe", "#60a5fa", "#2563eb", "#1e3a8a"],
  },
  Greens: {
    type: "Sequential",
    note: "Useful for ordered comparisons, especially when the theme invites environmental associations.",
    colors: ["#f0fdf4", "#bbf7d0", "#4ade80", "#16a34a", "#14532d"],
  },
  "Purple-Green": {
    type: "Diverging",
    note: "A diverging palette for teaching contrast; use carefully when the data do not have a meaningful midpoint.",
    colors: ["#762a83", "#af8dc3", "#f7f7f7", "#7fbf7b", "#1b7837"],
  },
  "Blue-Orange": {
    type: "Diverging",
    note: "A diverging palette that can make contrasts vivid, but may imply two-sided meaning.",
    colors: ["#2166ac", "#92c5de", "#f7f7f7", "#f4a582", "#b2182b"],
  },
  "Colour-blind-aware": {
    type: "Colour-blind-aware",
    note: "A restrained sequential palette selected for stronger separability under common colour-vision constraints.",
    colors: ["#fef0d9", "#fdcc8a", "#fc8d59", "#d7301f", "#7f0000"],
  },
};

const simdVariables = {
  overallRank: {
    label: "Overall SIMD rank",
    short: "Overall",
    field: "rankv2",
    rank: true,
    description: "Overall Scottish Index of Multiple Deprivation 2020v2 rank.",
  },
  percentile: {
    label: "SIMD percentile",
    short: "Percentile",
    field: "percentv2",
    lowerIsMoreDeprived: true,
    max: 100,
    description: "SIMD percentile, interpreted as deprivation intensity for display.",
  },
  quintile: {
    label: "SIMD quintile",
    short: "Quintile",
    field: "quintilev2",
    lowerIsMoreDeprived: true,
    max: 5,
    description: "SIMD quintile grouping, where 1 is most deprived.",
  },
  income: {
    label: "Income rank",
    short: "Income",
    field: "incrankv2",
    rank: true,
    description: "Income domain rank.",
  },
  employment: {
    label: "Employment rank",
    short: "Employment",
    field: "emprank",
    rank: true,
    description: "Employment domain rank.",
  },
  health: {
    label: "Health rank",
    short: "Health",
    field: "hlthrank",
    rank: true,
    description: "Health domain rank.",
  },
  education: {
    label: "Education rank",
    short: "Education",
    field: "edurank",
    rank: true,
    description: "Education, skills and training domain rank.",
  },
  access: {
    label: "Access rank",
    short: "Access",
    field: "gaccrank",
    rank: true,
    description: "Geographic access to services domain rank.",
  },
  crime: {
    label: "Crime rank",
    short: "Crime",
    field: "crimerank",
    rank: true,
    description: "Crime domain rank.",
  },
  housing: {
    label: "Housing rank",
    short: "Housing",
    field: "houserank",
    rank: true,
    description: "Housing domain rank.",
  },
};

const classificationMethods = {
  "Official quintile": "Uses Scottish Government SIMD quintile grouping.",
  Decile: "Uses Scottish Government SIMD decile grouping.",
  "Equal interval": "Divides the numerical range evenly.",
  Quantile: "Puts roughly equal numbers of data zones in each class.",
  "Natural breaks / Jenks": "Groups similar values and maximises difference between classes.",
  "Standard deviation": "Shows distance from the mean.",
};

const reasoningPrompts = [
  "What spatial pattern is immediately visible?",
  "How does the pattern change when switching from overall SIMD to a single domain?",
  "Which classification method makes local contrasts more or less visible?",
  "Does the colour palette support interpretation for a general audience?",
  "What are the risks of interpreting area-based deprivation as individual deprivation?",
];

const courseCatalogueUrl = "https://www.gla.ac.uk/coursecatalogue/course/?code=GEOG5026";
const maintainerLinks = {
  personal: "https://mingshuwang.org",
  profile: "https://www.gla.ac.uk/schools/ges/staff/mingshuwang/",
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
    text: "Compare official SIMD groupings with alternative classifications, then explain how each method changes the apparent geography of deprivation.",
  },
  {
    title: "Colour and perception",
    text: "Test sequential, diverging, and colour-blind-aware palettes. Discuss contrast, legibility, and whether darker colours support the intended reading.",
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

function readField(feature, field) {
  const properties = feature?.properties || {};
  return properties[field] ?? properties[field.toUpperCase()] ?? properties[field.toLowerCase()];
}

function numberField(feature, field) {
  const value = Number(readField(feature, field));
  return Number.isFinite(value) ? value : undefined;
}

function textField(feature, field, fallback = "") {
  const value = readField(feature, field);
  return value === undefined || value === null ? fallback : String(value);
}

function formatNumber(value) {
  if (!Number.isFinite(Number(value))) return "Not available";
  return Number.isInteger(Number(value)) ? String(value) : Number(value).toFixed(1);
}

function getOriginalValue(feature, variableKey) {
  return numberField(feature, simdVariables[variableKey].field);
}

function getDisplayValue(feature, variableKey) {
  const variable = simdVariables[variableKey];
  const value = getOriginalValue(feature, variableKey);

  if (!Number.isFinite(value)) return undefined;
  if (variable.rank) return SIMD_REVERSED_MAX - value;
  if (variable.lowerIsMoreDeprived) return (variable.max || 100) + 1 - value;
  return value;
}

function getDatazoneCode(feature) {
  return textField(feature, "datazone", "Unknown data zone");
}

function getDatazoneName(feature) {
  return textField(feature, "dzname", getDatazoneCode(feature));
}

function getInterpretation(feature) {
  const quintile = numberField(feature, "quintilev2");
  if (quintile <= 2) return "More deprived relative to other Scottish data zones.";
  if (quintile >= 4) return "Less deprived relative to other Scottish data zones.";
  return "Around the Scottish middle of relative deprivation.";
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

function valuesFor(features, variableKey) {
  return features.map((feature) => getDisplayValue(feature, variableKey)).filter(Number.isFinite);
}

function standardDeviationBreaks(values, classes) {
  const sorted = values.slice().sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const mean = ss.mean(sorted);
  const sd = ss.standardDeviation(sorted) || 1;
  const offsetsByClass = {
    3: [-0.5, 0.5],
    4: [-1, 0, 1],
    5: [-1.5, -0.5, 0.5, 1.5],
    6: [-2, -1, 0, 1, 2],
    7: [-2.5, -1.5, -0.5, 0.5, 1.5, 2.5],
  };
  const offsets = offsetsByClass[classes] || offsetsByClass[5];
  const thresholds = offsets.map((offset) => Math.max(min, Math.min(max, mean + offset * sd))).sort((a, b) => a - b);
  return [...thresholds, max];
}

function getBreaks(features, variableKey, classes, method) {
  const values = valuesFor(features, variableKey).slice().sort((a, b) => a - b);
  const min = values[0];
  const max = values[values.length - 1];

  if (!values.length) return Array.from({ length: classes }, () => 0);
  if (max === min) return Array.from({ length: classes }, () => max);

  if (method === "Quantile") {
    return Array.from({ length: classes }, (_, index) => {
      const rank = Math.ceil(((index + 1) / classes) * values.length) - 1;
      return values[Math.min(values.length - 1, rank)];
    });
  }

  if (method === "Natural breaks / Jenks") {
    try {
      const breaks = ss.jenks(values, Math.min(classes, values.length));
      return breaks.slice(1);
    } catch {
      return getBreaks(features, variableKey, classes, "Equal interval");
    }
  }

  if (method === "Standard deviation") {
    return standardDeviationBreaks(values, classes);
  }

  const width = (max - min) / classes;
  return Array.from({ length: classes }, (_, index) => min + width * (index + 1));
}

function classifyByBreaks(value, breaks) {
  const index = breaks.findIndex((threshold) => value <= threshold);
  return index === -1 ? breaks.length - 1 : index;
}

function paletteColor(index, classes, paletteName) {
  const colors = palettes[paletteName].colors;
  const scaledIndex = Math.round((index / Math.max(1, classes - 1)) * (colors.length - 1));
  return colors[Math.max(0, Math.min(colors.length - 1, scaledIndex))];
}

function getClassInfo(feature, variableKey, method, classes, breaks) {
  if (method === "Official quintile") {
    const group = numberField(feature, "quintilev2");
    return { index: 5 - group, classes: 5, group };
  }

  if (method === "Decile") {
    const group = numberField(feature, "decilev2");
    return { index: 10 - group, classes: 10, group };
  }

  const displayValue = getDisplayValue(feature, variableKey);
  return { index: classifyByBreaks(displayValue, breaks), classes, group: undefined };
}

function buildLegend(features, variableKey, method, classes, breaks, paletteName) {
  if (method === "Official quintile" || method === "Decile") {
    const field = method === "Official quintile" ? "quintilev2" : "decilev2";
    const count = method === "Official quintile" ? 5 : 10;

    return Array.from({ length: count }, (_, index) => {
      const group = index + 1;
      const classIndex = count - group;
      const rows = features.filter((feature) => numberField(feature, field) === group).length;
      const suffix = group === 1 ? "most deprived" : group === count ? "least deprived" : "relative group";
      return {
        color: paletteColor(classIndex, count, paletteName),
        count: rows,
        label: `${method === "Official quintile" ? "Quintile" : "Decile"} ${group} (${suffix})`,
      };
    });
  }

  return breaks.map((upper, index) => {
    const lower = index === 0 ? Math.min(...valuesFor(features, variableKey)) : breaks[index - 1];
    const rows = features.filter((feature) => classifyByBreaks(getDisplayValue(feature, variableKey), breaks) === index).length;
    return {
      color: paletteColor(index, classes, paletteName),
      count: rows,
      label: index === 0 ? `<= ${formatNumber(upper)}` : `${formatNumber(lower)}-${formatNumber(upper)}`,
    };
  });
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
          text="Developed in connection with postgraduate teaching at the University of Glasgow, Atlas Praxis supports GEOG5026 Visualisation & Map Use. The course focuses on applied map design, geographic information visualisation, map use, visual perception, critical analysis of geospatial representation, map-user evaluation, map production, and oral discussion of cartographic issues."
        />
        <a className="inline-link" href={courseCatalogueUrl} target="_blank" rel="noreferrer">
          View GEOG5026 course catalogue <ExternalLink size={15} aria-hidden="true" />
        </a>
      </section>

      <section className="section-block course-band">
        <SectionHeader
          eyebrow="Teaching use"
          title="Designed for a 30-60 minute practical session."
          text="Students explore the Visual Reasoning Studio, change variables, classification methods, and palettes, respond to critique prompts, and translate observations into a featured-graphics style visual argument."
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
  const [variableKey, setVariableKey] = useState("overallRank");
  const [palette, setPalette] = useState("Official SIMD-style");
  const [method, setMethod] = useState("Official quintile");
  const [classes, setClasses] = useState(5);
  const [opacity, setOpacity] = useState(0.82);
  const [labels, setLabels] = useState(false);
  const [selected, setSelected] = useState("");
  const [hovered, setHovered] = useState(null);
  const [simdGeojson, setSimdGeojson] = useState(null);
  const [loadError, setLoadError] = useState("");

  const features = simdGeojson?.features || [];
  const variable = simdVariables[variableKey];
  const availableMethods =
    variableKey === "overallRank"
      ? Object.keys(classificationMethods)
      : Object.keys(classificationMethods).filter((name) => name !== "Official quintile" && name !== "Decile");
  const classCount = method === "Decile" ? 10 : method === "Official quintile" ? 5 : Number(classes);

  useEffect(() => {
    let ignore = false;

    fetch(SIMD_DATA_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Glasgow SIMD data is not available locally. Run npm.cmd run fetch:simd, commit public/data/glasgow-simd-2020v2.geojson, and redeploy."
          );
        }
        return response.json();
      })
      .then((data) => {
        if (!data?.features?.length) {
          throw new Error("SIMD data file is empty or invalid. Run npm.cmd run fetch:simd again.");
        }
        if (!ignore) {
          setSimdGeojson(data);
          setSelected(getDatazoneCode(data.features[0]));
          setLoadError("");
        }
      })
      .catch((error) => {
        if (!ignore) {
          setSimdGeojson(null);
          setLoadError(
            error.message ||
              "Glasgow SIMD data is not available locally. Run npm.cmd run fetch:simd, commit public/data/glasgow-simd-2020v2.geojson, and redeploy."
          );
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!availableMethods.includes(method)) {
      setMethod("Equal interval");
    }
  }, [availableMethods, method]);

  useEffect(() => {
    if (features.length && !features.some((feature) => getDatazoneCode(feature) === selected)) {
      setSelected(getDatazoneCode(features[0]));
    }
  }, [features, selected]);

  const breaks = useMemo(
    () => (features.length ? getBreaks(features, variableKey, classCount, method) : []),
    [features, variableKey, classCount, method]
  );
  const legend = useMemo(
    () => (features.length ? buildLegend(features, variableKey, method, classCount, breaks, palette) : []),
    [features, variableKey, method, classCount, breaks, palette]
  );
  const activeFeature = useMemo(
    () => features.find((feature) => getDatazoneCode(feature) === (hovered || selected)) || features[0],
    [features, hovered, selected]
  );
  const displayValues = valuesFor(features, variableKey);
  const minValue = displayValues.length ? Math.min(...displayValues) : undefined;
  const maxValue = displayValues.length ? Math.max(...displayValues) : undefined;
  const layerKey = `${variableKey}-${palette}-${method}-${classCount}-${opacity}-${labels}-${selected}-${hovered || ""}`;

  const styleFeature = (feature) => {
    const classInfo = getClassInfo(feature, variableKey, method, classCount, breaks);
    const id = getDatazoneCode(feature);
    const isSelected = selected === id;
    const isHovered = hovered === id;

    return {
      color: isSelected || isHovered ? "#1f2933" : "#ffffff",
      fillColor: paletteColor(classInfo.index, classInfo.classes, palette),
      fillOpacity: opacity,
      opacity: 1,
      weight: isSelected ? 3 : isHovered ? 2.4 : 0.8,
    };
  };

  const bindFeature = (feature, layer) => {
    const id = getDatazoneCode(feature);
    const selectedValue = getOriginalValue(feature, variableKey);

    layer.on({
      click: () => setSelected(id),
      mouseover: () => {
        setHovered(id);
        layer.bringToFront?.();
      },
      mouseout: () => setHovered(null),
    });

    layer.bindPopup(`
      <strong>${escapeHtml(getDatazoneName(feature))}</strong><br>
      <strong>Data zone:</strong> ${escapeHtml(id)}<br>
      <strong>Local authority:</strong> ${escapeHtml(textField(feature, "laname", "Glasgow City"))}<br>
      <strong>Overall rank:</strong> ${escapeHtml(formatNumber(numberField(feature, "rankv2")))}<br>
      <strong>Quintile:</strong> ${escapeHtml(formatNumber(numberField(feature, "quintilev2")))}<br>
      <strong>Decile:</strong> ${escapeHtml(formatNumber(numberField(feature, "decilev2")))}<br>
      <strong>Percentile:</strong> ${escapeHtml(formatNumber(numberField(feature, "percentv2")))}<br>
      <strong>${escapeHtml(variable.label)}:</strong> ${escapeHtml(formatNumber(selectedValue))}<br>
      <em>${escapeHtml(getInterpretation(feature))}</em>
    `);

    if (labels) {
      layer.bindTooltip(escapeHtml(id), {
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
            <h2 id="studio-heading">Glasgow SIMD Explorer</h2>
            <p className="panel-copy">
              Explore Scottish Index of Multiple Deprivation 2020v2 data zones in Glasgow. Darker colours show greater
              relative deprivation by default.
            </p>
          </div>
          <span className="pill">Leaflet + OpenStreetMap</span>
        </div>

        <div className="map-status-row">
          <span className="pill muted-pill">SIMD 2020v2</span>
          <span>In SIMD, lower ranks indicate greater relative deprivation.</span>
        </div>

        {loadError && <div className="map-alert">{loadError}</div>}

        <div className="leaflet-shell" aria-label="Interactive Leaflet choropleth map centred on Glasgow">
          <MapContainer center={[55.8642, -4.2518]} zoom={11} scrollWheelZoom className="leaflet-map">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {simdGeojson && <GeoJSON key={layerKey} data={simdGeojson} style={styleFeature} onEachFeature={bindFeature} />}
          </MapContainer>
        </div>

        <div className="studio-bottom-grid">
          <section className="legend-panel" aria-label="Choropleth legend">
            <h3>Legend</h3>
            <p>
              {method}, {classCount} classes. Display values are deprivation intensity: higher means more deprived.
            </p>
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

          <section className="reading-panel" aria-label="Selected data zone reading">
            <p className="eyebrow">Current reading</p>
            {activeFeature ? (
              <>
                <h3>{getDatazoneName(activeFeature)}</h3>
                <p>
                  {variable.label}: {formatNumber(getOriginalValue(activeFeature, variableKey))}. Display range:{" "}
                  {formatNumber(minValue)}-{formatNumber(maxValue)}.
                </p>
                <p className="prompt-text">{getInterpretation(activeFeature)}</p>
              </>
            ) : (
              <p>Load the Glasgow SIMD layer to inspect a data zone.</p>
            )}
          </section>
        </div>

        <div className="data-note">
          <strong>Data note</strong>
          <p>
            SIMD is a relative, area-based measure of deprivation. It identifies concentrations of deprivation in data
            zones, not whether every individual in an area is deprived.
          </p>
          <p>
            Data source: Scottish Government, Scottish Index of Multiple Deprivation 2020v2. Contains Ordnance Survey
            data © Crown copyright and database right. Used under the Open Government Licence.
          </p>
        </div>
      </section>

      <aside className="control-panel" aria-label="Studio design controls">
        <div className="control-title">
          <SlidersHorizontal size={18} aria-hidden="true" />
          <span>Design controls</span>
        </div>

        <SegmentedControl
          label="Mapped variable"
          value={variableKey}
          onChange={setVariableKey}
          options={Object.entries(simdVariables).map(([value, config]) => ({ value, label: config.short }))}
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

        <SegmentedControl label="Classification" value={method} onChange={setMethod} options={availableMethods} />

        {method !== "Official quintile" && method !== "Decile" && (
          <label className="range-control">
            <span>Number of classes: {classes}</span>
            <input type="range" min="3" max="7" value={classes} onChange={(event) => setClasses(Number(event.target.value))} />
          </label>
        )}

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
          <span>Show data zone labels</span>
        </label>

        <div className="method-note">
          <strong>{variable.label}</strong>
          <p>{variable.description}</p>
        </div>

        <div className="method-note">
          <strong>Classification note</strong>
          <p>{classificationMethods[method]}</p>
        </div>

        <div className="method-note">
          <strong>{palettes[palette].type} palette</strong>
          <p>{palettes[palette].note}</p>
        </div>

        <div className="reasoning-panel">
          <strong>Reasoning prompts</strong>
          <ul>
            {reasoningPrompts.map((prompt) => (
              <li key={prompt}>{prompt}</li>
            ))}
          </ul>
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
          Atlas Praxis is developed in connection with postgraduate teaching at the University of Glasgow, including
          GEOG5026 Visualisation & Map Use. It is an open teaching studio, not an official University of Glasgow
          platform.
        </p>
        <p className="about-note">
          Current release: a browser-based learning environment with a Glasgow SIMD visual reasoning studio, static
          teaching pages, and reusable classroom frameworks.
        </p>
        <div className="contact-card">
          <h3>Maintainer</h3>
          <p>
            Dr Mingshu Wang<br />
            Reader in Geospatial Data Science<br />
            University of Glasgow
          </p>
          <div className="link-stack">
            <a href="mailto:Mingshu.Wang@glasgow.ac.uk">Mingshu.Wang@glasgow.ac.uk</a>
            <a href={maintainerLinks.personal} target="_blank" rel="noreferrer">
              Personal website <ExternalLink size={15} aria-hidden="true" />
            </a>
            <a href={maintainerLinks.profile} target="_blank" rel="noreferrer">
              University profile <ExternalLink size={15} aria-hidden="true" />
            </a>
            <a href={courseCatalogueUrl} target="_blank" rel="noreferrer">
              GEOG5026 course catalogue <ExternalLink size={15} aria-hidden="true" />
            </a>
          </div>
        </div>
        <div className="contact-card">
          <h3>Data and attribution</h3>
          <p>
            The Visual Reasoning Studio uses Scottish Index of Multiple Deprivation (SIMD) 2020v2 data for Glasgow
            data zones. SIMD is a relative, area-based measure of deprivation and should not be interpreted as
            describing every individual within an area.
          </p>
          <p>
            Map tiles are provided by OpenStreetMap contributors. SIMD data are provided by the Scottish Government
            and contain Ordnance Survey data © Crown copyright and database right. Used under the Open Government
            Licence.
          </p>
        </div>
      </section>
      <section className="roadmap">
        <Feature icon={<BookOpen />} title="Teaching alignment" text="Supports visual perception, representation, interpretation, user evaluation, critique, and oral discussion." />
        <Feature icon={<Layers />} title="Data and attribution" text="Uses Glasgow SIMD 2020v2 data zones and OpenStreetMap tiles with visible attribution." />
        <Feature icon={<Route />} title="Learning pathway" text="Guides learners from observing a pattern to modifying a design, critiquing the result, and communicating a claim." />
        <Feature icon={<Palette />} title="Roadmap" text="Next modules: side-by-side comparison, critique sheets, open teaching datasets, activity templates, and web/mobile mapping exercises." />
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
