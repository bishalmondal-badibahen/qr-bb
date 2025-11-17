"use client";

import { db } from "@/lib/firebase";
import NumberFlow from "@number-flow/react";
import { onValue, ref } from "firebase/database";
import { motion, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

export default function ResultPage() {
  const [yesCount, setYesCount] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [displayedYes, setDisplayedYes] = useState(0);

  // Subscribe to users and compute yes count
  useEffect(() => {
    const usersRef = ref(db, "users");
    const unsub = onValue(usersRef, (snapshot) => {
      const val = snapshot.val();
      if (!val) {
        setTotal(0);
        setYesCount(0);
        setIsLoading(false);
        return;
      }

      const entries = Object.values(val) as any[];
      const totalCount = entries.length;
      let yesCounter = 0;

      entries.forEach((e: any) => {
        if (e?.wantsToSee === true) {
          yesCounter++;
        }
      });

      setTotal(totalCount);
      setYesCount(yesCounter);
      setIsLoading(false);
    });

    return () => unsub();
  }, []);

  // Animating count with spring
  const springCount = useSpring(0, {
    bounce: 0,
    duration: 1200,
  });

  springCount.on("change", (value) => {
    setDisplayedYes(Math.round(value));
  });

  useEffect(() => {
    springCount.set(yesCount);
  }, [yesCount]);

  const yesPercentage = total > 0 ? Math.round((yesCount / total) * 100) : 0;

  return (
    <main className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-rose-200 via-white to-rose-200">
      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center justify-center px-4 md:px-0">
        {/* Main Counter Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative w-full max-w-xl"
        >
          <div className="bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
            {/* Animated background circle */}
            <motion.div
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -top-20 -right-20 w-60 h-60 bg-white rounded-full"
            />

            <div className="relative z-10 text-center">
              {/* Label */}
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-white/80 text-lg font-semibold uppercase tracking-wider mb-6"
              >
                Want to See Us
              </motion.p>

              {/* Main Counter with NumberFlow */}
              <div className="text-[140px] md:text-[180px] font-black text-white leading-none mb-6 tracking-tight">
                <NumberFlow value={displayedYes} />
              </div>

              {/* Percentage Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, type: "spring" }}
                className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm px-8 py-4 rounded-full border-2 border-white/30"
              >
                <span className="text-4xl font-bold text-white">
                  <NumberFlow value={yesPercentage} suffix="%" />
                </span>
                <span className="text-white/80 text-lg">of {total} votes</span>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-3xl"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
