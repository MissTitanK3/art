'use client';

import React, { forwardRef, useEffect, useState } from 'react';
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

/** Keep this type local to avoid importing from LeafletMapImpl (circular/incorrect). */
export type SelectedCounty = {
  GEO_ID: string;
  NAME: string;
  STATE: string;   // 2-digit FIPS string, e.g. "01"
  ZONE: number[];  // grid cells selected inside the county
};

interface FeatureLayer extends L.Polygon {
  feature?: Feature<Polygon | MultiPolygon, CountyProps>;
}

type Props = {
  selected: SelectedCounty[];
  onToggleCounty: (county: SelectedCounty, bounds: L.LatLngBounds) => void; // keep it 2-arg for simplicity
};

const CountyLayer = forwardRef<L.GeoJSON, Props>(({ selected, onToggleCounty }, ref) => {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<FeatureCollection<Polygon | MultiPolygon, CountyProps> | null>(null);

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

  // reflect "selected" styles when props change
  useEffect(() => {
    const inst = (ref as React.RefObject<L.GeoJSON>)?.current;
    if (!inst) return;

    inst.eachLayer((layer) => {
      const polygon = layer as FeatureLayer;
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
    });
  }, [selected, ref]);

  if (!visible || !data) return null;

  const onEachFeature = (feature: Feature<Polygon | MultiPolygon, CountyProps>, layer: L.Layer) => {
    const county: SelectedCounty = {
      GEO_ID: feature.properties!.GEO_ID,
      NAME: feature.properties!.NAME,
      STATE: feature.properties!.STATE,
      ZONE: [],
    };

    const polygon = layer as FeatureLayer;
    const bounds = polygon.getBounds();

    const updateStyle = () => {
      const match = selected.find((c) => c.GEO_ID === county.GEO_ID);
      const isPartial = !!match && match.ZONE.length > 0;

      polygon.setStyle({
        fillColor: match ? (isPartial ? 'transparent' : 'green') : 'blue',
        fillOpacity: match ? (isPartial ? 0 : 0.4) : 0.1,
        color: 'blue',
        weight: 1,
      });
    };

    polygon.on({
      click: () => {
        onToggleCounty(county, bounds);
        updateStyle();
      },
      mouseover: () =>
        polygon.setStyle({
          fillColor: 'blue',
          fillOpacity: 0.3,
          color: 'blue',
          weight: 1,
        }),
      mouseout: updateStyle,
    });

    updateStyle();
  };

  return (
    <GeoJSON
      ref={ref}
      data={data}
      style={() => ({ color: 'blue', weight: 1, fillOpacity: 0.1 })}
      onEachFeature={onEachFeature}
    />
  );
});

CountyLayer.displayName = 'CountyLayer';
export default CountyLayer;
