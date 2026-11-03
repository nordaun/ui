import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "cn";
import { MapPin } from "lucide-react";
import Image from "next/image";

type Location = {
  coords: Coordinate;
  id: string;
  title: string;
  description: string;
  color: string;
};

const locations: Location[] = [
  {
    id: "budapest",
    coords: { latitude: 47.507092, longitude: 19.045636 },
    title: "Budapest, Hungary",
    description:
      "The Pearl of the Danube, renowned for its grand architecture, thermal baths, and vibrant ruin bar scene.",
    color: "bg-rose-500",
  },
  {
    id: "copenhagen",
    coords: { latitude: 55.679787, longitude: 12.590716 },
    title: "Copenhagen, Denmark",
    description:
      "A cozy Scandinavian capital celebrated for its colorful harbor, cycling culture, and world-class design.",
    color: "bg-violet-500",
  },
  {
    id: "dublin",
    coords: { latitude: 53.346948, longitude: -6.241303 },
    title: "Dublin, Ireland",
    description:
      "A historic city steeped in literary heritage, lively pub culture, and warm Irish hospitality.",
    color: "bg-amber-500",
  },
  {
    id: "istanbul",
    coords: { latitude: 41.016141, longitude: 28.963954 },
    title: "Istanbul, Türkiye",
    description:
      "A bustling metropolis straddling Europe and Asia, famous for its rich history, grand mosques, and vibrant bazaars.",
    color: "bg-sky-500",
  },
  {
    id: "madrid",
    coords: { latitude: 40.418746, longitude: -3.697326 },
    title: "Madrid, Spain",
    description:
      "Spain's energetic heart, known for its elegant boulevards, world-class art museums, and bustling night life.",
    color: "bg-emerald-500",
  },
  {
    id: "milan",
    coords: { latitude: 45.464292, longitude: 9.191903 },
    title: "Milan, Italy",
    description:
      "Italy's global capital of fashion and finance, featuring stunning Gothic architecture and high-end shopping.",
    color: "bg-fuchsia-500",
  },
  {
    id: "paris",
    coords: { latitude: 48.873867, longitude: 2.295043 },
    title: "Paris, France",
    description:
      "The City of Light, iconic for its art galleries, haute cuisine, romantic cafes, and landmark monuments.",
    color: "bg-indigo-500",
  },
  {
    id: "warsaw",
    coords: { latitude: 52.2477756, longitude: 21.014719 },
    title: "Warsaw, Poland",
    description:
      "A resilient metropolis blending a meticulously restored Old Town with a modern, dynamic skyline.",
    color: "bg-orange-500",
  },
];

// START

import {
  Coordinate,
  Map,
  MapControlFullscreen,
  MapControlGroup,
  MapControlLocate,
  MapControlPitchDown,
  MapControlPitchUp,
  MapControlProjection,
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
} from "@/components/ui/map";

export default function MapDemo() {
  return (
    <div className="aspect-video w-full">
      <MapProvider
        defaultCenter={{ latitude: 47.8053, longitude: 13.0414 }}
        defaultZoom={2.75}
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
            {locations.map((l) => (
              <MapMarker key={l.id} coordinates={l.coords}>
                <MapMarkerIcon>
                  <div
                    className={cn(
                      "flex items-center justify-center relative size-6 rounded-full",
                      l.color,
                    )}
                  >
                    <MapPin className="size-5 text-white stroke-2.5" />
                  </div>
                </MapMarkerIcon>
                <MapMarkerPopup>
                  <Card className="relative mx-auto w-full min-w-2xs pt-0">
                    <div
                      className={cn(
                        "relative max-w-2xs aspect-video overflow-hidden",
                        l.color,
                      )}
                    >
                      <Image
                        width={1920}
                        height={1080}
                        src={`/assets/cities/${l.id}.webp`}
                        alt={l.title}
                        className="relative z-20 object-cover grayscale mix-blend-multiply m-0 rounded-none"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle className="font-semibold">{l.title}</CardTitle>
                      <CardDescription>{l.description}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Button className="w-full">View</Button>
                    </CardFooter>
                  </Card>
                </MapMarkerPopup>
              </MapMarker>
            ))}
          </MapMarkers>
          <MapCopyright title="Nordaun" />
        </Map>
      </MapProvider>
    </div>
  );
}
// END

export const keywords = [
  "shadcn",
  "base ui",
  "react",
  "component",
  "map",
  "vector",
  "controls",
];
