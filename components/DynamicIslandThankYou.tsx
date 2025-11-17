"use client";

import { motion, useSpring } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import NumberFlow from "@number-flow/react";
import { TrendingUp, Users, Heart } from "lucide-react";

export default function DynamicIslandThankYou() {
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
      if (
        islandRef.current &&
        !islandRef.current.contains(event.target as Node)
      ) {
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
      className="z-50"
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.3 }}
    >
      <motion.div
        ref={islandRef}
        className="relative cursor-pointer group"
        onHoverStart={() => setIsExpanded(true)}
        onHoverEnd={() => setIsExpanded(false)}
        onTap={() => setIsExpanded(!isExpanded)}
      >
        {/* Enhanced glow effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-white/40 via-rose-200/50 to-white/40 rounded-[40px] blur-2xl"
          animate={{
            scale: isExpanded ? 1.15 : 1.05,
            opacity: isExpanded ? 0.9 : 0.6,
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />

        {/* Main Island Container */}
        <motion.div
          className="relative overflow-hidden backdrop-blur-3xl bg-gradient-to-br from-white/90 via-white/80 to-white/70 shadow-2xl border border-white/60"
          style={{
            boxShadow:
              "0 8px 32px rgba(255, 255, 255, 0.35), 0 2px 8px rgba(251, 113, 133, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
          }}
          animate={{
            width: isExpanded ? "380px" : "180px",
            height: isExpanded ? "120px" : "56px",
            borderRadius: isExpanded ? "36px" : "36px",
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
        >
          {/* Animated gradient overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-rose-50/80 via-transparent to-rose-100/60"
            animate={{
              opacity: isExpanded ? 0.7 : 0.4,
            }}
            transition={{ duration: 0.4 }}
          />

          {/* Multiple liquid shimmer layers */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
            animate={{
              x: ["-100%", "200%"],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "linear",
              repeatDelay: 1,
            }}
          />

          <motion.div
            className="absolute inset-0 bg-gradient-to-l from-transparent via-rose-100/30 to-transparent"
            animate={{
              x: ["100%", "-200%"],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "linear",
              repeatDelay: 0.5,
            }}
          />

          {/* Floating particles effect */}
          <motion.div
            className="absolute top-2 left-4 w-1 h-1 bg-white/70 rounded-full blur-[0.5px]"
            animate={{
              y: [0, -10, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <motion.div
            className="absolute bottom-3 right-6 w-1.5 h-1.5 bg-rose-200/60 rounded-full blur-[0.5px]"
            animate={{
              y: [0, 8, 0],
              opacity: [0.4, 0.9, 0.4],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />

          {/* Content */}
          <div className="relative h-full flex items-center justify-center px-6">
            {/* Compact view */}
            <motion.div
              className={`flex items-center gap-3 ${
                isExpanded ? "hidden" : "flex"
              }`}
              initial={false}
            >
              <div className="relative">
                <TrendingUp className="w-5 h-5 text-rose-500 drop-shadow-sm" />
                <motion.div
                  className="absolute inset-0 bg-rose-400 rounded-full blur-md opacity-40"
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
              <NumberFlow
                value={totalCount}
                format={{ notation: "compact" }}
                className="text-rose-600 font-bold text-xl tabular-nums drop-shadow-sm"
                transformTiming={{ duration: 1200, easing: "ease-out" }}
              />
            </motion.div>

            {/* Expanded view */}
            <motion.div
              className={`absolute inset-0 flex items-center justify-between px-7 ${
                isExpanded ? "flex" : "hidden"
              }`}
              initial={false}
            >
              {/* Left side - Total Polls */}
              <motion.div
                className="flex flex-col items-center gap-1.5"
                initial={{ opacity: 0, x: -20 }}
                animate={{
                  opacity: isExpanded ? 1 : 0,
                  x: isExpanded ? 0 : -20,
                }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Users className="w-5 h-5 text-rose-500" />
                    <motion.div
                      className="absolute inset-0 bg-rose-400 rounded-full blur-sm opacity-30"
                      animate={{
                        scale: [1, 1.3, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </div>
                  <NumberFlow
                    value={totalCount}
                    className="text-rose-600 font-bold text-3xl tabular-nums drop-shadow"
                    transformTiming={{ duration: 1200, easing: "ease-out" }}
                  />
                </div>
                <span className="text-[10px] font-medium text-rose-500/80 uppercase tracking-wider">
                  Total Polls
                </span>
              </motion.div>

              {/* Divider */}
              <motion.div
                className="h-16 w-[1px] bg-gradient-to-b from-transparent via-rose-300/50 to-transparent"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: isExpanded ? 1 : 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
              />

              {/* Right side - Yes Votes */}
              <motion.div
                className="flex flex-col items-center gap-1.5"
                initial={{ opacity: 0, x: 20 }}
                animate={{
                  opacity: isExpanded ? 1 : 0,
                  x: isExpanded ? 0 : 20,
                }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                    <motion.div
                      className="absolute inset-0 bg-rose-400 rounded-full blur-sm opacity-40"
                      animate={{
                        scale: [1, 1.4, 1],
                      }}
                      transition={{
                        duration: 1.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </div>
                  <NumberFlow
                    value={yesCount}
                    className="text-rose-600 font-bold text-3xl tabular-nums drop-shadow"
                    transformTiming={{ duration: 1200, easing: "ease-out" }}
                  />
                </div>
                <span className="text-[10px] font-medium text-rose-500/80 uppercase tracking-wider">
                  Yes Votes
                </span>
              </motion.div>
            </motion.div>
          </div>

          {/* Bottom progress indicator */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-1 bg-rose-200/30 overflow-hidden rounded-b-[36px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: isExpanded ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-rose-400 to-rose-500 shadow-lg"
              initial={{ width: "0%" }}
              animate={{ width: isExpanded ? `${percentage}%` : "0%" }}
              transition={{
                duration: 0.8,
                delay: 0.2,
                ease: "easeOut",
              }}
            >
              {/* Shimmer on progress bar */}
              <motion.div
                className="h-full w-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{
                  x: ["-100%", "200%"],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear",
                  repeatDelay: 0.5,
                }}
              />
            </motion.div>
          </motion.div>

          {/* Top highlight glass effect */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
