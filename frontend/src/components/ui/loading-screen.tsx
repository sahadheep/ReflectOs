"use client";

import { motion } from "framer-motion";
import { TRANSITION } from "@/lib/motion";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "" }: LoadingScreenProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={TRANSITION}
      className="flex flex-col space-y-4 p-4"
    >
      <div className="h-10 w-1/4 bg-border-subtle rounded animate-pulse" />
      <div className="h-24 bg-border-subtle rounded-xl animate-pulse opacity-50" />
      <div className="h-24 bg-border-subtle rounded-xl animate-pulse opacity-30" />
      <div className="h-24 bg-border-subtle rounded-xl animate-pulse opacity-20" />
    </motion.div>
  );
}
