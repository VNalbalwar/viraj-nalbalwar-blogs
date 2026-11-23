"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** Top bar that fills as you read, with a little spring so it trails your scroll. */
export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, restDelta: 0.001 });
  return <motion.div className="progress" style={{ scaleX }} aria-hidden />;
}
