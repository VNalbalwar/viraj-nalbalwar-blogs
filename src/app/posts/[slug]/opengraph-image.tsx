import { ImageResponse } from "next/og";
import { OgCollage } from "@/lib/og";
import { getAllPosts, getPost } from "@/lib/posts";
import { site } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Post cover";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  const title = post?.title ?? site.name;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#faf9f7", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, display: "flex" }}>
          <OgCollage seed={slug} width={1200} height={630} accent={post?.accent} />
        </div>
        <div
          style={{
            position: "absolute",
            left: 48,
            right: 48,
            bottom: 44,
            display: "flex",
            flexDirection: "column",
            background: "#faf9f7",
            padding: "28px 36px",
          }}
        >
          <div style={{ fontSize: 58, fontWeight: 800, lineHeight: 1.05, color: "#181716", letterSpacing: -2 }}>{title}</div>
          <div style={{ marginTop: 14, fontSize: 28, color: "#53504b" }}>{`${site.name} · ${site.author}`}</div>
        </div>
      </div>
    ),
    size,
  );
}
