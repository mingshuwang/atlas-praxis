# Atlas Praxis

Atlas Praxis is an open geomatics teaching studio for visual reasoning. It is a static React/Vite application that helps students examine how map design choices shape geographic interpretation, map use, critique, and communication.

The app uses bundled demonstration data and has no backend, login, database, upload system, paid API, API key, or external map token.

## Teaching Purpose

Atlas Praxis supports postgraduate geomatics teaching by turning map production into a studio cycle:

- Observe: read the mapped pattern and visual hierarchy.
- Modify: test classification, colour, opacity, labels, and mapped variables.
- Critique: evaluate representation, perception, interpretation, ethics, and communication.
- Communicate: refine a map exploration into a presentation-ready featured graphic.

The public teaching content is developed in connection with GEOG5026 Visualisation & Map Use at the University of Glasgow. It draws on course themes including applied map design, geographic information visualisation, map use, visual perception, map-user evaluation, map critique, and featured graphics. Internal assessment details, grading criteria, course administration, copyrighted examples, and student materials are not published in the app.

## Pages

- Home: product overview, learning pathway, course integration, and classroom activities.
- Studio: interactive choropleth exercise using bundled Glasgow demonstration data.
- Critique: five-part framework for structured map critique.
- Featured Graphics: workflow and checklist for moving from map exploration to a clear geographic visual.
- About: pedagogical alignment, implementation notes, and roadmap.

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

Atlas Praxis can be deployed to Vercel with default Vite settings.

- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: none

Suggested deployment flow:

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Confirm the Vite framework preset.
4. Deploy the static site.

## Instructor Materials

See [docs/instructor-guide.md](docs/instructor-guide.md) for a 30-60 minute class plan that uses the Studio, Critique, and Featured Graphics pages without requiring accounts or external services.

## CATCON 9 Context

Atlas Praxis has also been prepared for CATCON 9 evaluation as an open cartographic education resource. The public-facing site is written as a teaching product; CATCON-specific context is kept in project documentation.

Evaluation questions:

- Does the Studio help students explain how design choices affect map interpretation?
- Does the critique framework support concise seminar discussion?
- Does the featured-graphics workflow help students move from exploration to communication?
- What additional scaffolding would help instructors adapt the studio to other geomatics topics?

## Roadmap

- Side-by-side comparison of two map designs.
- Printable critique worksheet and instructor prompts.
- Static gallery of example featured graphics created specifically for the project.
- Additional web and mobile mapping activities.
- Geodatabase and land administration teaching exercises.
- Optional teaching notes for GEOG5026 workshops.

## Author

Dr Mingshu Wang  
Reader in Geospatial Data Science  
University of Glasgow

## License

MIT
