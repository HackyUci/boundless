import citiesData from '@/datasource/map-data/cities.json';
import outputData from '@/datasource/map-data/output.json';

export const joinCityData = () => {
  const costMap = new Map();
  outputData.forEach(cost => {
    costMap.set(`${cost.city}-${cost.country}`, cost);
  });
  
  return citiesData.map(city => ({
    ...city,
    ...costMap.get(`${city.city}-${city.country}`)
  }));
};