"use client";
import { useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { CVUpload } from "@/modules/CVScannerModule/components/CVUpload";
import { FEATURE_BUTTONS, type FeatureButtonId } from "./constant";

export default function ResizableLayout() {
  const [activeFeature, setActiveFeature] =
    useState<FeatureButtonId>("country-details");

  const handleButtonClick = (buttonId: FeatureButtonId) => {
    setActiveFeature(buttonId);
    console.log(`Button clicked: ${buttonId}`);
  };

  const renderFeatureContent = () => {
    switch (activeFeature) {
      case "country-details":
        return <div className="space-y-4"></div>;
      case "cv-analyzer":
        return <CVUpload />;
      default:
        return <div>Select a feature</div>;
    }
  };

  return (
    <div className="h-screen">
      <ResizablePanelGroup
        direction="horizontal"
        className="min-h-full border rounded-lg"
      >
        <ResizablePanel defaultSize={60} minSize={30}>
          <div className="flex h-full items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center space-y-2">
              <div className="text-6xl">🗺️</div>
              <p className="text-muted-foreground">Map will be placed here</p>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={40} minSize={25}>
          <div className="flex flex-col h-full overflow-y-auto">
            <div className="relative h-full">
              <div className="flex-1 px-8 translate-x-6 pt-4 top-0 mx-2 relative">
                {renderFeatureContent()}
              </div>
              <div className="flex justify-start rotate-90 -translate-x-1/2 ml-6 gap-1 absolute top-1/8 my-2">
                {FEATURE_BUTTONS.map((button) => (
                  <div
                    key={button.id}
                    onClick={() => handleButtonClick(button.id)}
                    className={`px-3 py-2 text-sm cursor-pointer transition-colors duration-200 rounded-md ${
                      activeFeature === button.id
                        ? "bg-muted text-muted-foreground border-gray-400 border-1 shadow-[4px_0_0_rgba(0,0,0,0.1)]"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {button.label}
                  </div>
                ))}
              </div>
              <div className="absolute left-[48px] top-0 min-h-screen w-px bg-gray-300"></div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
