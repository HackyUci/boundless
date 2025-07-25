"use client";
import { useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { CVUpload } from "@/modules/CVScannerModule/components/CVUpload";
import { FEATURE_BUTTONS, type FeatureButtonId } from "./constant";
import MapComponent from "../Map";
import CountryDetailsModule from "@/modules/CompareDetailsModukle";
import { AIChatbotModule } from "@/modules/AIChatbotModule";

interface City {
  city: string;
  country: string;
  lat: number;
  lon: number;
}

export default function ResizableLayout() {
  const [activeFeature, setActiveFeature] = useState<FeatureButtonId>("comparison-details");
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  const handleButtonClick = (buttonId: FeatureButtonId) => {
    setActiveFeature(buttonId);
  };

  const handleCityClick = (city: City) => {
    setSelectedCity(city);
    setActiveFeature("comparison-details"); 
  };

  const renderFeatureContent = () => {
    switch (activeFeature) {
      case "comparison-details":
        return <CountryDetailsModule selectedCity={selectedCity} />;
      case "cv-analyzer":
        return <CVUpload />;
      case "chatbot":
        return <AIChatbotModule />;
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
          <MapComponent onCityClick={handleCityClick} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={40} minSize={25}>
          <div className="flex flex-col h-full overflow-y-auto">
            <div className="relative h-full">
              <div className="flex-1 px-8 translate-x-6 pt-4 top-0 mx-2 relative">
                {renderFeatureContent()}
              </div>
              <div className="flex justify-start rotate-90 -translate-x-1/2 ml-6 gap-1 absolute top-1/4">
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
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}