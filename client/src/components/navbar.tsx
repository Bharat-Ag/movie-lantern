"use client";

import { LogOut, Search, Ticket, User } from "lucide-react";
import { usePathname } from "next/navigation";

import { CitySelector } from "@/components/city-selector";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Movies", href: "/movies" },
  { label: "My Bookings", href: "/bookings" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, loading, openAuthDialog, logout } = useAuth();

  return (
    <header className="border-b border-white/5">
      <div className="container-app flex h-20 items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Movie<span className="text-brand-text">Lantern</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== '/' && pathname.startsWith(`${link.href}/`));
            return (
              <Link
                key={link.label}
                href={link.href}
                className={isActive ? "nav-link-active" : "nav-link"}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <CitySelector />
          <button type="button" aria-label="Search" className="icon-button">
            <Search className="size-4" />
          </button>

          {!loading && user ? (
            <Popover>
              <PopoverTrigger
                aria-label="Account"
                className="icon-button overflow-hidden font-semibold"
              >
                {user.name.charAt(0).toUpperCase()}
              </PopoverTrigger>
              <PopoverContent align="end">
                <div className="px-1 py-0.5">
                  <p className="truncate font-semibold text-foreground">{user.name}</p>
                  <p className="truncate text-xs text-foreground/60">{user.email}</p>
                </div>
                <div className="mt-1 h-px bg-white/10" />
                <Link
                  href="/bookings"
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground/85 transition-colors hover:bg-white/10"
                >
                  <Ticket className="size-4" />
                  My Bookings
                </Link>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-foreground/85 transition-colors hover:bg-white/10"
                >
                  <LogOut className="size-4" />
                  Log Out
                </button>
              </PopoverContent>
            </Popover>
          ) : (
            <button
              type="button"
              aria-label="Account"
              onClick={() => openAuthDialog()}
              className="icon-button overflow-hidden"
            >
              <User className="size-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}