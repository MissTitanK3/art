'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GeoJSON, useMapEvents } from 'react-leaflet';
import type { Feature, FeatureCollection, Polygon, MultiPolygon } from 'geojson';
import L from 'leaflet';

export interface CountyProps {
  GEO_ID: string;
  STATE: string;
  COUNTY: string;
  NAME: string;
  LSAD: string;
  CENSUSAREA: number;
}

export type SelectedCounty = {
  GEO_ID: string;
  NAME: string;
  STATE: string;   // 2-digit FIPS
  ZONE: number[];  // grid cells selected inside the county
};

interface FeatureLayer extends L.Polygon {
  feature?: Feature<Polygon | MultiPolygon, CountyProps>;
}

type Props = {
  selected: SelectedCounty[];
  onToggleCounty: (county: SelectedCounty, bounds: L.LatLngBounds) => void;
};

function CountyLayer({ selected, onToggleCounty }: Props) {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<FeatureCollection<Polygon | MultiPolygon, CountyProps> | null>(null);

  // NEW: internal ref to the GeoJSON layer
  const geoRef = useRef<L.GeoJSON | null>(null);

  const map = useMapEvents({
    zoomend: () => setVisible(map.getZoom() >= 7),
  });

  useEffect(() => {
    setVisible(map.getZoom() >= 7);
    if (!data) {
      fetch('/us-counties.json')
        .then((res) => res.json())
        .then((geo) => setData(geo));
    }
  }, [map, data]);

  // helper to restyle one polygon based on current `selected`
  const restylePolygon = (polygon: FeatureLayer) => {
    const props = polygon.feature?.properties;
    if (!props) return;
    const match = selected.find((c) => c.GEO_ID === props.GEO_ID);
    const isPartial = !!match && match.ZONE.length > 0;

    polygon.setStyle({
      fillColor: match ? (isPartial ? 'transparent' : 'green') : 'blue',
      fillOpacity: match ? (isPartial ? 0 : 0.4) : 0.1,
      color: 'blue',
      weight: 1,
    });
  };

  // UPDATE STYLES whenever `selected` changes
  useEffect(() => {
    const inst = geoRef.current;
    if (!inst) return;
    inst.eachLayer((layer) => restylePolygon(layer as FeatureLayer));
  }, [selected]);

  if (!visible || !data) return null;

  const onEachFeature = (
    feature: Feature<Polygon | MultiPolygon, CountyProps>,
    layer: L.Layer
  ) => {
    const polygon = layer as FeatureLayer;
    const { GEO_ID, NAME, STATE } = feature.properties!;
    const county: SelectedCounty = { GEO_ID, NAME, STATE, ZONE: [] };
    const bounds = polygon.getBounds();

    polygon.on({
      click: () => {
        onToggleCounty(county, bounds); // parent updates `selected`
        // optional immediate visual feedback (will be corrected by effect on next render)
        restylePolygon(polygon);
      },
      mouseover: () => {
        polygon.setStyle({ fillColor: 'blue', fillOpacity: 0.3, color: 'blue', weight: 1 });
      },
      mouseout: () => {
        // revert to style based on latest `selected`
        restylePolygon(polygon);
      },
    });

    // initial style
    restylePolygon(polygon);
  };

  return (
    <GeoJSON
      ref={(node) => { geoRef.current = (node as unknown as L.GeoJSON) ?? null; }}
      data={data}
      style={() => ({ color: 'blue', weight: 1, fillOpacity: 0.1 })}
      onEachFeature={onEachFeature}
    />
  );
}

export default CountyLayer;
