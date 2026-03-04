/**
 * World Locations Database
 * Comprehensive list of countries, states/provinces, and major cities worldwide
 */

// Generate randomized but realistic environmental data based on region
function generateEnvData(type, region = 'default', name = '') {
  const regionFactors = {
    europe: { co2: 0.6, recycling: 45, circular: 18, renewable: 38 },
    northAmerica: { co2: 0.9, recycling: 32, circular: 12, renewable: 22 },
    asia: { co2: 0.8, recycling: 25, circular: 10, renewable: 28 },
    southAsia: { co2: 0.7, recycling: 28, circular: 12, renewable: 35 },
    africa: { co2: 0.4, recycling: 12, circular: 6, renewable: 18 },
    southAmerica: { co2: 0.5, recycling: 18, circular: 8, renewable: 45 },
    oceania: { co2: 0.65, recycling: 42, circular: 15, renewable: 28 },
    middleEast: { co2: 0.85, recycling: 15, circular: 8, renewable: 12 },
    default: { co2: 0.6, recycling: 25, circular: 10, renewable: 25 },
  };

  const factors = regionFactors[region] || regionFactors.default;
  const variance = () => 0.8 + Math.random() * 0.4; // 80% to 120%

  if (type === 'country') {
    return {
      co2: { value: +(factors.co2 * variance() * (0.5 + Math.random())).toFixed(2), unit: "B tons", label: "CO₂ Emissions" },
      water: { value: Math.round(50 + Math.random() * 450), unit: "B m³", label: "Water Consumption" },
      waste: { value: Math.round(50 + Math.random() * 400), unit: "M tons", label: "Waste Generated" },
      recyclingRate: { value: Math.round(factors.recycling * variance()), unit: "%", label: "Recycling Rate" },
      circularIndex: { value: +(factors.circular * variance()).toFixed(1), unit: "%", label: "Circular Economy Index" },
      energyRenewable: { value: Math.round(factors.renewable * variance()), unit: "%", label: "Renewable Energy" },
    };
  } else if (type === 'state') {
    return {
      co2: { value: +(factors.co2 * variance() * 50).toFixed(1), unit: "M tons", label: "CO₂ Emissions" },
      water: { value: +(factors.co2 * variance() * 3).toFixed(1), unit: "B m³", label: "Water Consumption" },
      waste: { value: +(factors.co2 * variance() * 8).toFixed(1), unit: "M tons", label: "Waste Generated" },
      recyclingRate: { value: Math.round(factors.recycling * variance()), unit: "%", label: "Recycling Rate" },
      circularIndex: { value: +(factors.circular * variance()).toFixed(1), unit: "%", label: "Circular Economy Index" },
      energyRenewable: { value: Math.round(factors.renewable * variance()), unit: "%", label: "Renewable Energy" },
    };
  } else {
    return {
      co2: { value: +(factors.co2 * variance() * 25).toFixed(1), unit: "M tons", label: "CO₂ Emissions" },
      water: { value: +(factors.co2 * variance() * 2).toFixed(1), unit: "B m³", label: "Water Consumption" },
      waste: { value: +(factors.co2 * variance() * 5).toFixed(1), unit: "M tons", label: "Waste Generated" },
      recyclingRate: { value: Math.round(factors.recycling * variance()), unit: "%", label: "Recycling Rate" },
      circularIndex: { value: +(factors.circular * variance()).toFixed(1), unit: "%", label: "Circular Economy Index" },
      airQuality: { value: Math.round(30 + Math.random() * 120), unit: "AQI", label: "Air Quality Index" },
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// COUNTRIES DATABASE
// ═══════════════════════════════════════════════════════════════
export const WORLD_COUNTRIES = {
  // ASIA
  india: { name: "India", flag: "🇮🇳", region: "southAsia", continent: "Asia" },
  china: { name: "China", flag: "🇨🇳", region: "asia", continent: "Asia" },
  japan: { name: "Japan", flag: "🇯🇵", region: "asia", continent: "Asia" },
  southKorea: { name: "South Korea", flag: "🇰🇷", region: "asia", continent: "Asia" },
  indonesia: { name: "Indonesia", flag: "🇮🇩", region: "asia", continent: "Asia" },
  thailand: { name: "Thailand", flag: "🇹🇭", region: "asia", continent: "Asia" },
  vietnam: { name: "Vietnam", flag: "🇻🇳", region: "asia", continent: "Asia" },
  philippines: { name: "Philippines", flag: "🇵🇭", region: "asia", continent: "Asia" },
  malaysia: { name: "Malaysia", flag: "🇲🇾", region: "asia", continent: "Asia" },
  singapore: { name: "Singapore", flag: "🇸🇬", region: "asia", continent: "Asia" },
  pakistan: { name: "Pakistan", flag: "🇵🇰", region: "southAsia", continent: "Asia" },
  bangladesh: { name: "Bangladesh", flag: "🇧🇩", region: "southAsia", continent: "Asia" },
  sriLanka: { name: "Sri Lanka", flag: "🇱🇰", region: "southAsia", continent: "Asia" },
  nepal: { name: "Nepal", flag: "🇳🇵", region: "southAsia", continent: "Asia" },
  myanmar: { name: "Myanmar", flag: "🇲🇲", region: "asia", continent: "Asia" },
  cambodia: { name: "Cambodia", flag: "🇰🇭", region: "asia", continent: "Asia" },
  taiwan: { name: "Taiwan", flag: "🇹🇼", region: "asia", continent: "Asia" },
  mongolia: { name: "Mongolia", flag: "🇲🇳", region: "asia", continent: "Asia" },
  northKorea: { name: "North Korea", flag: "🇰🇵", region: "asia", continent: "Asia" },
  laos: { name: "Laos", flag: "🇱🇦", region: "asia", continent: "Asia" },
  brunei: { name: "Brunei", flag: "🇧🇳", region: "asia", continent: "Asia" },
  bhutan: { name: "Bhutan", flag: "🇧🇹", region: "southAsia", continent: "Asia" },
  maldives: { name: "Maldives", flag: "🇲🇻", region: "southAsia", continent: "Asia" },
  timorLeste: { name: "Timor-Leste", flag: "🇹🇱", region: "asia", continent: "Asia" },

  // MIDDLE EAST
  saudiArabia: { name: "Saudi Arabia", flag: "🇸🇦", region: "middleEast", continent: "Asia" },
  uae: { name: "UAE", flag: "🇦🇪", region: "middleEast", continent: "Asia" },
  iran: { name: "Iran", flag: "🇮🇷", region: "middleEast", continent: "Asia" },
  iraq: { name: "Iraq", flag: "🇮🇶", region: "middleEast", continent: "Asia" },
  israel: { name: "Israel", flag: "🇮🇱", region: "middleEast", continent: "Asia" },
  turkey: { name: "Turkey", flag: "🇹🇷", region: "middleEast", continent: "Asia" },
  qatar: { name: "Qatar", flag: "🇶🇦", region: "middleEast", continent: "Asia" },
  kuwait: { name: "Kuwait", flag: "🇰🇼", region: "middleEast", continent: "Asia" },
  oman: { name: "Oman", flag: "🇴🇲", region: "middleEast", continent: "Asia" },
  bahrain: { name: "Bahrain", flag: "🇧🇭", region: "middleEast", continent: "Asia" },
  jordan: { name: "Jordan", flag: "🇯🇴", region: "middleEast", continent: "Asia" },
  lebanon: { name: "Lebanon", flag: "🇱🇧", region: "middleEast", continent: "Asia" },
  syria: { name: "Syria", flag: "🇸🇾", region: "middleEast", continent: "Asia" },
  yemen: { name: "Yemen", flag: "🇾🇪", region: "middleEast", continent: "Asia" },
  afghanistan: { name: "Afghanistan", flag: "🇦🇫", region: "southAsia", continent: "Asia" },

  // EUROPE
  uk: { name: "United Kingdom", flag: "🇬🇧", region: "europe", continent: "Europe" },
  germany: { name: "Germany", flag: "🇩🇪", region: "europe", continent: "Europe" },
  france: { name: "France", flag: "🇫🇷", region: "europe", continent: "Europe" },
  italy: { name: "Italy", flag: "🇮🇹", region: "europe", continent: "Europe" },
  spain: { name: "Spain", flag: "🇪🇸", region: "europe", continent: "Europe" },
  netherlands: { name: "Netherlands", flag: "🇳🇱", region: "europe", continent: "Europe" },
  belgium: { name: "Belgium", flag: "🇧🇪", region: "europe", continent: "Europe" },
  sweden: { name: "Sweden", flag: "🇸🇪", region: "europe", continent: "Europe" },
  norway: { name: "Norway", flag: "🇳🇴", region: "europe", continent: "Europe" },
  denmark: { name: "Denmark", flag: "🇩🇰", region: "europe", continent: "Europe" },
  finland: { name: "Finland", flag: "🇫🇮", region: "europe", continent: "Europe" },
  switzerland: { name: "Switzerland", flag: "🇨🇭", region: "europe", continent: "Europe" },
  austria: { name: "Austria", flag: "🇦🇹", region: "europe", continent: "Europe" },
  portugal: { name: "Portugal", flag: "🇵🇹", region: "europe", continent: "Europe" },
  greece: { name: "Greece", flag: "🇬🇷", region: "europe", continent: "Europe" },
  poland: { name: "Poland", flag: "🇵🇱", region: "europe", continent: "Europe" },
  czechia: { name: "Czechia", flag: "🇨🇿", region: "europe", continent: "Europe" },
  hungary: { name: "Hungary", flag: "🇭🇺", region: "europe", continent: "Europe" },
  romania: { name: "Romania", flag: "🇷🇴", region: "europe", continent: "Europe" },
  ireland: { name: "Ireland", flag: "🇮🇪", region: "europe", continent: "Europe" },
  russia: { name: "Russia", flag: "🇷🇺", region: "europe", continent: "Europe" },
  ukraine: { name: "Ukraine", flag: "🇺🇦", region: "europe", continent: "Europe" },
  croatia: { name: "Croatia", flag: "🇭🇷", region: "europe", continent: "Europe" },
  serbia: { name: "Serbia", flag: "🇷🇸", region: "europe", continent: "Europe" },
  bulgaria: { name: "Bulgaria", flag: "🇧🇬", region: "europe", continent: "Europe" },
  slovakia: { name: "Slovakia", flag: "🇸🇰", region: "europe", continent: "Europe" },
  slovenia: { name: "Slovenia", flag: "🇸🇮", region: "europe", continent: "Europe" },
  lithuania: { name: "Lithuania", flag: "🇱🇹", region: "europe", continent: "Europe" },
  latvia: { name: "Latvia", flag: "🇱🇻", region: "europe", continent: "Europe" },
  estonia: { name: "Estonia", flag: "🇪🇪", region: "europe", continent: "Europe" },
  iceland: { name: "Iceland", flag: "🇮🇸", region: "europe", continent: "Europe" },
  luxembourg: { name: "Luxembourg", flag: "🇱🇺", region: "europe", continent: "Europe" },
  malta: { name: "Malta", flag: "🇲🇹", region: "europe", continent: "Europe" },
  cyprus: { name: "Cyprus", flag: "🇨🇾", region: "europe", continent: "Europe" },
  belarus: { name: "Belarus", flag: "🇧🇾", region: "europe", continent: "Europe" },
  moldova: { name: "Moldova", flag: "🇲🇩", region: "europe", continent: "Europe" },
  albania: { name: "Albania", flag: "🇦🇱", region: "europe", continent: "Europe" },
  northMacedonia: { name: "North Macedonia", flag: "🇲🇰", region: "europe", continent: "Europe" },
  montenegro: { name: "Montenegro", flag: "🇲🇪", region: "europe", continent: "Europe" },
  bosniaHerzegovina: { name: "Bosnia & Herzegovina", flag: "🇧🇦", region: "europe", continent: "Europe" },
  kosovo: { name: "Kosovo", flag: "🇽🇰", region: "europe", continent: "Europe" },

  // NORTH AMERICA
  usa: { name: "United States", flag: "🇺🇸", region: "northAmerica", continent: "North America" },
  canada: { name: "Canada", flag: "🇨🇦", region: "northAmerica", continent: "North America" },
  mexico: { name: "Mexico", flag: "🇲🇽", region: "northAmerica", continent: "North America" },

  // CENTRAL AMERICA & CARIBBEAN
  cuba: { name: "Cuba", flag: "🇨🇺", region: "southAmerica", continent: "North America" },
  jamaica: { name: "Jamaica", flag: "🇯🇲", region: "southAmerica", continent: "North America" },
  haiti: { name: "Haiti", flag: "🇭🇹", region: "southAmerica", continent: "North America" },
  dominicanRepublic: { name: "Dominican Republic", flag: "🇩🇴", region: "southAmerica", continent: "North America" },
  puertoRico: { name: "Puerto Rico", flag: "🇵🇷", region: "northAmerica", continent: "North America" },
  costaRica: { name: "Costa Rica", flag: "🇨🇷", region: "southAmerica", continent: "North America" },
  panama: { name: "Panama", flag: "🇵🇦", region: "southAmerica", continent: "North America" },
  guatemala: { name: "Guatemala", flag: "🇬🇹", region: "southAmerica", continent: "North America" },
  honduras: { name: "Honduras", flag: "🇭🇳", region: "southAmerica", continent: "North America" },
  elSalvador: { name: "El Salvador", flag: "🇸🇻", region: "southAmerica", continent: "North America" },
  nicaragua: { name: "Nicaragua", flag: "🇳🇮", region: "southAmerica", continent: "North America" },
  belize: { name: "Belize", flag: "🇧🇿", region: "southAmerica", continent: "North America" },
  bahamas: { name: "Bahamas", flag: "🇧🇸", region: "northAmerica", continent: "North America" },
  barbados: { name: "Barbados", flag: "🇧🇧", region: "southAmerica", continent: "North America" },
  trinidadTobago: { name: "Trinidad & Tobago", flag: "🇹🇹", region: "southAmerica", continent: "North America" },

  // SOUTH AMERICA
  brazil: { name: "Brazil", flag: "🇧🇷", region: "southAmerica", continent: "South America" },
  argentina: { name: "Argentina", flag: "🇦🇷", region: "southAmerica", continent: "South America" },
  colombia: { name: "Colombia", flag: "🇨🇴", region: "southAmerica", continent: "South America" },
  peru: { name: "Peru", flag: "🇵🇪", region: "southAmerica", continent: "South America" },
  venezuela: { name: "Venezuela", flag: "🇻🇪", region: "southAmerica", continent: "South America" },
  chile: { name: "Chile", flag: "🇨🇱", region: "southAmerica", continent: "South America" },
  ecuador: { name: "Ecuador", flag: "🇪🇨", region: "southAmerica", continent: "South America" },
  bolivia: { name: "Bolivia", flag: "🇧🇴", region: "southAmerica", continent: "South America" },
  paraguay: { name: "Paraguay", flag: "🇵🇾", region: "southAmerica", continent: "South America" },
  uruguay: { name: "Uruguay", flag: "🇺🇾", region: "southAmerica", continent: "South America" },
  guyana: { name: "Guyana", flag: "🇬🇾", region: "southAmerica", continent: "South America" },
  suriname: { name: "Suriname", flag: "🇸🇷", region: "southAmerica", continent: "South America" },

  // AFRICA
  southAfrica: { name: "South Africa", flag: "🇿🇦", region: "africa", continent: "Africa" },
  egypt: { name: "Egypt", flag: "🇪🇬", region: "africa", continent: "Africa" },
  nigeria: { name: "Nigeria", flag: "🇳🇬", region: "africa", continent: "Africa" },
  kenya: { name: "Kenya", flag: "🇰🇪", region: "africa", continent: "Africa" },
  ethiopia: { name: "Ethiopia", flag: "🇪🇹", region: "africa", continent: "Africa" },
  morocco: { name: "Morocco", flag: "🇲🇦", region: "africa", continent: "Africa" },
  algeria: { name: "Algeria", flag: "🇩🇿", region: "africa", continent: "Africa" },
  tunisia: { name: "Tunisia", flag: "🇹🇳", region: "africa", continent: "Africa" },
  ghana: { name: "Ghana", flag: "🇬🇭", region: "africa", continent: "Africa" },
  tanzania: { name: "Tanzania", flag: "🇹🇿", region: "africa", continent: "Africa" },
  uganda: { name: "Uganda", flag: "🇺🇬", region: "africa", continent: "Africa" },
  zimbabwe: { name: "Zimbabwe", flag: "🇿🇼", region: "africa", continent: "Africa" },
  senegal: { name: "Senegal", flag: "🇸🇳", region: "africa", continent: "Africa" },
  rwanda: { name: "Rwanda", flag: "🇷🇼", region: "africa", continent: "Africa" },
  coteDivoire: { name: "Côte d'Ivoire", flag: "🇨🇮", region: "africa", continent: "Africa" },
  cameroon: { name: "Cameroon", flag: "🇨🇲", region: "africa", continent: "Africa" },
  angola: { name: "Angola", flag: "🇦🇴", region: "africa", continent: "Africa" },
  mozambique: { name: "Mozambique", flag: "🇲🇿", region: "africa", continent: "Africa" },
  madagascar: { name: "Madagascar", flag: "🇲🇬", region: "africa", continent: "Africa" },
  sudan: { name: "Sudan", flag: "🇸🇩", region: "africa", continent: "Africa" },
  libya: { name: "Libya", flag: "🇱🇾", region: "africa", continent: "Africa" },
  drc: { name: "DR Congo", flag: "🇨🇩", region: "africa", continent: "Africa" },
  zambia: { name: "Zambia", flag: "🇿🇲", region: "africa", continent: "Africa" },
  botswana: { name: "Botswana", flag: "🇧🇼", region: "africa", continent: "Africa" },
  namibia: { name: "Namibia", flag: "🇳🇦", region: "africa", continent: "Africa" },
  mauritius: { name: "Mauritius", flag: "🇲🇺", region: "africa", continent: "Africa" },

  // OCEANIA
  australia: { name: "Australia", flag: "🇦🇺", region: "oceania", continent: "Oceania" },
  newZealand: { name: "New Zealand", flag: "🇳🇿", region: "oceania", continent: "Oceania" },
  fiji: { name: "Fiji", flag: "🇫🇯", region: "oceania", continent: "Oceania" },
  papuaNewGuinea: { name: "Papua New Guinea", flag: "🇵🇬", region: "oceania", continent: "Oceania" },

  // CENTRAL ASIA
  kazakhstan: { name: "Kazakhstan", flag: "🇰🇿", region: "asia", continent: "Asia" },
  uzbekistan: { name: "Uzbekistan", flag: "🇺🇿", region: "asia", continent: "Asia" },
  turkmenistan: { name: "Turkmenistan", flag: "🇹🇲", region: "asia", continent: "Asia" },
  tajikistan: { name: "Tajikistan", flag: "🇹🇯", region: "asia", continent: "Asia" },
  kyrgyzstan: { name: "Kyrgyzstan", flag: "🇰🇬", region: "asia", continent: "Asia" },
  azerbaijan: { name: "Azerbaijan", flag: "🇦🇿", region: "asia", continent: "Asia" },
  georgia: { name: "Georgia", flag: "🇬🇪", region: "europe", continent: "Asia" },
  armenia: { name: "Armenia", flag: "🇦🇲", region: "asia", continent: "Asia" },
};

// ═══════════════════════════════════════════════════════════════
// INDIAN STATES DATABASE
// ═══════════════════════════════════════════════════════════════
export const INDIAN_STATES = {
  // States
  andhraPradesh: { name: "Andhra Pradesh", flag: "🏛️", capital: "Amaravati" },
  arunachalPradesh: { name: "Arunachal Pradesh", flag: "🏔️", capital: "Itanagar" },
  assam: { name: "Assam", flag: "🌿", capital: "Dispur" },
  bihar: { name: "Bihar", flag: "🏛️", capital: "Patna" },
  chhattisgarh: { name: "Chhattisgarh", flag: "🌲", capital: "Raipur" },
  goa: { name: "Goa", flag: "🏖️", capital: "Panaji" },
  gujarat: { name: "Gujarat", flag: "🦁", capital: "Gandhinagar" },
  haryana: { name: "Haryana", flag: "🌾", capital: "Chandigarh" },
  himachalPradesh: { name: "Himachal Pradesh", flag: "⛰️", capital: "Shimla" },
  jharkhand: { name: "Jharkhand", flag: "🌿", capital: "Ranchi" },
  karnataka: { name: "Karnataka", flag: "🏛️", capital: "Bengaluru" },
  kerala: { name: "Kerala", flag: "🌴", capital: "Thiruvananthapuram" },
  madhyaPradesh: { name: "Madhya Pradesh", flag: "🐅", capital: "Bhopal" },
  maharashtra: { name: "Maharashtra", flag: "🏛️", capital: "Mumbai" },
  manipur: { name: "Manipur", flag: "💃", capital: "Imphal" },
  meghalaya: { name: "Meghalaya", flag: "☁️", capital: "Shillong" },
  mizoram: { name: "Mizoram", flag: "🌺", capital: "Aizawl" },
  nagaland: { name: "Nagaland", flag: "🦅", capital: "Kohima" },
  odisha: { name: "Odisha", flag: "🛕", capital: "Bhubaneswar" },
  punjab: { name: "Punjab", flag: "🌾", capital: "Chandigarh" },
  rajasthan: { name: "Rajasthan", flag: "🏰", capital: "Jaipur" },
  sikkim: { name: "Sikkim", flag: "🏔️", capital: "Gangtok" },
  tamilNadu: { name: "Tamil Nadu", flag: "🛕", capital: "Chennai" },
  telangana: { name: "Telangana", flag: "🏛️", capital: "Hyderabad" },
  tripura: { name: "Tripura", flag: "🌿", capital: "Agartala" },
  uttarPradesh: { name: "Uttar Pradesh", flag: "🕌", capital: "Lucknow" },
  uttarakhand: { name: "Uttarakhand", flag: "🏔️", capital: "Dehradun" },
  westBengal: { name: "West Bengal", flag: "🐯", capital: "Kolkata" },
  // Union Territories
  andamanNicobar: { name: "Andaman & Nicobar", flag: "🏝️", capital: "Port Blair" },
  chandigarh: { name: "Chandigarh", flag: "🏛️", capital: "Chandigarh" },
  dadraAndNagarHaveli: { name: "Dadra & Nagar Haveli", flag: "🌿", capital: "Daman" },
  delhi: { name: "Delhi", flag: "🏛️", capital: "New Delhi" },
  jammuKashmir: { name: "Jammu & Kashmir", flag: "🏔️", capital: "Srinagar" },
  ladakh: { name: "Ladakh", flag: "🏔️", capital: "Leh" },
  lakshadweep: { name: "Lakshadweep", flag: "🏝️", capital: "Kavaratti" },
  puducherry: { name: "Puducherry", flag: "🏖️", capital: "Puducherry" },
};

// ═══════════════════════════════════════════════════════════════
// US STATES DATABASE
// ═══════════════════════════════════════════════════════════════
export const US_STATES = {
  alabama: { name: "Alabama", flag: "🌟", capital: "Montgomery" },
  alaska: { name: "Alaska", flag: "❄️", capital: "Juneau" },
  arizona: { name: "Arizona", flag: "🏜️", capital: "Phoenix" },
  arkansas: { name: "Arkansas", flag: "💎", capital: "Little Rock" },
  california: { name: "California", flag: "🐻", capital: "Sacramento" },
  colorado: { name: "Colorado", flag: "🏔️", capital: "Denver" },
  connecticut: { name: "Connecticut", flag: "🌟", capital: "Hartford" },
  delaware: { name: "Delaware", flag: "🌟", capital: "Dover" },
  florida: { name: "Florida", flag: "🌴", capital: "Tallahassee" },
  georgiaUS: { name: "Georgia", flag: "🍑", capital: "Atlanta" },
  hawaii: { name: "Hawaii", flag: "🌺", capital: "Honolulu" },
  idaho: { name: "Idaho", flag: "🥔", capital: "Boise" },
  illinois: { name: "Illinois", flag: "🌽", capital: "Springfield" },
  indiana: { name: "Indiana", flag: "🏎️", capital: "Indianapolis" },
  iowa: { name: "Iowa", flag: "🌽", capital: "Des Moines" },
  kansas: { name: "Kansas", flag: "🌻", capital: "Topeka" },
  kentucky: { name: "Kentucky", flag: "🐴", capital: "Frankfort" },
  louisiana: { name: "Louisiana", flag: "⚜️", capital: "Baton Rouge" },
  maine: { name: "Maine", flag: "🦞", capital: "Augusta" },
  maryland: { name: "Maryland", flag: "🦀", capital: "Annapolis" },
  massachusetts: { name: "Massachusetts", flag: "🏛️", capital: "Boston" },
  michigan: { name: "Michigan", flag: "🚗", capital: "Lansing" },
  minnesota: { name: "Minnesota", flag: "❄️", capital: "Saint Paul" },
  mississippi: { name: "Mississippi", flag: "🌟", capital: "Jackson" },
  missouri: { name: "Missouri", flag: "🌟", capital: "Jefferson City" },
  montana: { name: "Montana", flag: "🏔️", capital: "Helena" },
  nebraska: { name: "Nebraska", flag: "🌽", capital: "Lincoln" },
  nevada: { name: "Nevada", flag: "🎰", capital: "Carson City" },
  newHampshire: { name: "New Hampshire", flag: "🏔️", capital: "Concord" },
  newJersey: { name: "New Jersey", flag: "🏖️", capital: "Trenton" },
  newMexico: { name: "New Mexico", flag: "🌵", capital: "Santa Fe" },
  newYork: { name: "New York", flag: "🗽", capital: "Albany" },
  northCarolina: { name: "North Carolina", flag: "🌲", capital: "Raleigh" },
  northDakota: { name: "North Dakota", flag: "🌾", capital: "Bismarck" },
  ohio: { name: "Ohio", flag: "🌟", capital: "Columbus" },
  oklahoma: { name: "Oklahoma", flag: "🌪️", capital: "Oklahoma City" },
  oregon: { name: "Oregon", flag: "🌲", capital: "Salem" },
  pennsylvania: { name: "Pennsylvania", flag: "🔔", capital: "Harrisburg" },
  rhodeIsland: { name: "Rhode Island", flag: "⚓", capital: "Providence" },
  southCarolina: { name: "South Carolina", flag: "🌴", capital: "Columbia" },
  southDakota: { name: "South Dakota", flag: "🗿", capital: "Pierre" },
  tennessee: { name: "Tennessee", flag: "🎸", capital: "Nashville" },
  texas: { name: "Texas", flag: "🤠", capital: "Austin" },
  utah: { name: "Utah", flag: "🏜️", capital: "Salt Lake City" },
  vermont: { name: "Vermont", flag: "🍁", capital: "Montpelier" },
  virginia: { name: "Virginia", flag: "🏛️", capital: "Richmond" },
  washington: { name: "Washington", flag: "🌲", capital: "Olympia" },
  westVirginia: { name: "West Virginia", flag: "🏔️", capital: "Charleston" },
  wisconsin: { name: "Wisconsin", flag: "🧀", capital: "Madison" },
  wyoming: { name: "Wyoming", flag: "🦬", capital: "Cheyenne" },
};

// ═══════════════════════════════════════════════════════════════
// MAJOR CITIES DATABASE (Worldwide)
// ═══════════════════════════════════════════════════════════════
export const WORLD_CITIES = {
  // INDIAN CITIES
  delhi: { name: "Delhi", country: "india", state: "delhi", flag: "🏙️" },
  mumbai: { name: "Mumbai", country: "india", state: "maharashtra", flag: "🏙️" },
  bangalore: { name: "Bangalore", country: "india", state: "karnataka", flag: "🏙️" },
  chennai: { name: "Chennai", country: "india", state: "tamilNadu", flag: "🏙️" },
  kolkata: { name: "Kolkata", country: "india", state: "westBengal", flag: "🏙️" },
  hyderabad: { name: "Hyderabad", country: "india", state: "telangana", flag: "🏙️" },
  pune: { name: "Pune", country: "india", state: "maharashtra", flag: "🏙️" },
  ahmedabad: { name: "Ahmedabad", country: "india", state: "gujarat", flag: "🏙️" },
  jaipur: { name: "Jaipur", country: "india", state: "rajasthan", flag: "🏙️" },
  lucknow: { name: "Lucknow", country: "india", state: "uttarPradesh", flag: "🏙️" },
  surat: { name: "Surat", country: "india", state: "gujarat", flag: "🏙️" },
  kanpur: { name: "Kanpur", country: "india", state: "uttarPradesh", flag: "🏙️" },
  nagpur: { name: "Nagpur", country: "india", state: "maharashtra", flag: "🏙️" },
  indore: { name: "Indore", country: "india", state: "madhyaPradesh", flag: "🏙️" },
  thane: { name: "Thane", country: "india", state: "maharashtra", flag: "🏙️" },
  bhopal: { name: "Bhopal", country: "india", state: "madhyaPradesh", flag: "🏙️" },
  visakhapatnam: { name: "Visakhapatnam", country: "india", state: "andhraPradesh", flag: "🏙️" },
  patna: { name: "Patna", country: "india", state: "bihar", flag: "🏙️" },
  vadodara: { name: "Vadodara", country: "india", state: "gujarat", flag: "🏙️" },
  ghaziabad: { name: "Ghaziabad", country: "india", state: "uttarPradesh", flag: "🏙️" },
  ludhiana: { name: "Ludhiana", country: "india", state: "punjab", flag: "🏙️" },
  agra: { name: "Agra", country: "india", state: "uttarPradesh", flag: "🏙️" },
  nashik: { name: "Nashik", country: "india", state: "maharashtra", flag: "🏙️" },
  faridabad: { name: "Faridabad", country: "india", state: "haryana", flag: "🏙️" },
  meerut: { name: "Meerut", country: "india", state: "uttarPradesh", flag: "🏙️" },
  rajkot: { name: "Rajkot", country: "india", state: "gujarat", flag: "🏙️" },
  varanasi: { name: "Varanasi", country: "india", state: "uttarPradesh", flag: "🏙️" },
  srinagar: { name: "Srinagar", country: "india", state: "jammuKashmir", flag: "🏙️" },
  amritsar: { name: "Amritsar", country: "india", state: "punjab", flag: "🏙️" },
  allahabad: { name: "Prayagraj", country: "india", state: "uttarPradesh", flag: "🏙️" },
  ranchi: { name: "Ranchi", country: "india", state: "jharkhand", flag: "🏙️" },
  howrah: { name: "Howrah", country: "india", state: "westBengal", flag: "🏙️" },
  coimbatore: { name: "Coimbatore", country: "india", state: "tamilNadu", flag: "🏙️" },
  jabalpur: { name: "Jabalpur", country: "india", state: "madhyaPradesh", flag: "🏙️" },
  gwalior: { name: "Gwalior", country: "india", state: "madhyaPradesh", flag: "🏙️" },
  vijayawada: { name: "Vijayawada", country: "india", state: "andhraPradesh", flag: "🏙️" },
  jodhpur: { name: "Jodhpur", country: "india", state: "rajasthan", flag: "🏙️" },
  madurai: { name: "Madurai", country: "india", state: "tamilNadu", flag: "🏙️" },
  raipur: { name: "Raipur", country: "india", state: "chhattisgarh", flag: "🏙️" },
  kota: { name: "Kota", country: "india", state: "rajasthan", flag: "🏙️" },
  chandigarh: { name: "Chandigarh", country: "india", state: "chandigarh", flag: "🏙️" },
  guwahati: { name: "Guwahati", country: "india", state: "assam", flag: "🏙️" },
  solapur: { name: "Solapur", country: "india", state: "maharashtra", flag: "🏙️" },
  hubli: { name: "Hubli", country: "india", state: "karnataka", flag: "🏙️" },
  mysore: { name: "Mysore", country: "india", state: "karnataka", flag: "🏙️" },
  tiruchirappalli: { name: "Tiruchirappalli", country: "india", state: "tamilNadu", flag: "🏙️" },
  bareilly: { name: "Bareilly", country: "india", state: "uttarPradesh", flag: "🏙️" },
  aligarh: { name: "Aligarh", country: "india", state: "uttarPradesh", flag: "🏙️" },
  moradabad: { name: "Moradabad", country: "india", state: "uttarPradesh", flag: "🏙️" },
  jalandhar: { name: "Jalandhar", country: "india", state: "punjab", flag: "🏙️" },
  bhubaneswar: { name: "Bhubaneswar", country: "india", state: "odisha", flag: "🏙️" },
  salem: { name: "Salem", country: "india", state: "tamilNadu", flag: "🏙️" },
  warangal: { name: "Warangal", country: "india", state: "telangana", flag: "🏙️" },
  guntur: { name: "Guntur", country: "india", state: "andhraPradesh", flag: "🏙️" },
  bhiwandi: { name: "Bhiwandi", country: "india", state: "maharashtra", flag: "🏙️" },
  saharanpur: { name: "Saharanpur", country: "india", state: "uttarPradesh", flag: "🏙️" },
  gorakhpur: { name: "Gorakhpur", country: "india", state: "uttarPradesh", flag: "🏙️" },
  bikaner: { name: "Bikaner", country: "india", state: "rajasthan", flag: "🏙️" },
  amravati: { name: "Amravati", country: "india", state: "maharashtra", flag: "🏙️" },
  noida: { name: "Noida", country: "india", state: "uttarPradesh", flag: "🏙️" },
  jamshedpur: { name: "Jamshedpur", country: "india", state: "jharkhand", flag: "🏙️" },
  bhilai: { name: "Bhilai", country: "india", state: "chhattisgarh", flag: "🏙️" },
  cuttack: { name: "Cuttack", country: "india", state: "odisha", flag: "🏙️" },
  firozabad: { name: "Firozabad", country: "india", state: "uttarPradesh", flag: "🏙️" },
  kochi: { name: "Kochi", country: "india", state: "kerala", flag: "🏙️" },
  nellore: { name: "Nellore", country: "india", state: "andhraPradesh", flag: "🏙️" },
  bhavnagar: { name: "Bhavnagar", country: "india", state: "gujarat", flag: "🏙️" },
  dehradun: { name: "Dehradun", country: "india", state: "uttarakhand", flag: "🏙️" },
  durgapur: { name: "Durgapur", country: "india", state: "westBengal", flag: "🏙️" },
  asansol: { name: "Asansol", country: "india", state: "westBengal", flag: "🏙️" },
  nanded: { name: "Nanded", country: "india", state: "maharashtra", flag: "🏙️" },
  kolhapur: { name: "Kolhapur", country: "india", state: "maharashtra", flag: "🏙️" },
  ajmer: { name: "Ajmer", country: "india", state: "rajasthan", flag: "🏙️" },
  gulbarga: { name: "Gulbarga", country: "india", state: "karnataka", flag: "🏙️" },
  jamnagar: { name: "Jamnagar", country: "india", state: "gujarat", flag: "🏙️" },
  ujjain: { name: "Ujjain", country: "india", state: "madhyaPradesh", flag: "🏙️" },
  loni: { name: "Loni", country: "india", state: "uttarPradesh", flag: "🏙️" },
  siliguri: { name: "Siliguri", country: "india", state: "westBengal", flag: "🏙️" },
  jhansi: { name: "Jhansi", country: "india", state: "uttarPradesh", flag: "🏙️" },
  ulhasnagar: { name: "Ulhasnagar", country: "india", state: "maharashtra", flag: "🏙️" },
  jammu: { name: "Jammu", country: "india", state: "jammuKashmir", flag: "🏙️" },
  sangli: { name: "Sangli", country: "india", state: "maharashtra", flag: "🏙️" },
  mangalore: { name: "Mangalore", country: "india", state: "karnataka", flag: "🏙️" },
  erode: { name: "Erode", country: "india", state: "tamilNadu", flag: "🏙️" },
  belgaum: { name: "Belgaum", country: "india", state: "karnataka", flag: "🏙️" },
  ambattur: { name: "Ambattur", country: "india", state: "tamilNadu", flag: "🏙️" },
  tirunelveli: { name: "Tirunelveli", country: "india", state: "tamilNadu", flag: "🏙️" },
  malegaon: { name: "Malegaon", country: "india", state: "maharashtra", flag: "🏙️" },
  gaya: { name: "Gaya", country: "india", state: "bihar", flag: "🏙️" },
  jalgaon: { name: "Jalgaon", country: "india", state: "maharashtra", flag: "🏙️" },
  udaipur: { name: "Udaipur", country: "india", state: "rajasthan", flag: "🏙️" },
  maheshtala: { name: "Maheshtala", country: "india", state: "westBengal", flag: "🏙️" },
  davanagere: { name: "Davanagere", country: "india", state: "karnataka", flag: "🏙️" },
  kozhikode: { name: "Kozhikode", country: "india", state: "kerala", flag: "🏙️" },
  kurnool: { name: "Kurnool", country: "india", state: "andhraPradesh", flag: "🏙️" },
  bokaro: { name: "Bokaro", country: "india", state: "jharkhand", flag: "🏙️" },
  rajahmundry: { name: "Rajahmundry", country: "india", state: "andhraPradesh", flag: "🏙️" },
  akola: { name: "Akola", country: "india", state: "maharashtra", flag: "🏙️" },
  dhanbad: { name: "Dhanbad", country: "india", state: "jharkhand", flag: "🏙️" },
  bellary: { name: "Bellary", country: "india", state: "karnataka", flag: "🏙️" },
  patiala: { name: "Patiala", country: "india", state: "punjab", flag: "🏙️" },
  gopalpur: { name: "Gopalpur", country: "india", state: "odisha", flag: "🏙️" },
  agartala: { name: "Agartala", country: "india", state: "tripura", flag: "🏙️" },
  shimla: { name: "Shimla", country: "india", state: "himachalPradesh", flag: "🏙️" },
  gangtok: { name: "Gangtok", country: "india", state: "sikkim", flag: "🏙️" },
  imphal: { name: "Imphal", country: "india", state: "manipur", flag: "🏙️" },
  shillong: { name: "Shillong", country: "india", state: "meghalaya", flag: "🏙️" },
  aizawl: { name: "Aizawl", country: "india", state: "mizoram", flag: "🏙️" },
  kohima: { name: "Kohima", country: "india", state: "nagaland", flag: "🏙️" },
  itanagar: { name: "Itanagar", country: "india", state: "arunachalPradesh", flag: "🏙️" },
  leh: { name: "Leh", country: "india", state: "ladakh", flag: "🏙️" },
  portBlair: { name: "Port Blair", country: "india", state: "andamanNicobar", flag: "🏙️" },
  panaji: { name: "Panaji", country: "india", state: "goa", flag: "🏙️" },
  puducherry: { name: "Puducherry", country: "india", state: "puducherry", flag: "🏙️" },
  kavaratti: { name: "Kavaratti", country: "india", state: "lakshadweep", flag: "🏙️" },
  thiruvananthapuram: { name: "Thiruvananthapuram", country: "india", state: "kerala", flag: "🏙️" },

  // US CITIES
  newYorkCity: { name: "New York City", country: "usa", state: "newYork", flag: "🗽" },
  losAngeles: { name: "Los Angeles", country: "usa", state: "california", flag: "🌴" },
  chicago: { name: "Chicago", country: "usa", state: "illinois", flag: "🏙️" },
  houston: { name: "Houston", country: "usa", state: "texas", flag: "🚀" },
  phoenix: { name: "Phoenix", country: "usa", state: "arizona", flag: "🌵" },
  philadelphia: { name: "Philadelphia", country: "usa", state: "pennsylvania", flag: "🔔" },
  sanAntonio: { name: "San Antonio", country: "usa", state: "texas", flag: "🏙️" },
  sanDiego: { name: "San Diego", country: "usa", state: "california", flag: "🏖️" },
  dallas: { name: "Dallas", country: "usa", state: "texas", flag: "🤠" },
  sanJose: { name: "San Jose", country: "usa", state: "california", flag: "💻" },
  austin: { name: "Austin", country: "usa", state: "texas", flag: "🎸" },
  jacksonville: { name: "Jacksonville", country: "usa", state: "florida", flag: "🏙️" },
  fortWorth: { name: "Fort Worth", country: "usa", state: "texas", flag: "🏙️" },
  columbus: { name: "Columbus", country: "usa", state: "ohio", flag: "🏙️" },
  sanFrancisco: { name: "San Francisco", country: "usa", state: "california", flag: "🌉" },
  charlotte: { name: "Charlotte", country: "usa", state: "northCarolina", flag: "🏙️" },
  indianapolis: { name: "Indianapolis", country: "usa", state: "indiana", flag: "🏎️" },
  seattle: { name: "Seattle", country: "usa", state: "washington", flag: "☕" },
  denver: { name: "Denver", country: "usa", state: "colorado", flag: "🏔️" },
  washingtonDC: { name: "Washington D.C.", country: "usa", state: null, flag: "🏛️" },
  boston: { name: "Boston", country: "usa", state: "massachusetts", flag: "🏛️" },
  elPaso: { name: "El Paso", country: "usa", state: "texas", flag: "🏙️" },
  nashville: { name: "Nashville", country: "usa", state: "tennessee", flag: "🎸" },
  detroit: { name: "Detroit", country: "usa", state: "michigan", flag: "🚗" },
  oklahoma: { name: "Oklahoma City", country: "usa", state: "oklahoma", flag: "🏙️" },
  portland: { name: "Portland", country: "usa", state: "oregon", flag: "🌲" },
  lasVegas: { name: "Las Vegas", country: "usa", state: "nevada", flag: "🎰" },
  memphis: { name: "Memphis", country: "usa", state: "tennessee", flag: "🎵" },
  louisville: { name: "Louisville", country: "usa", state: "kentucky", flag: "🐴" },
  baltimore: { name: "Baltimore", country: "usa", state: "maryland", flag: "🦀" },
  milwaukee: { name: "Milwaukee", country: "usa", state: "wisconsin", flag: "🍺" },
  albuquerque: { name: "Albuquerque", country: "usa", state: "newMexico", flag: "🌵" },
  tucson: { name: "Tucson", country: "usa", state: "arizona", flag: "🏜️" },
  fresno: { name: "Fresno", country: "usa", state: "california", flag: "🏙️" },
  sacramento: { name: "Sacramento", country: "usa", state: "california", flag: "🏛️" },
  atlanta: { name: "Atlanta", country: "usa", state: "georgiaUS", flag: "🍑" },
  kansasCity: { name: "Kansas City", country: "usa", state: "missouri", flag: "🏙️" },
  miami: { name: "Miami", country: "usa", state: "florida", flag: "🌴" },
  cleveland: { name: "Cleveland", country: "usa", state: "ohio", flag: "🏙️" },
  honolulu: { name: "Honolulu", country: "usa", state: "hawaii", flag: "🌺" },

  // CHINA CITIES
  beijing: { name: "Beijing", country: "china", flag: "🏙️" },
  shanghai: { name: "Shanghai", country: "china", flag: "🏙️" },
  guangzhou: { name: "Guangzhou", country: "china", flag: "🏙️" },
  shenzhen: { name: "Shenzhen", country: "china", flag: "🏙️" },
  chengdu: { name: "Chengdu", country: "china", flag: "🐼" },
  hangzhou: { name: "Hangzhou", country: "china", flag: "🏙️" },
  wuhan: { name: "Wuhan", country: "china", flag: "🏙️" },
  xian: { name: "Xi'an", country: "china", flag: "🏙️" },
  chongqing: { name: "Chongqing", country: "china", flag: "🏙️" },
  nanjing: { name: "Nanjing", country: "china", flag: "🏙️" },
  tianjin: { name: "Tianjin", country: "china", flag: "🏙️" },
  suzhou: { name: "Suzhou", country: "china", flag: "🏙️" },
  zhengzhou: { name: "Zhengzhou", country: "china", flag: "🏙️" },
  changsha: { name: "Changsha", country: "china", flag: "🏙️" },
  shenyang: { name: "Shenyang", country: "china", flag: "🏙️" },
  dalian: { name: "Dalian", country: "china", flag: "🏙️" },
  qingdao: { name: "Qingdao", country: "china", flag: "🏙️" },
  harbin: { name: "Harbin", country: "china", flag: "❄️" },
  kunming: { name: "Kunming", country: "china", flag: "🏙️" },
  fuzhou: { name: "Fuzhou", country: "china", flag: "🏙️" },
  hongKong: { name: "Hong Kong", country: "china", flag: "🏙️" },
  macau: { name: "Macau", country: "china", flag: "🎰" },

  // UK CITIES
  london: { name: "London", country: "uk", flag: "🇬🇧" },
  manchester: { name: "Manchester", country: "uk", flag: "⚽" },
  birmingham: { name: "Birmingham", country: "uk", flag: "🏙️" },
  glasgow: { name: "Glasgow", country: "uk", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  liverpool: { name: "Liverpool", country: "uk", flag: "⚽" },
  leeds: { name: "Leeds", country: "uk", flag: "🏙️" },
  edinburgh: { name: "Edinburgh", country: "uk", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  bristol: { name: "Bristol", country: "uk", flag: "🏙️" },
  cardiff: { name: "Cardiff", country: "uk", flag: "🏙️" },
  belfast: { name: "Belfast", country: "uk", flag: "🏙️" },
  newcastle: { name: "Newcastle", country: "uk", flag: "🏙️" },
  sheffield: { name: "Sheffield", country: "uk", flag: "🏙️" },
  nottingham: { name: "Nottingham", country: "uk", flag: "🏙️" },
  cambridge: { name: "Cambridge", country: "uk", flag: "🎓" },
  oxford: { name: "Oxford", country: "uk", flag: "🎓" },

  // GERMANY CITIES
  berlin: { name: "Berlin", country: "germany", flag: "🇩🇪" },
  hamburg: { name: "Hamburg", country: "germany", flag: "🏙️" },
  munich: { name: "Munich", country: "germany", flag: "🍺" },
  cologne: { name: "Cologne", country: "germany", flag: "🏙️" },
  frankfurt: { name: "Frankfurt", country: "germany", flag: "💶" },
  stuttgart: { name: "Stuttgart", country: "germany", flag: "🚗" },
  dusseldorf: { name: "Düsseldorf", country: "germany", flag: "🏙️" },
  dortmund: { name: "Dortmund", country: "germany", flag: "⚽" },
  essen: { name: "Essen", country: "germany", flag: "🏙️" },
  leipzig: { name: "Leipzig", country: "germany", flag: "🏙️" },
  bremen: { name: "Bremen", country: "germany", flag: "🏙️" },
  dresden: { name: "Dresden", country: "germany", flag: "🏙️" },
  hanover: { name: "Hanover", country: "germany", flag: "🏙️" },
  nuremberg: { name: "Nuremberg", country: "germany", flag: "🏙️" },

  // FRANCE CITIES
  paris: { name: "Paris", country: "france", flag: "🗼" },
  marseille: { name: "Marseille", country: "france", flag: "🏙️" },
  lyon: { name: "Lyon", country: "france", flag: "🏙️" },
  toulouse: { name: "Toulouse", country: "france", flag: "✈️" },
  nice: { name: "Nice", country: "france", flag: "🏖️" },
  nantes: { name: "Nantes", country: "france", flag: "🏙️" },
  strasbourg: { name: "Strasbourg", country: "france", flag: "🏛️" },
  montpellier: { name: "Montpellier", country: "france", flag: "🏙️" },
  bordeaux: { name: "Bordeaux", country: "france", flag: "🍷" },
  lille: { name: "Lille", country: "france", flag: "🏙️" },
  rennes: { name: "Rennes", country: "france", flag: "🏙️" },

  // JAPAN CITIES
  tokyo: { name: "Tokyo", country: "japan", flag: "🗼" },
  osaka: { name: "Osaka", country: "japan", flag: "🏯" },
  yokohama: { name: "Yokohama", country: "japan", flag: "🏙️" },
  nagoya: { name: "Nagoya", country: "japan", flag: "🏙️" },
  sapporo: { name: "Sapporo", country: "japan", flag: "❄️" },
  fukuoka: { name: "Fukuoka", country: "japan", flag: "🏙️" },
  kobe: { name: "Kobe", country: "japan", flag: "🏙️" },
  kyoto: { name: "Kyoto", country: "japan", flag: "⛩️" },
  kawasaki: { name: "Kawasaki", country: "japan", flag: "🏙️" },
  saitama: { name: "Saitama", country: "japan", flag: "🏙️" },
  hiroshima: { name: "Hiroshima", country: "japan", flag: "🕊️" },
  sendai: { name: "Sendai", country: "japan", flag: "🏙️" },
  kitakyushu: { name: "Kitakyushu", country: "japan", flag: "🏙️" },
  chiba: { name: "Chiba", country: "japan", flag: "🏙️" },

  // AUSTRALIA CITIES
  sydney: { name: "Sydney", country: "australia", flag: "🦘" },
  melbourne: { name: "Melbourne", country: "australia", flag: "☕" },
  brisbane: { name: "Brisbane", country: "australia", flag: "🏙️" },
  perth: { name: "Perth", country: "australia", flag: "🏙️" },
  adelaide: { name: "Adelaide", country: "australia", flag: "🏙️" },
  goldCoast: { name: "Gold Coast", country: "australia", flag: "🏖️" },
  canberra: { name: "Canberra", country: "australia", flag: "🏛️" },
  newcastle: { name: "Newcastle", country: "australia", flag: "🏙️" },
  hobart: { name: "Hobart", country: "australia", flag: "🏙️" },
  darwin: { name: "Darwin", country: "australia", flag: "🏙️" },

  // CANADA CITIES
  toronto: { name: "Toronto", country: "canada", flag: "🍁" },
  montreal: { name: "Montreal", country: "canada", flag: "🏒" },
  vancouver: { name: "Vancouver", country: "canada", flag: "🏔️" },
  calgary: { name: "Calgary", country: "canada", flag: "🤠" },
  edmonton: { name: "Edmonton", country: "canada", flag: "🏙️" },
  ottawa: { name: "Ottawa", country: "canada", flag: "🏛️" },
  winnipeg: { name: "Winnipeg", country: "canada", flag: "🏙️" },
  quebec: { name: "Quebec City", country: "canada", flag: "🏰" },
  hamilton: { name: "Hamilton", country: "canada", flag: "🏙️" },
  victoria: { name: "Victoria", country: "canada", flag: "🏙️" },
  halifax: { name: "Halifax", country: "canada", flag: "🏙️" },

  // BRAZIL CITIES
  saoPaulo: { name: "São Paulo", country: "brazil", flag: "🏙️" },
  rioDeJaneiro: { name: "Rio de Janeiro", country: "brazil", flag: "🗿" },
  brasilia: { name: "Brasília", country: "brazil", flag: "🏛️" },
  salvador: { name: "Salvador", country: "brazil", flag: "🏖️" },
  fortaleza: { name: "Fortaleza", country: "brazil", flag: "🏖️" },
  beloHorizonte: { name: "Belo Horizonte", country: "brazil", flag: "🏙️" },
  manaus: { name: "Manaus", country: "brazil", flag: "🌿" },
  curitiba: { name: "Curitiba", country: "brazil", flag: "🏙️" },
  recife: { name: "Recife", country: "brazil", flag: "🏖️" },
  portoAlegre: { name: "Porto Alegre", country: "brazil", flag: "🏙️" },

  // SOUTH KOREA CITIES
  seoul: { name: "Seoul", country: "southKorea", flag: "🏙️" },
  busan: { name: "Busan", country: "southKorea", flag: "🏖️" },
  incheon: { name: "Incheon", country: "southKorea", flag: "✈️" },
  daegu: { name: "Daegu", country: "southKorea", flag: "🏙️" },
  daejeon: { name: "Daejeon", country: "southKorea", flag: "🏙️" },
  gwangju: { name: "Gwangju", country: "southKorea", flag: "🏙️" },
  suwon: { name: "Suwon", country: "southKorea", flag: "🏙️" },

  // MIDDLE EAST CITIES
  dubai: { name: "Dubai", country: "uae", flag: "🏙️" },
  abuDhabi: { name: "Abu Dhabi", country: "uae", flag: "🏛️" },
  riyadh: { name: "Riyadh", country: "saudiArabia", flag: "🏙️" },
  jeddah: { name: "Jeddah", country: "saudiArabia", flag: "🏙️" },
  mecca: { name: "Mecca", country: "saudiArabia", flag: "🕋" },
  doha: { name: "Doha", country: "qatar", flag: "🏙️" },
  tehran: { name: "Tehran", country: "iran", flag: "🏙️" },
  istanbul: { name: "Istanbul", country: "turkey", flag: "🕌" },
  ankara: { name: "Ankara", country: "turkey", flag: "🏛️" },
  telAviv: { name: "Tel Aviv", country: "israel", flag: "🏙️" },
  jerusalem: { name: "Jerusalem", country: "israel", flag: "🕌" },
  beirut: { name: "Beirut", country: "lebanon", flag: "🏙️" },
  amman: { name: "Amman", country: "jordan", flag: "🏙️" },
  kuwait: { name: "Kuwait City", country: "kuwait", flag: "🏙️" },
  muscat: { name: "Muscat", country: "oman", flag: "🏙️" },
  manama: { name: "Manama", country: "bahrain", flag: "🏙️" },

  // SOUTHEAST ASIA CITIES
  singaporeCity: { name: "Singapore", country: "singapore", flag: "🏙️" },
  kualaLumpur: { name: "Kuala Lumpur", country: "malaysia", flag: "🏙️" },
  bangkok: { name: "Bangkok", country: "thailand", flag: "🏙️" },
  jakarta: { name: "Jakarta", country: "indonesia", flag: "🏙️" },
  manila: { name: "Manila", country: "philippines", flag: "🏙️" },
  hoChiMinhCity: { name: "Ho Chi Minh City", country: "vietnam", flag: "🏙️" },
  hanoi: { name: "Hanoi", country: "vietnam", flag: "🏙️" },
  yangon: { name: "Yangon", country: "myanmar", flag: "🏙️" },
  phnomPenh: { name: "Phnom Penh", country: "cambodia", flag: "🏙️" },
  taipei: { name: "Taipei", country: "taiwan", flag: "🏙️" },
  bali: { name: "Bali", country: "indonesia", flag: "🏖️" },
  phuket: { name: "Phuket", country: "thailand", flag: "🏖️" },

  // SOUTH ASIA CITIES (non-India)
  karachi: { name: "Karachi", country: "pakistan", flag: "🏙️" },
  lahore: { name: "Lahore", country: "pakistan", flag: "🏙️" },
  islamabad: { name: "Islamabad", country: "pakistan", flag: "🏛️" },
  dhaka: { name: "Dhaka", country: "bangladesh", flag: "🏙️" },
  colombo: { name: "Colombo", country: "sriLanka", flag: "🏙️" },
  kathmandu: { name: "Kathmandu", country: "nepal", flag: "🏔️" },
  male: { name: "Male", country: "maldives", flag: "🏝️" },
  kabul: { name: "Kabul", country: "afghanistan", flag: "🏙️" },

  // RUSSIA CITIES
  moscow: { name: "Moscow", country: "russia", flag: "🏙️" },
  saintPetersburg: { name: "Saint Petersburg", country: "russia", flag: "🏛️" },
  novosibirsk: { name: "Novosibirsk", country: "russia", flag: "🏙️" },
  yekaterinburg: { name: "Yekaterinburg", country: "russia", flag: "🏙️" },
  kazan: { name: "Kazan", country: "russia", flag: "🏙️" },
  nizhnyNovgorod: { name: "Nizhny Novgorod", country: "russia", flag: "🏙️" },
  vladivostok: { name: "Vladivostok", country: "russia", flag: "🏙️" },
  sochi: { name: "Sochi", country: "russia", flag: "🏖️" },

  // ITALY CITIES
  rome: { name: "Rome", country: "italy", flag: "🏛️" },
  milan: { name: "Milan", country: "italy", flag: "👗" },
  naples: { name: "Naples", country: "italy", flag: "🍕" },
  turin: { name: "Turin", country: "italy", flag: "🚗" },
  florence: { name: "Florence", country: "italy", flag: "🎨" },
  venice: { name: "Venice", country: "italy", flag: "🛶" },
  bologna: { name: "Bologna", country: "italy", flag: "🍝" },
  genoa: { name: "Genoa", country: "italy", flag: "⚓" },

  // SPAIN CITIES
  madrid: { name: "Madrid", country: "spain", flag: "🏙️" },
  barcelona: { name: "Barcelona", country: "spain", flag: "⚽" },
  valencia: { name: "Valencia", country: "spain", flag: "🏙️" },
  seville: { name: "Seville", country: "spain", flag: "💃" },
  bilbao: { name: "Bilbao", country: "spain", flag: "🏙️" },
  malaga: { name: "Málaga", country: "spain", flag: "🏖️" },

  // NETHERLANDS CITIES
  amsterdam: { name: "Amsterdam", country: "netherlands", flag: "🚲" },
  rotterdam: { name: "Rotterdam", country: "netherlands", flag: "🏙️" },
  theHague: { name: "The Hague", country: "netherlands", flag: "🏛️" },
  utrecht: { name: "Utrecht", country: "netherlands", flag: "🏙️" },
  eindhoven: { name: "Eindhoven", country: "netherlands", flag: "💡" },

  // SCANDINAVIAN CITIES
  stockholm: { name: "Stockholm", country: "sweden", flag: "🏙️" },
  oslo: { name: "Oslo", country: "norway", flag: "🏙️" },
  copenhagen: { name: "Copenhagen", country: "denmark", flag: "🧜‍♀️" },
  helsinki: { name: "Helsinki", country: "finland", flag: "🏙️" },
  reykjavik: { name: "Reykjavik", country: "iceland", flag: "🌋" },

  // OTHER EUROPEAN CITIES
  vienna: { name: "Vienna", country: "austria", flag: "🎹" },
  zurich: { name: "Zurich", country: "switzerland", flag: "🏔️" },
  geneva: { name: "Geneva", country: "switzerland", flag: "⌚" },
  brussels: { name: "Brussels", country: "belgium", flag: "🏛️" },
  lisbon: { name: "Lisbon", country: "portugal", flag: "🏙️" },
  athens: { name: "Athens", country: "greece", flag: "🏛️" },
  warsaw: { name: "Warsaw", country: "poland", flag: "🏙️" },
  krakow: { name: "Krakow", country: "poland", flag: "🏰" },
  prague: { name: "Prague", country: "czechia", flag: "🏰" },
  budapest: { name: "Budapest", country: "hungary", flag: "🏛️" },
  bucharest: { name: "Bucharest", country: "romania", flag: "🏙️" },
  dublin: { name: "Dublin", country: "ireland", flag: "🍀" },
  kyiv: { name: "Kyiv", country: "ukraine", flag: "🏙️" },
  zagreb: { name: "Zagreb", country: "croatia", flag: "🏙️" },
  belgrade: { name: "Belgrade", country: "serbia", flag: "🏙️" },
  sofia: { name: "Sofia", country: "bulgaria", flag: "🏙️" },
  tallinn: { name: "Tallinn", country: "estonia", flag: "🏙️" },
  riga: { name: "Riga", country: "latvia", flag: "🏙️" },
  vilnius: { name: "Vilnius", country: "lithuania", flag: "🏙️" },

  // AFRICA CITIES
  cairo: { name: "Cairo", country: "egypt", flag: "🏛️" },
  alexandria: { name: "Alexandria", country: "egypt", flag: "🏙️" },
  johannesburg: { name: "Johannesburg", country: "southAfrica", flag: "🏙️" },
  capeTown: { name: "Cape Town", country: "southAfrica", flag: "🏔️" },
  durban: { name: "Durban", country: "southAfrica", flag: "🏖️" },
  lagos: { name: "Lagos", country: "nigeria", flag: "🏙️" },
  abuja: { name: "Abuja", country: "nigeria", flag: "🏛️" },
  nairobi: { name: "Nairobi", country: "kenya", flag: "🦁" },
  addisAbaba: { name: "Addis Ababa", country: "ethiopia", flag: "🏙️" },
  casablanca: { name: "Casablanca", country: "morocco", flag: "🏙️" },
  marrakech: { name: "Marrakech", country: "morocco", flag: "🏜️" },
  tunis: { name: "Tunis", country: "tunisia", flag: "🏙️" },
  accra: { name: "Accra", country: "ghana", flag: "🏙️" },
  dakar: { name: "Dakar", country: "senegal", flag: "🏙️" },
  kigali: { name: "Kigali", country: "rwanda", flag: "🏙️" },

  // SOUTH AMERICA CITIES
  buenosAires: { name: "Buenos Aires", country: "argentina", flag: "💃" },
  lima: { name: "Lima", country: "peru", flag: "🏙️" },
  bogota: { name: "Bogotá", country: "colombia", flag: "🏔️" },
  santiago: { name: "Santiago", country: "chile", flag: "🏔️" },
  caracas: { name: "Caracas", country: "venezuela", flag: "🏙️" },
  quito: { name: "Quito", country: "ecuador", flag: "🏔️" },
  montevideo: { name: "Montevideo", country: "uruguay", flag: "🏙️" },
  laPaz: { name: "La Paz", country: "bolivia", flag: "🏔️" },
  asuncion: { name: "Asunción", country: "paraguay", flag: "🏙️" },
  medellin: { name: "Medellín", country: "colombia", flag: "🏙️" },
  cartagena: { name: "Cartagena", country: "colombia", flag: "🏰" },

  // CENTRAL AMERICA & CARIBBEAN CITIES
  mexicoCity: { name: "Mexico City", country: "mexico", flag: "🏙️" },
  cancun: { name: "Cancún", country: "mexico", flag: "🏖️" },
  guadalajara: { name: "Guadalajara", country: "mexico", flag: "🏙️" },
  monterrey: { name: "Monterrey", country: "mexico", flag: "🏙️" },
  tijuana: { name: "Tijuana", country: "mexico", flag: "🏙️" },
  havana: { name: "Havana", country: "cuba", flag: "🏙️" },
  sanJuan: { name: "San Juan", country: "puertoRico", flag: "🏖️" },
  panamaCity: { name: "Panama City", country: "panama", flag: "🏙️" },
  sanJoseCR: { name: "San José", country: "costaRica", flag: "🏙️" },
  guatemalaCity: { name: "Guatemala City", country: "guatemala", flag: "🏙️" },
  santoDomingo: { name: "Santo Domingo", country: "dominicanRepublic", flag: "🏙️" },
  kingston: { name: "Kingston", country: "jamaica", flag: "🏙️" },

  // NEW ZEALAND CITIES
  auckland: { name: "Auckland", country: "newZealand", flag: "🏙️" },
  wellington: { name: "Wellington", country: "newZealand", flag: "🏛️" },
  christchurch: { name: "Christchurch", country: "newZealand", flag: "🏙️" },
  queenstown: { name: "Queenstown", country: "newZealand", flag: "🏔️" },
};

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

// Build complete location with environmental data
export function buildLocationData(type, key, baseData, region) {
  const envData = generateEnvData(type, region, baseData.name);
  return {
    ...baseData,
    ...envData,
    type,
    key,
  };
}

// Get all countries with data
export function getAllCountriesWithData() {
  return Object.entries(WORLD_COUNTRIES).map(([key, data]) => ({
    value: key,
    label: `${data.flag} ${data.name}`,
    type: 'country',
    continent: data.continent,
    ...buildLocationData('country', key, data, data.region),
  }));
}

// Get all states for a country
export function getStatesForCountry(countryKey) {
  if (countryKey === 'india') {
    return Object.entries(INDIAN_STATES).map(([key, data]) => ({
      value: key,
      label: `${data.flag} ${data.name}`,
      type: 'state',
      country: 'india',
      ...buildLocationData('state', key, data, 'southAsia'),
    }));
  }
  if (countryKey === 'usa') {
    return Object.entries(US_STATES).map(([key, data]) => ({
      value: key,
      label: `${data.flag} ${data.name}`,
      type: 'state',
      country: 'usa',
      ...buildLocationData('state', key, data, 'northAmerica'),
    }));
  }
  return [];
}

// Get all cities for a country or state
export function getCitiesForLocation(countryKey, stateKey = null) {
  return Object.entries(WORLD_CITIES)
    .filter(([_, data]) => {
      if (stateKey) {
        return data.country === countryKey && data.state === stateKey;
      }
      return data.country === countryKey;
    })
    .map(([key, data]) => {
      const countryData = WORLD_COUNTRIES[data.country];
      const region = countryData?.region || 'default';
      return {
        value: key,
        label: `${data.flag} ${data.name}`,
        type: 'city',
        country: data.country,
        state: data.state,
        ...buildLocationData('city', key, data, region),
      };
    });
}

// Get search results for locations
export function searchLocations(query) {
  if (!query || query.length < 2) return [];
  
  const normalizedQuery = query.toLowerCase().trim();
  const results = [];
  
  // Search countries
  Object.entries(WORLD_COUNTRIES).forEach(([key, data]) => {
    if (data.name.toLowerCase().includes(normalizedQuery)) {
      results.push({
        value: key,
        label: `${data.flag} ${data.name}`,
        type: 'country',
        ...buildLocationData('country', key, data, data.region),
      });
    }
  });
  
  // Search Indian states
  Object.entries(INDIAN_STATES).forEach(([key, data]) => {
    if (data.name.toLowerCase().includes(normalizedQuery)) {
      results.push({
        value: key,
        label: `${data.flag} ${data.name}, India`,
        type: 'state',
        country: 'india',
        ...buildLocationData('state', key, data, 'southAsia'),
      });
    }
  });
  
  // Search US states
  Object.entries(US_STATES).forEach(([key, data]) => {
    if (data.name.toLowerCase().includes(normalizedQuery)) {
      results.push({
        value: key,
        label: `${data.flag} ${data.name}, USA`,
        type: 'state',
        country: 'usa',
        ...buildLocationData('state', key, data, 'northAmerica'),
      });
    }
  });
  
  // Search cities
  Object.entries(WORLD_CITIES).forEach(([key, data]) => {
    if (data.name.toLowerCase().includes(normalizedQuery)) {
      const countryData = WORLD_COUNTRIES[data.country];
      results.push({
        value: key,
        label: `${data.flag} ${data.name}, ${countryData?.name || data.country}`,
        type: 'city',
        country: data.country,
        ...buildLocationData('city', key, data, countryData?.region || 'default'),
      });
    }
  });
  
  return results.slice(0, 50); // Limit results
}

// Get location by key
export function getLocationByKey(key, type = null) {
  // Check if it's India or global
  if (key === 'india') {
    return buildLocationData('country', 'india', { name: 'India', flag: '🇮🇳' }, 'southAsia');
  }
  if (key === 'global') {
    return {
      name: "Global",
      flag: "🌍",
      type: 'global',
      key: 'global',
      co2: { value: 36.8, unit: "B tons", label: "CO₂ Emissions" },
      water: { value: 4, unit: "T m³", label: "Water Consumption" },
      waste: { value: 2.24, unit: "B tons", label: "Waste Generated" },
      recyclingRate: { value: 19, unit: "%", label: "Recycling Rate" },
      circularIndex: { value: 8.6, unit: "%", label: "Circular Economy Index" },
      energyRenewable: { value: 29, unit: "%", label: "Renewable Energy" },
    };
  }
  
  // Check countries
  if (WORLD_COUNTRIES[key]) {
    const data = WORLD_COUNTRIES[key];
    return buildLocationData('country', key, data, data.region);
  }
  
  // Check Indian states
  if (INDIAN_STATES[key]) {
    return buildLocationData('state', key, INDIAN_STATES[key], 'southAsia');
  }
  
  // Check US states
  if (US_STATES[key]) {
    return buildLocationData('state', key, US_STATES[key], 'northAmerica');
  }
  
  // Check cities
  if (WORLD_CITIES[key]) {
    const cityData = WORLD_CITIES[key];
    const countryData = WORLD_COUNTRIES[cityData.country];
    return buildLocationData('city', key, cityData, countryData?.region || 'default');
  }
  
  // Default to Delhi
  return buildLocationData('city', 'delhi', WORLD_CITIES.delhi, 'southAsia');
}

// Get all locations grouped by type
export function getAllLocationsGrouped() {
  const groups = {
    global: [{ value: 'global', label: '🌍 Global', type: 'global' }],
    continents: {},
    countries: [],
    indianStates: [],
    usStates: [],
    cities: [],
  };
  
  // Add countries grouped by continent
  Object.entries(WORLD_COUNTRIES).forEach(([key, data]) => {
    if (!groups.continents[data.continent]) {
      groups.continents[data.continent] = [];
    }
    groups.continents[data.continent].push({
      value: key,
      label: `${data.flag} ${data.name}`,
      type: 'country',
    });
    groups.countries.push({
      value: key,
      label: `${data.flag} ${data.name}`,
      type: 'country',
      continent: data.continent,
    });
  });
  
  // Add India separately at top
  groups.countries.unshift({ value: 'india', label: '🇮🇳 India', type: 'country', continent: 'Asia' });
  
  // Add Indian states
  Object.entries(INDIAN_STATES).forEach(([key, data]) => {
    groups.indianStates.push({
      value: key,
      label: `${data.flag} ${data.name}`,
      type: 'state',
      country: 'india',
    });
  });
  
  // Add US states
  Object.entries(US_STATES).forEach(([key, data]) => {
    groups.usStates.push({
      value: key,
      label: `${data.flag} ${data.name}`,
      type: 'state',
      country: 'usa',
    });
  });
  
  // Add cities
  Object.entries(WORLD_CITIES).forEach(([key, data]) => {
    groups.cities.push({
      value: key,
      label: `${data.flag} ${data.name}`,
      type: 'city',
      country: data.country,
      state: data.state,
    });
  });
  
  return groups;
}
