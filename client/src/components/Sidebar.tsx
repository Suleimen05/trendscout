import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  Search,
  Users,
  UserSearch,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  Target,
  Bookmark,
  History,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

const mainNavItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Trending',
    href: '/trending',
    icon: TrendingUp,
    badge: 'New',
  },
  {
    title: 'Discover',
    href: '/discover',
    icon: Search,
  },
  {
    title: 'AI Scripts',
    href: '/ai-scripts',
    icon: Sparkles,
    badge: 'AI',
  },
  {
    title: 'Account Search',
    href: '/account-search',
    icon: UserSearch,
  },
  {
    title: 'Competitors',
    href: '/competitors',
    icon: Users,
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
];

const quickActions = [
  { title: 'Viral Videos', href: '/discover?filter=viral', icon: Zap },
  { title: 'Trending Hashtags', href: '/trending', icon: Target },
  { title: 'Saved Scripts', href: '/saved', icon: Bookmark },
  { title: 'Watch History', href: '/history', icon: History },
];

const bottomNavItems = [
  { title: 'Settings', href: '/settings', icon: Settings },
  { title: 'Help', href: '/help', icon: HelpCircle },
];

export function Sidebar({ open, onToggle }: SidebarProps) {
  const location = useLocation();
  const [activeNiche, setActiveNiche] = useState('all');

  const niches = [
    { id: 'all', label: 'All', color: 'bg-gray-500' },
    { id: 'entertainment', label: 'Entertainment', color: 'bg-purple-500' },
    { id: 'education', label: 'Education', color: 'bg-blue-500' },
    { id: 'lifestyle', label: 'Lifestyle', color: 'bg-green-500' },
    { id: 'business', label: 'Business', color: 'bg-amber-500' },
    { id: 'fashion', label: 'Fashion', color: 'bg-pink-500' },
    { id: 'food', label: 'Food', color: 'bg-orange-500' },
    { id: 'fitness', label: 'Fitness', color: 'bg-red-500' },
  ];

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col border-r bg-muted/30 transition-all duration-300',
        open ? 'w-64' : 'w-16'
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {open && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 text-white font-bold text-sm">
              VT
            </div>
            <span className="font-semibold">ViralTrend AI</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={cn(!open && 'w-full justify-center')}
        >
          {open ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-2 p-4 overflow-y-auto">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent',
                isActive
                  ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400'
                  : 'text-muted-foreground hover:text-foreground',
                !open && 'justify-center'
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {open && (
                <span className="flex-1">{item.title}</span>
              )}
              {item.badge && open && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  {item.badge}
                </Badge>
              )}
            </NavLink>
          );
        })}

        {/* Niches Filter */}
        {open && (
          <div className="pt-4">
            <h3 className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Niches
            </h3>
            <div className="space-y-1">
              {niches.map((niche) => (
                <button
                  key={niche.id}
                  onClick={() => setActiveNiche(niche.id)}
                  className={cn(
                    'w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all',
                    activeNiche === niche.id
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  )}
                >
                  <div className={cn('h-2 w-2 rounded-full', niche.color)} />
                  <span>{niche.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {open && (
          <div className="pt-4">
            <h3 className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Quick Actions
            </h3>
            <div className="space-y-1">
              {quickActions.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent',
                        isActive
                          ? 'bg-accent text-accent-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      )
                    }
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span>{item.title}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t p-4 space-y-1">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:text-foreground',
                !open && 'justify-center'
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {open && <span>{item.title}</span>}
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
}
