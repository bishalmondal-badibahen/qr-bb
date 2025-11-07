"use client";

import { useState } from "react";
import LiveForm from "@/components/LiveForm";
import LiveList from "@/components/LiveList";
import MasonryLiveList from "@/components/MasonryLiveList";
import AnimatedMasonryList from "@/components/AnimatedMasonryList";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List, ExternalLink, Zap } from "lucide-react";
import Link from "next/link";

export default function Page() {
  const [viewMode, setViewMode] = useState<"list" | "masonry" | "animated">(
    "list",
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="space-y-8">
          {/* Page Header */}
          <div className="text-center space-y-4 animate-fade-in">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Realtime Form Data
            </h1>
            <p className="text-muted-foreground">
              Submit a name and watch the list update in realtime
            </p>

            {/* View Toggle and Display Link */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <div className="inline-flex rounded-lg border border-border/50 bg-card p-1 shadow-sm">
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="gap-2"
                >
                  <List className="h-4 w-4" />
                  List View
                </Button>
                <Button
                  variant={viewMode === "masonry" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("masonry")}
                  className="gap-2"
                >
                  <LayoutGrid className="h-4 w-4" />
                  Masonry
                </Button>
                <Button
                  variant={viewMode === "animated" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("animated")}
                  className="gap-2"
                >
                  <Zap className="h-4 w-4" />
                  Animated
                </Button>
              </div>

              <Link href="/display" target="_blank">
                <Button variant="outline" size="sm" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Open Display Page
                </Button>
              </Link>
            </div>
          </div>

          {/* Form Section */}
          <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
            <LiveForm />
          </div>

          {/* List/Masonry/Animated Section */}
          <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
            {viewMode === "list" ? (
              <LiveList />
            ) : viewMode === "masonry" ? (
              <MasonryLiveList />
            ) : (
              <AnimatedMasonryList />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
