import Footer from "../Footer";
import Nav from "../navBars/Nav";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col ">
      <Nav />
      <div className="flex-1 md:grid md:place-items-center p-3">{children}</div>
      <Footer />
    </div>
  );
};

export default Layout;
