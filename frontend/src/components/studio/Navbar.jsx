import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, BookOpen, User, Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  return (
    <nav className="h-14 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 shrink-0">
      {/* Left: Logo + Tabs */}
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center">
            <svg viewBox="0 0 64 64" className="w-8 h-8">
              <polygon points="32,2 58,16 58,48 32,62 6,48 6,16" fill="hsl(142 65% 38%)" />
              <polygon points="32,16 45,23 45,41 32,48 19,41 19,23" fill="none" stroke="white" strokeWidth="2.5" />
            </svg>
          </div>
          <span className="font-heading font-bold text-lg text-foreground hidden sm:inline">
            ArcaneMath
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-primary font-heading font-medium gap-1.5 rounded-full">
              <Plus className="w-4 h-4" />
              Create
            </Button>
          </Link>
          <Link to="/library">
            <Button variant="ghost" size="sm" className="text-muted-foreground font-heading font-medium gap-1.5 rounded-full hover:text-foreground">
              <BookOpen className="w-4 h-4" />
              Library
            </Button>
          </Link>
        </div>
      </div>

      {/* Right: Search + Actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground rounded-full hidden sm:flex">
          <Search className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground rounded-full hidden sm:flex">
          <Bell className="w-4 h-4" />
        </Button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center cursor-pointer">
          <User className="w-4 h-4 text-primary-foreground" />
        </div>
      </div>
    </nav>
  );
}