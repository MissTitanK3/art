// declare module 'leaflet.heat' {
//   import * as L from 'leaflet';

//   export function heatLayer(
//     latlngs: Array<[number, number, number?]>,
//     options?: {
//       radius?: number;
//       blur?: number;
//       maxZoom?: number;
//       gradient?: Record<number, string>;
//       minOpacity?: number;
//       max?: number;
//     },
//   ): L.Layer;
// }

declare module "leaflet.heat" {
  import * as L from "leaflet";

  interface HeatLayerOptions {
    minOpacity?: number;
    maxZoom?: number;
    radius?: number;
    blur?: number;
    gradient?: { [key: number]: string };
  }

  function heatLayer(
    latlngs: [number, number, number?][],
    options?: HeatLayerOptions,
  ): L.Layer;

  export { heatLayer };
}
