// "use client";

// import React, {
//   useMemo,
//   useState,
//   useRef,
//   useEffect,
//   memo,
//   CSSProperties,
// } from "react";
// import { motion } from "framer-motion";

// interface AnimatedItem {
//   id: string;
//   img: string;
//   name: string;
//   timestamp: number;
// }

// interface AnimatedMasonryProps {
//   items: AnimatedItem[];
//   columns?: number;
//   gap?: number;
//   speed?: number; // seconds for a loop
//   pauseOnHover?: boolean;
//   cardScale?: number;
// }

// const CONSTANT_SPEED = 90; // Smooth slow scroll

// const idsKey = (arr: AnimatedItem[]) => arr.map((i) => i.id).join("|");

// // -----------------------------------------------------
// // ItemCard
// // -----------------------------------------------------
// interface ItemCardProps {
//   item: AnimatedItem;
//   isNew: boolean;
//   isFirstOccurrence: boolean;
//   gap: number;
//   cardScale: number;
//   shouldBeWide: boolean;
// }

// const ItemCard = memo(function ItemCard({
//   item,
//   isNew,
//   isFirstOccurrence,
//   gap,
//   cardScale,
//   shouldBeWide,
// }: ItemCardProps) {
//   const seed = item.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);

//   const heights = [180, 240, 300, 380, 460, 220, 340, 420, 280, 360];
//   const height = heights[seed % heights.length] * cardScale;

//   return (
//     <motion.div
//       initial={
//         isNew && isFirstOccurrence
//           ? { opacity: 0, scale: 0.9, y: 40 }
//           : undefined
//       }
//       animate={{ opacity: 1, scale: 1, y: 0 }}
//       transition={{
//         duration: 1.2,
//         ease: [0.22, 1, 0.36, 1],
//       }}
//       whileHover={{ scale: 1.05 }}
//       className="rounded-2xl overflow-hidden shadow-xl relative group cursor-pointer"
//       style={
//         {
//           height,
//           width: shouldBeWide ? `calc(200% + ${gap}px)` : "100%",
//           marginBottom: gap,
//         } as CSSProperties
//       }
//     >
//       <img
//         src={item.img}
//         alt={item.name}
//         className="w-full h-full object-cover"
//         loading="lazy"
//       />

//       <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/95 via-neutral-900/50 to-transparent pointer-events-none" />

//       <div
//         className="absolute bottom-0 left-0 right-0 transition-all duration-300"
//         style={{ padding: Math.max(8, 16 * cardScale) }}
//       >
//         <p
//           className="text-white font-bold drop-shadow-2xl line-clamp-2"
//           style={{ fontSize: Math.max(14, 18 * cardScale) }}
//         >
//           {item.name}
//         </p>
//         <p
//           className="text-white/70 drop-shadow-lg mt-1"
//           style={{ fontSize: Math.max(10, 12 * cardScale) }}
//         >
//           {new Date(item.timestamp).toLocaleDateString()}
//         </p>
//       </div>

//       {isNew && isFirstOccurrence && (
//         <motion.div
//           initial={{ opacity: 1 }}
//           animate={{ opacity: 0 }}
//           transition={{ duration: 2.5 }}
//           className="absolute inset-0 ring-4 ring-rose-500/90 rounded-2xl pointer-events-none shadow-2xl shadow-rose-500/50"
//         />
//       )}
//     </motion.div>
//   );
// });

// // -----------------------------------------------------
// // MasonryColumn
// // -----------------------------------------------------
// interface MasonryColumnProps {
//   columnItems: AnimatedItem[];
//   colIndex: number;
//   gap: number;
//   speed: number;
//   pauseOnHover: boolean;
//   cardScale: number;
// }

// const MasonryColumn = memo(function MasonryColumn({
//   columnItems,
//   colIndex,
//   gap,
//   speed,
//   pauseOnHover,
//   cardScale,
// }: MasonryColumnProps) {
//   const [isPaused, setIsPaused] = useState(false);
//   const prevIdsRef = useRef<string>("");
//   const [newItemIds, setNewItemIds] = useState<Set<string>>(new Set());

//   // Detect new items
//   useEffect(() => {
//     const key = idsKey(columnItems);
//     const prev = prevIdsRef.current;

//     if (prev !== key) {
//       const prevSet = new Set(prev.split("|").filter(Boolean));
//       const currSet = new Set(columnItems.map((i) => i.id));

//       const diff = new Set<string>();
//       currSet.forEach((id) => {
//         if (!prevSet.has(id)) diff.add(id);
//       });

//       if (diff.size > 0) {
//         setNewItemIds((p) => {
//           const n = new Set(p);
//           diff.forEach((id) => n.add(id));
//           return n;
//         });

//         const t = setTimeout(() => {
//           setNewItemIds((p) => {
//             const n = new Set(p);
//             diff.forEach((id) => n.delete(id));
//             return n;
//           });
//         }, 2500);

//         return () => clearTimeout(t);
//       }
//     }

//     prevIdsRef.current = key;
//   }, [columnItems]);

//   // Duplicate list for scroll animation
//   const loopedItems = useMemo(() => {
//     if (columnItems.length <= 1) return columnItems;
//     return [...columnItems, ...columnItems, ...columnItems];
//   }, [columnItems]);

//   const direction = colIndex % 2 === 0 ? -1 : 1;
//   const shouldAnimate = columnItems.length > 1;

//   // Static padding when column is empty
//   const columnPadding = columnItems.length === 0 ? 8 : 0;

//   return (
//     <div
//       className="flex-1 relative overflow-hidden"
//       style={{ padding: columnPadding }}
//       onMouseEnter={() => pauseOnHover && setIsPaused(true)}
//       onMouseLeave={() => pauseOnHover && setIsPaused(false)}
//     >
//       <div
//         className="masonry-scroller"
//         style={
//           {
//             animationName: shouldAnimate ? "masonry-scroll" : undefined,
//             animationDuration: `${speed}s`,
//             animationTimingFunction: "linear",
//             animationIterationCount: "infinite",
//             animationDirection: direction === -1 ? "normal" : "reverse",
//             animationDelay: `${colIndex * 0.35}s`,
//             animationPlayState: isPaused ? "paused" : "running",
//           } as CSSProperties
//         }
//       >
//         {loopedItems.map((item, idx) => {
//           const seed = item.id
//             .split("")
//             .reduce((a, c) => a + c.charCodeAt(0), 0);

//           return (
//             <ItemCard
//               key={`${item.id}-${idx}`}
//               item={item}
//               isNew={newItemIds.has(item.id)}
//               isFirstOccurrence={idx < columnItems.length}
//               gap={gap}
//               cardScale={cardScale}
//               shouldBeWide={seed % 8 === 0}
//             />
//           );
//         })}
//       </div>

//       <style jsx>{`
//         @keyframes masonry-scroll {
//           0% {
//             transform: translateY(0);
//           }
//           100% {
//             transform: translateY(-33.333%);
//           }
//         }
//         .masonry-scroller {
//           will-change: transform;
//         }
//       `}</style>
//     </div>
//   );
// });

// // -----------------------------------------------------
// // AnimatedMasonry (Main Component)
// // -----------------------------------------------------
// const AnimatedMasonry: React.FC<AnimatedMasonryProps> = memo(
//   ({
//     items,
//     columns = 4,
//     gap = 16,
//     speed = CONSTANT_SPEED,
//     pauseOnHover = true,
//     cardScale = 1,
//   }) => {
//     const columnDataRef = useRef<Map<number, AnimatedItem[]>>(new Map());

//     const finalSpeed = CONSTANT_SPEED;

//     const columnData = useMemo(() => {
//       const cols: AnimatedItem[][] = Array.from({ length: columns }, () => []);

//       items.forEach((item, idx) => {
//         cols[idx % columns].push(item);
//       });

//       const prevMap = columnDataRef.current;
//       const newMap = new Map<number, AnimatedItem[]>();
//       const finalCols: AnimatedItem[][] = [];

//       for (let i = 0; i < columns; i++) {
//         const newCol = cols[i];
//         const prev = prevMap.get(i);

//         if (
//           prev &&
//           prev.length === newCol.length &&
//           prev.every((it, idx2) => it.id === newCol[idx2]?.id)
//         ) {
//           finalCols.push(prev);
//           newMap.set(i, prev);
//         } else {
//           finalCols.push(newCol);
//           newMap.set(i, newCol);
//         }
//       }

//       columnDataRef.current = newMap;
//       return finalCols;
//     }, [items, columns]);

//     return (
//       <div className="w-full h-full overflow-hidden">
//         <div
//           className="flex h-full"
//           style={{
//             gap: `${gap}px`,
//             padding: `0 ${gap}px`,
//           }}
//         >
//           {columnData.map((colItems, colIndex) => (
//             <MasonryColumn
//               key={`col-${colIndex}`}
//               columnItems={colItems}
//               colIndex={colIndex}
//               gap={gap}
//               speed={finalSpeed}
//               pauseOnHover={pauseOnHover}
//               cardScale={cardScale}
//             />
//           ))}
//         </div>
//       </div>
//     );
//   },
// );

// AnimatedMasonry.displayName = "AnimatedMasonry";

// export default AnimatedMasonry;

"use client";

import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  memo,
  CSSProperties,
  useCallback,
} from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useTransform,
} from "framer-motion";

// ---------------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------------
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
  speed?: number; // pixels per second
  pauseOnHover?: boolean;
  cardScale?: number;
}

// ---------------------------------------------------------------------------
// UTILS
// ---------------------------------------------------------------------------
// Deterministic height generation based on ID (prevents layout shift on hydration)
const getItemHeight = (id: string, scale: number) => {
  // Fixed height for all cards
  return 180 * scale;
};

// ---------------------------------------------------------------------------
// COMPONENT: ItemCard
// ---------------------------------------------------------------------------
const ItemCard = memo(function ItemCard({
  item,
  gap,
  cardScale,
  shouldBeWide,
}: {
  item: AnimatedItem;
  gap: number;
  cardScale: number;
  shouldBeWide: boolean;
}) {
  const height = getItemHeight(item.id, cardScale);

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-neutral-900 shadow-xl transition-transform duration-500 hover:scale-[1.02]"
      style={{
        height,
        width: shouldBeWide ? `calc(200% + ${gap}px)` : "100%",
        marginBottom: gap,
        // Force hardware acceleration
        willChange: "transform",
      }}
    >
      <img
        src={item.img}
        alt={item.name}
        className="h-full w-full object-cover opacity-90 transition-opacity duration-500 hover:opacity-100"
        loading="lazy"
        draggable={false}
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-900/20 to-transparent" />

      <div className="absolute bottom-0 left-0 w-full p-4">
        <p className="line-clamp-1 text-sm font-bold text-white drop-shadow-lg">
          {item.name}
        </p>
        <p className="mt-1 text-xs text-white/60">
          {new Date(item.timestamp).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
});

// ---------------------------------------------------------------------------
// COMPONENT: TickerColumn
// ---------------------------------------------------------------------------
interface TickerColumnProps {
  items: AnimatedItem[]; // These are the raw items for this column
  gap: number;
  speed: number; // Pixels per frame (approx)
  direction?: 1 | -1;
  pauseOnHover: boolean;
  cardScale: number;
}

const TickerColumn = memo(
  ({
    items,
    gap,
    speed,
    direction = 1,
    pauseOnHover,
    cardScale,
  }: TickerColumnProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [contentHeight, setContentHeight] = useState(0);

    // We assume the items are doubled to create the loop.
    // We only need to measure the height of the FIRST set.
    // However, for simplicity and robustness with dynamic data,
    // we measure the whole container and loop at half height.

    // 1. Construct the display list (5x buffered to ensure no whitespace with 10+ columns)
    const displayItems = useMemo(() => {
      if (items.length === 0) return [];
      return [...items, ...items, ...items, ...items, ...items];
    }, [items]);

    // 2. Resize Observer to track height changes dynamically
    useEffect(() => {
      if (!containerRef.current) return;

      const measure = () => {
        if (containerRef.current) {
          // We loop when we have scrolled past the first "set" of items
          // The container holds 5 sets. So 1 set height = total / 5
          setContentHeight(containerRef.current.scrollHeight / 5);
        }
      };

      // Measure immediately
      measure();

      // Measure on resize
      const observer = new ResizeObserver(() => {
        measure();
      });
      observer.observe(containerRef.current);

      return () => observer.disconnect();
    }, [items]);

    // 3. Animation Logic
    const y = useMotionValue(0);
    const isHovered = useRef(false);

    useAnimationFrame((time, delta) => {
      if (pauseOnHover && isHovered.current) return;
      if (contentHeight === 0) return;

      // Normalize speed based on delta (frame duration) to handle lag spikes smoothly
      // Speed input is pixels per second. Delta is ms.
      const moveBy = speed * (delta / 1000) * direction;

      let newY = y.get() - moveBy;

      // The Loop Logic:
      // If we move UP (negative Y) and pass the contentHeight, reset to 0
      if (direction === 1 && newY <= -contentHeight) {
        // We add the remainder to keep motion smooth, don't just set to 0
        newY = newY % contentHeight;
      }

      // If we move DOWN (positive Y) and go positive, snap back to -contentHeight
      if (direction === -1 && newY >= 0) {
        newY = -contentHeight + (newY % contentHeight);
      }

      y.set(newY);
    });

    return (
      <div
        className="relative h-full w-full overflow-hidden"
        onMouseEnter={() => (isHovered.current = true)}
        onMouseLeave={() => (isHovered.current = false)}
      >
        <motion.div
          style={{ y }}
          ref={containerRef}
          className="absolute left-0 top-0 w-full"
        >
          {displayItems.map((item, idx) => {
            // Use a composite key that includes the index to allow duplicates
            const uniqueKey = `${item.id}-${idx}`;
            const seed = item.id.charCodeAt(0);
            return (
              <ItemCard
                key={uniqueKey}
                item={item}
                gap={gap}
                cardScale={cardScale}
                shouldBeWide={seed % 7 === 0} // Randomly make some wide
              />
            );
          })}
        </motion.div>
      </div>
    );
  },
);

TickerColumn.displayName = "TickerColumn";

// ---------------------------------------------------------------------------
// COMPONENT: AnimatedMasonry (Main)
// ---------------------------------------------------------------------------
const AnimatedMasonry: React.FC<AnimatedMasonryProps> = memo(
  ({
    items,
    columns = 4,
    gap = 16,
    speed = 50, // pixels per second
    pauseOnHover = true,
    cardScale = 1,
  }) => {
    // Distribute items into columns
    const cols = useMemo(() => {
      const grid: AnimatedItem[][] = Array.from({ length: columns }, () => []);
      items.forEach((item, i) => {
        grid[i % columns].push(item);
      });
      return grid;
    }, [items, columns]);

    return (
      <div
        className="h-full w-full overflow-hidden bg-transparent"
        style={{ padding: `0 ${gap}px` }}
      >
        <div className="flex h-full" style={{ gap: gap }}>
          {cols.map((colItems, i) => (
            <div key={i} className="flex-1 relative h-full">
              {/* We separate the wrapper (flex-1) from the ticker
                  to prevent layout thrashing on the main flex container
                */}
              <TickerColumn
                items={colItems}
                gap={gap}
                speed={speed}
                // Alternating directions for visual interest
                direction={i % 2 === 0 ? 1 : -1}
                pauseOnHover={pauseOnHover}
                cardScale={cardScale}
              />
            </div>
          ))}
        </div>
      </div>
    );
  },
);

AnimatedMasonry.displayName = "AnimatedMasonry";

export default AnimatedMasonry;
