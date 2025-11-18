"use client";

import { useEffect, useState, useMemo } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import AnimatedMasonry from "@/components/ui/AnimatedMasonry";
import TypingText from "@/components/ui/Typingtext";

type UserEntry = {
  id: string;
  name: string;
  imageURL?: string | null;
  timestamp: number;
};

export default function DisplayPage() {
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Detect screen size for responsive columns and gap
  const [columns, setColumns] = useState(4);
  const [gap, setGap] = useState(16);
  const [cardScale, setCardScale] = useState(1);

  // Dynamic columns and card sizing based on item count
  useEffect(() => {
    const updateResponsiveSettings = () => {
      const width = window.innerWidth;
      const itemCount = users.length;

      // Base columns from screen width
      let baseColumns = 4;
      let baseGap = 16;
      let maxColumns = 6;

      if (width >= 3840) {
        // 4K displays
        baseColumns = 12;
        baseGap = 24;
        maxColumns = 18;
      } else if (width >= 2560) {
        // 2K displays
        baseColumns = 11;
        baseGap = 22;
        maxColumns = 15;
      } else if (width >= 1920) {
        // Large desktop
        baseColumns = 10;
        baseGap = 20;
        maxColumns = 13;
      } else if (width >= 1440) {
        // Desktop XL (>= 1440px)
        baseColumns = 10;
        baseGap = 18;
        maxColumns = 12;
      } else if (width >= 1280) {
        // Desktop
        baseColumns = 6;
        baseGap = 16;
        maxColumns = 8;
      } else if (width >= 1024) {
        // Laptop
        baseColumns = 3;
        baseGap = 14;
        maxColumns = 4;
      } else if (width >= 768) {
        // Tablet
        baseColumns = 2;
        baseGap = 12;
        maxColumns = 3;
      } else {
        // Mobile
        baseColumns = 1;
        baseGap = 10;
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
      setCardScale(scale);
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
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            user.name,
          )}&size=600&background=random&bold=true`,
        timestamp: user.timestamp,
      })),
    [users],
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-rose-300 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6 animate-fade-in">
          <div className="relative">
            <div className="h-20 w-20 rounded-full border-4 border-rose-500/30 border-t-rose-500 animate-spin" />
            <div className="absolute inset-0 h-20 w-20 rounded-full bg-rose-500/20 blur-2xl animate-pulse" />
          </div>
          <p className="text-neutral-700 text-xl font-medium">
            Loading display...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-neutral-200 to-rose-300 overflow-hidden fixed inset-0">
      {users.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-screen text-center px-4">
          <TypingText
            text={[
              "Your financial बड़ी बहन",
              "Finance for every family",
              "Finances for a stress-free life",
              "Money, made simple",
              "Plan your future",
              "Your goals, sorted",
              "Invest with clarity",
            ]}
            typingSpeed={75}
            pauseDuration={1500}
            showCursor={true}
            className="text-4xl xl:text-5xl font-bold text-center max-w-2xl"
            cursorClassName="h-[2.5rem]"
            hideCursorWhileTyping
            textColors={["#ff2056"]}
            variableSpeed={{ min: 50, max: 120 }}
          />
        </div>
      ) : (
        <div className="h-full w-full transition-all duration-500 ease-in-out">
          <AnimatedMasonry
            items={animatedItems}
            columns={columns}
            gap={gap}
            pauseOnHover={true}
            cardScale={cardScale}
          />
        </div>
      )}
    </div>
  );
}
