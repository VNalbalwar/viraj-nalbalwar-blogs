import { ImageResponse } from "next/og";
import { OgCollage } from "@/lib/og";
import { site } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = site.name;

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#faf9f7", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, display: "flex" }}>
          <OgCollage seed="offcuts" width={1200} height={630} />
        </div>
        <div style={{ position: "absolute", left: 48, bottom: 44, display: "flex", flexDirection: "column", background: "#faf9f7", padding: "24px 36px" }}>
          <div style={{ fontSize: 120, fontWeight: 800, lineHeight: 1, color: "#181716", letterSpacing: -5 }}>{site.name}</div>
          <div style={{ marginTop: 10, fontSize: 30, color: "#53504b" }}>{site.tagline}</div>
        </div>
      </div>
    ),
    size,
  );
}
