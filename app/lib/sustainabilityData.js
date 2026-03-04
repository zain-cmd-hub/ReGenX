/**
 * Sustainability Data Service
 * Provides environmental impact metrics for Global, India, and Location-specific data
 * Now with comprehensive worldwide location support
 */

import {
  WORLD_COUNTRIES,
  INDIAN_STATES,
  US_STATES,
  WORLD_CITIES,
  getAllCountriesWithData,
  getStatesForCountry,
  getCitiesForLocation,
  searchLocations,
  getLocationByKey,
  getAllLocationsGrouped,
} from './worldLocations.js';

// Re-export for backward compatibility
export {
  WORLD_COUNTRIES,
  INDIAN_STATES,
  US_STATES,
  WORLD_CITIES,
  getAllCountriesWithData,
  getStatesForCountry,
  getCitiesForLocation,
  searchLocations,
  getAllLocationsGrouped,
};

// Static environmental data for key locations (can be replaced with API calls)
export const SUSTAINABILITY_DATA = {
  global: {
    name: "Global",
    flag: "🌍",
    co2: { value: 36.8, unit: "B tons", label: "CO₂ Emissions" },
    water: { value: 4, unit: "T m³", label: "Water Consumption" },
    waste: { value: 2.24, unit: "B tons", label: "Waste Generated" },
    recyclingRate: { value: 19, unit: "%", label: "Recycling Rate" },
    circularIndex: { value: 8.6, unit: "%", label: "Circular Economy Index" },
    energyRenewable: { value: 29, unit: "%", label: "Renewable Energy" },
  },
  india: {
    name: "India",
    flag: "🇮🇳",
    co2: { value: 2.7, unit: "B tons", label: "CO₂ Emissions" },
    water: { value: 1123, unit: "B m³", label: "Water Consumption" },
    waste: { value: 277, unit: "M tons", label: "Waste Generated" },
    recyclingRate: { value: 30, unit: "%", label: "Recycling Rate" },
    circularIndex: { value: 12.4, unit: "%", label: "Circular Economy Index" },
    energyRenewable: { value: 42, unit: "%", label: "Renewable Energy" },
  },
};

// Global impact counter (simulated live data)
export const GLOBAL_IMPACT_COUNTER = {
  co2Saved: 2381920, // kg
  waterSaved: 8945200, // liters
  wasteRecycled: 456780, // kg
  treesEquivalent: 113424, // trees
  usersContributing: 24567,
};

// AI Impact insights generator
export function generateImpactInsights(productType, action) {
  const insights = {
    laptop: {
      recycle: {
        co2: 35,
        water: 280,
        energy: 85,
        circularScore: 78,
        message: "Recycling this laptop prevents harmful e-waste and recovers valuable rare earth metals.",
      },
      repair: {
        co2: 48,
        water: 320,
        energy: 120,
        circularScore: 92,
        message: "Repairing extends the laptop's life by 3-5 years, significantly reducing environmental impact.",
      },
      sell: {
        co2: 42,
        water: 290,
        energy: 95,
        circularScore: 85,
        message: "Reselling gives your laptop a second life and reduces the demand for new manufacturing.",
      },
    },
    mobile: {
      recycle: {
        co2: 12,
        water: 140,
        energy: 35,
        circularScore: 82,
        message: "Recycling this phone recovers gold, silver, and copper worth preserving.",
      },
      repair: {
        co2: 18,
        water: 165,
        energy: 48,
        circularScore: 94,
        message: "Repairing your phone saves the energy equivalent of charging it for 10 years.",
      },
      sell: {
        co2: 15,
        water: 150,
        energy: 40,
        circularScore: 88,
        message: "Your old phone could be someone's first smartphone. Give it a new purpose!",
      },
    },
    electronics: {
      recycle: {
        co2: 25,
        water: 200,
        energy: 60,
        circularScore: 75,
        message: "Electronic waste recycling recovers critical materials and prevents toxic contamination.",
      },
      repair: {
        co2: 32,
        water: 240,
        energy: 78,
        circularScore: 88,
        message: "Repairing electronics reduces manufacturing demand and conserves resources.",
      },
      sell: {
        co2: 28,
        water: 220,
        energy: 68,
        circularScore: 82,
        message: "Selling used electronics keeps them in circulation and out of landfills.",
      },
    },
    appliances: {
      recycle: {
        co2: 45,
        water: 380,
        energy: 110,
        circularScore: 70,
        message: "Appliance recycling recovers steel, aluminum, and copper for reuse.",
      },
      repair: {
        co2: 58,
        water: 450,
        energy: 145,
        circularScore: 90,
        message: "Repairing appliances can extend their life by 8-12 years.",
      },
      sell: {
        co2: 52,
        water: 420,
        energy: 125,
        circularScore: 85,
        message: "Pre-owned appliances are in high demand. Your sale helps another household.",
      },
    },
    furniture: {
      recycle: {
        co2: 18,
        water: 120,
        energy: 25,
        circularScore: 65,
        message: "Furniture recycling diverts wood and metal from landfills.",
      },
      repair: {
        co2: 22,
        water: 150,
        energy: 35,
        circularScore: 92,
        message: "Restored furniture has character and saves trees from being cut.",
      },
      sell: {
        co2: 20,
        water: 135,
        energy: 30,
        circularScore: 88,
        message: "Vintage and upcycled furniture is trending. Your piece could be someone's treasure!",
      },
    },
    default: {
      recycle: {
        co2: 15,
        water: 120,
        energy: 35,
        circularScore: 72,
        message: "Recycling this item prevents waste and recovers valuable materials.",
      },
      repair: {
        co2: 20,
        water: 150,
        energy: 45,
        circularScore: 88,
        message: "Repair extends product life and reduces environmental footprint.",
      },
      sell: {
        co2: 18,
        water: 140,
        energy: 40,
        circularScore: 82,
        message: "Reselling promotes circular economy and reduces manufacturing demand.",
      },
    },
  };

  const category = insights[productType.toLowerCase()] || insights.default;
  return category[action.toLowerCase()] || category.recycle;
}

// Get location data by city name (fuzzy match) - Now uses comprehensive world locations
export function getLocationData(locationKey) {
  if (!locationKey) return null;
  
  // First try to get from the new comprehensive database
  const worldLocation = getLocationByKey(locationKey);
  if (worldLocation) {
    return worldLocation;
  }
  
  const normalizedName = locationKey.toLowerCase().trim().replace(/\s+/g, '');
  
  // Check static cities
  if (SUSTAINABILITY_DATA.cities && SUSTAINABILITY_DATA.cities[normalizedName]) {
    return { type: 'city', key: normalizedName, ...SUSTAINABILITY_DATA.cities[normalizedName] };
  }
  
  // Check if India or global
  if (normalizedName === 'india' || normalizedName === 'bharat') {
    return { type: 'country', key: 'india', ...SUSTAINABILITY_DATA.india };
  }
  
  if (normalizedName === 'global' || normalizedName === 'world' || normalizedName === 'earth') {
    return { type: 'global', key: 'global', ...SUSTAINABILITY_DATA.global };
  }
  
  // Search in world locations
  const searchResults = searchLocations(locationKey);
  if (searchResults.length > 0) {
    return searchResults[0];
  }
  
  // Return Delhi as fallback
  return getLocationByKey('delhi');
}

// Get all available locations for dropdown - Now includes comprehensive world locations
export function getAllLocations() {
  const locations = [];
  
  // Add global first
  locations.push({ value: 'global', label: '🌍 Global', type: 'global', section: 'Global' });
  
  // Add India
  locations.push({ value: 'india', label: '🇮🇳 India', type: 'country', section: 'Countries' });
  
  // Add all countries from new database grouped by continent
  const countryGroups = {};
  Object.entries(WORLD_COUNTRIES).forEach(([key, data]) => {
    if (!countryGroups[data.continent]) {
      countryGroups[data.continent] = [];
    }
    countryGroups[data.continent].push({ 
      value: key, 
      label: `${data.flag} ${data.name}`, 
      type: 'country',
      continent: data.continent,
      section: `Countries - ${data.continent}`
    });
  });
  
  // Add countries by continent
  ['Asia', 'Europe', 'North America', 'South America', 'Africa', 'Oceania'].forEach(continent => {
    if (countryGroups[continent]) {
      locations.push(...countryGroups[continent].sort((a, b) => a.label.localeCompare(b.label)));
    }
  });
  
  // Add Indian states
  Object.entries(INDIAN_STATES).forEach(([key, data]) => {
    locations.push({ 
      value: key, 
      label: `${data.flag} ${data.name}`, 
      type: 'state', 
      country: 'india',
      section: 'Indian States'
    });
  });
  
  // Add US states
  Object.entries(US_STATES).forEach(([key, data]) => {
    locations.push({ 
      value: key, 
      label: `${data.flag} ${data.name}`, 
      type: 'state', 
      country: 'usa',
      section: 'US States'
    });
  });
  
  // Add major cities
  Object.entries(WORLD_CITIES).forEach(([key, data]) => {
    const countryData = WORLD_COUNTRIES[data.country];
    locations.push({ 
      value: key, 
      label: `${data.flag} ${data.name}`, 
      type: 'city', 
      country: data.country,
      state: data.state,
      section: `Cities - ${countryData?.name || data.country}`
    });
  });
  
  return locations;
}

// Reverse geocoding to get city from coordinates
export async function getCityFromCoordinates(lat, lon) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
      { headers: { 'User-Agent': 'ReGenX-App/1.0' } }
    );
    const data = await response.json();
    
    const city = data.address?.city || 
                 data.address?.town || 
                 data.address?.village ||
                 data.address?.state_district ||
                 data.address?.state;
    
    const country = data.address?.country;
    
    return { city, country, raw: data.address };
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return { city: 'Delhi', country: 'India' };
  }
}

// Calculate environmental comparison percentages
export function calculateComparison(locationData, comparisonType = 'global') {
  const baseData = comparisonType === 'global' 
    ? SUSTAINABILITY_DATA.global 
    : SUSTAINABILITY_DATA.india;
  
  if (!locationData || !baseData) return {};
  
  // Normalize values for comparison (as percentages of the base)
  return {
    co2: Math.min(100, (locationData.co2.value / (baseData.co2.value * 1000)) * 100),
    water: Math.min(100, (locationData.water.value / (baseData.water.value)) * 100),
    recycling: locationData.recyclingRate.value,
    circularIndex: locationData.circularIndex.value,
  };
}
