import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, User, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { getMediaUrl } from "@/api/client.ts";
import { useAuth } from "@/context/AuthContext.tsx";
import { NavLink } from "@/components/ui/nav-link.tsx";
import LanguageSwitcher from "@/components/LanguageSwitcher.tsx";
import { useCart } from "@/context/CartContext";

const logo = getMediaUrl("images/logo.webp")

export const Header = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const { totalItems, toggleCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: t("navigation.home") },
    { href: "/collections", label: t("navigation.collections") },
    { href: "/about", label: t("navigation.about") },
    { href: "/contact", label: t("navigation.contact") },
  ];

  const navLinkClass = "text-sm font-sans tracking-widest uppercase transition-colors duration-300";
  const navLinkActiveClass = "text-primary";
  const navLinkInactiveClass = "text-muted-foreground hover:text-foreground";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 -ml-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
            ) : (
              <Menu className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
            )}
          </button>

          {/* Logo */}
          <Link
            to="/"
            className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0"
          >
            <h1>
              <img src={logo} alt="logo" className="w-40 object-cover"/>
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 flex-1 justify-center">
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                end={link.href === "/"}
                className={`${navLinkClass} ${navLinkInactiveClass}`}
                activeClassName={navLinkActiveClass}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-4 sm:gap-6">
            <button
              type="button"
              onClick={() => {
                if (isAuthenticated) {
                  toggleCart();
                } else {
                  navigate("/signin", { state: { from: { pathname: "/cart" } } });
                }
              }}
              className="hidden lg:block relative p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={`${t("navigation.cart")} (${totalItems})`}
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 min-w-5 h-5 px-1 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Auth link - desktop */}
            <NavLink
              to={isAuthenticated ? "/profile" : "/signin"}
              className="hidden lg:flex items-center gap-2 text-sm font-sans tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-300"
              activeClassName={navLinkActiveClass}
            >
              <User className="h-4 w-4" />
              {isAuthenticated ? user?.first_name : t("navigation.signIn")}
            </NavLink>

            <LanguageSwitcher/>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background border-b border-border overflow-hidden"
          >
            <nav className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col gap-3 sm:gap-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.href}
                  to={link.href}
                  end={link.href === "/"}
                  className={`${navLinkClass} ${navLinkInactiveClass}`}
                  activeClassName={navLinkActiveClass}
                  onClick={() => {
                    setIsMenuOpen(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  {link.label}
                </NavLink>
              ))}

              {/* Auth link inside mobile menu too */}
              <NavLink
                to={isAuthenticated ? "/profile" : "/signin"}
                onClick={() => {
                  setIsMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="text-lg font-sans tracking-widest uppercase py-2 text-muted-foreground"
                activeClassName={navLinkActiveClass}
              >
                {isAuthenticated ? t("navigation.profile") : t("navigation.signIn")}
              </NavLink>
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  if (isAuthenticated) {
                    toggleCart();
                  } else {
                    navigate("/signin", { state: { from: location } });
                  }
                }}
                className="text-lg font-sans tracking-widest uppercase py-2 text-muted-foreground flex items-center gap-2"
              >
                <ShoppingBag className="h-4 w-4" />
                {t("navigation.cart")} ({totalItems})
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
