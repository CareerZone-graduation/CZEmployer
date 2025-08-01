import tree from '@/data/tree.json';

// Create LOCATIONS array similar to backend
const wards = tree.flatMap((province) => province.wards.map((ward) => ward.name));
const provinces = tree.map((province) => province.name);

export const LOCATIONS = [...new Set([...provinces, ...wards])];

/**
 * Get all cities from the location data
 * @returns {Array} Array of city names
 */
export const getCities = () => {
  return tree.map(city => city.name);
};

/**
 * Get all wards for a specific city
 * @param {string} cityName - The city name
 * @returns {Array} Array of ward names
 */
export const getWardsByCity = (cityName) => {
  const city = tree.find(city => city.name === cityName);
  return city ? city.wards.map(ward => ward.name) : [];
};

/**
 * Get city object by name
 * @param {string} cityName - The city name
 * @returns {Object|null} City object
 */
export const getCityByName = (cityName) => {
  return tree.find(city => city.name === cityName) || null;
};

/**
 * Check if a location is valid (exists in LOCATIONS)
 * @param {string} location - The location name
 * @returns {boolean} Whether the location is valid
 */
export const isValidLocation = (location) => {
  return LOCATIONS.includes(location);
};
