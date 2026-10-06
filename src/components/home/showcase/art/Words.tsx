import { Fragment } from "react";

/** Every word its own element, so a scene can write the text out word by word. */
export function Words({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <Fragment key={i}>
          {i > 0 && " "}
          <span data-word="" style={{ display: "inline-block" }}>
            {word}
          </span>
        </Fragment>
      ))}
    </>
  );
}
