import Link from "next/link";
import { useEffect, useState } from "react";
import { IoGlobeOutline } from "react-icons/io5";
import Logo from "@/components/Logo";

export default function Footer() {
  const [selectedLang, setSelectedLang] = useState("en");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const googleTranslateDropdown = document.querySelector(".goog-te-combo") as HTMLSelectElement;
    if (googleTranslateDropdown) {
      googleTranslateDropdown.value = selectedLang;
      googleTranslateDropdown.dispatchEvent(new Event("change"));
    }
  }, [selectedLang]);

  return (
    <footer className={`bg-white border-t border-gray-200 py-6 transition-all ${isOpen ? "pb-20" : "pb-6"}`}>
      <div className="max-w-5xl mx-auto px-5 flex flex-col items-center gap-4 relative">
        {/* Logo & Brand Name */}
        <Link href="/" className="hover:text-black transition">
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-6" />
            <span className="notranslate text-lg font-semibold tracking-wide text-gray-900">GeoEvent</span>
          </div>
        </Link>

        {/* Tagline */}
        <p className="text-sm text-gray-600 text-center max-w-md">
          Your go-to source for discovering local events near you.
        </p>

        {/* Navigation Links */}
        <div className="flex gap-6 text-gray-700 font-medium">
          <Link href="/" className="hover:text-black transition">Home</Link>
          <Link href="/public-api" className="hover:text-black transition">Public API</Link>
        </div>

        {/* Language Selector */}
        <div className="relative w-full flex justify-center">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gray-100 shadow-md hover:shadow-lg transition-all cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          >
            <IoGlobeOutline className="text-gray-600" size={18} />
            <span className="text-gray-900 font-medium">{selectedLang === "en" ? "English" : "Français"}</span>
          </button>

          {/* Dropdown Google Menu */}
          {isOpen && (
            <div className="absolute top-full mt-2 w-40 bg-white shadow-lg rounded-xl overflow-hidden z-50">
              <ul>
                <li
                  className="notranslate px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setSelectedLang("en");
                    setIsOpen(false);
                  }}
                >
                  English
                </li>
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setSelectedLang("fr");
                    setIsOpen(false);
                  }}
                >
                  Français
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Copyright Notice */}
        <p className="notranslate text-xs text-gray-500 text-center">
          &copy; {new Date().getFullYear()} GeoEvent. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
