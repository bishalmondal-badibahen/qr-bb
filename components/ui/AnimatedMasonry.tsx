"use client";

import React, { useEffect, useRef, useMemo, useCallback } from "react";
import { gsap } from "gsap";

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

const AnimatedMasonry: React.FC<AnimatedMasonryProps> = React.memo(
  ({
    items,
    columns = 4,
    gap = 16,
    speed = 30,
    pauseOnHover = true,
    cardScale = 1,
  }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const animationsRef = useRef<gsap.core.Tween[]>([]);
    const previousItemsRef = useRef<AnimatedItem[]>([]);
    const columnRefsRef = useRef<Map<number, HTMLElement>>(new Map());
    const isInitializedRef = useRef(false);
    const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const wasEmptyRef = useRef(items.length === 0);

    // Distribute items across columns using useMemo (stable reference)
    const columnData = useMemo(() => {
      if (items.length === 0) return [];

      // Create columns
      const cols: AnimatedItem[][] = Array.from({ length: columns }, () => []);

      // Distribute items across columns evenly
      items.forEach((item, index) => {
        cols[index % columns].push(item);
      });

      // Duplicate items for seamless looping (triple for smooth infinite scroll)
      return cols.map((col) => [...col, ...col, ...col]);
    }, [items, columns]);

    // Detect new items without causing re-render
    const getNewItems = useCallback(
      (currentItems: AnimatedItem[], previousItems: AnimatedItem[]) => {
        const previousIds = new Set(previousItems.map((item) => item.id));
        return currentItems.filter((item) => !previousIds.has(item.id));
      },
      [],
    );

    // Setup animations for each column (only once or when columns change)
    const setupColumnAnimation = useCallback(
      (colIndex: number, columnEl: HTMLElement, itemCount: number) => {
        const direction = colIndex % 2 === 0 ? -1 : 1;
        const itemsContainer = columnEl.querySelector(
          ".items-container",
        ) as HTMLElement;
        if (!itemsContainer) return null;

        // Calculate total height of one set of items
        const itemHeight = 350; // Average height per item
        const totalHeight = itemCount * (itemHeight + gap);
        const oneThirdHeight = totalHeight / 3;

        // Always set initial position for proper start
        if (direction === 1) {
          // Odd columns: scroll up (start from bottom of first set)
          gsap.set(itemsContainer, { y: -oneThirdHeight });
        } else {
          // Even columns: scroll down (start from top)
          gsap.set(itemsContainer, { y: 0 });
        }

        // Create infinite scroll animation
        const anim = gsap.to(itemsContainer, {
          y: direction === 1 ? 0 : -oneThirdHeight,
          duration: speed,
          ease: "none",
          repeat: -1,
          modifiers: {
            y: (y) => {
              const yValue = parseFloat(y);
              if (direction === 1) {
                // Scrolling up: when reaching top (0), reset to bottom
                if (yValue >= 0) {
                  return `-${oneThirdHeight}px`;
                }
              } else {
                // Scrolling down: when reaching bottom, reset to top
                if (yValue <= -oneThirdHeight) {
                  return "0px";
                }
              }
              return y;
            },
          },
        });

        return anim;
      },
      [gap, speed],
    );

    // Initialize animations after DOM is ready
    const initializeAnimations = useCallback(() => {
      if (columnData.length === 0) return;

      // Clear any existing timeout
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }

      // Kill existing animations
      animationsRef.current.forEach((anim) => anim?.kill());
      animationsRef.current = [];

      // Function to attempt initialization with retry logic
      const attemptInitialization = (retryCount = 0, maxRetries = 5) => {
        // Query all columns
        const foundColumns: HTMLElement[] = [];
        const expectedColumns = columns;

        for (let colIndex = 0; colIndex < expectedColumns; colIndex++) {
          const columnEl = document.querySelector(
            `[data-column="${colIndex}"]`,
          ) as HTMLElement;
          if (columnEl) {
            foundColumns.push(columnEl);
          }
        }

        console.log(
          `Initialization attempt ${retryCount + 1}: Found ${foundColumns.length}/${expectedColumns} columns`,
        );

        // If we found all expected columns, initialize them
        if (foundColumns.length === expectedColumns) {
          columnData.forEach((col, colIndex) => {
            const columnEl = document.querySelector(
              `[data-column="${colIndex}"]`,
            ) as HTMLElement;
            if (!columnEl) {
              console.warn(`Column ${colIndex} not found in DOM`);
              return;
            }

            columnRefsRef.current.set(colIndex, columnEl);
            const anim = setupColumnAnimation(colIndex, columnEl, col.length);
            if (anim) {
              animationsRef.current[colIndex] = anim;
            }
          });

          isInitializedRef.current = true;
          console.log(
            "✓ Animations initialized for",
            animationsRef.current.length,
            "columns",
          );
        } else if (retryCount < maxRetries) {
          // Retry after a short delay
          console.warn(
            `Not all columns found yet, retrying in 100ms... (${retryCount + 1}/${maxRetries})`,
          );
          initTimeoutRef.current = setTimeout(() => {
            attemptInitialization(retryCount + 1, maxRetries);
          }, 100);
        } else {
          console.error(
            `Failed to initialize all columns after ${maxRetries} attempts. Found ${foundColumns.length}/${expectedColumns}`,
          );
        }
      };

      // Start initialization with initial delay
      initTimeoutRef.current = setTimeout(() => {
        attemptInitialization();
      }, 300); // Initial delay increased to 300ms
    }, [columnData, setupColumnAnimation, columns]);

    // Initialize or update animations
    useEffect(() => {
      if (columnData.length === 0) {
        wasEmptyRef.current = true;
        return;
      }

      const newItems = getNewItems(items, previousItemsRef.current);

      // Check if we're transitioning from empty to populated
      const transitioningFromEmpty = wasEmptyRef.current && items.length > 0;

      // If this is initialization or column count changed, or transitioning from empty, restart animations
      if (
        !isInitializedRef.current ||
        animationsRef.current.length !== columns ||
        transitioningFromEmpty
      ) {
        // Reset initialization flag if transitioning from empty
        if (transitioningFromEmpty) {
          isInitializedRef.current = false;
        }

        initializeAnimations();
        wasEmptyRef.current = false;
      } else if (newItems.length > 0) {
        // New items added - smoothly integrate them without restarting animation
        newItems.forEach((newItem) => {
          const itemElement = document.querySelector(
            `[data-item-id="${newItem.id}"]`,
          ) as HTMLElement;

          if (itemElement) {
            // Fade in new items smoothly
            gsap.from(itemElement, {
              opacity: 0,
              scale: 0.9,
              duration: 0.8,
              ease: "power2.out",
            });
          }
        });
      }

      // Always update previous items ref
      previousItemsRef.current = items;

      // Log state for debugging
      console.log(
        `AnimatedMasonry: ${items.length} items, ${columns} columns, initialized: ${isInitializedRef.current}, animations: ${animationsRef.current.length}`,
      );
    }, [columnData, items, columns, getNewItems, initializeAnimations]);

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        animationsRef.current.forEach((anim) => anim?.kill());
        if (initTimeoutRef.current) {
          clearTimeout(initTimeoutRef.current);
        }
      };
    }, []);

    const handleMouseEnter = useCallback(
      (colIndex: number) => {
        if (!pauseOnHover) return;
        const anim = animationsRef.current[colIndex];
        if (anim) {
          gsap.to(anim, { timeScale: 0, duration: 0.5 });
        }
      },
      [pauseOnHover],
    );

    const handleMouseLeave = useCallback(
      (colIndex: number) => {
        if (!pauseOnHover) return;
        const anim = animationsRef.current[colIndex];
        if (anim) {
          gsap.to(anim, { timeScale: 1, duration: 0.5 });
        }
      },
      [pauseOnHover],
    );

    if (items.length === 0) {
      return (
        <div className="flex items-center justify-center h-full w-full">
          <p className="text-white/60 text-lg">No items to display</p>
        </div>
      );
    }

    return (
      <div ref={containerRef} className="w-full h-full overflow-hidden">
        <div
          className="flex h-full"
          style={{ gap: `${gap}px`, padding: `0 ${gap}px` }}
        >
          {columnData.map((column, colIndex) => (
            <div
              key={`col-${colIndex}`}
              data-column={colIndex}
              className="flex-1 relative overflow-hidden"
              onMouseEnter={() => handleMouseEnter(colIndex)}
              onMouseLeave={() => handleMouseLeave(colIndex)}
            >
              <div className="items-container">
                {column.map((item, itemIndex) => {
                  const seed = item.timestamp % 150;
                  const baseHeight = seed + 250;
                  const height = Math.max(
                    150,
                    Math.floor(baseHeight * cardScale),
                  ); // Apply scale with minimum

                  return (
                    <div
                      key={`${item.id}-${itemIndex}`}
                      data-item-id={item.id}
                      className="mb-4 rounded-xl overflow-hidden shadow-2xl relative group cursor-pointer transform transition-transform duration-300 hover:scale-105"
                      style={{
                        height: `${height}px`,
                        marginBottom: `${gap}px`,
                        transition: "height 0.5s ease-in-out",
                      }}
                    >
                      {/* Image */}
                      <img
                        src={item.img}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />

                      {/* Always Visible Gradient Overlay at Bottom */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

                      {/* Name Overlay - Always Visible */}
                      <div
                        className="absolute bottom-0 left-0 right-0 transition-all duration-300"
                        style={{ padding: `${Math.max(8, 16 * cardScale)}px` }}
                      >
                        <p
                          className="text-white font-bold drop-shadow-2xl"
                          style={{
                            fontSize: `${Math.max(14, 18 * cardScale)}px`,
                          }}
                        >
                          {item.name}
                        </p>
                        <p
                          className="text-white/70 drop-shadow-lg"
                          style={{
                            fontSize: `${Math.max(10, 12 * cardScale)}px`,
                          }}
                        >
                          {new Date(item.timestamp).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Hover Color Shift Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                      {/* Glow Effect */}
                      <div className="absolute inset-0 ring-2 ring-primary/0 group-hover:ring-primary/50 rounded-xl transition-all duration-300" />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison to prevent unnecessary re-renders
    // Only re-render if items actually changed (new items added)
    if (prevProps.items.length !== nextProps.items.length) {
      return false; // Re-render
    }
    if (prevProps.columns !== nextProps.columns) {
      return false; // Re-render
    }
    if (prevProps.speed !== nextProps.speed) {
      return false; // Re-render
    }
    if (prevProps.gap !== nextProps.gap) {
      return false; // Re-render
    }
    if (prevProps.pauseOnHover !== nextProps.pauseOnHover) {
      return false; // Re-render
    }
    if (prevProps.cardScale !== nextProps.cardScale) {
      return false; // Re-render
    }

    // Check if any item IDs changed
    const prevIds = prevProps.items.map((i) => i.id).join(",");
    const nextIds = nextProps.items.map((i) => i.id).join(",");

    return prevIds === nextIds; // Same IDs = skip re-render
  },
);

AnimatedMasonry.displayName = "AnimatedMasonry";

export default AnimatedMasonry;
