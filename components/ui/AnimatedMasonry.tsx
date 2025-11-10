"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

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

const MasonryColumn = React.memo<{
  columnItems: AnimatedItem[];
  colIndex: number;
  gap: number;
  speed: number;
  pauseOnHover: boolean;
  cardScale: number;
}>(({ columnItems, colIndex, gap, speed, pauseOnHover, cardScale }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [newItemIds, setNewItemIds] = useState<Set<string>>(new Set());
  const prevItemIdsRef = useRef<Set<string>>(new Set());
  const direction = colIndex % 2 === 0 ? -1 : 1;

  useEffect(() => {
    const currentIds = new Set(columnItems.map(item => item.id));
    const prevIds = prevItemIdsRef.current;
    const newIds = new Set<string>();

    currentIds.forEach(id => {
      if (!prevIds.has(id)) {
        newIds.add(id);
      }
    });

    if (newIds.size > 0) {
      setNewItemIds(prev => new Set([...prev, ...newIds]));
      // Clear the highlight after animation completes
      setTimeout(() => {
        setNewItemIds(current => {
          const updated = new Set(current);
          newIds.forEach(id => updated.delete(id));
          return updated;
        });
      }, 3000);
    }

    prevItemIdsRef.current = currentIds;
  }, [columnItems]);

  // Always triple items for infinite scroll
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
        {loopedItems.map((item, itemIndex) => {
          // Create varied sizes based on item ID for consistency
          const itemSeed = item.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

          // Height variations: small, medium, large, extra-large, tall, very tall
          // More variety for dynamic bento grid effect
          const heightVariants = [
            180,  // compact
            240,  // small
            300,  // medium
            380,  // large
            460,  // extra-large
            220,  // short-medium
            340,  // medium-large
            420,  // tall
            280,  // small-medium
            360,  // medium-tall
          ];
          const heightIndex = itemSeed % heightVariants.length;
          const height = heightVariants[heightIndex] * cardScale;

          // Width variations for bento grid effect
          // Some items span wider occasionally for visual interest
          const shouldBeWide = itemSeed % 8 === 0; // ~12.5% chance of being wide

          const isNewItem = newItemIds.has(item.id);
          // Only animate the first occurrence of each new item
          const isFirstOccurrence = itemIndex < columnItems.length;

          return (
            <motion.div
              key={`${item.id}-${itemIndex}`}
              initial={isNewItem && isFirstOccurrence ? {
                opacity: 0,
                scale: 0.9,
                y: 40,
              } : false}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              transition={{
                duration: 1.5,
                ease: [0.22, 1, 0.36, 1],
                opacity: {
                  duration: 1.0,
                  ease: "easeOut"
                },
                scale: {
                  duration: 1.5,
                  ease: [0.22, 1, 0.36, 1]
                },
                y: {
                  duration: 1.2,
                  ease: [0.22, 1, 0.36, 1]
                }
              }}
              whileHover={{ scale: 1.05 }}
              className={`rounded-2xl overflow-hidden shadow-xl relative group cursor-pointer ${
                shouldBeWide ? 'col-span-2' : ''
              }`}
              style={{
                height: `${height}px`,
                marginBottom: `${gap}px`,
                width: shouldBeWide ? `calc(200% + ${gap}px)` : '100%',
              }}
            >
              <img
                src={item.img}
                alt={item.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/95 via-neutral-900/50 to-transparent pointer-events-none" />
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
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/30 via-rose-600/20 to-rose-700/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div className="absolute inset-0 ring-2 ring-rose-500/0 group-hover:ring-rose-500/60 rounded-2xl transition-all duration-300" />
              {isNewItem && isFirstOccurrence && (
                <motion.div
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{
                    duration: 3.0,
                    ease: "easeOut",
                  }}
                  className="absolute inset-0 ring-4 ring-rose-500/90 rounded-2xl pointer-events-none shadow-2xl shadow-rose-500/50"
                />
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  if (prevProps.columnItems.length !== nextProps.columnItems.length) return false;
  if (prevProps.gap !== nextProps.gap) return false;
  if (prevProps.speed !== nextProps.speed) return false;
  if (prevProps.cardScale !== nextProps.cardScale) return false;
  if (prevProps.pauseOnHover !== nextProps.pauseOnHover) return false;

  const prevIds = prevProps.columnItems;
  const nextIds = nextProps.columnItems;

  for (let i = 0; i < prevIds.length; i++) {
    if (prevIds[i].id !== nextIds[i].id) {
      return false;
    }
  }

  return true;
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
    const columnDataRef = useRef<Map<number, AnimatedItem[]>>(new Map());

    const columnData = useMemo(() => {
      if (items.length === 0) return [];

      const prevMap = columnDataRef.current;
      const newMap = new Map<number, AnimatedItem[]>();
      const cols: AnimatedItem[][] = Array.from({ length: columns }, () => []);

      items.forEach((item, index) => {
        cols[index % columns].push(item);
      });

      const result: AnimatedItem[][] = [];
      for (let i = 0; i < columns; i++) {
        const newCol = cols[i];
        const prevCol = prevMap.get(i);

        if (prevCol &&
            prevCol.length === newCol.length &&
            prevCol.every((item, idx) => item.id === newCol[idx].id)) {
          result.push(prevCol);
          newMap.set(i, prevCol);
        } else {
          result.push(newCol);
          newMap.set(i, newCol);
        }
      }

      columnDataRef.current = newMap;
      return result;
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
