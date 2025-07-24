import React from 'react'
import { CompareDetailSection } from './section/CountryDetailSection'

interface City {
  city: string;
  country: string;
  lat: number;
  lon: number;
}

interface CountryDetailsModuleProps {
  selectedCity: City | null;
}

const CountryDetailsModule: React.FC<CountryDetailsModuleProps> = ({ selectedCity }) => {
  return (
    <div>
      <CompareDetailSection selectedCity={selectedCity} />
    </div>
  )
}

export default CountryDetailsModule