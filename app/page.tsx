"use client";

import { useState } from "react";
import LiveForm from "@/components/LiveForm";
import ThankYouTab from "@/components/ThankYouTab";
import { AnimatePresence } from "framer-motion";

export default function Page() {
  const [activeTab, setActiveTab] = useState<"form" | "thankyou">("form");

  const handleFormSuccess = () => {
    setActiveTab("thankyou");
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Tab Content - No visible navigation */}
      <AnimatePresence mode="wait">
        {activeTab === "form" && (
          <div key="form">
            <LiveForm onSuccess={handleFormSuccess} />
          </div>
        )}
        {activeTab === "thankyou" && (
          <div key="thankyou">
            <ThankYouTab onBackToForm={() => setActiveTab("form")} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
