import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto p-5">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center space-x-2">
            <Logo />
            <span className="text-lg font-bold">GeoEvent</span>
          </div>
          <p className="text-sm text-gray-600 text-center">
            Your go-to source for local events happening near you.
          </p>
          <p className="text-sm text-gray-600 text-center">
            &copy; {new Date().getFullYear()} GeoEvent. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
