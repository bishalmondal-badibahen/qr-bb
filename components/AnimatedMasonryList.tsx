"use client";

import { useEffect, useState, useMemo } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import AnimatedMasonry from "@/components/ui/AnimatedMasonry";
import { Users, TrendingUp, Play, Pause, Gauge } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

type UserEntry = {
  id: string;
  name: string;
  imageURL?: string | null;
  timestamp: number;
};

export default function AnimatedMasonryList() {
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(30);
  const [columns, setColumns] = useState(4);

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
      <Card className="glass border-border/50 shadow-2xl overflow-hidden">
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
              <div className="absolute inset-0 h-12 w-12 rounded-full bg-primary/20 blur-xl animate-pulse" />
            </div>
            <p className="text-sm text-muted-foreground">Loading entries...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-border/50 shadow-2xl overflow-hidden animate-fade-in">
      {/* Header */}
      <CardHeader className="bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 border-b">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center shadow-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Animated Columns
              </CardTitle>
              <CardDescription className="text-xs flex items-center gap-1.5 mt-1">
                <TrendingUp className="h-3 w-3" />
                {users.length} {users.length === 1 ? "entry" : "entries"} •
                Auto-scrolling
              </CardDescription>
            </div>
          </div>
          {users.length > 0 && (
            <Badge variant="success" className="shadow-lg">
              <div className="h-1.5 w-1.5 rounded-full bg-white mr-1.5 animate-pulse" />
              Live
            </Badge>
          )}
        </div>

        {/* Controls */}
        {users.length > 0 && (
          <div className="mt-4 space-y-4 pt-4 border-t border-border/50">
            {/* Play/Pause & Speed */}
            <div className="flex items-center gap-4 flex-wrap">
              <Button
                variant={isPaused ? "default" : "outline"}
                size="sm"
                onClick={() => setIsPaused(!isPaused)}
                className="gap-2"
              >
                {isPaused ? (
                  <>
                    <Play className="h-4 w-4" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4" />
                    Pause
                  </>
                )}
              </Button>

              <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                <Gauge className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Speed</span>
                    <span className="text-xs font-medium">
                      {speed === 60 ? "Slow" : speed === 30 ? "Normal" : "Fast"}
                    </span>
                  </div>
                  <Slider
                    value={[speed]}
                    onValueChange={(value) => setSpeed(value[0])}
                    min={15}
                    max={60}
                    step={15}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">Columns:</span>
                <div className="flex gap-2">
                  {[2, 3, 4, 5].map((col) => (
                    <Button
                      key={col}
                      variant={columns === col ? "default" : "outline"}
                      size="sm"
                      onClick={() => setColumns(col)}
                      className="w-8 h-8 p-0"
                    >
                      {col}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      {/* Animated Masonry Content */}
      <CardContent className="p-0">
        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="relative mb-6">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                <Users className="h-10 w-10 text-primary/60" />
              </div>
              <div className="absolute inset-0 h-20 w-20 rounded-full bg-primary/10 blur-2xl animate-pulse" />
            </div>
            <p className="text-lg font-semibold text-foreground mb-2">
              No entries yet
            </p>
            <p className="text-sm text-muted-foreground max-w-sm">
              Start by adding your first entry above. Your entries will appear
              here in animated scrolling columns.
            </p>
          </div>
        ) : (
          <div className="h-[700px] relative">
            {isPaused ? (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
                <div className="text-center space-y-3">
                  <Pause className="h-12 w-12 text-primary mx-auto" />
                  <p className="text-lg font-semibold">Animation Paused</p>
                  <Button onClick={() => setIsPaused(false)} className="gap-2">
                    <Play className="h-4 w-4" />
                    Resume Animation
                  </Button>
                </div>
              </div>
            ) : null}
            {!isPaused && (
              <AnimatedMasonry
                items={animatedItems}
                columns={columns}
                gap={16}
                speed={speed}
                pauseOnHover={true}
              />
            )}
          </div>
        )}
      </CardContent>

      {/* Footer */}
      {users.length > 0 && (
        <div className="px-6 py-3 bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30 border-t border-border/50">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <span>
              Auto-scrolling columns • Hover to pause • Real-time updates
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
