// START
import {
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
} from "@/components/ui/video";

export default function VideoDemo() {
  return (
    <VideoProvider>
      <VideoPlayer src="/assets/video.webm">
        <VideoControlSeek />
        <VideoControlList>
          <VideoControlGroup>
            <VideoControlPlay />
            <VideoControlTimer />
          </VideoControlGroup>
          <VideoControlGroup>
            <VideoControlLoop />
            <VideoControlPlaybackRate rates={[0.5, 0.75, 1, 1.25, 2]} />
            <VideoControlVolume />
            <VideoControlFullscreen />
          </VideoControlGroup>
        </VideoControlList>
      </VideoPlayer>
    </VideoProvider>
  );
}
// END
