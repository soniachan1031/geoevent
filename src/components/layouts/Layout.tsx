import { useRouter } from "next/router";
import Footer from "../Footer";
import Nav from "../navBars/Nav";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  
  // Define pages where the navbar should be hidden
  const hideNavbarRoutes = ["/login", "/register", "/forgot-password"];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Show Navbar only if the current route is not in hideNavbarRoutes */}
      {!hideNavbarRoutes.includes(router.pathname) && <Nav />}
      
      <div className="flex-1 md:grid md:place-items-center p-3">
        {children}
      </div>

      <Footer />
    </div>
  );
};

export default Layout;
