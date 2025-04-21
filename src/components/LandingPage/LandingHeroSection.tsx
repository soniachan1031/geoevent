import Image from "next/image";
import Link from "next/link";
import React from "react";

const LandingHeroSection = () => {
  return (
    <section className="relative">
      <div className="max-w-7xl mx-auto px-6 py-24 md:flex md:items-center md:justify-between gap-12 animate-fade-in">
        {/* Left Text */}
        <div className="md:w-1/2 text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
            Discover Live Events Happening Around You
          </h1>
          <p className="text-white/90 text-lg mb-8 drop-shadow-sm">
            From concerts to community festivals, GeoEvents helps you find,
            follow, and stay updated on real-time events near you. Never miss
            out on what’s happening around you.
          </p>
          <div className="flex items-center space-x-4">
            <Link href="/">
              <button className="bg-white text-primary px-6 py-3 rounded-full font-medium hover:shadow-[0_0_12px_rgba(255,255,255,0.4)] hover:scale-105 transition duration-200">
                Explore events →
              </button>
            </Link>
            <span className="text-sm text-white/70">*No sign-up required</span>
          </div>
        </div>

        {/* Right Image */}
        <div className="md:w-1/2 mt-12 md:mt-0">
          <Image
            src="/banner.png"
            alt="GeoEvents Dashboard"
            height="400"
            width="400"
          />
        </div>
      </div>
    </section>
  );
};

export default LandingHeroSection;
