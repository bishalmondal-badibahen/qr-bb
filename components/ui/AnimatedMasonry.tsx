// AnimatedMasonry.tsx
"use client";

import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  memo,
} from "react";
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
  speed?: number; // seconds for a full loop
  pauseOnHover?: boolean;
  cardScale?: number;
}

// Constant slower speed - smooth and comfortable for viewing
const CONSTANT_SPEED = 90; // seconds for a full loop - slower, more readable

const idsKey = (arr: AnimatedItem[]) => arr.map((i) => i.id).join("|");

// ----------------------------------------
// ItemCard (Memoized)
// ----------------------------------------
const ItemCard = memo(
  function ItemCard({
    item,
    isNew,
    isFirstOccurrence,
    gap,
    cardScale,
    shouldBeWide,
  }: {
    item: AnimatedItem;
    isNew: boolean;
    isFirstOccurrence: boolean;
    gap: number;
    cardScale: number;
    shouldBeWide: boolean;
  }) {
    const itemSeed = item.id
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const heightVariants = [180, 240, 300, 380, 460, 220, 340, 420, 280, 360];
    const heightIndex = itemSeed % heightVariants.length;
    const height = heightVariants[heightIndex] * cardScale;

    return (
      <motion.div
        key={item.id}
        initial={
          isNew && isFirstOccurrence
            ? { opacity: 0, scale: 0.9, y: 40 }
            : undefined
        }
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: 1.2,
          ease: [0.22, 1, 0.36, 1],
        }}
        whileHover={{ scale: 1.05 }}
        className="rounded-2xl overflow-hidden shadow-xl relative group cursor-pointer"
        style={{
          height: `${height}px`,
          marginBottom: `${gap}px`,
          width: shouldBeWide ? `calc(200% + ${gap}px)` : "100%",
        }}
      >
        <img
          src={item.img}
          alt={item.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/95 via-neutral-900/50 to-transparent pointer-events-none" />

        <div
          className="absolute bottom-0 left-0 right-0 transition-all duration-300"
          style={{ padding: `${Math.max(8, 16 * cardScale)}px` }}
        >
          <p
            className="text-white font-bold drop-shadow-2xl line-clamp-2"
            style={{ fontSize: `${Math.max(14, 18 * cardScale)}px` }}
          >
            {item.name}
          </p>
          <p
            className="text-white/70 drop-shadow-lg mt-1"
            style={{ fontSize: `${Math.max(10, 12 * cardScale)}px` }}
          >
            {new Date(item.timestamp).toLocaleDateString()}
          </p>
        </div>

        {isNew && isFirstOccurrence && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{
              duration: 2.5,
              ease: "easeOut",
            }}
            className="absolute inset-0 ring-4 ring-rose-500/90 rounded-2xl pointer-events-none shadow-2xl shadow-rose-500/50"
          />
        )}
      </motion.div>
    );
  },
  (prev, next) =>
    prev.item.id === next.item.id &&
    prev.isNew === next.isNew &&
    prev.isFirstOccurrence === next.isFirstOccurrence &&
    prev.gap === next.gap &&
    prev.cardScale === next.cardScale &&
    prev.shouldBeWide === next.shouldBeWide
);

// ----------------------------------------
// MasonryColumn
// ----------------------------------------
const MasonryColumn = memo(
  function MasonryColumn({
    columnItems,
    colIndex,
    gap,
    speed,
    pauseOnHover,
    cardScale,
  }: {
    columnItems: AnimatedItem[];
    colIndex: number;
    gap: number;
    speed: number;
    pauseOnHover: boolean;
    cardScale: number;
  }) {
    const [isPaused, setIsPaused] = useState(false);
    const prevIdsRef = useRef<string>("");
    const [newItemIds, setNewItemIds] = useState<Set<string>>(new Set());

    // detect new items
    useEffect(() => {
      const key = idsKey(columnItems);
      const prev = prevIdsRef.current;

      if (prev !== key) {
        const prevSet = new Set(prev.split("|").filter(Boolean));
        const currSet = new Set(columnItems.map((i) => i.id));
        const diff = new Set<string>();

        currSet.forEach((id) => {
          if (!prevSet.has(id)) diff.add(id);
        });

        if (diff.size > 0) {
          setNewItemIds((p) => {
            const next = new Set(p);
            diff.forEach((i) => next.add(i));
            return next;
          });

          const t = setTimeout(() => {
            setNewItemIds((p) => {
              const next = new Set(p);
              diff.forEach((i) => next.delete(i));
              return next;
            });
          }, 2500);

          return () => clearTimeout(t);
        }
      }

      prevIdsRef.current = key;
    }, [columnItems]);

    // triple list only if we have multiple items, otherwise just show once
    const loopedItems = useMemo(() => {
      // If there's only 1 item in this column and it's the only column with data,
      // don't triple it to avoid duplicates
      if (columnItems.length === 1) {
        return columnItems;
      }
      return [...columnItems, ...columnItems, ...columnItems];
    }, [columnItems]);

    const direction = colIndex % 2 === 0 ? -1 : 1;
    const shouldAnimate = columnItems.length > 1;

    return (
      <div
        className="flex-1 relative overflow-hidden"
        onMouseEnter={() => pauseOnHover && setIsPaused(true)}
        onMouseLeave={() => pauseOnHover && setIsPaused(false)}
      >
        <div
          className="masonry-scroller"
          style={{
            animationName: shouldAnimate ? "masonry-scroll" : "none",
            animationDuration: `${speed}s`,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            animationDirection: direction === -1 ? "normal" : "reverse",
            animationDelay: `${colIndex * 0.35}s`,
            animationPlayState: isPaused ? "paused" : "running",
          }}
        >
          {loopedItems.map((item, idx) => {
            const seed = item.id
              .split("")
              .reduce((a, c) => a + c.charCodeAt(0), 0);

            return (
              <ItemCard
                key={`${item.id}-${idx}`}
                item={item}
                isNew={newItemIds.has(item.id)}
                isFirstOccurrence={idx < columnItems.length}
                gap={gap}
                cardScale={cardScale}
                shouldBeWide={seed % 8 === 0}
              />
            );
          })}
        </div>

        <style jsx>{`
          @keyframes masonry-scroll {
            0% {
              transform: translateY(0);
            }
            100% {
              transform: translateY(-33.333%);
            }
          }
          .masonry-scroller {
            will-change: transform;
          }
        `}</style>
      </div>
    );
  },
  (prev, next) => {
    if (prev.gap !== next.gap) return false;
    if (prev.speed !== next.speed) return false;
    if (prev.cardScale !== next.cardScale) return false;
    if (prev.pauseOnHover !== next.pauseOnHover) return false;

    if (prev.columnItems === next.columnItems) return true;

    if (prev.columnItems.length !== next.columnItems.length) return false;

    for (let i = 0; i < prev.columnItems.length; i++) {
      if (prev.columnItems[i].id !== next.columnItems[i].id) return false;
    }

    return true;
  }
);

MasonryColumn.displayName = "MasonryColumn";

// ----------------------------------------
// Main AnimatedMasonry Component
// ----------------------------------------
const AnimatedMasonry: React.FC<AnimatedMasonryProps> = memo(
  ({
    items,
    columns = 4,
    gap = 16,
    speed = CONSTANT_SPEED,
    pauseOnHover = true,
    cardScale = 1,
  }) => {
    const columnDataRef = useRef<Map<number, AnimatedItem[]>>(new Map());

    // Override speed prop with constant speed for consistent animation
    const finalSpeed = CONSTANT_SPEED;

    const columnData = useMemo(() => {
      const cols: AnimatedItem[][] = Array.from({ length: columns }, () => []);

      items.forEach((item, idx) => cols[idx % columns].push(item));

      const prevMap = columnDataRef.current;
      const newMap = new Map<number, AnimatedItem[]>();
      const result: AnimatedItem[][] = [];

      for (let i = 0; i < columns; i++) {
        const newCol = cols[i];
        const prev = prevMap.get(i);

        if (
          prev &&
          prev.length === newCol.length &&
          prev.every((it, idx) => it.id === newCol[idx].id)
        ) {
          result.push(prev);
          newMap.set(i, prev);
        } else {
          result.push(newCol);
          newMap.set(i, newCol);
        }
      }

      columnDataRef.current = newMap;
      return result;
    }, [items, columns]);

    return (
      <div className="w-full h-full overflow-hidden">
        <div
          className="flex h-full"
          style={{ gap: `${gap}px`, padding: `0 ${gap}px` }}
        >
          {columnData.map((colItems, colIndex) => (
            <MasonryColumn
              key={`col-${colIndex}`}
              columnItems={colItems}
              colIndex={colIndex}
              gap={gap}
              speed={finalSpeed}
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
