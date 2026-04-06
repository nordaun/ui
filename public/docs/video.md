# Video

This component enables you to use a simple lightweight video player with control options like play/pause, volume, playback speed etc.

### Installation

`bunx --bun shadcn@latest add https://vorhdam-registry.vercel.app/r/video.json`

### Usage

```
<VideoProvider>
    <VideoPlayer src="https://example.com/sample.mp4">
        <VideoControlSlide />
        <VideoControlList>
            <VideoControlGroup>
                <VideoControlPlay />
                <VideoControlTimer />
            </VideoControlGroup>
            <VideoControlGroup>
                <VideoControlPlaybackRate rates={[0.5, 0.75, 1, 1.25, 2]} />
                <VideoControlVolume />
                <VideoControlFullscreen />
            </VideoControlGroup>
        </VideoControlList>
    </VideoPlayer>
</VideoProvider>
```

## Extendability

You can extend the control options by editing the `@/components/ui/video.tsx` file that shadcn will create.

You can add new player variables as `React states` to the `React context` and access or modify them in subcomponents later. For example if you want to add a shadcn switch in the control bar:

```
function VideoControlSwitch() {
  return (<Switch />)
}
```
