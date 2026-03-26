import { Link, useLocation } from "react-router";
import { Menu, X, ChevronDown, Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [calculatorsOpen, setCalculatorsOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] =
    useState("English");
  const [isScrolled, setIsScrolled] = useState(false);

  const location = useLocation();
  const calculatorsRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;
  const calculatorsActive =
    isActive("/calculator/sip") ||
    isActive("/calculator/lumpsum");

  useEffect(() => {
    setMobileMenuOpen(false);
    setCalculatorsOpen(false);
    setLanguageOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        calculatorsRef.current &&
        !calculatorsRef.current.contains(event.target as Node)
      ) {
        setCalculatorsOpen(false);
      }

      if (
        languageRef.current &&
        !languageRef.current.contains(event.target as Node)
      ) {
        setLanguageOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
  }, []);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 24);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () =>
      window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Desktop Floating Glass Navbar */}
      <div className="hidden md:block fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <nav
          className={`rounded-full border backdrop-blur-2xl transition-all duration-300 ${
            isScrolled
              ? "border-white/25 bg-[#0f172a]/72 shadow-[0_14px_44px_rgba(0,0,0,0.34)]"
              : "border-white/20 bg-[#0f172a]/55 shadow-[0_12px_40px_rgba(0,0,0,0.28)]"
          }`}
        >
          <div className="flex items-center gap-2 px-3 py-2">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-3 rounded-full px-2 py-1.5"
            >
              {/* Icon */}
              <div className="relative w-7 h-7">
                <span className="absolute left-0 top-0 h-1 w-6 rounded-full bg-[#B8E55C]" />
                <span className="absolute left-1 top-2 h-1 w-4 rounded-full bg-[#8EDB63]" />
                <span className="absolute left-2 top-4 h-1 w-3 rounded-full bg-[#52C56B]" />

                <span className="absolute left-0 top-2 h-1 w-1 rounded-full bg-[#8EDB63]" />
                <span className="absolute left-0 top-4 h-1 w-1 rounded-full bg-[#52C56B]" />
                <span className="absolute left-0 top-6 h-1 w-1 rounded-full bg-[#2FAE5F]" />
              </div>

              {/* Text */}
              <span className="text-[20px] font-semibold tracking-[-0.02em] leading-none">
                <span className="text-white">Fin</span>
                <span className="text-[#9DDB63]">Tech</span>
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="flex items-center gap-1">
              <NavLink to="/" active={isActive("/")}>
                Home
              </NavLink>

              <NavLink
                to="/services"
                active={isActive("/services")}
              >
                Services
              </NavLink>

              {/* Calculators Dropdown */}
              <div className="relative" ref={calculatorsRef}>
                <button
                  type="button"
                  onClick={() =>
                    setCalculatorsOpen((prev) => !prev)
                  }
                  className={`px-4 py-2 rounded-full transition-all flex items-center gap-1 text-sm ${
                    calculatorsActive
                      ? "text-white bg-white/12"
                      : "text-white/75 hover:text-white hover:bg-white/8"
                  }`}
                >
                  <span>Calculators</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      calculatorsOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {calculatorsOpen && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: -8,
                        scale: 0.98,
                      }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.18 }}
                      className="absolute z-[100] top-full left-1/2 -translate-x-1/2 mt-3 w-52 rounded-2xl border border-[#1d3b30] bg-[#0f172a]/96 backdrop-blur-2xl shadow-[0_18px_45px_rgba(0,0,0,0.38)] overflow-hidden"
                    >
                      <Link
                        to="/calculator/sip"
                        className="block px-5 py-3.5 text-[15px] font-medium text-white/90 hover:text-white hover:bg-white/8 transition-colors"
                        onClick={() =>
                          setCalculatorsOpen(false)
                        }
                      >
                        SIP Calculator
                      </Link>
                      <Link
                        to="/calculator/lumpsum"
                        className="block px-5 py-3.5 text-[15px] font-medium text-white/90 hover:text-white hover:bg-white/8 transition-colors"
                        onClick={() =>
                          setCalculatorsOpen(false)
                        }
                      >
                        Lumpsum Calculator
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <NavLink
                to="/planner"
                active={isActive("/planner")}
              >
                Planner
              </NavLink>

              <NavLink
                to="/webinars"
                active={isActive("/webinars")}
              >
                Webinars
              </NavLink>
            </div>

            {/* Desktop CTA + Language */}
            <div className="flex items-center gap-2 ml-1">
              {/* Language Dropdown */}
              <div className="relative" ref={languageRef}>
                <button
                  type="button"
                  onClick={() =>
                    setLanguageOpen((prev) => !prev)
                  }
                  className="inline-flex min-w-[124px] items-center justify-between gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/8 text-sm text-white/90 hover:text-white hover:bg-white/12 transition-all backdrop-blur"
                >
                  <span className="inline-flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <span>{selectedLanguage}</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      languageOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {languageOpen && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: -8,
                        scale: 0.98,
                      }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.18 }}
                      className="absolute z-[100] top-full right-0 mt-3 w-52 rounded-2xl border border-[#1d3b30] bg-[#0f172a]/96 backdrop-blur-2xl shadow-[0_18px_45px_rgba(0,0,0,0.38)] overflow-hidden"
                    >
                      {[
                        "English",
                        "हिन्दी",
                        "मराठी",
                        "ಕನ್ನಡ",
                      ].map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => {
                            setSelectedLanguage(lang);
                            setLanguageOpen(false);
                          }}
                          className={`w-full text-left px-5 py-3.5 text-[15px] font-medium transition-colors ${
                            selectedLanguage === lang
                              ? "text-white bg-white/10"
                              : "text-white/90 hover:text-white hover:bg-white/8"
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                to="/login"
                className="px-4 py-2 rounded-full text-sm text-white/75 hover:text-white hover:bg-white/8 transition-all"
              >
                Login
              </Link>

              <Link
                to="/signup"
                className="px-5 py-2 rounded-full bg-[#D8F46B] text-black text-sm font-semibold shadow-[0_8px_25px_rgba(184,233,134,0.35)] hover:scale-[1.03] transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>
      </div>
      {/* Mobile Navbar */}
      <nav
        className={`md:hidden sticky top-0 z-50 border-b border-white/10 backdrop-blur-xl transition-all duration-300 ${
          isScrolled ? "bg-[#0f172a]/95" : "bg-[#0f172a]/90"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link
              to="/"
              className="flex items-center space-x-2"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1A5F3D] to-[#3FAF7D] flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  SF
                </span>
              </div>
              <span className="font-bold text-xl text-white">
                SmartFinance
              </span>
            </Link>

            <button
              className="p-2 text-white"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              type="button"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-white/10 bg-[#0f172a]/95 backdrop-blur-xl overflow-hidden"
            >
              <div className="px-4 py-4 space-y-2">
                <MobileNavLink
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </MobileNavLink>

                <MobileNavLink
                  to="/services"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Services
                </MobileNavLink>

                <MobileNavLink
                  to="/calculator/sip"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  SIP Calculator
                </MobileNavLink>

                <MobileNavLink
                  to="/calculator/lumpsum"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Lumpsum Calculator
                </MobileNavLink>

                <MobileNavLink
                  to="/planner"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Planner
                </MobileNavLink>

                <MobileNavLink
                  to="/webinars"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Webinars
                </MobileNavLink>

                {/* Mobile Language */}
                <div className="pt-3">
                  <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                    Language
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "English",
                      "हिन्दी",
                      "मराठी",
                      "ಕನ್ನಡ",
                    ].map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() =>
                          setSelectedLanguage(lang)
                        }
                        className={`px-4 py-3 rounded-xl text-sm transition-all ${
                          selectedLanguage === lang
                            ? "bg-white/12 text-white border border-white/15"
                            : "bg-white/5 text-white/80 border border-white/10"
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <Link
                    to="/login"
                    className="block w-full px-4 py-3 text-center border border-white/15 text-white rounded-xl bg-white/5"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>

                  <Link
                    to="/signup"
                    className="block w-full px-4 py-3 text-center bg-[#D8F46B] text-black rounded-xl font-semibold"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}

function NavLink({
  to,
  active,
  children,
}: {
  to: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className={`px-4 py-2 rounded-full text-sm transition-all ${
        active
          ? "text-white bg-white/12"
          : "text-white/75 hover:text-white hover:bg-white/8"
      }`}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  to,
  onClick,
  children,
}: {
  to: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="block px-4 py-3 rounded-xl text-white/85 hover:text-white hover:bg-white/8 transition-colors"
      onClick={onClick}
    >
      {children}
    </Link>
  );
}