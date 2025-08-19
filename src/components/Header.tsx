
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Receipt, Wallet, Calendar, Target, Settings, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLanguage } from '@/i18n/context';
import { useTheme } from '@/theme/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const Header = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const navLinks = [
    { name: t('dashboard'), path: '/', icon: <Home className="h-5 w-5 mr-2" /> },
    { name: 'LCARS Dashboard', path: '/dashboard/v2', icon: <Globe className="h-5 w-5 mr-2" /> },
    { name: t('bills'), path: '/bills', icon: <Receipt className="h-5 w-5 mr-2" /> },
    { name: t('accounts'), path: '/accounts', icon: <Wallet className="h-5 w-5 mr-2" /> },
    { name: t('calendar'), path: '/calendar', icon: <Calendar className="h-5 w-5 mr-2" /> },
    { name: t('paymentGoals'), path: '/payment-goals', icon: <Target className="h-5 w-5 mr-2" /> },
  ];

  const userInitial = user?.email ? user.email[0].toUpperCase() : '?';
  
  const toggleTheme = () => {
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="fixed w-full bg-background z-10 border-b">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2">
          <Link to="/" className="text-xl font-bold">
            FinanceTracker
          </Link>
        </div>

        {!isMobile && (
          <nav className="mx-6 flex items-center space-x-4 lg:space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === link.path
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title={resolvedTheme === 'light' ? t('dark') : t('light')}
          >
            {resolvedTheme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg" alt={user.email || 'User'} />
                    <AvatarFallback>{userInitial}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{t('accountSettings')}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/accounts">{t('accounts')}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/bills">{t('bills')}</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    {t('settings')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>{t('signOut')}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {isMobile && (
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="pr-0">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between px-4">
                    <div className="text-lg font-bold">Menu</div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setOpen(false)}
                    >
                      <X className="h-5 w-5" />
                      <span className="sr-only">Close</span>
                    </Button>
                  </div>
                  <nav className="flex flex-col gap-4 py-6">
                    {navLinks.map((link) => (
                      <Link
                        key={link.name}
                        to={link.path}
                        className={`flex items-center px-4 py-2 text-base font-medium transition-colors hover:bg-muted ${
                          location.pathname === link.path
                            ? 'bg-muted text-foreground'
                            : 'text-muted-foreground'
                        }`}
                        onClick={() => setOpen(false)}
                      >
                        {link.icon}
                        {link.name}
                      </Link>
                    ))}
                    <Link
                      to="/settings"
                      className={`flex items-center px-4 py-2 text-base font-medium transition-colors hover:bg-muted ${
                        location.pathname === '/settings'
                          ? 'bg-muted text-foreground'
                          : 'text-muted-foreground'
                      }`}
                      onClick={() => setOpen(false)}
                    >
                      <Settings className="h-5 w-5 mr-2" />
                      {t('settings')}
                    </Link>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
