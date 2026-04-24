# Atlas Praxis Studio Data

The Visual Reasoning Studio loads Glasgow SIMD 2020v2 data zones from:

```text
public/data/glasgow-simd-2020v2.geojson
```

Generate the local static data file with:

```bash
npm.cmd run fetch:simd
```

The fetch script queries the Scottish Government SIMD2020 ArcGIS Feature Layer for `laname = 'Glasgow City'` and writes a GeoJSON `FeatureCollection` for static use in the browser. The deployed app should read the local GeoJSON and should not query the remote ArcGIS service at runtime.

The Studio expects these SIMD fields:

- `rankv2`
- `percentv2`
- `quintilev2`
- `decilev2`
- `incrankv2`
- `emprank`
- `hlthrank`
- `edurank`
- `gaccrank`
- `crimerank`
- `houserank`

In SIMD, lower ranks indicate greater relative deprivation. Atlas Praxis reverses rank values for choropleth intensity while preserving the original rank values in popups.
