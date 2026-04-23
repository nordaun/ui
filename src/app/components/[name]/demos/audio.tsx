// START
import {
  AudioControlGroup,
  AudioControlLoop,
  AudioControlPlay,
  AudioControlPlaybackRate,
  AudioControlSeek,
  AudioControlTimer,
  AudioControlVolume,
  AudioPlayer,
  AudioProvider,
} from "@/components/ui/audio";

export default function AudioDemo() {
  return (
    <AudioProvider>
      <AudioPlayer src="/assets/audio.webm">
        <AudioControlPlay />
        <AudioControlSeek />
        <AudioControlGroup>
          <AudioControlTimer />
          <AudioControlPlaybackRate rates={[0.5, 0.75, 1, 1.25, 2]} />
          <AudioControlVolume />
          <AudioControlLoop />
        </AudioControlGroup>
      </AudioPlayer>
    </AudioProvider>
  );
}
// END
