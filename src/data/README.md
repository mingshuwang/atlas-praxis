# Atlas Praxis Studio Data

The Studio attempts to load a real Glasgow ward boundary layer from:

```text
public/data/glasgow-wards.geojson
```

Place a valid GeoJSON `FeatureCollection` at that path to replace the fallback teaching layer. If the file is missing, Atlas Praxis uses `src/data/glasgow-learning-districts.geojson`, a synthetic Glasgow learning-district layer with illustrative teaching variables.

The current teaching variables are illustrative:

- Accessibility index
- Green space access
- Housing pressure
- Transit intensity

They are designed for map-reading and classification exercises, not operational city analysis.
