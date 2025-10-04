import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center border-4 border-foreground p-12">
        <h1 className="mb-4 text-8xl font-black">404</h1>
        <p className="mb-6 text-2xl font-bold uppercase">Page not found</p>
        <a href="/" className="inline-block bg-foreground text-background px-8 py-4 font-black uppercase border-4 border-foreground hover:bg-background hover:text-foreground transition-all">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
