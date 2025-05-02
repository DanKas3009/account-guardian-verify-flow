
import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavLayoutProps {
  children: React.ReactNode;
}

const NavLayout: React.FC<NavLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-pesalink-500 text-white font-bold w-10 h-10 flex items-center justify-center rounded-md">PL</div>
            <span className="text-xl font-semibold text-gray-800">PesaLink Validator</span>
          </Link>
          <nav className="hidden md:flex space-x-6">
            <NavLink href="/">Dashboard</NavLink>
            <NavLink href="/validate">Validate Accounts</NavLink>
            <NavLink href="/history">History</NavLink>
          </nav>
          <div className="md:hidden">
            {/* Mobile menu button - would implement in full version */}
            <button className="p-2 text-gray-600 hover:text-pesalink-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-gray-50">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} PesaLink Bulk Account Validator. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

const NavLink: React.FC<NavLinkProps> = ({ href, children, className }) => {
  // In a real app, we would check if the current route matches the link
  const isActive = location.pathname === href;

  return (
    <Link
      to={href}
      className={cn(
        "text-gray-600 hover:text-pesalink-500 font-medium",
        isActive && "text-pesalink-500 font-semibold",
        className
      )}
    >
      {children}
    </Link>
  );
};

export default NavLayout;
