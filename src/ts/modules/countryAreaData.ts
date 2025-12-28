// countryAreaData.ts
const eastEurope = ['ALB', 'BGR', 'BIH', 'BLR', 'CZE', 'EST', 'HRV', 'HUN', 'LTU', 'LVA', 'MDA', 'MKD', 'MNE', 'POL', 'ROU', 'RUS', 'SRB', 'SVK', 'SVN', 'UKR', 'XKX'];
const westEurope = ['AND', 'AUT', 'BEL', 'CHE', 'DEU', 'DNK', 'ESP', 'FIN', 'FRA', 'GBR', 'GRC', 'IRL', 'ISL', 'ITA', 'LIE', 'LUX', 'MCO', 'MLT', 'NLD', 'NOR', 'PRT', 'SMR', 'SWE', 'VAT'];

const northAndMiddleAmerica = ['ATG', 'BHS', 'BLZ', 'BRB', 'CAN', 'CRI', 'CUB', 'DMA', 'DOM', 'GRD', 'GRL', 'GTM', 'HND', 'HTI', 'JAM', 'KNA', 'LCA', 'MEX', 'NIC', 'PAN', 'SLV', 'TTO', 'USA', 'VCT'];
const southAmerica = ['ARG', 'BOL', 'BRA', 'CHL', 'COL', 'ECU', 'GUF', 'GUY', 'PER', 'PRY', 'SUR', 'URY', 'VEN'];

const westNorthAfrica = ['DZA', 'BEN', 'BFA', 'EGY', 'GMB', 'GHA', 'GIN', 'GNB', 'CIV', 'LBR', 'LBY', 'MLI', 'MRT', 'MAR', 'SEN', 'TGO', 'TUN', 'ESH', 'CPV'];
const centralAfrica = ['AGO', 'BDI', 'CMR', 'CAF', 'TCD', 'COD', 'COG', 'GNQ', 'GAB', 'NER', 'NGA', 'RWA', 'SLE', 'SSD', 'SDN', 'UGA', 'STP'];
const eastSouthAfrica = ['BWA', 'DJI', 'ERI', 'SWZ', 'ETH', 'KEN', 'LSO', 'MDG', 'MWI', 'MOZ', 'NAM', 'SOM', 'ZAF', 'TZA', 'ZMB', 'ZWE', 'COM', 'MUS', 'SYC'];

// 東アジア + 東南アジア
const eastAsia = ['BRN', 'CHN', 'IDN', 'JPN', 'KHM', 'KOR', 'LAO', 'MMR', 'MNG', 'MYS', 'PHL', 'PRK', 'SGP', 'THA', 'TLS', 'TWN', 'VNM'];
// 西アジア + 中東 + 南アジア + 中央アジア
const westAsia = ['AFG', 'ARE', 'ARM', 'AZE', 'BGD', 'BHR', 'BTN', 'CYP', 'GEO', 'IND', 'IRN', 'IRQ', 'ISR', 'JOR', 'KAZ', 'KGZ', 'KWT', 'LBN', 'LKA', 'MDV', 'NPL', 'OMN', 'PAK', 'PSE', 'QAT', 'SAU', 'SYR', 'TJK', 'TKM', 'TUR', 'UZB', 'YEM'];

const oceania = ['AUS', 'FJI', 'FSM', 'KIR', 'MHL', 'NRU', 'NZL', 'PLW', 'PNG', 'SLB', 'TON', 'TUV', 'VUT', 'WSM'];

export function getArea(CountryCode: string) {
  if (eastEurope.includes(CountryCode)) {
    return 'eastEurope';
  } else if (westEurope.includes(CountryCode)) {
    return 'westEurope';
  } else if (northAndMiddleAmerica.includes(CountryCode)) {
    return 'northAndMiddleAmerica';
  } else if (southAmerica.includes(CountryCode)) {
    return 'southAmerica';
  }
  else if (westNorthAfrica.includes(CountryCode)) {
    return 'westNorthAfrica';
  } else if (centralAfrica.includes(CountryCode)) {
    return 'centralAfrica';
  } else if (eastSouthAfrica.includes(CountryCode)) {
    return 'eastSouthAfrica';
  } else if (eastAsia.includes(CountryCode)) {
    return 'eastAsia';
  } else if (westAsia.includes(CountryCode)) {
    return 'westAsia';
  } else if (oceania.includes(CountryCode)) {
    return 'oceania';
  } else {
    return null;
  }
}

export function getRandomCountryFromArea(area: string) {
  switch (area) {
    case 'eastEurope':
      return eastEurope[Math.floor(Math.random() * eastEurope.length)];
    case 'westEurope':
      return westEurope[Math.floor(Math.random() * westEurope.length)];
    case 'northAndMiddleAmerica':
      return northAndMiddleAmerica[Math.floor(Math.random() * northAndMiddleAmerica.length)];
    case 'southAmerica':
      return southAmerica[Math.floor(Math.random() * southAmerica.length)];
    case 'westNorthAfrica':
      return westNorthAfrica[Math.floor(Math.random() * westNorthAfrica.length)];
    case 'centralAfrica':
      return centralAfrica[Math.floor(Math.random() * centralAfrica.length)];
    case 'eastSouthAfrica':
      return eastSouthAfrica[Math.floor(Math.random() * eastSouthAfrica.length)];
    case 'eastAsia':
      return eastAsia[Math.floor(Math.random() * eastAsia.length)];
    case 'westAsia':
      return westAsia[Math.floor(Math.random() * westAsia.length)];
    default:
      return null;
  }
}

// 実績用
// 海に接していない国
export const landlockedCountries = [
  'AFG', 'AND', 'ARM', 'AUT', 'AZE', 'BDI', 'BFA', 'BLR', 'BOL', 'BTN',
  'BWA', 'CAF', 'CHE', 'CZE', 'ETH', 'HUN', 'KAZ', 'KGZ', 'LAO', 'LIE',
  'LSO', 'LUX', 'MDA', 'MKD', 'MLI', 'MNG', 'MWI', 'NER', 'NPL', 'PRY',
  'RWA', 'SMR', 'SRB', 'SSD', 'SVK', 'SWZ', 'TCD', 'TJK', 'TKM', 'UGA',
  'UZB', 'VAT', 'XKX', 'ZMB', 'ZWE'
];
// 海がなく、完全に1国の中にある国
export const surroundedCountries = [
  'LSO', // レソト
  'SMR', // サンマリノ
  'VAT'  // バチカン
];
export const worldTop5Countries = ['RUS', 'CAN', 'USA', 'CHN', 'BRA'];
export const stanCountries = ['AFG', 'KAZ', 'KGZ', 'PAK', 'TJK', 'TKM', 'UZB'];