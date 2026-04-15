"use client";

import {
  Map,
  MapControlFullscreen,
  MapControlGroup,
  MapControlLocate,
  MapControls,
  MapControlZoomIn,
  MapControlZoomOut,
  MapCopyright,
  MapProvider,
} from "@/components/ui/map";

export default function MapPage() {
  return (
    <div className="w-full aspect-video">
      <MapProvider
        defaultCenter={[47.4979, 19.0404]}
        defaultZoom={14}
        defaultProjection="mercator"
      >
        <Map className="rounded-xl">
          <MapControls align="bottom-right">
            <MapControlGroup>
              <MapControlZoomIn />
              <MapControlZoomOut />
            </MapControlGroup>
            <MapControlGroup>
              <MapControlLocate />
              <MapControlFullscreen />
            </MapControlGroup>
          </MapControls>
          <MapCopyright title="vorhdam" />
        </Map>
      </MapProvider>
    </div>
  );
}
