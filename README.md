# Atlas Praxis

Atlas Praxis is an open-source React/Vite teaching prototype for postgraduate geomatics education. It is prepared as an initial CATCON 9 evaluation prototype linked to GEOG5026 Visualisation & Map Use at the University of Glasgow.

The app is intentionally static: it uses bundled demonstration data, requires no backend, and does not depend on paid APIs, API keys, or external map tokens.

## Teaching Concept

Atlas Praxis supports visual reasoning with maps. Students can adjust a choropleth design, read how the pattern changes, critique the cartographic choices, and prepare a concise featured graphic for seminar discussion or assessment.

The current prototype focuses on three teaching moves:

- See: compare how classification, colour, opacity, and labels shape spatial interpretation.
- Critique: evaluate maps from the perspective of map users and peer reviewers.
- Share: frame a featured graphic around one clear geographic argument.

## Prototype Pages

- Home: project introduction and teaching rationale.
- Studio: interactive choropleth design exercise using bundled Glasgow demonstration data.
- Critique: structured prompts for postgraduate map critique.
- Featured Graphics: checklist for presentation-ready geographic visuals.
- About: pedagogical alignment and development roadmap.

## Local Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build the static production bundle:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Deployment

Atlas Praxis can be deployed to Vercel as a static Vite application.

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Use the default Vite framework settings.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Publish the deployed URL with the CATCON 9 submission materials.

No environment variables are required for the current prototype.

## CATCON 9 Context

The prototype demonstrates how open teaching software can support studio-based geomatics learning without requiring specialist desktop GIS infrastructure. It is designed for early evaluation rather than production teaching at scale.

Evaluation questions:

- Does the Studio help students explain how design choices affect map interpretation?
- Are the critique prompts concise enough for seminar and workshop use?
- Does the featured-graphics workflow support clearer oral presentation of geographic arguments?
- What additional scaffolding would help students connect map design, map use, and uncertainty?

## Roadmap

- Side-by-side comparison of two map designs.
- Exportable critique worksheet for seminars and assessment.
- Student featured-graphics gallery using static example content.
- Web and mobile mapping lab extension.
- Geodatabase and land administration teaching exercises.
- Optional teaching notes for GEOG5026 workshops.

## Author

Dr Mingshu Wang  
Reader in Geospatial Data Science  
University of Glasgow

## License

MIT
