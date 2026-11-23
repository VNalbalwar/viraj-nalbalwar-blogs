import Link from "next/link";
import { Collage } from "@/components/Collage";

export default function NotFound() {
  return (
    <div className="wrap grid items-center gap-10 py-16 md:grid-cols-2">
      <div className="grid gap-5">
        <h1 className="t-title m-0">That page got cut.</h1>
        <p className="t-lead m-0">The link may be old or mistyped. Try the full list of posts.</p>
        <p className="m-0">
          <Link href="/posts" className="btn">
            See all posts
          </Link>
        </p>
      </div>
      <div className="thumb aspect-[8/5]">
        <Collage seed="not-found" />
      </div>
    </div>
  );
}
