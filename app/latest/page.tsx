"use client";

import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";

interface User {
  id: string;
  name: string;
  imageUrl: string;
  timestamp: number;
}

export default function LatestPage() {
  const [latestThree, setLatestThree] = useState<User[]>([]);
  const [prevIds, setPrevIds] = useState<string[]>([]);

  useEffect(() => {
    const usersRef = ref(db, "users");

    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();

      if (!data) {
        setLatestThree([]);
        return;
      }

      const usersList: User[] = Object.entries(data).map(([id, value]: [string, any]) => ({
        id,
        name: value.name || "Unknown",
        imageUrl: value.imageURL || "/placeholder.png",
        timestamp: value.timestamp || Date.now(),
      }));

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

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-rose-200 via-white to-rose-200 flex items-center justify-center overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl"
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
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl"
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
      <div className="relative z-10 w-full max-w-7xl px-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 mb-4">
            Latest Responses
          </h1>
        </motion.div>

        {/* Cards Grid */}
        {latestThree.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-neutral-800 text-2xl"
          >
            Waiting for responses...
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <AnimatePresence mode="popLayout">
              {latestThree.map((user, index) => {
                const state = getItemState(user, index);
                const itemSeed = user.id
                  .split("")
                  .reduce((acc, char) => acc + char.charCodeAt(0), 0);
                const heightVariants = [320, 360, 400, 340, 380];
                const height = 400;

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
                    className="relative group cursor-pointer perspective-1000"
                    style={{
                      transformStyle: "preserve-3d",
                    }}
                  >
                    {/* Card container */}
                    <div
                      className="relative rounded-3xl overflow-hidden shadow-2xl"
                      style={{ height: `${height}px` }}
                    >
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
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <motion.div
                          initial={state.isNew ? { y: 20, opacity: 0 } : false}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{
                            delay: 0.2,
                            duration: 0.6,
                            ease: "easeOut",
                          }}
                        >
                          <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-2xl">
                            {user.name}
                          </h3>
                          <p className="text-white/70 text-sm drop-shadow-lg">
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
                          className="absolute inset-0 ring-4 ring-rose-500 rounded-3xl pointer-events-none"
                        >
                          <motion.div
                            className="absolute top-4 right-4 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg"
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
                        className="absolute top-4 left-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
                      >
                        {index + 1}
                      </motion.div>
                    </div>

                    {/* Card shadow effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-t from-rose-500/20 to-transparent rounded-3xl blur-xl -z-10"
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
          className="fixed bottom-8 right-8 flex items-center gap-3 bg-white/10 backdrop-blur-lg rounded-full px-6 py-3 shadow-2xl"
        >
          <motion.div
            className="w-3 h-3 bg-rose-500 rounded-full"
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
          <span className="text-white font-semibold text-sm">LIVE</span>
        </motion.div>
      </div>
    </div>
  );
}
