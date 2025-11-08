"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, BarChart3, Users } from "lucide-react";

interface ThankYouTabProps {
  onBackToForm: () => void;
}

export default function ThankYouTab({ onBackToForm }: ThankYouTabProps) {
  const router = useRouter();

  const colors = ["#fb7185", "#f43f5e", "#e11d48", "#be123c", "#9f1239"];

  // Pre-generate confetti positions to avoid hydration issues
  const confettiData = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    yOffset: -100 - (i * 10),
    xOffset: (i % 2 === 0 ? 1 : -1) * (30 + i * 5),
    rotation: i * 30,
    color: colors[i % colors.length],
    delay: 0.8 + (i * 0.08),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed inset-0 bg-gradient-to-br from-rose-500 via-rose-600 to-rose-700 flex items-center justify-center overflow-hidden"
    >
          {/* Animated Background Circles */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 2, opacity: 0.1 }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.1 }}
            className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"
          />
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 2, opacity: 0.1 }}
            transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
            className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"
          />

          {/* Main Content Container */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="relative z-10 w-full max-w-md px-6 py-8 flex flex-col items-center justify-center min-h-screen"
          >
            {/* Success Icon with Animation */}
            <motion.div
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.4,
              }}
              className="relative mb-8"
            >
              {/* Pulsing background circle */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.2, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.6,
                }}
                className="absolute inset-0 bg-white rounded-full blur-xl"
              />

              {/* Main success circle */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 250,
                  damping: 20,
                  delay: 0.5,
                }}
                className="relative w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl"
              >
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: 0.7,
                  }}
                >
                  <Check className="w-16 h-16 text-rose-500" strokeWidth={3} />
                </motion.div>
              </motion.div>

              {/* Confetti particles */}
              <div className="absolute inset-0 pointer-events-none">
                {confettiData.map((confetti) => (
                  <motion.div
                    key={confetti.id}
                    initial={{ scale: 0, opacity: 0, x: 0, y: 0, rotate: 0 }}
                    animate={{
                      scale: [0, 1.2, 1, 0],
                      opacity: [0, 1, 0.8, 0],
                      y: confetti.yOffset,
                      x: confetti.xOffset,
                      rotate: confetti.rotation,
                    }}
                    transition={{
                      duration: 1.8,
                      delay: 0.8 + confetti.delay,
                      ease: "easeOut",
                    }}
                    className="absolute top-1/2 left-1/2"
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: confetti.color,
                    }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Thank You Text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6, ease: "easeOut" }}
              className="text-center mb-8"
            >
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.5, ease: "easeOut" }}
                className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight"
              >
                Thank You! 🎉
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.5, ease: "easeOut" }}
                className="text-lg md:text-xl text-white/90 leading-relaxed px-4"
              >
                Your response has been recorded successfully. We appreciate your time!
              </motion.p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5, ease: "easeOut" }}
              className="flex flex-col gap-3 w-full px-4"
            >
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.3, duration: 0.3 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={onBackToForm}
                className="w-full py-4 px-6 rounded-2xl bg-white text-rose-600 font-bold text-lg shadow-xl hover:shadow-2xl transition-shadow"
              >
                Submit Another Response
              </motion.button>

              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.4, duration: 0.3 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/display")}
                className="w-full py-4 px-6 rounded-2xl bg-white/20 backdrop-blur-sm text-white font-bold text-lg border-2 border-white/30 hover:bg-white/30 transition-colors flex items-center justify-center gap-2"
              >
                <Users className="w-5 h-5" />
                View All Responses
              </motion.button>

              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5, duration: 0.3 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/result")}
                className="w-full py-4 px-6 rounded-2xl bg-white/20 backdrop-blur-sm text-white font-bold text-lg border-2 border-white/30 hover:bg-white/30 transition-colors flex items-center justify-center gap-2"
              >
                <BarChart3 className="w-5 h-5" />
                View Statistics
              </motion.button>
            </motion.div>

            {/* Decorative emoji */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.6, duration: 0.5, type: "spring", stiffness: 200 }}
              className="mt-8 text-6xl"
            >
              <motion.span
                animate={{
                  rotate: [0, 10, -10, 10, 0],
                }}
                transition={{
                  duration: 0.5,
                  delay: 1.8,
                  repeat: 2,
                }}
                className="inline-block"
              >
                🎊
              </motion.span>
            </motion.div>
          </motion.div>
        </motion.div>
  );
}
