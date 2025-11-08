"use client";

import { useEffect, useState, useMemo } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import AnimatedMasonry from "@/components/ui/AnimatedMasonry";

type UserEntry = {
  id: string;
  name: string;
  imageURL?: string | null;
  timestamp: number;
};

export default function DisplayPage() {
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Detect screen size for responsive columns, gap, and speed
  const [columns, setColumns] = useState(4);
  const [gap, setGap] = useState(16);
  const [speed, setSpeed] = useState(40);
  const [cardScale, setCardScale] = useState(1);

  // Dynamic columns and card sizing based on item count
  useEffect(() => {
    const updateResponsiveSettings = () => {
      const width = window.innerWidth;
      const itemCount = users.length;

      // Base columns from screen width
      let baseColumns = 4;
      let baseGap = 16;
      let baseSpeed = 40;
      let maxColumns = 6;

      if (width >= 3840) {
        // 4K displays
        baseColumns = 8;
        baseGap = 24;
        baseSpeed = 60;
        maxColumns = 12;
      } else if (width >= 2560) {
        // 2K displays
        baseColumns = 7;
        baseGap = 22;
        baseSpeed = 55;
        maxColumns = 10;
      } else if (width >= 1920) {
        // Large desktop
        baseColumns = 6;
        baseGap = 20;
        baseSpeed = 50;
        maxColumns = 8;
      } else if (width >= 1536) {
        // Desktop XL
        baseColumns = 5;
        baseGap = 18;
        baseSpeed = 45;
        maxColumns = 7;
      } else if (width >= 1280) {
        // Desktop
        baseColumns = 4;
        baseGap = 16;
        baseSpeed = 40;
        maxColumns = 6;
      } else if (width >= 1024) {
        // Laptop
        baseColumns = 3;
        baseGap = 14;
        baseSpeed = 35;
        maxColumns = 4;
      } else if (width >= 768) {
        // Tablet
        baseColumns = 2;
        baseGap = 12;
        baseSpeed = 30;
        maxColumns = 3;
      } else {
        // Mobile
        baseColumns = 1;
        baseGap = 10;
        baseSpeed = 25;
        maxColumns = 2;
      }

      // Calculate additional columns based on item count
      let additionalColumns = 0;
      let scale = 1;

      if (itemCount > 200) {
        // 200+ items: add 3 columns, scale down to 70%
        additionalColumns = 3;
        scale = 0.7;
      } else if (itemCount > 150) {
        // 150-200 items: add 2 columns, scale down to 75%
        additionalColumns = 2;
        scale = 0.75;
      } else if (itemCount > 100) {
        // 100-150 items: add 2 columns, scale down to 80%
        additionalColumns = 2;
        scale = 0.8;
      } else if (itemCount > 50) {
        // 50-100 items: add 1 column, scale down to 90%
        additionalColumns = 1;
        scale = 0.9;
      }

      // Calculate final columns (but don't exceed max)
      const finalColumns = Math.min(
        baseColumns + additionalColumns,
        maxColumns,
      );

      // Calculate minimum card width to ensure visibility
      const minCardWidth = 150; // Minimum 150px card width
      const availableWidth = width - baseGap * (finalColumns + 1);
      const cardWidth = availableWidth / finalColumns;

      // If cards would be too small, reduce columns
      let adjustedColumns = finalColumns;
      if (cardWidth < minCardWidth) {
        adjustedColumns = Math.floor(availableWidth / minCardWidth);
        adjustedColumns = Math.max(adjustedColumns, baseColumns); // Don't go below base
      }

      setColumns(adjustedColumns);
      setGap(baseGap);
      setSpeed(baseSpeed);
      setCardScale(scale);

      console.log(
        `Display settings: ${itemCount} items → ${adjustedColumns} columns (base: ${baseColumns}, scale: ${scale})`,
      );
    };

    updateResponsiveSettings();
    window.addEventListener("resize", updateResponsiveSettings);
    return () => window.removeEventListener("resize", updateResponsiveSettings);
  }, [users.length]); // Re-run when item count changes

  useEffect(() => {
    const usersRef = ref(db, "users");

    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setUsers([]);
        setLoading(false);
        return;
      }

      // Convert to array with IDs
      const userArray: UserEntry[] = Object.entries(data).map(([id, value]) => {
        const entry = value as {
          name: string;
          imageURL?: string | null;
          timestamp: number;
        };
        return {
          id,
          name: entry.name,
          imageURL: entry.imageURL,
          timestamp: entry.timestamp,
        };
      });

      // Sort by timestamp (newest first)
      userArray.sort((a, b) => b.timestamp - a.timestamp);

      setUsers(userArray);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Convert user entries to animated masonry items (memoized to prevent re-creation)
  const animatedItems = useMemo(
    () =>
      users.map((user) => ({
        id: user.id,
        name: user.name,
        img:
          user.imageURL ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=600&background=random&bold=true`,
        timestamp: user.timestamp,
      })),
    [users],
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-300 to-rose-300 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6 animate-fade-in">
          <div className="relative">
            <div className="h-20 w-20 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
            <div className="absolute inset-0 h-20 w-20 rounded-full bg-primary/20 blur-2xl animate-pulse" />
          </div>
          <p className="text-white/80 text-xl font-medium">
            Loading display...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden fixed inset-0">
      {users.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-screen text-center px-4">
          <div className="relative mb-8 animate-fade-in">
            <div className="h-32 w-32 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
              <svg
                className="h-16 w-16 text-primary/60"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div className="absolute inset-0 h-32 w-32 rounded-full bg-primary/10 blur-3xl animate-pulse" />
          </div>
          <p className="text-3xl font-semibold text-white mb-3 animate-fade-in">
            No entries yet
          </p>
          <p
            className="text-white/60 max-w-md text-lg animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            Waiting for entries to appear. They will be displayed here in
            real-time with animated columns.
          </p>
        </div>
      ) : (
        <div className="h-full w-full transition-all duration-500 ease-in-out">
          <AnimatedMasonry
            items={animatedItems}
            columns={columns}
            gap={gap}
            speed={speed}
            pauseOnHover={true}
            cardScale={cardScale}
          />
        </div>
      )}

      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s", animationDuration: "4s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s", animationDuration: "5s" }}
        />
      </div>
    </div>
  );
}
