"use client";

import * as MenuPrimitive from "@base-ui/react/menu";
import * as SliderPrimitive from "@base-ui/react/slider";
import {
  Check,
  Gauge,
  Maximize,
  Minimize,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Volume,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { useIsMobile } from "@/hooks/use-mobile";

import { cn } from "@/lib/utils";

type VideoContext = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  paused: boolean;
  setPaused: React.Dispatch<React.SetStateAction<boolean>>;
  progress: number;
  setProgress: React.Dispatch<React.SetStateAction<number>>;
  volume: number;
  setVolume: React.Dispatch<React.SetStateAction<number>>;
  loop: boolean;
  setLoop: React.Dispatch<React.SetStateAction<boolean>>;
  muted: boolean;
  setMuted: React.Dispatch<React.SetStateAction<boolean>>;
  fullscreen: boolean;
  setFullscreen: React.Dispatch<React.SetStateAction<boolean>>;
  playbackRate: number;
  setPlaybackRate: React.Dispatch<React.SetStateAction<number>>;
  duration: number;
  setDuration: React.Dispatch<React.SetStateAction<number>>;
  currentTime: number;
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
};

const DefaultVideoContext: VideoContext = {
  videoRef: { current: null },
  containerRef: { current: null },
  paused: true,
  setPaused: () => {},
  progress: 0,
  setProgress: () => {},
  volume: 1,
  setVolume: () => {},
  loop: false,
  setLoop: () => {},
  muted: false,
  setMuted: () => {},
  fullscreen: false,
  setFullscreen: () => {},
  playbackRate: 1,
  setPlaybackRate: () => {},
  duration: 0,
  setDuration: () => {},
  currentTime: 0,
  setCurrentTime: () => {},
};

const Context = React.createContext<VideoContext>(DefaultVideoContext);

if (typeof window !== "undefined") {
  const _error = console.error.bind(console);
  console.error = (...args) => {
    if (typeof args[0] === "string" && args[0].includes("script")) return;
    _error(...args);
  };
}

type VideoProviderProps = {
  defaultVolume?: number;
  defaultMuted?: boolean;
  defaultLoop?: boolean;
  defaultRate?: number;
};

function VideoProvider({
  defaultVolume = 0.5,
  defaultMuted = false,
  defaultLoop = false,
  defaultRate = 1,
  children,
}: VideoProviderProps & { children: React.ReactNode }) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const [paused, setPaused] = React.useState<boolean>(true);
  const [progress, setProgress] = React.useState<number>(0);
  const [volume, setVolume] = React.useState<number>(defaultVolume);
  const [muted, setMuted] = React.useState<boolean>(defaultMuted);
  const [loop, setLoop] = React.useState<boolean>(defaultLoop);
  const [playbackRate, setPlaybackRate] = React.useState<number>(defaultRate);
  const [fullscreen, setFullscreen] = React.useState<boolean>(false);
  const [duration, setDuration] = React.useState<number>(0);
  const [currentTime, setCurrentTime] = React.useState<number>(0);

  React.useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.volume = volume;
    videoRef.current.muted = muted;
    videoRef.current.playbackRate = playbackRate;
    videoRef.current.loop = loop;

    if (currentTime === duration && !loop) setPaused(true);
    setDuration(videoRef.current.duration);
  }, [volume, muted, playbackRate, loop, currentTime, duration]);

  const values = {
    videoRef,
    containerRef,
    paused,
    setPaused,
    progress,
    setProgress,
    volume,
    setVolume,
    loop,
    setLoop,
    muted,
    setMuted,
    fullscreen,
    setFullscreen,
    playbackRate,
    setPlaybackRate,
    duration,
    setDuration,
    currentTime,
    setCurrentTime,
  };

  return <Context.Provider value={values}>{children}</Context.Provider>;
}

function VideoPlayer({
  src,
  className,
  children,
  ...props
}: React.ComponentProps<"video">) {
  const mobile = useIsMobile();

  const {
    videoRef,
    containerRef,
    paused,
    fullscreen,
    setPaused,
    setCurrentTime,
    setProgress,
    setDuration,
  } = React.useContext(Context);

  const showControlRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [showControl, setShowControl] = React.useState<boolean>(false);

  const revealControls = React.useCallback(() => {
    setShowControl(true);
    if (showControlRef.current) clearTimeout(showControlRef.current);
    showControlRef.current = setTimeout(() => {
      setShowControl(false);
    }, 3000);
  }, [setShowControl]);

  const handleTouch = () => {
    handlePlay();
    revealControls();
  };

  const handlePlay = () => {
    if (!videoRef.current) return;
    if (paused) videoRef.current.play();
    else videoRef.current.pause();
    setPaused(!paused);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    setProgress(
      (videoRef.current.currentTime / videoRef.current.duration) * 100,
    );
  };

  const handleLoadedMetadata = () => {
    setDuration(videoRef.current?.duration || 0);
  };

  if (mobile)
    return (
      <div className="relative group overflow-hidden bg-secondary flex items-center justify-center transition-all rounded-xl aspect-video">
        <video
          src={src}
          className="w-full max-h-full transition-transform"
          playsInline
          controls
        />
      </div>
    );

  if (!mobile)
    return (
      <div
        ref={containerRef}
        className={cn(
          "relative group overflow-hidden bg-secondary flex items-center justify-center transition-all",
          fullscreen ? "w-screen h-screen" : "rounded-xl aspect-video",
          className,
        )}
      >
        <video
          ref={videoRef}
          src={src}
          className="w-full max-h-full transition-transform"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          playsInline
          {...props}
        />
        <div
          className={cn(
            "absolute inset-0 bg-background/20 transition-opacity flex flex-col justify-end p-2 bg-linear-to-t from-background/80 via-transparent to-transparent",
            "opacity-0 group-hover:opacity-100",
            showControl && "opacity-100",
          )}
        >
          <div
            className="size-full mb-3"
            onClick={handlePlay}
            onTouchEnd={handleTouch}
          />
          {children}
        </div>
      </div>
    );
}

function VideoControlSeek({
  className,
  ...props
}: SliderPrimitive.SliderRoot.Props) {
  const { videoRef, progress, setProgress } = React.useContext(Context);
  const value = [progress];

  const handleSeek = (value: number | readonly number[]) => {
    if (!videoRef.current?.duration) return;
    const nextValue = Array.isArray(value) ? value[0] : value;
    const newTime = (nextValue / 100) * videoRef.current.duration;
    videoRef.current.currentTime = newTime;
    setProgress(nextValue);
  };

  return (
    <div className="px-1 pb-2">
      <Slider
        value={value}
        max={100}
        step={0.1}
        onValueChange={handleSeek}
        className={cn("cursor-pointer", className)}
        {...props}
      />
    </div>
  );
}

function VideoControlList({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-center justify-between", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function VideoControlGroup({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      {children}
    </div>
  );
}

function VideoControlPlay({
  className,
  ...props
}: React.ComponentProps<"button">) {
  const { videoRef, paused, setPaused } = React.useContext(Context);

  const handlePlay = () => {
    if (!videoRef.current) return;
    if (paused) videoRef.current.play();
    else videoRef.current.pause();
    setPaused(!paused);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handlePlay}
      className={cn("text-white rounded-full aspect-square h-8", className)}
      {...props}
    >
      {paused ? (
        <Play className="fill-current stroke-0" />
      ) : (
        <Pause className="fill-current stroke-0" />
      )}
    </Button>
  );
}

function VideoControlTimer({ className }: React.ComponentProps<"button">) {
  const { currentTime, duration } = React.useContext(Context);
  const [reverse, setReverse] = React.useState<boolean>(false);

  const displayTime = reverse
    ? `-${Math.floor((duration - currentTime) / 60)}` +
      ":" +
      `${Math.floor((duration - currentTime) % 60)
        .toString()
        .padStart(2, "0")}`
    : `${Math.floor(currentTime / 60)}` +
      ":" +
      `${Math.floor(currentTime % 60)
        .toString()
        .padStart(2, "0")}`;

  const handleToggle = () => {
    setReverse(!reverse);
  };

  return (
    <div
      className={cn("text-white text-sm cursor-pointer", className)}
      onClick={handleToggle}
    >
      {displayTime}
      <span className="text-white/50 mx-1">/</span>
      {Math.floor(duration / 60)}:
      {Math.floor(duration % 60)
        .toString()
        .padStart(2, "0")}
    </div>
  );
}

function VideoControlPlaybackRate({
  rates,
  className,
  ...props
}: MenuPrimitive.MenuTrigger.Props & { rates: number[] }) {
  const { playbackRate, setPlaybackRate } = React.useContext(Context);

  const handlePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex items-center justify-center text-white rounded-full aspect-square h-8 hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 aria-expanded:bg-muted aria-expanded:text-foreground cursor-pointer",
          className,
        )}
        {...props}
      >
        <Gauge className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContainer
        align="end"
        className="bg-zinc-900 text-white border-zinc-800"
      >
        {rates.map((rate) => (
          <DropdownMenuItem
            key={rate}
            onClick={() => handlePlaybackRate(rate)}
            className="flex items-center justify-between focus:bg-zinc-800 focus:text-white"
          >
            {rate}x{playbackRate === rate && <Check className="size-4 ml-2" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContainer>
    </DropdownMenu>
  );
}

function VideoControlLoop({
  className,
  ...props
}: React.ComponentProps<"button">) {
  const { videoRef, loop, setLoop } = React.useContext(Context);

  const handleLoop = () => {
    if (!videoRef.current) return;
    setLoop(!loop);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleLoop}
      className={cn("text-white rounded-full aspect-square h-8", className)}
      {...props}
    >
      {loop ? <Repeat1 /> : <Repeat />}
    </Button>
  );
}

function VideoControlVolume({
  className,
  ...props
}: MenuPrimitive.MenuTrigger.Props) {
  const { muted, volume, setMuted, setVolume } = React.useContext(Context);

  const value = React.useMemo(
    () => [muted ? 0 : (Number(volume) || 0) * 100],
    [muted, volume],
  );

  const handleMute = () => {
    setMuted(!muted);
  };

  const handleVolume = (newVolume: number | readonly number[]) => {
    const nextValue = Array.isArray(newVolume) ? newVolume[0] : newVolume;
    setVolume(nextValue / 100);
    if (nextValue > 0) setMuted(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex items-center justify-center text-white rounded-full aspect-square h-8 hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 aria-expanded:bg-muted aria-expanded:text-foreground cursor-pointer",
          className,
        )}
        {...props}
      >
        <VolumeIcon className="size-4" muted={muted} volume={volume} />
      </DropdownMenuTrigger>
      <DropdownMenuContainer align="end" className="min-w-40">
        <div className="flex flex-row items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-accent-foreground/80 hover:bg-accent/20 rounded-full"
            onClick={handleMute}
          >
            <VolumeIcon muted={muted} volume={volume} />
          </Button>
          <Slider
            value={value}
            className="w-20 group-hover/volume:block transition-all mr-1.5"
            onValueChange={(v) => handleVolume(v)}
          />
        </div>
      </DropdownMenuContainer>
    </DropdownMenu>
  );
}

function VideoControlFullscreen({
  className,
  ...props
}: React.ComponentProps<"button">) {
  const { containerRef, fullscreen, setFullscreen } = React.useContext(Context);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleFullscreen}
      className={cn("text-white rounded-full aspect-square h-8", className)}
      {...props}
    >
      {fullscreen ? <Minimize /> : <Maximize />}
    </Button>
  );
}

function VolumeIcon({
  className,
  muted,
  volume,
}: {
  className?: string;
  muted: boolean;
  volume: number;
}) {
  if (muted || volume === 0) return <VolumeX className={className} />;
  if (volume > 0.66) return <Volume2 className={className} />;
  if (volume > 0.33) return <Volume1 className={className} />;
  return <Volume className={className} />;
}

function DropdownMenuContainer({
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  className,
  children,
}: {
  align?: MenuPrimitive.MenuPositioner.Props["align"];
  alignOffset?: number;
  side?: MenuPrimitive.MenuPositioner.Props["side"];
  sideOffset?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const { fullscreen, containerRef } = React.useContext(Context);
  const container = fullscreen ? containerRef : { current: undefined };

  return (
    <MenuPrimitive.Menu.Portal container={container.current}>
      <MenuPrimitive.Menu.Positioner
        className="isolate z-50 outline-none"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <MenuPrimitive.Menu.Popup
          data-slot="dropdown-menu-content"
          className={cn(
            "z-50 max-h-(--available-height) w-(--anchor-width) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 outline-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:overflow-hidden data-closed:fade-out-0 data-closed:zoom-out-95",
            className,
          )}
        >
          {children}
        </MenuPrimitive.Menu.Popup>
      </MenuPrimitive.Menu.Positioner>
    </MenuPrimitive.Menu.Portal>
  );
}

export {
  VideoControlFullscreen,
  VideoControlGroup,
  VideoControlList,
  VideoControlLoop,
  VideoControlPlay,
  VideoControlPlaybackRate,
  VideoControlSeek,
  VideoControlTimer,
  VideoControlVolume,
  VideoPlayer,
  VideoProvider,
};
