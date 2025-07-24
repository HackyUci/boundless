import React from "react";
import Image from "next/image";
import Link from "next/link";

export const GetStartedSection = () => {
  return (
    <section
      className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #FFF 0%, #FFF3E6 100%)" }}
    >
      <Image
        src="/dunia.png"
        alt="World Map"
        width={800}
        height={400}
        quality={100}
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-0"
      />

      <Image
        src="/kiri-atas.png"
        alt="Student testimonial"
        width={300}
        height={120}
        quality={100}
        className="absolute top-20 left-10 z-5"
      />

      <Image
        src="/kiri-tengah.png"
        alt="Student testimonial"
        width={300}
        height={120}
        quality={100}
        className="absolute bottom-60 left-10 transform translate-y-1/3 z-5"
      />

      <Image
        src="/kiri-bawah.png"
        alt="Student testimonial"
        width={300}
        height={120}
        quality={100}
        className="absolute bottom-20 left-20 translate-x-1/2 transform translate-y-1/3 z-5"
      />

      <Image
        src="/kanan-atas.png"
        alt="Student testimonial"
        width={300}
        height={120}
        quality={100}
        className="absolute top-20 right-10 z-5"
      />

      <Image
        src="/kanan-tengah.png"
        alt="Student testimonial"
        width={300}
        height={120}
        quality={100}
        className="absolute bottom-60 right-10 transform translate-y-1/3 z-5"
      />

      <Image
        src="/kanan-bawah.png"
        alt="Student testimonial"
        width={300}
        height={120}
        quality={100}
        className="absolute bottom-20 right-20 -translate-x-1/2 transform translate-y-1/3 z-5"
      />

      <div className="text-center max-w-4xl mx-auto relative z-10">
        <Image
          src="/boundless.png"
          alt="Boundless Logo"
          width={449}
          height={128}
          quality={100}
          className="mx-auto mb-8"
        />
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
          Breaking Barriers to <br></br>
          <span className="text-orange-500">Studying Abroad</span>
        </h1>
        <button className="bg-[linear-gradient(180deg,_#4479B2_0%,_#669DD9_100%)] backdrop-blur-sm shadow-[0px_2px_4px_0px_#00000040] px-5 py-3 rounded-md text-white font-bold">
          <Link href="/register">Get started</Link>
        </button>
      </div>
    </section>
  );
};
