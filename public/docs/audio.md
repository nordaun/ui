# Audio

This component enables you to use a simple lightweight waveform-theme audio player with control options like play/pause, volume, playback speed etc.

Preview this component

### Installation

`bunx --bun shadcn@latest add https://vorhdam-registry.vercel.app/r/audio.json`

### Usage

```
<AudioProvider>
    <AudioPlayer src="https://example.com/sample.mp3">
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
```

## Extendability

You can extend the control options by editing the `@/components/ui/audio.tsx` file that shadcn will create.

You can add new player variables as `React states` to the `React context` and access or modify them in subcomponents later. For example if you want to add a shadcn switch in the control bar:

```
function AudioControlSwitch() {
  return (<Switch />)
}
```
