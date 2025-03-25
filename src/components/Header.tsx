
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Receipt, 
  CreditCard, 
  Calendar, 
  Menu, 
  X,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFinance } from '@/contexts/FinanceContext';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { reminders } = useFinance();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const links = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/bills', icon: Receipt, label: 'Bills' },
    { to: '/accounts', icon: CreditCard, label: 'Accounts' },
    { to: '/calendar', icon: Calendar, label: 'Calendar' },
  ];

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-8",
      isScrolled 
        ? "bg-white/80 dark:bg-card/80 backdrop-blur-lg shadow-sm py-3" 
        : "bg-transparent py-5"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link 
          to="/" 
          className="text-2xl font-medium flex items-center"
        >
          <span className="bg-primary text-primary-foreground rounded-lg h-8 w-8 flex items-center justify-center mr-2">
            <CreditCard size={18} />
          </span>
          <span className="hidden sm:block">FinanceTrack</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-250",
                location.pathname === link.to 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "hover:bg-secondary"
              )}
            >
              <link.icon size={18} />
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          <Link to="/reminders" className="relative">
            <Bell size={20} />
            {reminders.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {reminders.length}
              </span>
            )}
          </Link>

          {/* Mobile menu toggle */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-background animate-fade-in">
          <div className="pt-20 pb-6 px-6">
            <div className="flex flex-col space-y-2">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    "py-3 px-4 rounded-xl flex items-center space-x-3 transition-all duration-300 animate-slide-up",
                    location.pathname === link.to 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "hover:bg-secondary"
                  )}
                >
                  <link.icon size={20} />
                  <span className="text-lg">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
