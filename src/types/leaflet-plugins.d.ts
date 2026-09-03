declare module "leaflet.markercluster";
declare module "leaflet.heat" {
  import type * as L from "leaflet";
  interface HeatLayer extends L.Layer {
    setLatLngs(latlngs: Array<[number, number, number?]>): this;
  }
  module "leaflet" {
    function heatLayer(
      latlngs: Array<[number, number, number?]>,
      options?: {
        radius?: number;
        blur?: number;
        maxZoom?: number;
        max?: number;
        gradient?: Record<number, string>;
      },
    ): HeatLayer;
  }
}
