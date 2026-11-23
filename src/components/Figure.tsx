import Image from "next/image";

/**
 * An image pasted onto the page like a cut-out. Use it only when the picture carries information a
 * diagram cannot: a screenshot, a photo, a chart from a paper. `alt` describes what it shows,
 * `credit` says where it came from (and the licence, if it is not the author's own).
 * Files live in public/posts/<slug>/.
 */
export function Figure({
  src,
  alt,
  caption,
  credit,
  creditHref,
  width = 1200,
  height = 675,
}: {
  src: string;
  alt: string;
  caption: string;
  credit: string;
  creditHref?: string;
  width?: number;
  height?: number;
}) {
  return (
    <figure className="fig wide m-0">
      <div className="figure-frame">
        <Image src={src} alt={alt} width={width} height={height} sizes="(min-width: 1024px) 700px, 92vw" />
      </div>
      <figcaption className="fig-cap">
        {caption}{" "}
        <span className="fig-credit">
          Source:{" "}
          {creditHref ? (
            <a href={creditHref} target="_blank" rel="noopener noreferrer">
              {credit}
            </a>
          ) : (
            credit
          )}
        </span>
      </figcaption>
    </figure>
  );
}
