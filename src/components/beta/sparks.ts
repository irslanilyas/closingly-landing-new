/** A burst of brand-coloured sparks from (x, y) inside `host`, for a moment that just landed. */
export function sparks(host: HTMLElement, x: number, y: number, className: string, { count = 22, reach = 90 } = {}) {
  for (let i = 0; i < count; i++) {
    const spark = document.createElement("span");
    spark.className = className;
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
    const distance = reach + Math.random() * reach;
    const size = 4 + Math.random() * 6;
    Object.assign(spark.style, { left: `${x}px`, top: `${y}px`, width: `${size}px`, height: `${size}px`, background: i % 3 ? "" : "#fbad90" });
    host.append(spark);
    spark
      .animate(
        [
          { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
          { transform: `translate(calc(-50% + ${Math.cos(angle) * distance}px), calc(-50% + ${Math.sin(angle) * distance}px)) scale(0.2)`, opacity: 0 },
        ],
        { duration: 700 + Math.random() * 400, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "forwards" },
      )
      .finished.then(() => spark.remove());
  }
}
