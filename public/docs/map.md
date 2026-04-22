# Map

This component enables you to use a vector tile map with the help of [MapLibre](https://maplibre.org/), a GPU-accelerated opensource mapping package for a smooth and responsive experience. The component also has control options like zoom, fullscreen, locate, etc.

[Preview this component](https://vorhdam-registry.vercel.app/components/map)

### Installation

`bunx --bun shadcn@latest add https://vorhdam-registry.vercel.app/r/map.json`

### Usage

It uses a simple coordinate system called [EPSG:4326](https://epsg.io/4326) which takes latitude and longitude to define a point on Earth's surface. You can import a `Coordinate` type from `@/components/ui/map.tsx`.
For projections you can use `mercator` and `globe` as these are the most widely used projections. You can import a `Projection` type from `@/components/ui/map.tsx`.
If you want a different map style you can add your own to the Map component as `<Map style={...}/>`. You can browse styles at [Carto](https://carto.com/basemaps/) or at other third party sites.

```
<MapProvider
    defaultCenter={{ latitude: 47.4979, longitude: 19.0404 }}
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
                <MapControlPitchUp />
                <MapControlPitchDown />
                <MapControlRotate />
            </MapControlGroup>
            <MapControlGroup>
                <MapControlProjection />
                <MapControlLocate />
                <MapControlFullscreen />
            </MapControlGroup>
        </MapControls>
        <MapMarkers>
            <MapMarker coordinates={{ latitude: 47.507092, longitude: 19.045636 }}>
                <MapMarkerIcon />
                <MapMarkerPopup>
                    <Card>
                        ...
                    </Card>
                </MapMarkerPopup>
            </MapMarker>
        </MapMarkers>
        <MapCopyright title="vorhdam" />
    </Map>
</MapProvider>
```

### Dependencies

It uses good old shadcn components including: `button` and `button-group`.
The main dependency is of course the [maplibre-gl](https://www.npmjs.com/package/maplibre-gl) NPM package whcih renders the entire map.

### Extendability

You can extend the control options by editing the `@/components/ui/map.tsx` file that shadcn will create.

You can add new map variables as `React states` to the `React context` and access or modify them in subcomponents later. For example if you want to add a shadcn switch in the control bar:

```
function MapControlSwitch() {
  return (<Switch />)
}
```
