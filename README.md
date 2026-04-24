# Atlas Praxis

Atlas Praxis is an open geomatics teaching studio for visual reasoning. It is a browser-based learning environment built with React and Vite for teaching how maps represent geographic information, how visual perception shapes map use, and how design choices become cartographic arguments.

The current release is fully static. It uses bundled sample teaching data and has no backend, login, upload system, database, API key, paid service, or external map token.

## Teaching Purpose

Atlas Praxis supports postgraduate geomatics teaching through a studio cycle:

- Observe: read mapped patterns and visual hierarchy.
- Modify: test classification, colour, opacity, labels, variables, and representation methods.
- Critique: evaluate representation, perception, interpretation, ethics, and communication.
- Communicate: refine exploratory maps into presentation-ready featured graphics.

The teaching content is developed in connection with GEOG5026 Visualisation & Map Use at the University of Glasgow. The course focuses on applied map design, geographic information visualisation, map use, visual perception, critical analysis of geospatial representation, map-user evaluation, map production, and oral discussion of cartographic issues.

## Pages And Features

- Home: product overview, learning pathway, course integration, and classroom activities.
- Studio: interactive choropleth exercise using bundled Glasgow sample teaching data.
- Tutorials: guided activities on map critique, cartographic design principles, bivariate mapping, and cartograms.
- Critique: five-part framework covering Representation, Perception, Interpretation, Ethics, and Communication.
- Featured Graphics: teaching framework and checklist for moving from map exploration to a clear geographic visual.
- Case Studies: citation-style cards linking to DOI records for published featured graphics.
- About: course connection, implementation notes, and roadmap.

## Local Setup

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

Atlas Praxis can be deployed to Vercel or any static hosting platform with standard Vite settings.

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

## Roadmap

- Side-by-side comparison of two map designs.
- Printable critique worksheet and instructor prompts.
- Additional tutorials for web mapping and mobile mapping.
- Static gallery of original teaching examples created for the project.
- Geodatabase and land administration teaching exercises.
- Optional teaching notes for GEOG5026 workshops.

## Citation And Contact

If you use or adapt Atlas Praxis in teaching, cite the project as:

Wang, M. Atlas Praxis: an open geomatics teaching studio for visual reasoning. University of Glasgow.

Contact: Dr Mingshu Wang, Reader in Geospatial Data Science, University of Glasgow.

## License

MIT
