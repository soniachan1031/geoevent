import Image from "next/image";
import LandingHeroSection from "./LandingHeroSection";
import LandingMobileNav from "./LandingMobileNav";
import Link from "next/link";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white font-sans w-full grid">
      {/* Gradient Background Wrapper */}
      <div className="bg-gradient-to-r from-primary via-lightComponent to-primary text-white ">
        {/* Navbar */}
        <header className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <Image
              src="/landing-logo.png"
              alt="GeoEvents Logo"
              className="h-8"
              width="128"
              height="128"
            />
          </div>

          <nav className="hidden md:flex space-x-6 text-sm text-white/80">
            <Link href="/">Home</Link>
            <Link href="/">Events</Link>
            <Link href="/">Maps</Link>
            <Link href="/create-event">Create</Link>
            <Link href="/public-api">Public API</Link>
          </nav>

          <div className="space-x-3 hidden md:block">
            <Link href="/login">
              <button className="px-5 py-2 border border-white text-white rounded-full hover:bg-white hover:text-primary transition">
                Login Now
              </button>
            </Link>
            <Link href="/login">
              <button className="px-5 py-2 bg-white text-primary rounded-full hover:opacity-90 transition">
                Join Free
              </button>
            </Link>
          </div>
          <LandingMobileNav />
        </header>

        {/* Hero */}
        <LandingHeroSection />
      </div>
    </div> 
  );
};

export default LandingPage;
