# Atlas Praxis

Atlas Praxis is an open geomatics teaching studio for visual reasoning. It is a browser-based learning environment for teaching how maps represent geographic information, how visual perception shapes map use, and how cartographic design choices become arguments.

The current release is fully static and deployable on Vercel. It has no backend, login, upload system, database, student accounts, paid API, API key, or external map token.

## Teaching Purpose

Atlas Praxis supports postgraduate geomatics teaching through a studio cycle:

- Observe mapped patterns and visual hierarchy.
- Modify classification, colour, opacity, variables, and representation methods.
- Critique representation, perception, interpretation, ethics, and communication.
- Communicate exploratory findings as concise featured graphics.

The teaching content is developed in connection with GEOG5026 Visualisation & Map Use at the University of Glasgow. The course focuses on applied map design, geographic information visualisation, map use, visual perception, critical analysis of geospatial representation, map-user evaluation, map production, and oral discussion of cartographic issues.

## Pages And Features

- Home: product overview, learning pathway, course integration, and classroom activities.
- Studio: Leaflet map studio centred on Glasgow with OpenStreetMap tiles, attribution, choropleth controls, palette notes, classification notes, and illustrative teaching variables.
- Tutorials: guided activities on OS cartographic design principles, map critique, bivariate mapping, quantile classification, colour combinations, and cartograms.
- Concepts: public teaching notes on map communication, visual perception, geovisualisation, data structure, visualisation purpose, and interaction.
- Critique: five-part framework covering Representation, Perception, Interpretation, Ethics, and Communication.
- Featured Graphics: learning model for moving from map exploration to publication-style visual explanation.
- Case Studies: DOI-linked teaching cards with local open-access PDFs and prompts for reading featured graphics.
- About: course connection, implementation notes, and roadmap.

## Studio Data

The Studio attempts to load a real Glasgow ward boundary GeoJSON from:

```text
public/data/glasgow-wards.geojson
```

If that file is missing, the app falls back to a bundled synthetic Glasgow learning-district layer and labels it clearly as a fallback teaching layer. The included variables are illustrative teaching variables:

- Accessibility index
- Green space access
- Housing pressure
- Transit intensity

The Studio uses the OpenStreetMap tile endpoint:

```text
https://tile.openstreetmap.org/{z}/{x}/{y}.png
```

No Mapbox token or paid map service is used.

## Case Study Resources

Open-access case-study PDFs are stored in `public/pdfs/` and linked from the Case Studies page:

- `construction-demolition-england-2025-epb.pdf`
- `scotland-twin-referendums-2026-rsrs.pdf`
- `academy-nations-2025-epb.pdf`

The site links to DOI records and local PDFs. It does not embed screenshots from the PDFs or republish slide content.

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
npm.cmd run build
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

- Add a real Glasgow ward boundary GeoJSON and course-specific teaching attributes.
- Add side-by-side comparison of two map designs.
- Add printable critique worksheets and instructor prompts.
- Extend tutorials for web mapping, interaction, and mobile mapping.
- Add static galleries of original teaching examples created for the project.
- Add geodatabase and land administration teaching exercises.

## Citation And Contact

If you use or adapt Atlas Praxis in teaching, cite the project as:

Wang, M. Atlas Praxis: an open geomatics teaching studio for visual reasoning. University of Glasgow.

Contact: Dr Mingshu Wang, Reader in Geospatial Data Science, University of Glasgow.

## License

MIT
