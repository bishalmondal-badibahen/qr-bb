"use client";

import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import Masonry from "@/components/ui/Masonry";
import { Users, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type UserEntry = {
  id: string;
  name: string;
  imageURL?: string | null;
  timestamp: number;
};

export default function MasonryLiveList() {
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Convert user entries to masonry items with stable heights
  const masonryItems = users.map((user) => {
    // Use timestamp to generate consistent random height per user
    const seed = user.timestamp % 200;
    return {
      id: user.id,
      img:
        user.imageURL ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&size=400&background=random&bold=true`,
      url: "#",
      height: seed + 300, // Heights between 300-500 based on timestamp
    };
  });

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center shadow-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Recent Entries
              </CardTitle>
              <CardDescription className="text-xs flex items-center gap-1.5 mt-1">
                <TrendingUp className="h-3 w-3" />
                {users.length} {users.length === 1 ? "entry" : "entries"} total
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
      </CardHeader>

      {/* Masonry Content */}
      <CardContent className="p-4 sm:p-6">
        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
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
              here in a beautiful masonry layout.
            </p>
          </div>
        ) : (
          <div className="min-h-[600px] relative">
            <Masonry
              items={masonryItems}
              ease="power3.out"
              duration={0.6}
              stagger={0.04}
              animateFrom="bottom"
              scaleOnHover={true}
              hoverScale={1.05}
              blurToFocus={true}
              colorShiftOnHover={true}
            />
          </div>
        )}
      </CardContent>

      {/* Footer */}
      {users.length > 0 && (
        <div className="px-6 py-3 bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30 border-t border-border/50">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <span>Real-time masonry layout • Auto-updating</span>
          </div>
        </div>
      )}
    </Card>
  );
}
