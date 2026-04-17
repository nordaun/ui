"use client";

import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Locate,
  MapPin,
  Maximize,
  Minimize,
  Minus,
  Plus,
} from "lucide-react";
import {
  MapLibreMap,
  MapOptions,
  Marker,
  MarkerOptions,
  Popup,
  PopupOptions,
  StyleSpecification,
} from "maplibre-gl";
import * as React from "react";

import { Button } from "./button";
import { ButtonGroup } from "./button-group";
import { Loading } from "./loading";

import { cn } from "@/lib/utils";
import "maplibre-gl/dist/maplibre-gl.css";
import { createPortal } from "react-dom";

type Theme = "light" | "dark";
type Coordinates = { latitude: number; longitude: number };
type MapStyle = string | StyleSpecification;
type MapProjection = "mercator" | "globe";

const defaultStyles: Record<Theme, MapStyle> = {
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
};

function getDocumentTheme(): Theme | null {
  if (typeof document === "undefined") return null;
  if (document.documentElement.classList.contains("dark")) return "dark";
  if (document.documentElement.classList.contains("light")) return "light";
  return null;
}

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function useTheme(defaultTheme?: Theme): Theme {
  const [theme, setTheme] = React.useState<Theme>(
    () => getDocumentTheme() ?? getSystemTheme(),
  );

  React.useEffect(() => {
    if (defaultTheme) return;

    const observer = new MutationObserver(() => {
      const docTheme = getDocumentTheme();
      if (docTheme) setTheme(docTheme);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = (e: MediaQueryListEvent) => {
      if (!getDocumentTheme()) setTheme(e.matches ? "dark" : "light");
    };
    mediaQuery.addEventListener("change", handleSystemChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", handleSystemChange);
    };
  }, [defaultTheme]);

  return defaultTheme ?? theme;
}

type MapContext = {
  mapRef: React.RefObject<MapLibreMap | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  loaded: boolean;
  setLoaded: React.Dispatch<React.SetStateAction<boolean>>;
  projection: MapProjection;
  setProjection: React.Dispatch<React.SetStateAction<MapProjection>>;
  center: Coordinates;
  setCenter: React.Dispatch<React.SetStateAction<Coordinates>>;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  bearing: number;
  setBearing: React.Dispatch<React.SetStateAction<number>>;
  pitch: number;
  setPitch: React.Dispatch<React.SetStateAction<number>>;
  fullscreen: boolean;
  setFullscreen: React.Dispatch<React.SetStateAction<boolean>>;
};

const DefaultMapContext: MapContext = {
  mapRef: { current: null },
  containerRef: { current: null },
  loaded: false,
  setLoaded: () => {},
  projection: "mercator",
  setProjection: () => {},
  center: { latitude: 47.4979, longitude: 19.0404 },
  setCenter: () => {},
  zoom: 1,
  setZoom: () => {},
  bearing: 0,
  setBearing: () => {},
  pitch: 0,
  setPitch: () => {},
  fullscreen: false,
  setFullscreen: () => {},
};

const Context = React.createContext<MapContext>(DefaultMapContext);

type MapProviderProps = {
  defaultCenter?: Coordinates;
  defaultZoom?: number;
  defaultBearing?: number;
  defaultPitch?: number;
  defaultProjection?: MapProjection;
  children: React.ReactNode;
};

function MapProvider({
  defaultCenter = { latitude: 47.4979, longitude: 19.0404 },
  defaultZoom = 8,
  defaultBearing = 0,
  defaultPitch = 0,
  defaultProjection = "mercator",
  children,
}: MapProviderProps) {
  const mapRef = React.useRef<MapLibreMap>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const [loaded, setLoaded] = React.useState<boolean>(false);
  const [zoom, setZoom] = React.useState<number>(defaultZoom);
  const [bearing, setBearing] = React.useState<number>(defaultBearing);
  const [pitch, setPitch] = React.useState<number>(defaultPitch);
  const [fullscreen, setFullscreen] = React.useState<boolean>(false);
  const [center, setCenter] = React.useState<Coordinates>(defaultCenter);
  const [projection, setProjection] =
    React.useState<MapProjection>(defaultProjection);

  const values: MapContext = {
    mapRef,
    containerRef,
    projection,
    setProjection,
    loaded,
    setLoaded,
    center,
    setCenter,
    zoom,
    setZoom,
    bearing,
    setBearing,
    pitch,
    setPitch,
    fullscreen,
    setFullscreen,
  };

  return <Context.Provider value={values}>{children}</Context.Provider>;
}

type MapProps = {
  children?: React.ReactNode;
  className?: string;
  theme?: Theme;
  styles?: Record<Theme, MapStyle>;
  onViewportChange?: (viewport: {
    center: Coordinates;
    zoom: number;
    bearing: number;
    pitch: number;
  }) => void;
} & Omit<MapOptions, "container" | "style">;

function Map({
  children,
  className,
  theme: themeProp,
  styles,
  onViewportChange,
  ...props
}: MapProps) {
  const {
    mapRef,
    containerRef,
    loaded,
    setLoaded,
    projection,
    center: initialCenter,
    setCenter,
    zoom: initialZoom,
    setZoom,
    bearing: initialBearing,
    setBearing,
    pitch: initialPitch,
    setPitch,
  } = React.useContext(Context);

  const resolvedTheme = useTheme(themeProp);
  const [isStyleLoaded, setIsStyleLoaded] = React.useState(false);

  const mapStyles = React.useMemo(
    () => ({
      dark: styles?.dark ?? defaultStyles.dark,
      light: styles?.light ?? defaultStyles.light,
    }),
    [styles],
  );

  const currentStyleRef = React.useRef<MapStyle | null>(null);
  const styleTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const onViewportChangeRef = React.useRef(onViewportChange);
  onViewportChangeRef.current = onViewportChange;

  const clearStyleTimeout = React.useCallback(() => {
    if (styleTimeoutRef.current) {
      clearTimeout(styleTimeoutRef.current);
      styleTimeoutRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    if (!containerRef.current) return;

    const initialStyle =
      resolvedTheme === "dark" ? mapStyles.dark : mapStyles.light;
    currentStyleRef.current = initialStyle;

    const map = new MapLibreMap({
      container: containerRef.current,
      style: initialStyle,
      center: [initialCenter.longitude, initialCenter.latitude],
      zoom: initialZoom,
      bearing: initialBearing,
      pitch: initialPitch,
      renderWorldCopies: true,
      attributionControl: false,
      ...props,
    });

    mapRef.current = map;

    const handleStyleData = () => {
      clearStyleTimeout();
      styleTimeoutRef.current = setTimeout(() => {
        setIsStyleLoaded(true);
        if (projection) map.setProjection({ type: projection });
      }, 100);
    };

    const handleLoad = () => setLoaded(true);

    const handleMove = () => {
      const c = map.getCenter();
      const viewport = {
        center: { latitude: c.lat, longitude: c.lng } as Coordinates,
        zoom: map.getZoom(),
        bearing: map.getBearing(),
        pitch: map.getPitch(),
      };
      setCenter(viewport.center);
      setZoom(viewport.zoom);
      setBearing(viewport.bearing);
      setPitch(viewport.pitch);
      onViewportChangeRef.current?.(viewport);
    };

    map.on("load", handleLoad);
    map.on("styledata", handleStyleData);
    map.on("move", handleMove);

    return () => {
      clearStyleTimeout();
      map.off("load", handleLoad);
      map.off("styledata", handleStyleData);
      map.off("move", handleMove);
      map.remove();
      mapRef.current = null;
      setLoaded(false);
      setIsStyleLoaded(false);
    };
  }, []);

  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const newStyle =
      resolvedTheme === "dark" ? mapStyles.dark : mapStyles.light;
    if (currentStyleRef.current === newStyle) return;

    clearStyleTimeout();
    currentStyleRef.current = newStyle;
    setIsStyleLoaded(false);
    map.setStyle(newStyle, { diff: true });
  }, [resolvedTheme, mapStyles, clearStyleTimeout, mapRef]);

  const isReady = loaded && isStyleLoaded;

  return (
    <div
      ref={containerRef}
      className={cn("relative h-full w-full overflow-hidden", className)}
    >
      {(!isReady || !loaded) && <Loading />}
      {mapRef.current && children}
    </div>
  );
}

function MapCopyright({ title }: { title?: string }) {
  return (
    <span className="absolute bottom-1 right-2 z-20 text-card-foreground/75 bg-card/50 rounded-full px-2 border border-border select-none">
      {title ? `${title} | ` : ""}© CARTO, © OpenStreetMap contributors
    </span>
  );
}

type MapControlsProps = {
  align?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  className?: string;
  children: React.ReactNode;
};

const controlPositionClasses: Record<
  NonNullable<MapControlsProps["align"]>,
  string
> = {
  "top-left": "top-2 left-2",
  "top-right": "top-2 right-2",
  "bottom-left": "bottom-10 left-2",
  "bottom-right": "bottom-10 right-2",
};

function MapControls({
  align = "bottom-right",
  className,
  children,
}: MapControlsProps) {
  return (
    <div
      className={cn(
        "absolute z-10 flex flex-col gap-2",
        controlPositionClasses[align],
        className,
      )}
    >
      {children}
    </div>
  );
}

function MapControlGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <ButtonGroup
      orientation={"vertical"}
      className={cn("bg-card rounded-lg min-h-9 flex", className)}
    >
      {children}
    </ButtonGroup>
  );
}

function MapControlZoomIn({ className }: { className?: string }) {
  const { mapRef } = React.useContext(Context);

  const handleZoomIn = () => {
    mapRef.current?.zoomTo((mapRef.current.getZoom() ?? 0) + 1, {
      duration: 300,
    });
  };

  return (
    <Button
      onClick={handleZoomIn}
      className={cn("min-h-8 grow max-w-9", className)}
      size="sm"
      variant={"outline"}
    >
      <Plus />
    </Button>
  );
}

function MapControlZoomOut({ className }: { className?: string }) {
  const { mapRef } = React.useContext(Context);

  const handleZoomOut = () => {
    mapRef.current?.zoomTo((mapRef.current.getZoom() ?? 0) - 1, {
      duration: 300,
    });
  };

  return (
    <Button
      onClick={handleZoomOut}
      className={cn("min-h-8 grow max-w-9", className)}
      size="sm"
      variant={"outline"}
    >
      <Minus />
    </Button>
  );
}

function MapControlPitchUp({ className }: { className?: string }) {
  const { mapRef, pitch, setPitch } = React.useContext(Context);

  const handlePitchUp = () => {
    const currentPitch = mapRef.current?.getPitch() ?? pitch ?? 0;
    const newPitch = Math.min(currentPitch + 15, 85);
    mapRef.current?.flyTo({
      pitch: newPitch,
      duration: 500,
    });
    setPitch(newPitch);
  };

  return (
    <Button
      onClick={handlePitchUp}
      className={cn("min-h-8 grow max-w-9", className)}
      size="sm"
      variant={"outline"}
    >
      <ChevronUp />
    </Button>
  );
}

function MapControlPitchDown({ className }: { className?: string }) {
  const { mapRef, pitch, setPitch } = React.useContext(Context);

  const handlePitchDown = () => {
    const currentPitch = mapRef.current?.getPitch() ?? pitch ?? 0;
    const newPitch = Math.max(currentPitch - 15, 0);
    mapRef.current?.flyTo({
      pitch: newPitch,
      duration: 500,
    });
    setPitch(newPitch);
  };

  return (
    <Button
      onClick={handlePitchDown}
      className={cn("min-h-8 grow max-w-9", className)}
      size="sm"
      variant={"outline"}
    >
      <ChevronDown />
    </Button>
  );
}

function MapControlRotate({ className }: { className?: string }) {
  const { mapRef } = React.useContext(Context);
  const compassRef = React.useRef<SVGSVGElement>(null);
  const currentRef = React.useRef<number>(0);
  const previousRef = React.useRef<number>(0);

  React.useEffect(() => {
    const map = mapRef.current;
    if (!map || !compassRef.current) return;

    const compass = compassRef.current;
    const update = () => {
      const b = map.getBearing();
      const p = map.getPitch();

      let delta = b - previousRef.current;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;

      currentRef.current += delta;
      previousRef.current = b;

      compass.style.transform = `rotateX(${p}deg) rotateZ(${-currentRef.current}deg)`;
    };

    map.on("rotate", update);
    map.on("pitch", update);
    update();

    return () => {
      map.off("rotate", update);
      map.off("pitch", update);
    };
  }, [mapRef]);

  const handleReset = () => {
    mapRef.current?.resetNorthPitch({ duration: 300 });
  };

  return (
    <Button
      onClick={handleReset}
      className={cn("min-h-8 grow max-w-9", className)}
      size="sm"
      variant={"outline"}
    >
      <svg
        ref={compassRef}
        viewBox="0 0 24 24"
        className="size-5 transition-transform duration-500"
        style={{ transformStyle: "preserve-3d" }}
        aria-hidden
      >
        <path d="M12 2L16 12H12V2Z" className="fill-primary" />
        <path d="M12 2L8 12H12V2Z" className="fill-primary/60" />
        <path d="M12 22L16 12H12V22Z" className="fill-muted-foreground/60" />
        <path d="M12 22L8 12H12V22Z" className="fill-muted-foreground/30" />
      </svg>
    </Button>
  );
}

function MapControlFullscreen({ className }: { className?: string }) {
  const { mapRef, fullscreen, setFullscreen } = React.useContext(Context);

  const handleFullscreen = () => {
    const container = mapRef.current?.getContainer();
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setFullscreen(false);
    } else {
      container.requestFullscreen();
      setFullscreen(true);
    }
  };

  React.useEffect(() => {
    const handler = () => {
      if (!document.fullscreenElement) setFullscreen(false);
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, [setFullscreen]);

  return (
    <Button
      onClick={handleFullscreen}
      className={cn("min-h-8 grow max-w-9", className)}
      size="sm"
      variant={"outline"}
    >
      {fullscreen ? <Minimize /> : <Maximize />}
    </Button>
  );
}

type MapControlLocateProps = {
  className?: string;
  onLocate?: (coords: Coordinates) => void;
};

function MapControlLocate({ className, onLocate }: MapControlLocateProps) {
  const { mapRef } = React.useContext(Context);
  const [loading, setLoading] = React.useState(false);

  const handleLocate = () => {
    if (!("geolocation" in navigator)) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          longitude: pos.coords.longitude,
          latitude: pos.coords.latitude,
        };
        mapRef.current?.flyTo({
          center: [coords.longitude, coords.latitude],
          zoom: 14,
          duration: 1500,
        });
        onLocate?.(coords);
        setLoading(false);
      },
      (err) => {
        console.error("Geolocation error:", err);
        setLoading(false);
      },
    );
  };

  return (
    <Button
      onClick={handleLocate}
      disabled={loading}
      className={cn("min-h-8 grow max-w-9", className)}
      size="sm"
      variant={"outline"}
    >
      {loading ? <Loader2 className="animate-spin" /> : <Locate />}
    </Button>
  );
}

function MapMarkers({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("contents", className)}>{children}</div>;
}

type MarkerContextValue = { marker: Marker };

const MarkerContext = React.createContext<MarkerContextValue | null>(null);

function useMarkerContext() {
  const ctx = React.useContext(MarkerContext);
  if (!ctx)
    throw new Error("Marker subcomponents must be used within MapMarker");
  return ctx;
}

type MapMarkerProps = {
  coords: Coordinates;
  children: React.ReactNode;
  onClick?: (e: MouseEvent) => void;
  onMouseEnter?: (e: MouseEvent) => void;
  onMouseLeave?: (e: MouseEvent) => void;
  onDragStart?: (lngLat: { lng: number; lat: number }) => void;
  onDrag?: (lngLat: { lng: number; lat: number }) => void;
  onDragEnd?: (lngLat: { lng: number; lat: number }) => void;
} & Omit<MarkerOptions, "element">;

function MapMarker({
  coords,
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onDragStart,
  onDrag,
  onDragEnd,
  draggable = false,
  ...markerOptions
}: MapMarkerProps) {
  const { mapRef, loaded } = React.useContext(Context);

  const callbacksRef = React.useRef({
    onClick,
    onMouseEnter,
    onMouseLeave,
    onDragStart,
    onDrag,
    onDragEnd,
  });
  callbacksRef.current = {
    onClick,
    onMouseEnter,
    onMouseLeave,
    onDragStart,
    onDrag,
    onDragEnd,
  };

  const marker = React.useMemo(() => {
    const el = document.createElement("div");
    const instance = new Marker({
      ...markerOptions,
      element: el,
      draggable,
    }).setLngLat([coords.longitude, coords.latitude]);

    el.addEventListener("click", (e) => callbacksRef.current.onClick?.(e));
    el.addEventListener("mouseenter", (e) =>
      callbacksRef.current.onMouseEnter?.(e),
    );
    el.addEventListener("mouseleave", (e) =>
      callbacksRef.current.onMouseLeave?.(e),
    );

    instance.on("dragstart", () => {
      const ll = instance.getLngLat();
      callbacksRef.current.onDragStart?.({ lng: ll.lng, lat: ll.lat });
    });
    instance.on("drag", () => {
      const ll = instance.getLngLat();
      callbacksRef.current.onDrag?.({ lng: ll.lng, lat: ll.lat });
    });
    instance.on("dragend", () => {
      const ll = instance.getLngLat();
      callbacksRef.current.onDragEnd?.({ lng: ll.lng, lat: ll.lat });
    });

    return instance;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add / remove from map
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded) return;
    marker.addTo(map);
    return () => {
      marker.remove();
    };
  }, [mapRef, loaded, marker]);

  if (
    marker.getLngLat().lng !== coords.longitude ||
    marker.getLngLat().lat !== coords.latitude
  )
    marker.setLngLat([coords.longitude, coords.latitude]);

  if (marker.isDraggable() !== draggable) marker.setDraggable(draggable);

  const currentOffset = marker.getOffset();
  const rawOffset = markerOptions.offset ?? [0, 0];
  const [ox, oy] = Array.isArray(rawOffset)
    ? rawOffset
    : [rawOffset.x, rawOffset.y];
  if (currentOffset.x !== ox || currentOffset.y !== oy)
    marker.setOffset(rawOffset);

  if (marker.getRotation() !== (markerOptions.rotation ?? 0))
    marker.setRotation(markerOptions.rotation ?? 0);

  return (
    <MarkerContext.Provider value={{ marker }}>
      {children}
    </MarkerContext.Provider>
  );
}

type MarkerIconProps = {
  children?: React.ReactNode;
  className?: string;
};

function MapMarkerIcon({ children, className }: MarkerIconProps) {
  const { marker } = useMarkerContext();
  return createPortal(
    <div className={cn("relative cursor-pointer", className)}>
      {children ?? (
        <div className="flex items-center justify-center relative size-6 rounded-full bg-primary">
          <MapPin className="size-5 text-primary-foreground stroke-2.5" />
        </div>
      )}
    </div>,
    marker.getElement(),
  );
}

type MarkerPopupProps = {
  children: React.ReactNode;
  className?: string;
  closeButton?: boolean;
} & Omit<PopupOptions, "className" | "closeButton">;

function MapMarkerPopup({
  children,
  className,
  closeButton = false,
  ...popupOptions
}: MarkerPopupProps) {
  const { marker } = useMarkerContext();
  const { mapRef, loaded } = React.useContext(Context);
  const container = React.useMemo(() => document.createElement("div"), []);
  const prevOptions = React.useRef(popupOptions);

  const popup = React.useMemo(
    () =>
      new Popup({
        offset: 16,
        ...popupOptions,
        closeButton: false,
      })
        .setMaxWidth("none")
        .setDOMContent(container),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  React.useEffect(() => {
    if (!mapRef.current || !loaded) return;

    // Inject style reset directly into the container's parent when added to map
    const content = container.parentElement;
    if (content && content.classList.contains("maplibregl-popup-content")) {
      content.style.background = "transparent";
      content.style.padding = "0";
      content.style.boxShadow = "none";

      const tip = content.parentElement?.querySelector(
        ".maplibregl-popup-tip",
      ) as HTMLElement;
      if (tip) tip.style.display = "none";
    }

    popup.setDOMContent(container);
    marker.setPopup(popup);

    return () => {
      marker.setPopup(null);
    };
  }, [loaded]);

  React.useEffect(() => {
    if (!mapRef.current || !loaded) return;
    popup.setDOMContent(container);
    marker.setPopup(popup);
    return () => {
      marker.setPopup(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  if (popup.isOpen()) {
    const prev = prevOptions.current;
    if (prev.offset !== popupOptions.offset)
      popup.setOffset(popupOptions.offset ?? 16);
    if (prev.maxWidth !== popupOptions.maxWidth && popupOptions.maxWidth)
      popup.setMaxWidth(popupOptions.maxWidth);
    prevOptions.current = popupOptions;
  }

  const handleClose = () => popup.remove();

  return createPortal(children, container);
}

export {
  Map,
  MapControlFullscreen,
  MapControlGroup,
  MapControlLocate,
  MapControlPitchDown,
  MapControlPitchUp,
  MapControlRotate,
  MapControls,
  MapControlZoomIn,
  MapControlZoomOut,
  MapCopyright,
  MapMarker,
  MapMarkerIcon,
  MapMarkerPopup,
  MapMarkers,
  MapProvider,
  type Coordinates,
};
