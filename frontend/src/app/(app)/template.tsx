"use client";

import { motion } from "framer-motion";
import { useMotionConfig, TRANSITION_FAST } from "@/lib/motion";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const { pageVariants } = useMotionConfig();
  const pathname = usePathname();

  // We use the pathname as the key so the component re-animates on route change.
  // Next.js `template.tsx` normally remounts on navigation anyway, but explicit key is safer.

  return (
    <motion.div
      key={pathname}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={TRANSITION_FAST}
      className="flex-1 flex flex-col h-full"
    >
      {children}
    </motion.div>
  );
}
