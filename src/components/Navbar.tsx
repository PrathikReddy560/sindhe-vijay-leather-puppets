import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, Menu, X, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { Badge } from "@/components/ui/badge";
import { ModeToggle } from "@/components/ModeToggle";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/heritage", label: "Our Heritage" },
  { to: "/events", label: "Events" },
  { to: "/achievements", label: "Achievements" },
  { to: "/contact", label: "Contact" }
];


const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { totalItems, setIsOpen } = useCart();
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHome = location.pathname === "/";
  const isTransparent = isHome && !isScrolled;

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      isTransparent 
        ? "bg-transparent border-transparent" 
        : "border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-sm"
    }`}>
      <div className="container flex h-16 items-center justify-between md:h-20">
        <Link to="/" className="flex items-center gap-2 py-1">
          <img alt="Sindhe Vijay Leather Puppets" className="h-14 w-auto md:h-18" src="/lovable-uploads/a59db8b9-c4c9-43d7-9346-e95ceed37723.png" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to;
            const textClass = isTransparent
              ? isActive
                ? "text-amber-400 font-semibold drop-shadow-sm"
                : "text-white/85 hover:text-amber-400"
              : isActive
                ? "text-amber-500 font-semibold"
                : "text-muted-foreground hover:text-amber-500";

            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative text-sm font-medium transition-colors py-1 group ${textClass}`}
              >
                {link.label}
                {isActive && (
                  <motion.span
                    layoutId="activeNavUnderline"
                    className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full ${
                      isTransparent ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" : "bg-amber-500"
                    }`}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {!isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full duration-200" />
                )}
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              to="/admin"
              className={`relative flex items-center gap-1.5 text-sm font-medium transition-colors py-1 group ${
                isTransparent
                  ? location.pathname === "/admin"
                    ? "text-amber-400 font-semibold drop-shadow-sm"
                    : "text-white/85 hover:text-amber-400"
                  : location.pathname === "/admin"
                    ? "text-amber-500 font-semibold"
                    : "text-muted-foreground hover:text-amber-500"
              }`}
            >
              <Shield className="h-3.5 w-3.5" /> Admin
              {location.pathname === "/admin" && (
                <motion.span
                  layoutId="activeNavUnderline"
                  className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full ${
                    isTransparent ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" : "bg-amber-500"
                  }`}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <ModeToggle isTransparent={isTransparent} />
          <Link to={user ? "/profile" : "/login"}>
            <Button variant="ghost" size="icon" className={isTransparent ? "text-white hover:text-white hover:bg-white/20" : "text-muted-foreground hover:text-foreground"}>
              {user ? <User className={`h-5 w-5 ${isTransparent ? "" : "text-primary"}`} /> : <User className="h-5 w-5" />}
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className={`relative ${isTransparent ? "text-white hover:text-white hover:bg-white/20" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => setIsOpen(true)}>
            
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 &&
            <Badge className={`absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-[10px] ${isTransparent ? "bg-white text-black hover:bg-white" : ""}`}>
                {totalItems}
              </Badge>
            }
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`md:hidden ${isTransparent ? "text-white hover:text-white hover:bg-white/20" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => setMobileOpen(!mobileOpen)}>
            
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen &&
      <div className="border-t bg-background md:hidden">
          <nav className="container flex flex-col gap-1 py-4">
            {navLinks.map((link) =>
          <Link
            key={link.to}
            to={link.to}
            onClick={() => setMobileOpen(false)}
            className={`rounded-md px-4 py-3 text-sm font-medium transition-colors hover:bg-muted ${
            location.pathname === link.to ? "text-amber-500 underline underline-offset-4" : "text-muted-foreground hover:text-amber-500 hover:underline hover:underline-offset-4"}`
            }>
            
                {link.label}
              </Link>
          )}
            {isAdmin &&
          <Link
            to="/admin"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-2 rounded-md px-4 py-3 text-sm font-medium transition-colors hover:bg-muted ${
            location.pathname === "/admin" ? "text-amber-500 underline underline-offset-4" : "text-muted-foreground hover:text-amber-500 hover:underline hover:underline-offset-4"}`
            }>
            
                <Shield className="h-4 w-4" /> Admin Panel
              </Link>
          }
          </nav>
        </div>
      }
    </header>);

};

export default Navbar;