"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, User, Bell } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMutation, useQuery } from "@tanstack/react-query";

type NavLink = { label: string; href: string };

interface NavbarProps {
  lang?: "en" | "nl"; // English or Dutch
}

export default function Navbar({ lang = "nl" }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const TOKEN = session?.user?.accessToken || "";

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // User profile fetch
  const { data: useData } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      if (!res.ok) throw new Error("Gebruikersprofiel ophalen mislukt");
      return res.json();
    },
  });

  // Notification unread count
  const { data: notifData } = useQuery({
    queryKey: ["notifCount"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/notification?limit=1`, {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!TOKEN && !!user,
    refetchInterval: 30000,
  });

  const unreadCount: number = notifData?.meta?.unreadCount || 0;

  // Stripe mutations
  const createStripDashboard = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/create-stripe-account`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
          },
        }
      );
      if (!res.ok) throw new Error("Stripe-account aanmaken mislukt");
      return res.json();
    },
    onSuccess: (data) => {
      const url = data?.data?.url;
      if (url) window.location.href = url;
      else alert("Stripe-onboarding-URL niet gevonden!");
    },
    onError: () => alert("Stripe-onboarding mislukt. Probeer het opnieuw."),
  });

  const fetchStripeDashboardLink = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/user/dashboard-link`, {
        method: "GET",
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      if (!res.ok) throw new Error("Stripe-dashboardlink ophalen mislukt");
      return res.json();
    },
    onSuccess: (data) => {
      const url = data?.data?.url;
      if (url) window.location.href = url;
      else alert("Stripe-dashboard-URL niet gevonden!");
    },
    onError: () => alert("Stripe-dashboard ophalen mislukt. Probeer het opnieuw."),
  });

  const handleLogout = async () => {
    setIsPopoverOpen(false);
    setIsOpen(false);
    await signOut({ callbackUrl: "/" });
  };

  // Nav links
  const navLinks: NavLink[] =
    lang === "en"
      ? [
          { label: "Home", href: "/" },
          { label: "Assignments", href: "/assignments" },
          { label: "Explore Freelancers", href: "/explore-freelancers" },
          { label: "Find Businesses", href: "/find-business" },
          { label: "Courses", href: "/courses" },
          { label: "Leaderboard", href: "/leaderboard" },
          { label: "Blogs", href: "/blogs" },
        ]
      : [
          { label: "Thuis", href: "/" },
          { label: "Opdrachten", href: "/assignments" },
          { label: "Ontdek freelancers", href: "/explore-freelancers" },
          { label: "Vind bedrijven", href: "/find-business" },
          { label: "Cursussen", href: "/courses" },
          { label: "Ranglijst", href: "/leaderboard" },
          { label: "Blogs", href: "/blogs" },
        ];

  // Function to check active route (fix multiple active issue)
  const checkIsActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href;
  };

  // User links (translated)
  const userLinks =
    lang === "en"
      ? [
          { label: "My Profile", href: "/profile" },
          { label: "Inbox", href: "/inbox" },
          { label: "Notifications", href: "/notifications" },
          { label: "My Favorites", href: "/favorites" },
          ...(user?.role === "business" ? [{ label: "My Assignments", href: "/assignment" }] : []),
          { label: "My Courses", href: "/courese" },
          { label: "My Earning History", href: "/earnings" },
          { label: "Referral Program", href: "/referrel_program" },
          { label: "Profile Promotion", href: "/profile_promotion" },
          { label: "Withdraw", href: "/withdraw" },
          { label: "Add Bank Account", href: "/add_bank_account" },
          { label: "Enrollment History", href: "/enrollment-history" },
        ]
      : [
          { label: "Mijn profiel", href: "/profile" },
          { label: "Berichten", href: "/inbox" },
          { label: "Meldingen", href: "/notifications" },
          { label: "Mijn favorieten", href: "/favorites" },
          ...(user?.role === "business" ? [{ label: "Mijn opdrachten", href: "/assignment" }] : []),
          { label: "Mijn cursussen", href: "/courese" },
          { label: "Mijn inkomsten", href: "/earnings" },
          { label: "Verwijzingsprogramma", href: "/referrel_program" },
          { label: "Profielpromotie", href: "/profile_promotion" },
          { label: "Opnemen", href: "/withdraw" },
          { label: "Bankrekening toevoegen", href: "/add_bank_account" },
          { label: "Inschrijvingsgeschiedenis", href: "/enrollment-history" },
        ];

  // Build full account links including role-specific items (translated)
  const accountLinks = [
    ...userLinks,
    ...(user?.role === "seles" ? [{ label: lang === "en" ? "My Purchase Assignments" : "Mijn aangekochte opdrachten", href: "/seles-assignment" }] : []),
    ...(user?.role === "business"
      ? [
          { label: lang === "en" ? "My Orders Assignment" : "Mijn bestellingen (opdrachten)", href: "/my-orders-for-assignment" },
          { label: lang === "en" ? "My Orders Course" : "Mijn bestellingen (cursussen)", href: "/my-orders-for-course" },
        ]
      : user?.role === "seles"
      ? [{ label: lang === "en" ? "My Orders Course" : "Mijn bestellingen (cursussen)", href: "/my-orders-for-course" }]
      : []),
    ...(user?.role === "business"
      ? [
          { label: lang === "en" ? "My Purchase Courses" : "Mijn aangekochte cursussen", href: "/seles-purchase-course" },
          { label: lang === "en" ? "My Purchase Assignment" : "Mijn aangekochte opdrachten", href: "/seles-assignment" },
        ]
      : user?.role === "seles"
      ? [{ label: lang === "en" ? "My Purchase Courses" : "Mijn aangekochte cursussen", href: "/seles-purchase-course" }]
      : []),
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full h-20 z-50 transition-all duration-300 bg-white border-b border-gray-200 ${
          isScrolled ? "shadow-lg" : "shadow-sm"
        }`}
      >
        <div className="container mx-auto px-2 lg:px-6 h-full flex items-center justify-between max-w-screen-2xl">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-16 lg:w-20 h-16 relative">
              <Image
                src="/images/chedsnyoLogo.png"
                alt="Logo"
                width={400}
                height={400}
                className="object-cover"
              />
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center justify-center flex-wrap lg:flex-nowrap gap-4 lg:gap-6 flex-1 px-4">
            {navLinks.map((link) => {
              const isActive = checkIsActive(link.href); // ✅ Updated
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[16px] lg:text-[18px] font-medium transition duration-200 whitespace-nowrap ${
                    isActive
                      ? "text-green-600 border-b-2 border-green-600 pb-1"
                      : "text-gray-700 hover:text-green-600"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop User/Auth */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                {/* Notification Bell */}
                <Link href="/notifications" className="relative p-2 text-gray-600 hover:text-green-600 transition-colors">
                  <Bell size={22} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
              </>
            ) : null}
            {user ? (
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <button className="w-[48px] h-[48px] rounded-full bg-green-600 text-white flex items-center justify-center hover:bg-green-700 transition duration-200 overflow-hidden">
                    {user.profileImage ? (
                      <Image
                        src={user.profileImage}
                        alt="User Profile"
                        width={48}
                        height={48}
                        className="rounded-full object-cover w-full h-full"
                      />
                    ) : (
                      <User size={24} />
                    )}
                  </button>
                </PopoverTrigger>

                <PopoverContent className="p-0 w-[300px] max-h-[80vh] overflow-y-auto shadow-lg border border-gray-200">
                  {/* Email & Role */}
                  <div className="px-4 py-3 bg-green-50 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 truncate text-center">
                      {user.email}
                    </p>
                    {user.role && (
                      <p className="text-xs text-gray-500 mt-1 text-center">{user.role}</p>
                    )}
                  </div>

                  {/* Links */}
                  <div className="flex flex-col">
                    {accountLinks.map((link) => {
                      const isActive = checkIsActive(link.href);
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setIsPopoverOpen(false)}
                          className={`block px-4 py-2 text-gray-700 text-sm transition duration-200 hover:bg-gray-100 ${
                            isActive ? "bg-green-100 text-green-700 font-semibold" : ""
                          }`}
                        >
                          {link.label}
                        </Link>
                      );
                    })}

                    {/* Stripe Section */}
                    {useData?.data?.stripeAccountId ? (
                      <button
                        onClick={() => {
                          fetchStripeDashboardLink.mutate();
                          setIsPopoverOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-gray-700 text-sm hover:bg-gray-100"
                      >
                        {lang === "en" ? "Stripe Dashboard" : "Stripe-dashboard"}
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          createStripDashboard.mutate();
                          setIsPopoverOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-gray-700 text-sm hover:bg-gray-100"
                      >
                        {lang === "en" ? "Add Stripe Account" : "Stripe-account toevoegen"}
                      </button>
                    )}

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 border-t border-gray-200"
                    >
                      {lang === "en" ? "Logout" : "Uitloggen"}
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="w-[139px] h-[48px] flex items-center justify-center text-[16px] font-semibold text-green-600 border-2 border-green-600 rounded-full hover:bg-green-50 transition duration-200"
                >
                  {lang === "en" ? "Login" : "Inloggen"}
                </Link>
                <div className="w-[3px] h-[32px] bg-[#0A192F]"></div>
                <Link
                  href="/signup"
                  className="w-[139px] h-[48px] flex items-center justify-center text-[16px] font-semibold text-white bg-green-600 rounded-full hover:bg-green-700 transition duration-200"
                >
                  {lang === "en" ? "Get Started" : "Aanmelden"}
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden fixed top-20 left-0 w-full h-[calc(100vh-5rem)] overflow-y-auto border-t border-gray-200 bg-white shadow-md z-50">
            <div className="flex flex-col gap-2 px-4 py-4">
              {navLinks.map((link) => {
                const isActive = checkIsActive(link.href); // ✅ Updated
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`text-sm font-medium py-2 px-2 rounded transition-colors duration-200 ${
                      isActive
                        ? "bg-green-50 text-green-600 font-semibold"
                        : "text-gray-700 hover:bg-green-50 hover:text-green-600"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="border-t border-gray-200 px-4 py-4 flex flex-col gap-2">
              {user ? (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    {user.profileImage ? (
                      <Image
                        src={user.profileImage}
                        alt="Profile"
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <User size={40} className="text-green-600" />
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-700 truncate">{user.email}</span>
                      {user.role && <span className="text-xs text-gray-500">{user.role}</span>}
                    </div>
                  </div>

                  {/* User Links */}
                  {accountLinks.map((link) => {
                    const isActive = checkIsActive(link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`block px-4 py-2 text-gray-700 text-sm rounded hover:bg-gray-100 transition ${
                          isActive ? "bg-green-50 text-green-600 font-semibold" : ""
                        }`}
                      >
                        {link.label}
                      </Link>
                    );
                  })}

                  {/* Stripe Section */}
                  {useData?.data?.stripeAccountId ? (
                    <button
                      onClick={() => {
                        fetchStripeDashboardLink.mutate();
                        setIsOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-700 text-sm rounded hover:bg-gray-100 transition"
                    >
                      {lang === "en" ? "Stripe Dashboard" : "Stripe-dashboard"}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        createStripDashboard.mutate();
                        setIsOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-700 text-sm rounded hover:bg-gray-100 transition"
                    >
                      {lang === "en" ? "Add Stripe Account" : "Stripe-account toevoegen"}
                    </button>
                  )}

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-red-600 text-sm rounded hover:bg-red-50 transition mt-2"
                  >
                    {lang === "en" ? "Logout" : "Uitloggen"}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/signin"
                    className="text-sm text-gray-700 hover:text-green-600 transition"
                    onClick={() => setIsOpen(false)}
                  >
                    {lang === "en" ? "Login" : "Inloggen"}
                  </Link>
                  <Link
                    href="/signup"
                    className="text-sm text-white bg-green-600 rounded-full text-center py-2 hover:bg-green-700 transition"
                    onClick={() => setIsOpen(false)}
                  >
                    {lang === "en" ? "Get Started" : "Aanmelden"}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Spacer */}
      <div className="h-20 w-full flex-shrink-0"></div>
    </>
  );
}
