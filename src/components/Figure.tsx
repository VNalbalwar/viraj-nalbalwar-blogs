import Image from "next/image";

/**
 * An image pasted onto the page like a cut-out: a photo, a screenshot, a chart from a paper. It shows
 * what its section is about. `alt` describes what it shows, `credit` says where it came from (and the
 * licence, if it is not the author's own).
 * Files live in public/posts/<slug>/.
 */
export function Figure({
  src,
  alt,
  caption,
  credit,
  creditHref,
  license,
  licenseHref,
  narrow = false,
  width = 1200,
  height = 675,
}: {
  src: string;
  alt: string;
  caption: string;
  credit: string;
  creditHref?: string;
  /** Licence name, for example "CC BY 4.0", shown after the credit. */
  license?: string;
  /** The licence's own page. Creative Commons licences ask for this link. */
  licenseHref?: string;
  /** For portraits and other tall or square pictures. */
  narrow?: boolean;
  width?: number;
  height?: number;
}) {
  return (
    <figure className={`fig ${narrow ? "fig-narrow" : "wide"} m-0`}>
      <div className="figure-frame">
        <Image src={src} alt={alt} width={width} height={height} sizes={narrow ? "(min-width: 480px) 384px, 92vw" : "(min-width: 1024px) 700px, 92vw"} />
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
          {license ? (
            <>
              ,{" "}
              {licenseHref ? (
                <a href={licenseHref} target="_blank" rel="license noopener noreferrer">
                  {license}
                </a>
              ) : (
                license
              )}
            </>
          ) : null}
        </span>
      </figcaption>
    </figure>
  );
}
