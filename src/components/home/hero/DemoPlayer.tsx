"use client";

import "@videojs/react/video/skin.css";
import { VideoPlayer, VideoSkin } from "@videojs/react/video";
import { MuxVideo } from "@videojs/react/media/mux-video";
import { MuxData } from "@videojs/react/extensions/mux-data";
import { DEMO } from "./demo";
import styles from "./DemoPlayer.module.css";

// Never part of the initial page load. It is mounted hidden once the visitor
// starts using the page, so the first seconds are buffered before they press
// play; autoPlay is only for a visitor who asked before that happened.
export default function DemoPlayer({ autoPlay, onPlaying }: { autoPlay: boolean; onPlaying: () => void }) {
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
          autoPlay={autoPlay}
          playsInline
          // Mounted early it holds just the first second (hls.js widens the buffer on play);
          // asked for directly, it buffers fully.
          preload={autoPlay ? "auto" : "metadata"}
          crossOrigin="anonymous"
          onPlaying={onPlaying}
        />
        <MuxData disableCookies metadata={{ video_title: DEMO.title }} />
      </VideoSkin>
    </VideoPlayer>
  );
}
