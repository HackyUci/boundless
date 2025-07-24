import React from "react";
import Image from "next/image";
import { FEATURES } from "../constant";

export const ProductValuesSection = () => {
  return (
    <section className="relative py-20 px-4">
      <Image
        src="/values-section.png"
        alt="Values Section Background"
        fill
        className="object-cover z-0"
      />

      <div className="relative z-10 max-w-6xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          How Boundless helps you
        </h2>
        <p className="text-xl text-white/90 mb-16">
          Everything You Need, All in One Place
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {FEATURES.map((feature, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="relative">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  width={300}
                  height={200}
                  className="mb-6"
                />
                <div className="absolute inset-0 flex flex-col justify-center items-center -mt-4 text-center p-4">
                  <h3 className="text-xl font-bold text-white mb-3 text-start">
                    {feature.title}
                  </h3>
                  <p className="text-white/90 text-sm text-start">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
