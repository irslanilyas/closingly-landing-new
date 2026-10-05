"use client";

import "@videojs/react/video/skin.css";
import { VideoPlayer, VideoSkin } from "@videojs/react/video";
import { MuxVideo } from "@videojs/react/media/mux-video";
import { MuxData } from "@videojs/react/extensions/mux-data";
import { DEMO } from "./demo";
import styles from "./DemoPlayer.module.css";

// Loaded only after a visitor asks for the demo: Video.js, hls.js and Mux Data
// never touch the initial page load.
export default function DemoPlayer({ onPlaying }: { onPlaying: () => void }) {
  return (
    <VideoPlayer>
      <VideoSkin className={styles.skin} renderPoster={() => null}>
        <MuxVideo
          source={{
            playbackId: DEMO.playbackId,
            // Adaptive selection stops at 720p so the demo starts fast on any
            // connection; 1080p stays one tap away in the quality menu.
            maxAutoResolution: "720p",
          }}
          autoPlay
          playsInline
          preload="auto"
          crossOrigin="anonymous"
          onPlaying={onPlaying}
        />
        <MuxData disableCookies metadata={{ video_title: DEMO.title }} />
      </VideoSkin>
    </VideoPlayer>
  );
}
