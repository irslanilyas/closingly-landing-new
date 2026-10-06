import { Mark } from "@/components/brand/Logo";
import a from "./art.module.css";

/** The Closingly mark as a glossy orb. */
export function Gloss({ size, className = "", part }: { size: number; className?: string; part?: string }) {
  return (
    <span className={`${a.gloss} ${className}`} style={{ "--size": `${size}px` } as React.CSSProperties} data-part={part}>
      <Mark size={Math.round(size)} />
    </span>
  );
}

/** The four-point sparkle that marks a Closingly suggestion. */
export function Sparkle({ className = "" }: { className?: string }) {
  return (
    <svg className={`${a.sparkle} ${className}`} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d="M8 0c.5 4.4 3.6 7.5 8 8-4.4.5-7.5 3.6-8 8-.5-4.4-3.6-7.5-8-8 4.4-.5 7.5-3.6 8-8Z" />
    </svg>
  );
}

export function Dots() {
  return (
    <span className={a.dots} aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

/** The orbit icon that turns while Closingly works. */
export function Orbit({ size, className = "" }: { size: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- decorative icon
    <img className={`${a.orbit} ${className}`} src="/icons/ai-chat.svg" alt="" width={size} height={size} loading="lazy" />
  );
}

/** The orange pointer. Its tip sits exactly on the element's position, so a scene moves the tip, not the image. */
export function Cursor({ className = "" }: { className?: string }) {
  return (
    <span className={`${a.cursor} ${className}`} data-part="cursor" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative pointer */}
      <img src="/icons/cursor.svg" alt="" width={79} height={94} loading="lazy" />
    </span>
  );
}

/** Closingly at work: the mark turning and the dots arriving, as in the app. */
export function Thinking({ label = "Thinking", className = "", part = "thinking" }: { label?: string; className?: string; part?: string }) {
  return (
    <span className={`${a.thinking} ${className}`} data-part={part} aria-hidden="true">
      <Gloss size={18} />
      {label}
      <Dots />
    </span>
  );
}
