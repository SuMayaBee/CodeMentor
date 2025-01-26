"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookText, 
  Headphones, 
  FolderGit2,
  Settings, 
  PackageOpen,
  Upload,
  Brain
} from 'lucide-react';

const sidebarItems = [
  {
    title: 'Roadmap',
    href: '/roadmap',
    icon: LayoutDashboard
  },
  {
    title: 'Content',
    href: '/content',
    icon: BookText
  },
  {
    title: 'MentorShip',
    href: '/mentor_ship',
    icon: Headphones
  },
  {
    title: 'Playground',
    href: '/playground',
    icon: FolderGit2
  },
  {
    title: 'AI Practice',
    href: '/practice',
    icon: Brain
  },
  {
    title: 'Material upload',
    href: '/material_upload',
    icon: Upload
  }
];

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className="h-full w-64 border-r bg-background/95 pb-12">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-secondary text-secondary-foreground' 
                      : 'hover:bg-secondary/80'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;