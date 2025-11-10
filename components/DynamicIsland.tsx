"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import NumberFlow from "@number-flow/react";
import { TrendingUp, Users } from "lucide-react";

export default function DynamicIsland() {
  const [totalCount, setTotalCount] = useState(0);
  const [yesCount, setYesCount] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const islandRef = useRef<HTMLDivElement>(null);

  // Animated count with spring physics
  const animatedTotal = useSpring(0, {
    stiffness: 50,
    damping: 30,
    mass: 1,
  });

  const animatedYes = useSpring(0, {
    stiffness: 50,
    damping: 30,
    mass: 1,
  });

  useEffect(() => {
    const usersRef = ref(db, "users");

    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setTotalCount(0);
        setYesCount(0);
        return;
      }

      const entries = Object.values(data) as Array<{
        wantsToSee?: boolean;
      }>;

      const total = entries.length;
      const yes = entries.filter((entry) => entry.wantsToSee === true).length;

      setTotalCount(total);
      setYesCount(yes);
      animatedTotal.set(total);
      animatedYes.set(yes);
    });

    return () => unsubscribe();
  }, [animatedTotal, animatedYes]);

  // Handle click outside to collapse
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (islandRef.current && !islandRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded]);

  const percentage =
    totalCount > 0 ? Math.round((yesCount / totalCount) * 100) : 0;

  return (
    <motion.div
      className="top-6 z-50"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.5 }}
    >
      <motion.div
        ref={islandRef}
        className="relative cursor-pointer"
        onHoverStart={() => setIsExpanded(true)}
        onHoverEnd={() => setIsExpanded(false)}
        onTap={() => setIsExpanded(!isExpanded)}
      >
        {/* Glow effect */}
        {/* <motion.div
          className="absolute inset-0 bg-gradient-to-r from-rose-500/30 via-rose-400/30 to-rose-500/30 rounded-full blur-xl"
          animate={{
            scale: isExpanded ? 1.1 : 1,
            opacity: isExpanded ? 0.8 : 0.5,
          }}
          transition={{ duration: 0.4 }}
        /> */}

        {/* Main Island */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-400 to-rose-600 rounded-2xl blur-xl opacity-70"></div>
        <motion.div
          className="relative overflow-hidden bg-white/40 shadow-4xl backdrop-blur-4xl border border-white"
          animate={{
            width: isExpanded ? "320px" : "160px",
            height: isExpanded ? "96px" : "44px",
            borderRadius: isExpanded ? "32px" : "32px",
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 35,
          }}
        >
          {/* Liquid glass shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Content */}
          <div
            className={`relative h-full flex items-center justify-center px-6`}
          >
            <motion.div
              className={`flex items-center gap-3 ${
                isExpanded ? "hidden" : "opacity-100"
              }`}
              //   animate={{
              //     opacity: isExpanded ? 0 : 1,
              //   }}
              transition={{ duration: 0.2 }}
            >
              {/* Compact view */}
              <TrendingUp className="w-4 h-4 text-rose-600" />
              <NumberFlow
                value={totalCount}
                format={{ notation: "compact" }}
                className="text-rose-600 font-bold text-lg tabular-nums"
                transformTiming={{ duration: 1200, easing: "ease-out" }}
              />
            </motion.div>

            {/* Expanded view */}
            <motion.div
              className={`absolute inset-0 flex items-center justify-between px-6 ${
                isExpanded ? "opacity-100" : "hidden"
              }`}
              //   animate={{
              //     opacity: isExpanded ? 1 : 0,
              //   }}
              transition={{ duration: 0.3, delay: isExpanded ? 0.1 : 0 }}
            >
              {/* Left side - Total */}
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-rose-600" />
                  <NumberFlow
                    value={totalCount}
                    className="text-rose-600 font-bold text-2xl tabular-nums"
                    transformTiming={{ duration: 1200, easing: "ease-out" }}
                  />
                </div>
                <span className="text-rose-600 text-xs font-medium mt-1">
                  Total Polls
                </span>
              </div>

              {/* Divider */}
              <div className="h-12 w-px bg-gradient-to-b from-white via-white/20 to-rose-400" />

              {/* Right side - Yes Count */}
              <div className="flex flex-col items-neutralcenter">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <TrendingUp className="w-4 h-4 text-rose-600" />
                  </motion.div>
                  <NumberFlow
                    value={yesCount}
                    className="text-rose-600 font-bold text-2xl tabular-nums"
                    transformTiming={{ duration: 1200, easing: "ease-out" }}
                  />
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-rose-600 text-xs font-medium">
                    Yes Votes
                  </span>
                  <motion.span
                    className="text-rose-600 text-xs font-bold"
                    key={percentage}
                    initial={{ scale: 1.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {percentage}%
                  </motion.span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Progress bar (visible when expanded) */}
          {/* <motion.div
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-800"
            animate={{
              opacity: isExpanded ? 1 : 0,
            }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-rose-500 to-rose-400"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </motion.div> */}
        </motion.div>

        {/* Ripple effect on hover */}
        {/* {isExpanded && (
          <motion.div
            className="absolute inset-0 border-2 border-rose-500/30 rounded-[32px]"
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 1.1, opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )} */}
      </motion.div>
    </motion.div>
  );
}
