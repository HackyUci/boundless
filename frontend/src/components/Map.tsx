import { useEffect, useRef } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import TileJSON from 'ol/source/TileJSON';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { fromLonLat } from 'ol/proj';

const MapComponent: React.FC = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const baseLayer = new TileLayer({
      source: new TileJSON({
        url: 'https://api.maptiler.com/maps/basic-v2/tiles.json?key=AbQrHv2zZohwE3Hz3Dhn',
        tileSize: 512,
      }),
    });

    const pointsLayer = new VectorLayer({
      source: new VectorSource({
        url: 'https://api.maptiler.com/data/01983c5c-e9df-7fcb-89a4-f9bbefcbb7f1/features.json?key=AbQrHv2zZohwE3Hz3Dhn',
        format: new GeoJSON(),
      }),
    });

    const map = new Map({
      target: mapRef.current,
      layers: [baseLayer, pointsLayer],
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 2,
      }),
    });

    // Cleanup on unmount
    return () => map.setTarget(undefined);
  }, []);

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