// game.ts
let countryMapData: object | null = null;

async function loadCountryMapData() {
  const response = await fetch('./src/json/country-map.json');
  if (!countryMapData) {
    countryMapData = await response.json();
  }
  return countryMapData;
}

let countryBorderData: object | null = null;

async function loadCountryBorderData() {
  const response = await fetch('./src/json/country-border.json');
  if (!countryBorderData) {
    countryBorderData = await response.json();
  }
  return countryBorderData;
}