"use client";

import { MenuTrigger } from "@base-ui/react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { cn } from "cn";
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
import { Kbd } from "./kbd";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

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
  volume: number;
  setVolume: (val: number) => void;
  muted: boolean;
  setMuted: (val: boolean) => void;
  loop: boolean;
  setLoop: React.Dispatch<React.SetStateAction<boolean>>;
  playbackRate: number;
  setPlaybackRate: (val: number) => void;
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
  const [volume, setVolumeState] = React.useState<number>(defaultVolume);
  const [muted, setMutedState] = React.useState<boolean>(defaultMuted);
  const [loop, setLoop] = React.useState<boolean>(defaultLoop);
  const [playbackRate, setPlaybackRateState] =
    React.useState<number>(defaultRate);
  const [duration, setDuration] = React.useState<number>(0);
  const [currentTime, setCurrentTime] = React.useState<number>(0);

  const setVolume = React.useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolumeState(clamped);
    if (audioRef.current) audioRef.current.volume = clamped;
  }, []);

  const setMuted = React.useCallback((val: boolean) => {
    setMutedState(val);
    if (audioRef.current) audioRef.current.muted = val;
  }, []);

  const setPlaybackRate = React.useCallback((val: number) => {
    setPlaybackRateState(val);
    if (audioRef.current) audioRef.current.playbackRate = val;
  }, []);

  React.useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
    audioRef.current.muted = muted;
    audioRef.current.playbackRate = playbackRate;
    audioRef.current.loop = loop;

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

  const values = React.useMemo(
    () => ({
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
    }),
    [
      paused,
      progress,
      volume,
      setVolume,
      muted,
      setMuted,
      loop,
      setLoop,
      playbackRate,
      setPlaybackRate,
      duration,
      currentTime,
    ],
  );

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
    setDuration,
    graphRef,
    setMuted,
    muted,
    setLoop,
    loop,
    volume,
    setVolume,
  } = React.useContext(Context);

  const handlePlayToggle = React.useCallback(async () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      await graphRef.current?.resume();
      audioRef.current.play().catch(() => {});
      setPaused(false);
    } else {
      audioRef.current.pause();
      setPaused(true);
    }
  }, [audioRef, graphRef, setPaused]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName))
        return;
      e.preventDefault();

      if (e.code === "Space" || e.code === "KeyK") {
        handlePlayToggle();
      } else if (e.code === "KeyM") {
        setMuted(!muted);
      } else if (e.code === "KeyR") {
        setLoop(!loop);
      } else if (e.code === "ArrowUp") {
        setVolume(volume + 0.1);
        if (muted && volume + 0.1 > 0) setMuted(false);
      } else if (e.code === "ArrowDown") {
        setVolume(volume - 0.1);
      } else if (e.code === "ArrowLeft" || e.code === "KeyJ") {
        if (!audioRef.current) return;
        audioRef.current.currentTime = Math.max(
          0,
          audioRef.current.currentTime - 10,
        );
      } else if (e.code === "ArrowRight" || e.code === "KeyL") {
        if (!audioRef.current || !audioRef.current.duration) return;
        audioRef.current.currentTime = Math.min(
          audioRef.current.duration,
          audioRef.current.currentTime + 10,
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    handlePlayToggle,
    muted,
    setMuted,
    loop,
    setLoop,
    audioRef,
    volume,
    setVolume,
    setCurrentTime,
  ]);

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const handleEnded = () => {
    setPaused(true);
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className={cn(
        "relative flex items-center gap-3 bg-secondary rounded-xl px-3 py-2 min-h-14 dark:bg-secondary/50 outline-none",
        className,
      )}
    >
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        {...props}
      />
      <div className="flex items-center justify-between w-full gap-2">
        {children}
      </div>
    </div>
  );
}

function AudioControlSeek({ className }: { className?: string }) {
  const { audioRef } = React.useContext(Context);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const ratio = Math.max(
      0,
      Math.min(1, (e.clientX - rect.left) / rect.width),
    );
    const newTime = ratio * audioRef.current.duration;
    audioRef.current.currentTime = newTime;
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
  children,
  ...props
}: React.ComponentProps<"button"> & { children?: React.ReactNode }) {
  const { audioRef, graphRef, paused, setPaused } = React.useContext(Context);

  const handlePlay = async () => {
    if (!audioRef.current) return;
    if (paused) {
      await graphRef.current?.resume();
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
    setPaused(!paused);
  };

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePlay}
            aria-label={paused ? "Play" : "Pause"}
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
        }
      />
      <TooltipContent>
        {children}
        <Kbd>K</Kbd>
      </TooltipContent>
    </Tooltip>
  );
}

function AudioControlTimer({ className }: React.ComponentProps<"button">) {
  const { currentTime, duration } = React.useContext(Context);
  const [reverse, setReverse] = React.useState<boolean>(false);

  const formatTime = (timeInSecs: number) => {
    if (isNaN(timeInSecs)) return "0:00";
    const minutes = Math.floor(timeInSecs / 60);
    const seconds = Math.floor(timeInSecs % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const displayTime = reverse
    ? `-${formatTime(duration - currentTime)}`
    : formatTime(currentTime);

  return (
    <button
      type="button"
      aria-label="Toggle remaining time"
      className={cn(
        "text-card-foreground text-sm cursor-pointer bg-transparent border-none mx-1.5",
        className,
      )}
      onClick={() => setReverse((prev) => !prev)}
    >
      {displayTime}
      <span className="text-card-foreground/50 mx-1">/</span>
      {formatTime(duration)}
    </button>
  );
}

function AudioControlPlaybackRate({
  rates,
  className,
  children,
  ...props
}: MenuTrigger.Props & { rates: number[]; children?: React.ReactNode }) {
  const { playbackRate, setPlaybackRate } = React.useContext(Context);

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger
          render={
            <DropdownMenuTrigger
              aria-label="Playback speed"
              className={cn(
                "inline-flex items-center justify-center text-card-foreground rounded-full aspect-square h-8 hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 aria-expanded:bg-muted aria-expanded:text-foreground cursor-pointer",
                className,
              )}
              {...props}
            >
              <Gauge className="size-4" />
            </DropdownMenuTrigger>
          }
        />
        <TooltipContent>{children}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent
        align="end"
        className="bg-card text-card-foreground border-border"
      >
        {rates.map((rate) => (
          <DropdownMenuItem
            key={rate}
            onClick={() => setPlaybackRate(rate)}
            className="flex items-center justify-between focus:bg-accent focus:text-card-foreground cursor-pointer"
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
  children,
  ...props
}: React.ComponentProps<"button"> & { children?: React.ReactNode }) {
  const { audioRef, loop, setLoop } = React.useContext(Context);

  const handleLoop = () => {
    if (!audioRef.current) return;
    setLoop(!loop);
    audioRef.current.loop = !loop;
  };

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLoop}
            aria-label="Toggle loop"
            className={cn(
              "text-card-foreground rounded-full aspect-square h-8",
              className,
            )}
            {...props}
          >
            {loop ? <Repeat1 /> : <Repeat />}
          </Button>
        }
      />
      <TooltipContent>
        {children}
        <Kbd>R</Kbd>
      </TooltipContent>
    </Tooltip>
  );
}

function AudioControlVolume({
  className,
  children,
  ...props
}: MenuTrigger.Props & { children?: React.ReactNode }) {
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
    if (nextValue > 0 && muted) setMuted(false);
  };

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger
          render={
            <DropdownMenuTrigger
              aria-label="Volume settings"
              className={cn(
                "inline-flex items-center justify-center text-card-foreground rounded-full aspect-square h-8 hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 aria-expanded:bg-muted aria-expanded:text-foreground cursor-pointer",
                className,
              )}
              {...props}
            >
              <VolumeIcon className="size-4" muted={muted} volume={volume} />
            </DropdownMenuTrigger>
          }
        />
        <TooltipContent>
          {children}
          <Kbd>M</Kbd>
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="min-w-40">
        <div className="flex flex-row items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={muted ? "Unmute" : "Mute"}
            className="text-accent-foreground/80 hover:bg-accent/20 rounded-full"
            onClick={handleMute}
          >
            <VolumeIcon muted={muted} volume={volume} />
          </Button>
          <Slider
            value={value}
            max={100}
            step={1}
            aria-label="Volume slider"
            className="w-20 transition-all mr-1.5"
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
  const barWidth = 3;
  const barGap = 2;
  const transitionSpeed = 0.08;
  const minHz = 20;
  const maxHz = 20000;
  const lowGain = Math.PI / 10;
  const highGain = Math.E;

  const { analyserRef, paused, audioRef } = React.useContext(Context);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const barsRef = React.useRef<(HTMLDivElement | null)[]>([]);
  const playedStateRef = React.useRef<boolean[]>([]);
  const rafRef = React.useRef<number>(0);
  const blendRef = React.useRef<number>(paused ? 1 : 0);
  const freqDataRef = React.useRef<Uint8Array<ArrayBuffer> | null>(null);
  const bandsRef = React.useRef<{
    key: string;
    ranges: (readonly [number, number])[];
  } | null>(null);
  const [barCount, setBarCount] = React.useState(0);

  const progress = React.useMemo(() => {
    return (
      ((audioRef.current?.currentTime ?? 0) /
        (audioRef.current?.duration ?? 0)) *
      100
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioRef.current?.currentTime, audioRef.current?.duration]);

  React.useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const ro = new ResizeObserver(() => {
      setBarCount(Math.floor(wrapper.clientWidth / (barWidth + barGap)));
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

    const getBandRanges = (binCount: number, sampleRate: number) => {
      const nyquist = sampleRate / 2;
      const hzPerBin = nyquist / binCount;
      const maximumHz = Math.min(maxHz, nyquist);

      return Array.from({ length: barCount }, (_, i) => {
        const lo = minHz * (maximumHz / minHz) ** (i / barCount);
        const hi = minHz * (maximumHz / minHz) ** ((i + 1) / barCount);
        const start = Math.min(binCount - 1, Math.floor(lo / hzPerBin));
        const end = Math.min(
          binCount,
          Math.max(start + 1, Math.ceil(hi / hzPerBin)),
        );
        return [start, end] as const;
      });
    };

    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);

      blendRef.current += (target - blendRef.current) * transitionSpeed;
      if (Math.abs(blendRef.current - target) < 0.001)
        blendRef.current = target;
      const blend = blendRef.current;

      const analyser = analyserRef.current;
      let freqData: Uint8Array<ArrayBuffer> | null = null;
      if (analyser) {
        const binCount = analyser.frequencyBinCount;
        if (freqDataRef.current?.length !== binCount) {
          freqDataRef.current = new Uint8Array(
            binCount,
          ) as Uint8Array<ArrayBuffer>;
        }
        freqData = freqDataRef.current;
        analyser.getByteFrequencyData(freqData);

        const sampleRate = analyser.context.sampleRate;
        const key = `${barCount}-${binCount}-${sampleRate}`;
        if (bandsRef.current?.key !== key) {
          bandsRef.current = {
            key,
            ranges: getBandRanges(binCount, sampleRate),
          };
        }
      }

      for (let i = 0; i < barCount; i++) {
        const bar = barsRef.current[i];
        if (!bar) continue;

        const t = i / barCount;

        let liveValue = 0;
        if (freqData && bandsRef.current) {
          const [start, end] = bandsRef.current.ranges[i]!;
          let sum = 0;
          for (let b = start; b < end; b++) sum += freqData[b]!;
          const avg = sum / (end - start) / 255;
          const gain = lowGain * (highGain / lowGain) ** t;
          liveValue = Math.min(1, avg * gain);
        }

        const value = liveValue * (1 - blend) + staticHeights[i]! * blend;

        bar.style.height = `${Math.max(15, value * 100)}%`;

        const played = t * 100 < progress;
        if (played !== playedStateRef.current[i]) {
          playedStateRef.current[i] = played;
          bar.className = cn(
            "shrink-0 rounded-full transition-colors",
            played ? playedClassName : unplayedClassName,
          );
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
    lowGain,
    highGain,
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
      style={{ gap: `${barGap}px` }}
    >
      {Array.from({ length: barCount }, (_, index) => {
        const initialValue = staticHeights[index]
          ? staticHeights[index] * 100
          : 20;
        return (
          <div
            key={index}
            ref={(element) => {
              barsRef.current[index] = element;
            }}
            className={cn("shrink-0 rounded-full", unplayedClassName)}
            style={{
              width: `${barWidth}px`,
              height: `${Math.max(15, initialValue)}%`,
            }}
          />
        );
      })}
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
