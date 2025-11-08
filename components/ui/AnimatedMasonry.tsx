"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AnimatedItem {
  id: string;
  img: string;
  name: string;
  timestamp: number;
}

interface AnimatedMasonryProps {
  items: AnimatedItem[];
  columns?: number;
  gap?: number;
  speed?: number;
  pauseOnHover?: boolean;
  cardScale?: number;
}

// Individual Column Component - only re-renders when its own data changes
const MasonryColumn = React.memo<{
  columnItems: AnimatedItem[];
  colIndex: number;
  gap: number;
  speed: number;
  pauseOnHover: boolean;
  cardScale: number;
}>(({ columnItems, colIndex, gap, speed, pauseOnHover, cardScale }) => {
  const [isPaused, setIsPaused] = useState(false);
  const direction = colIndex % 2 === 0 ? -1 : 1;

  // Triple the items for seamless looping
  const loopedItems = useMemo(
    () => [...columnItems, ...columnItems, ...columnItems],
    [columnItems]
  );

  return (
    <motion.div
      className="flex-1 relative overflow-hidden"
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      <motion.div
        animate={{
          y: direction === -1 ? [0, "-33.333%"] : ["-33.333%", 0],
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: "linear",
          delay: colIndex * 0.5,
        }}
        style={{
          animationPlayState: isPaused ? "paused" : "running",
        }}
      >
        <AnimatePresence initial={false}>
          {loopedItems.map((item, itemIndex) => {
            const seed = item.timestamp % 150;
            const baseHeight = seed + 250;
            const height = Math.max(150, Math.floor(baseHeight * cardScale));

            return (
              <motion.div
                key={`${item.id}-${itemIndex}`}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                whileHover={{ scale: 1.05 }}
                className="rounded-2xl overflow-hidden shadow-xl relative group cursor-pointer"
                style={{
                  height: `${height}px`,
                  marginBottom: `${gap}px`,
                }}
              >
                {/* Image */}
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/95 via-neutral-900/50 to-transparent pointer-events-none" />

                {/* Name Overlay */}
                <div
                  className="absolute bottom-0 left-0 right-0 transition-all duration-300"
                  style={{ padding: `${Math.max(8, 16 * cardScale)}px` }}
                >
                  <p
                    className="text-white font-bold drop-shadow-2xl line-clamp-2"
                    style={{
                      fontSize: `${Math.max(14, 18 * cardScale)}px`,
                    }}
                  >
                    {item.name}
                  </p>
                  <p
                    className="text-white/70 drop-shadow-lg mt-1"
                    style={{
                      fontSize: `${Math.max(10, 12 * cardScale)}px`,
                    }}
                  >
                    {new Date(item.timestamp).toLocaleDateString()}
                  </p>
                </div>

                {/* Hover Rose Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/30 via-rose-600/20 to-rose-700/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Border Glow */}
                <div className="absolute inset-0 ring-2 ring-rose-500/0 group-hover:ring-rose-500/60 rounded-2xl transition-all duration-300" />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if column data actually changed
  if (prevProps.columnItems.length !== nextProps.columnItems.length) return false;
  if (prevProps.gap !== nextProps.gap) return false;
  if (prevProps.speed !== nextProps.speed) return false;
  if (prevProps.cardScale !== nextProps.cardScale) return false;

  // Check if items in this column changed
  const prevIds = prevProps.columnItems.map(i => i.id).join(',');
  const nextIds = nextProps.columnItems.map(i => i.id).join(',');

  return prevIds === nextIds;
});

MasonryColumn.displayName = "MasonryColumn";

const AnimatedMasonry: React.FC<AnimatedMasonryProps> = React.memo(
  ({
    items,
    columns = 4,
    gap = 16,
    speed = 30,
    pauseOnHover = true,
    cardScale = 1,
  }) => {
    // Distribute items across columns - stable distribution
    const columnData = useMemo(() => {
      if (items.length === 0) return [];

      // Create columns
      const cols: AnimatedItem[][] = Array.from({ length: columns }, () => []);

      // Distribute items across columns evenly
      items.forEach((item, index) => {
        cols[index % columns].push(item);
      });

      return cols;
    }, [items, columns]);

    if (items.length === 0) {
      return (
        <div className="flex items-center justify-center h-full w-full">
          <p className="text-white/60 text-lg">No items to display</p>
        </div>
      );
    }

    return (
      <div className="w-full h-full overflow-hidden">
        <div
          className="flex h-full"
          style={{ gap: `${gap}px`, padding: `0 ${gap}px` }}
        >
          {columnData.map((columnItems, colIndex) => (
            <MasonryColumn
              key={`col-${colIndex}`}
              columnItems={columnItems}
              colIndex={colIndex}
              gap={gap}
              speed={speed}
              pauseOnHover={pauseOnHover}
              cardScale={cardScale}
            />
          ))}
        </div>
      </div>
    );
  }
);

AnimatedMasonry.displayName = "AnimatedMasonry";

export default AnimatedMasonry;
