# Map

This component enables you to use a vector tile map with the help of [MapLibre](https://maplibre.org/), a GPU-accelerated opensource mapping package for a smooth and responsive experience. The component also has control options like zoom, fullscreen, locate, etc.

[Preview this component](https://vorhdam-registry.vercel.app/components/map)

### Installation

`bunx --bun shadcn@latest add https://vorhdam-registry.vercel.app/r/map.json`

### Usage

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
                <MapControlLocate />
                <MapControlFullscreen />
            </MapControlGroup>
        </MapControls>
        <MapMarkers>
            <MapMarker coords={{ latitude: 47.507092, longitude: 19.045636 }}>
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

## Extendability

You can extend the control options by editing the `@/components/ui/map.tsx` file that shadcn will create.

You can add new map variables as `React states` to the `React context` and access or modify them in subcomponents later. For example if you want to add a shadcn switch in the control bar:

```
function MapControlSwitch() {
  return (<Switch />)
}
```
