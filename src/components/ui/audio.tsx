"use client";

import { MenuTrigger } from "@base-ui/react";
import {
  Check,
  Gauge,
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

import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Slider } from "./slider";

import { cn } from "@/lib/utils";

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

type AudioContext = {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  analyserRef: React.RefObject<AnalyserNode | null>;
  graphRef: React.RefObject<globalThis.AudioContext | null>;
  paused: boolean;
  setPaused: React.Dispatch<React.SetStateAction<boolean>>;
  progress: number;
  setProgress: React.Dispatch<React.SetStateAction<number>>;
  volume: number;
  setVolume: React.Dispatch<React.SetStateAction<number>>;
  muted: boolean;
  setMuted: React.Dispatch<React.SetStateAction<boolean>>;
  loop: boolean;
  setLoop: React.Dispatch<React.SetStateAction<boolean>>;
  playbackRate: number;
  setPlaybackRate: React.Dispatch<React.SetStateAction<number>>;
  duration: number;
  setDuration: React.Dispatch<React.SetStateAction<number>>;
  currentTime: number;
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
};

const DefaultAudioContext: AudioContext = {
  audioRef: { current: null },
  containerRef: { current: null },
  analyserRef: { current: null },
  graphRef: { current: null },
  paused: true,
  setPaused: () => {},
  progress: 0,
  setProgress: () => {},
  volume: 1,
  setVolume: () => {},
  muted: false,
  setMuted: () => {},
  loop: false,
  setLoop: () => {},
  playbackRate: 1,
  setPlaybackRate: () => {},
  duration: 0,
  setDuration: () => {},
  currentTime: 0,
  setCurrentTime: () => {},
};

if (typeof window !== "undefined") {
  const _error = console.error.bind(console);
  console.error = (...args) => {
    if (typeof args[0] === "string" && args[0].includes("script")) return;
    _error(...args);
  };
}

const WaveformCache = new WeakMap<
  HTMLAudioElement,
  { ctx: globalThis.AudioContext; analyser: AnalyserNode }
>();

const Context = React.createContext<AudioContext>(DefaultAudioContext);

type AudioProviderProps = {
  defaultVolume?: number;
  defaultMuted?: boolean;
  defaultLoop?: boolean;
  defaultRate?: number;
  children: React.ReactNode;
};

function AudioProvider({
  defaultVolume = 0.5,
  defaultMuted = false,
  defaultLoop = false,
  defaultRate = 1,
  children,
}: AudioProviderProps) {
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const analyserRef = React.useRef<AnalyserNode>(null);
  const graphRef = React.useRef<globalThis.AudioContext>(null);

  const [paused, setPaused] = React.useState<boolean>(true);
  const [progress, setProgress] = React.useState<number>(0);
  const [volume, setVolume] = React.useState<number>(defaultVolume);
  const [muted, setMuted] = React.useState<boolean>(defaultMuted);
  const [loop, setLoop] = React.useState<boolean>(defaultLoop);
  const [playbackRate, setPlaybackRate] = React.useState<number>(defaultRate);
  const [duration, setDuration] = React.useState<number>(0);
  const [currentTime, setCurrentTime] = React.useState<number>(0);

  React.useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
    audioRef.current.muted = muted;
    audioRef.current.playbackRate = playbackRate;
    audioRef.current.loop = loop;
    setDuration(audioRef.current.duration);

    if (WaveformCache.has(audioRef.current)) {
      const cached = WaveformCache.get(audioRef.current)!;
      analyserRef.current = cached.analyser;
      graphRef.current = cached.ctx;
      return;
    }

    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const source = ctx.createMediaElementSource(audioRef.current);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyser.connect(ctx.destination);

    analyserRef.current = analyser;
    graphRef.current = ctx;
    WaveformCache.set(audioRef.current, { ctx, analyser });
  }, [volume, muted, playbackRate, loop]);

  const values = {
    audioRef,
    containerRef,
    analyserRef,
    graphRef,
    paused,
    setPaused,
    progress,
    setProgress,
    volume,
    setVolume,
    muted,
    setMuted,
    loop,
    setLoop,
    playbackRate,
    setPlaybackRate,
    duration,
    setDuration,
    currentTime,
    setCurrentTime,
  };

  return <Context.Provider value={values}>{children}</Context.Provider>;
}

function AudioPlayer({
  src,
  className,
  children,
  ...props
}: React.ComponentProps<"audio">) {
  const {
    audioRef,
    containerRef,
    setPaused,
    setCurrentTime,
    setProgress,
    setDuration,
  } = React.useContext(Context);

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
    setProgress(
      (audioRef.current.currentTime / audioRef.current.duration) * 100,
    );
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current?.duration || 0);
  };

  const handleEnded = () => {
    setPaused(true);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex items-center gap-3 bg-accent/60 rounded-xl px-3 py-2 min-h-14 dark:bg-card",
        className,
      )}
    >
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        playsInline
        {...props}
      />
      <div className="flex items-center justify-between w-full gap-2">
        {children}
      </div>
    </div>
  );
}

function AudioControlSeek({ className }: { className?: string }) {
  const { audioRef, setProgress, setCurrentTime } = React.useContext(Context);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const newTime = ratio * audioRef.current.duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress(ratio * 100);
  };

  return (
    <div
      ref={wrapperRef}
      className={cn("flex-1 flex items-center", className)}
      onClick={handleClick}
    >
      <Waveform className="w-full" />
    </div>
  );
}

function AudioControlGroup({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex items-center gap-1", className)} {...props}>
      {children}
    </div>
  );
}

function AudioControlPlay({
  className,
  ...props
}: React.ComponentProps<"button">) {
  const { audioRef, graphRef, paused, setPaused } = React.useContext(Context);

  const handlePlay = async () => {
    if (!audioRef.current) return;
    if (paused) {
      await graphRef.current?.resume();
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
    setPaused(!paused);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handlePlay}
      className={cn(
        "text-card-foreground rounded-full aspect-square h-8",
        className,
      )}
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

function AudioControlTimer({ className }: React.ComponentProps<"button">) {
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
      className={cn(
        "text-card-foreground text-sm cursor-pointer mx-1.5",
        className,
      )}
      onClick={handleToggle}
    >
      {displayTime}
      <span className="text-card-foreground/50 mx-1">/</span>
      {Math.floor(duration / 60)}:
      {Math.floor(duration % 60)
        .toString()
        .padStart(2, "0")}
    </div>
  );
}

function AudioControlPlaybackRate({
  rates,
  className,
  ...props
}: MenuTrigger.Props & { rates: number[] }) {
  const { playbackRate, setPlaybackRate } = React.useContext(Context);

  const handlePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "inline-flex items-center justify-center text-card-foreground rounded-full aspect-square h-8 hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 aria-expanded:bg-muted aria-expanded:text-foreground cursor-pointer",
          className,
        )}
        {...props}
      >
        <Gauge className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-card text-card-foreground border-border"
      >
        {rates.map((rate) => (
          <DropdownMenuItem
            key={rate}
            onClick={() => handlePlaybackRate(rate)}
            className="flex items-center justify-between focus:bg-accent focus:text-card-foreground"
          >
            {rate}x{playbackRate === rate && <Check className="size-4 ml-2" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AudioControlLoop({
  className,
  ...props
}: React.ComponentProps<"button">) {
  const { audioRef, loop, setLoop } = React.useContext(Context);

  const handleLoop = () => {
    if (!audioRef.current) return;
    setLoop(!loop);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleLoop}
      className={cn(
        "text-card-foreground rounded-full aspect-square h-8",
        className,
      )}
      {...props}
    >
      {loop ? <Repeat1 /> : <Repeat />}
    </Button>
  );
}

function AudioControlVolume({ className, ...props }: MenuTrigger.Props) {
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
          "inline-flex items-center justify-center text-card-foreground rounded-full aspect-square h-8 hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 aria-expanded:bg-muted aria-expanded:text-foreground cursor-pointer",
          className,
        )}
        {...props}
      >
        <VolumeIcon className="size-4" muted={muted} volume={volume} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Waveform({
  className,
  playedClassName = "bg-primary",
  unplayedClassName = "bg-primary/20",
}: {
  className?: string;
  playedClassName?: string;
  unplayedClassName?: string;
}) {
  const BAR_W = 3;
  const BAR_GAP = 2;
  const TRANSITION_SPEED = 0.08;

  const { analyserRef, paused, progress } = React.useContext(Context);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const barsRef = React.useRef<(HTMLDivElement | null)[]>([]);
  const playedStateRef = React.useRef<boolean[]>([]);
  const rafRef = React.useRef<number>(0);
  const blendRef = React.useRef<number>(paused ? 1 : 0);
  const [barCount, setBarCount] = React.useState(0);

  React.useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const ro = new ResizeObserver(() => {
      setBarCount(Math.floor(wrapper.clientWidth / (BAR_W + BAR_GAP)));
    });
    ro.observe(wrapper);
    return () => ro.disconnect();
  }, []);

  const staticHeights = React.useMemo(
    () =>
      Array.from({ length: barCount }, (_, i) => {
        const t = i / barCount;
        return (
          0.15 +
          0.35 * Math.abs(Math.sin(t * Math.PI * 6)) +
          0.2 * Math.abs(Math.sin(t * Math.PI * 13.7 + 1))
        );
      }),
    [barCount],
  );

  React.useEffect(() => {
    if (barCount === 0) return;

    const target = paused ? 1 : 0;

    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);

      blendRef.current += (target - blendRef.current) * TRANSITION_SPEED;
      if (Math.abs(blendRef.current - target) < 0.001)
        blendRef.current = target;
      const blend = blendRef.current;

      const analyser = analyserRef.current;
      let freqData: Uint8Array<ArrayBuffer> | null = null;
      if (analyser) {
        freqData = new Uint8Array(
          analyser.frequencyBinCount,
        ) as Uint8Array<ArrayBuffer>;
        analyser.getByteFrequencyData(freqData);
      }
      const step = freqData ? Math.floor(freqData.length / barCount) : 1;

      for (let i = 0; i < barCount; i++) {
        const bar = barsRef.current[i];
        if (!bar) continue;

        const t = i / barCount;
        const liveValue = freqData ? freqData[i * step] / 255 : 0;
        const value = liveValue * (1 - blend) + staticHeights[i] * blend;
        bar.style.height = `${Math.max(10, value * 100)}%`;

        const played = t * 100 < progress;
        if (played !== playedStateRef.current[i]) {
          playedStateRef.current[i] = played;
          bar.className = cn(
            "shrink-0 rounded-full",
            played ? playedClassName : unplayedClassName,
          );
          bar.style.width = `${BAR_W}px`;
        }
      }
    };

    animate();
    return () => cancelAnimationFrame(rafRef.current);
  }, [
    analyserRef,
    paused,
    progress,
    barCount,
    staticHeights,
    playedClassName,
    unplayedClassName,
  ]);

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "flex-1 h-8 flex items-center overflow-hidden cursor-pointer",
        className,
      )}
      style={{ gap: `${BAR_GAP}px` }}
    >
      {Array.from({ length: barCount }, (_, index) => (
        <div
          key={index}
          ref={(element) => {
            barsRef.current[index] = element;
          }}
          className={cn("shrink-0 rounded-full", unplayedClassName)}
          style={{ width: BAR_W, height: "20%px" }}
        />
      ))}
    </div>
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

export {
  AudioControlGroup,
  AudioControlLoop,
  AudioControlPlay,
  AudioControlPlaybackRate,
  AudioControlSeek,
  AudioControlTimer,
  AudioControlVolume,
  AudioPlayer,
  AudioProvider,
};
