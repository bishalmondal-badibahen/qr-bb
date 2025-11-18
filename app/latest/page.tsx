"use client";

import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import NumberFlow from "@number-flow/react";

interface User {
  id: string;
  name: string;
  imageUrl: string;
  timestamp: number;
}

export default function LatestPage() {
  const [latestThree, setLatestThree] = useState<User[]>([]);
  const [prevIds, setPrevIds] = useState<string[]>([]);
  const [yesCount, setYesCount] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    const usersRef = ref(db, "users");

    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();

      if (!data) {
        setLatestThree([]);
        setTotal(0);
        setYesCount(0);
        return;
      }

      const usersList: User[] = Object.entries(data).map(
        ([id, value]: [string, any]) => ({
          id,
          name: value.name || "Unknown",
          imageUrl: value.imageURL || "/placeholder.png",
          timestamp: value.timestamp || Date.now(),
        }),
      );

      // Calculate yes count
      const entries = Object.values(data) as any[];
      const totalCount = entries.length;
      let yesCounter = 0;

      entries.forEach((e: any) => {
        if (e?.wantsToSee === true) {
          yesCounter++;
        }
      });

      setTotal(totalCount);
      setYesCount(yesCounter);

      // Sort by timestamp descending and get last 3
      const sorted = usersList.sort((a, b) => b.timestamp - a.timestamp);
      const last3 = sorted.slice(0, 3);

      // Track previous IDs for animation purposes
      setPrevIds(latestThree.map((u) => u.id));
      setLatestThree(last3);
    });

    return () => unsubscribe();
  }, []);

  // Detect new items
  const getItemState = (item: User, index: number) => {
    const wasInPrevious = prevIds.includes(item.id);
    return {
      isNew: !wasInPrevious,
      position: index,
    };
  };

  const yesPercentage = total > 0 ? Math.round((yesCount / total) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-rose-200 via-white to-rose-200 flex items-center justify-center overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-rose-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-rose-600/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-[95vw] xl:max-w-[1400px] px-4 md:px-6">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-4 md:mb-6"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600">
            Latest Responses
          </h1>
        </motion.div>

        {/* Counter Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6 md:mb-8 max-w-4xl mx-auto"
        >
          <div className="bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 rounded-2xl md:rounded-3xl lg:rounded-[3rem] px-6 py-6 md:px-10 md:py-8 lg:px-16 lg:py-10 shadow-2xl relative overflow-hidden">
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
              className="absolute -top-20 -right-20 md:-top-32 md:-right-32 w-64 h-64 md:w-96 md:h-96 bg-white rounded-full"
            />

            <div className="relative z-10 text-center">
              {/* Label */}
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-white/90 text-base md:text-xl lg:text-2xl xl:text-3xl font-bold uppercase tracking-wider mb-2 md:mb-4"
              >
                Want to See Us at FMC 2025
              </motion.p>

              {/* Main Counter with NumberFlow */}
              <div className="text-[60px] md:text-[90px] lg:text-[120px] xl:text-[150px] font-black text-white leading-none mb-2 md:mb-4 tracking-tight">
                <NumberFlow value={yesCount} />
              </div>

              {/* Percentage Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
                className="inline-flex items-center gap-2 md:gap-3 lg:gap-4 bg-white/20 backdrop-blur-sm px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 rounded-full border-2 border-white/30"
              >
                <span className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white">
                  <NumberFlow value={yesPercentage} suffix="%" />
                </span>
                <span className="text-white/90 text-xs md:text-base lg:text-xl xl:text-2xl font-semibold">
                  of {total} votes
                </span>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Cards Grid */}
        {latestThree.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
            <AnimatePresence mode="popLayout">
              {latestThree.map((user, index) => {
                const state = getItemState(user, index);

                return (
                  <motion.div
                    key={user.id}
                    layout
                    layoutId={user.id}
                    initial={
                      state.isNew
                        ? {
                            opacity: 0,
                            scale: 0.8,
                            y: 50,
                            rotateX: -15,
                          }
                        : false
                    }
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0,
                      rotateX: 0,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.8,
                      y: -50,
                      transition: { duration: 0.4 },
                    }}
                    transition={{
                      layout: {
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      },
                      opacity: { duration: 0.6 },
                      scale: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
                      y: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
                      rotateX: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
                    }}
                    whileHover={{
                      scale: 1.05,
                      y: -10,
                      transition: { duration: 0.3 },
                    }}
                    className="relative group cursor-pointer"
                    style={{
                      transformStyle: "preserve-3d",
                    }}
                  >
                    {/* Card container with uniform height */}
                    <div className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl h-[280px] md:h-[340px] lg:h-[380px] xl:h-[420px]">
                      {/* Image */}
                      <motion.img
                        src={user.imageUrl}
                        alt={user.name}
                        className="w-full h-full object-cover"
                        initial={state.isNew ? { scale: 1.2 } : false}
                        animate={{ scale: 1 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                      />

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/60 to-transparent" />

                      {/* Hover gradient */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-rose-500/30 via-rose-600/20 to-rose-700/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                      />

                      {/* Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 lg:p-5">
                        <motion.div
                          initial={state.isNew ? { y: 20, opacity: 0 } : false}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{
                            delay: 0.2,
                            duration: 0.6,
                            ease: "easeOut",
                          }}
                        >
                          <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-white mb-1 drop-shadow-2xl">
                            {user.name}
                          </h3>
                          <p className="text-white/70 text-xs md:text-sm drop-shadow-lg">
                            {new Date(user.timestamp).toLocaleString()}
                          </p>
                        </motion.div>
                      </div>

                      {/* New item indicator */}
                      {state.isNew && (
                        <motion.div
                          initial={{ opacity: 1 }}
                          animate={{ opacity: 0 }}
                          transition={{ duration: 3, ease: "easeOut" }}
                          className="absolute inset-0 ring-4 ring-rose-500 rounded-2xl md:rounded-3xl pointer-events-none"
                        >
                          <motion.div
                            className="absolute top-2 right-2 md:top-3 md:right-3 bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{
                              delay: 0.3,
                              type: "spring",
                              stiffness: 200,
                              damping: 15,
                            }}
                          >
                            NEW
                          </motion.div>
                        </motion.div>
                      )}

                      {/* Shine effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                        initial={{ x: "-100%" }}
                        animate={{ x: "200%" }}
                        transition={{
                          duration: 2,
                          ease: "easeInOut",
                          delay: state.isNew ? 0.5 : 0,
                        }}
                      />

                      {/* Position badge */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          delay: 0.4,
                          type: "spring",
                          stiffness: 200,
                          damping: 15,
                        }}
                        className="absolute top-2 left-2 md:top-3 md:left-3 w-7 h-7 md:w-9 md:h-9 lg:w-10 lg:h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base lg:text-lg shadow-lg"
                      >
                        {index + 1}
                      </motion.div>
                    </div>

                    {/* Card shadow effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-t from-rose-500/20 to-transparent rounded-2xl md:rounded-3xl blur-xl -z-10"
                      animate={{
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Live indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="fixed bottom-3 right-3 md:bottom-6 md:right-6 flex items-center gap-2 bg-white/10 backdrop-blur-lg rounded-full px-3 py-2 md:px-5 md:py-2 shadow-2xl"
        >
          <motion.div
            className="w-2 h-2 md:w-3 md:h-3 bg-rose-500 rounded-full"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [1, 0.7, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <span className="text-white font-semibold text-xs md:text-sm">
            LIVE
          </span>
        </motion.div>
      </div>
    </div>
  );
}
