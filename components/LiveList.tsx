"use client";

import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import { User, Clock, Users, Sparkles, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type UserEntry = {
  name: string;
  imageURL?: string | null;
  timestamp: number;
};

export default function LiveList() {
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    const usersRef = ref(db, "users");

    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setUsers([]);
        setLoading(false);
        return;
      }
      setUsers(Object.values(data));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Update current time every minute for relative timestamps
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((currentTime - timestamp) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "from-blue-500 to-purple-600",
      "from-purple-500 to-pink-600",
      "from-pink-500 to-rose-600",
      "from-green-500 to-emerald-600",
      "from-orange-500 to-red-600",
      "from-cyan-500 to-blue-600",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const handleImageError = (imageUrl: string) => {
    setImageErrors((prev) => new Set(prev).add(imageUrl));
  };

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

      {/* List Content */}
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
              here in real-time.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {users
              .slice()
              .reverse()
              .map((entry, i) => {
                const formattedTime = entry.timestamp
                  ? new Date(entry.timestamp).toLocaleString()
                  : "";
                const timeAgo = entry.timestamp
                  ? formatTimeAgo(entry.timestamp)
                  : "";
                const isNew = entry.timestamp
                  ? currentTime - entry.timestamp < 60000
                  : false;

                return (
                  <div
                    key={`${entry?.timestamp ?? i}-${i}`}
                    className={cn(
                      "group relative rounded-xl p-4 transition-all duration-300 cursor-pointer",
                      "bg-gradient-to-br from-card via-card to-muted/10",
                      "border border-border/50 hover:border-primary/50",
                      "hover:shadow-xl hover:scale-[1.02]",
                      "animate-slide-in",
                    )}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    {/* Hover glow effect */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/0 via-purple-500/0 to-pink-500/0 group-hover:from-primary/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-300 pointer-events-none" />

                    <div className="relative flex items-center gap-4">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        {entry.imageURL && !imageErrors.has(entry.imageURL) ? (
                          <div className="relative h-14 w-14 rounded-full overflow-hidden ring-2 ring-border group-hover:ring-primary transition-all duration-300 shadow-lg">
                            <img
                              src={entry.imageURL}
                              alt={entry.name}
                              className="w-full h-full object-cover"
                              onError={() => handleImageError(entry.imageURL!)}
                              loading="lazy"
                            />
                            <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
                          </div>
                        ) : (
                          <div
                            className={cn(
                              "h-14 w-14 rounded-full flex items-center justify-center ring-2 ring-border group-hover:ring-primary transition-all duration-300 shadow-lg bg-gradient-to-br",
                              getAvatarColor(entry.name || ""),
                            )}
                          >
                            <span className="text-white font-bold text-lg">
                              {entry?.name?.charAt(0)?.toUpperCase() ?? "?"}
                            </span>
                          </div>
                        )}
                        {/* Online indicator */}
                        <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-green-500 border-2 border-card shadow-lg">
                          <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                            {entry.name}
                          </h3>
                          {isNew && (
                            <Badge
                              variant="default"
                              className="shadow-sm animate-pulse"
                            >
                              <Sparkles className="h-2.5 w-2.5 mr-1" />
                              New
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="group-hover:text-primary/70 transition-colors font-medium">
                            {timeAgo}
                          </span>
                          <span className="hidden sm:inline text-muted-foreground/60">
                            • {formattedTime}
                          </span>
                        </div>
                      </div>

                      {/* Action Icon */}
                      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </CardContent>

      {/* Footer */}
      {users.length > 0 && (
        <div className="px-6 py-3 bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30 border-t border-border/50">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <span>Real-time updates • Showing all entries</span>
          </div>
        </div>
      )}
    </Card>
  );
}
