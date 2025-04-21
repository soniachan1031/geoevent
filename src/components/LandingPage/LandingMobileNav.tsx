import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";

const LandingMobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Events", href: "/" },
    { name: "Maps", href: "/" },
    { name: "Create", href: "/create-event" },
    { name: "Public API", href: "/public-api" },
  ];

  return (
    <>
      <button
        className="md:hidden text-white"
        onClick={() => setIsOpen(true)}
        aria-label="Open Menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Fullscreen Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-primary/80 to-lightComponent/70 backdrop-blur-xl text-white flex flex-col items-center justify-center gap-8 text-xl font-medium transition-all duration-300">
          <button
            className="absolute top-6 right-6"
            onClick={() => setIsOpen(false)}
            aria-label="Close Menu"
          >
            <X className="w-6 h-6" />
          </button>

          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="hover:underline"
            >
              {link.name}
            </Link>
          ))}

          <div className="mt-8 flex gap-4">
            <Link href="/login">
              <button className="border border-white px-5 py-2 rounded-full hover:bg-white hover:text-primary transition">
                Login
              </button>
            </Link>
            <Link href="/login">
              <button className="bg-white text-primary px-5 py-2 rounded-full hover:opacity-90 transition">
                Join Free
              </button>
            </Link>
          </div>
        </div>
      )}
    </>
  );
};

export default LandingMobileNav;
