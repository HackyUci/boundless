import { useEffect, useRef } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import TileJSON from 'ol/source/TileJSON';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import { Style, Circle, Fill, Stroke } from 'ol/style';
import citiesData from '@/datasource/map-data/cities.json';

interface City {
  city: string;
  country: string;
  lat: number;
  lon: number;
}

interface MapComponentProps {
  onCityClick?: (city: City) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({ onCityClick }) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const baseLayer = new TileLayer({
      source: new TileJSON({
        url: 'https://api.maptiler.com/maps/basic-v2/tiles.json?key=AbQrHv2zZohwE3Hz3Dhn',
        tileSize: 512,
      }),
    });

    const cityFeatures = (citiesData as City[]).map((city) => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([city.lon, city.lat])),
        city: city.city,
        country: city.country,
        lat: city.lat,
        lon: city.lon,
      });

      feature.setStyle(
        new Style({
          image: new Circle({
            radius: 6,
            fill: new Fill({
              color: '#3b82f6',
            }),
            stroke: new Stroke({
              color: '#ffffff',
              width: 2,
            }),
          }),
        })
      );

      return feature;
    });

    const citiesLayer = new VectorLayer({
      source: new VectorSource({
        features: cityFeatures,
      }),
    });

    const map = new Map({
      target: mapRef.current,
      layers: [baseLayer, citiesLayer],
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 2,
      }),
    });

    map.on('click', (event) => {
      const feature = map.forEachFeatureAtPixel(event.pixel, (feature) => feature);
      
      if (feature && onCityClick) {
        const cityData: City = {
          city: feature.get('city'),
          country: feature.get('country'),
          lat: feature.get('lat'),
          lon: feature.get('lon'),
        };
        onCityClick(cityData);
      }
    });

    map.on('pointermove', (event) => {
      const pixel = map.getEventPixel(event.originalEvent);
      const hit = map.hasFeatureAtPixel(pixel);
      const target = map.getTarget();
      if (target && target instanceof HTMLElement) {
        target.style.cursor = hit ? 'pointer' : '';
      }
    });

    mapInstance.current = map;

    return () => {
      map.setTarget(undefined);
      mapInstance.current = null;
    };
  }, [onCityClick]);

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: '100vh',
        margin: 0,
        padding: 0,
      }}
    />
  );
};

export default MapComponent;