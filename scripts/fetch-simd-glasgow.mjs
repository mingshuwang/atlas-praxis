import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ENDPOINT = "https://maps.gov.scot/server/rest/services/ScotGov/PeopleSociety/MapServer/7/query";
const OUT_FIELDS = [
  "objectid",
  "datazone",
  "dzname",
  "laname",
  "rankv2",
  "quintilev2",
  "decilev2",
  "vigintilv2",
  "percentv2",
  "incrankv2",
  "emprank",
  "hlthrank",
  "edurank",
  "gaccrank",
  "crimerank",
  "houserank",
].join(",");
const PAGE_SIZE = 1000;
const WHERE = "laname = 'Glasgow City'";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = resolve(repoRoot, "public/data/glasgow-simd-2020v2.geojson");

function buildQueryUrl(resultOffset) {
  const params = new URLSearchParams({
    where: WHERE,
    outFields: OUT_FIELDS,
    returnGeometry: "true",
    outSR: "4326",
    f: "geojson",
    orderByFields: "datazone",
    resultRecordCount: String(PAGE_SIZE),
    resultOffset: String(resultOffset),
  });

  return `${ENDPOINT}?${params.toString()}`;
}

function assertFeatureCollection(data, pageLabel) {
  if (!data || data.type !== "FeatureCollection" || !Array.isArray(data.features)) {
    const message = data?.error?.message ? ` ArcGIS error: ${data.error.message}` : "";
    throw new Error(`Expected GeoJSON FeatureCollection from SIMD service for ${pageLabel}.${message}`);
  }
}

async function fetchPage(resultOffset) {
  const url = buildQueryUrl(resultOffset);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`SIMD request failed with HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  assertFeatureCollection(data, `offset ${resultOffset}`);
  return data;
}

async function main() {
  const features = [];
  let resultOffset = 0;
  let page = 1;

  while (true) {
    const data = await fetchPage(resultOffset);
    features.push(...data.features);

    console.log(`Fetched page ${page}: ${data.features.length} features`);

    if (data.features.length < PAGE_SIZE || data.exceededTransferLimit === false) {
      break;
    }

    resultOffset += PAGE_SIZE;
    page += 1;
  }

  if (!features.length) {
    throw new Error("SIMD query returned no Glasgow City features. Check the where clause and service availability.");
  }

  const collection = {
    type: "FeatureCollection",
    name: "Glasgow SIMD 2020v2 data zones",
    source: "Scottish Government Scottish Index of Multiple Deprivation 2020v2",
    query: {
      where: WHERE,
      outFields: OUT_FIELDS,
      outSR: 4326,
    },
    features,
  };

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(collection)}\n`, "utf8");

  console.log(`Saved ${features.length} Glasgow SIMD features to ${outputPath}`);
}

main().catch((error) => {
  console.error(`Failed to fetch Glasgow SIMD 2020v2 data: ${error.message}`);
  process.exitCode = 1;
});
