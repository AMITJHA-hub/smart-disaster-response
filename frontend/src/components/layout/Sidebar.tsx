"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils'; // I'll need to create a simple cn utility

export interface SidebarLink {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

interface SidebarProps {
  links: SidebarLink[];
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ links, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform bg-base-100 border-r border-base-300 lg:translate-x-0 shadow-lg",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full px-4 pb-4 overflow-y-auto">
          <ul className="menu w-full space-y-2">
            {links.map((link) => {
              const isRoot = link.href.split('/').length === 2; // e.g. /admin
              const isActive = isRoot 
                ? pathname === link.href 
                : (pathname === link.href || pathname.startsWith(`${link.href}/`));
              
              return (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className={cn(
                      "transition-all rounded-xl",
                      isActive ? "bg-primary/10 text-primary font-medium hover:bg-primary/20 border border-primary/20" : "hover:bg-base-200 text-base-content/70 hover:text-base-content"
                    )}
                    onClick={onClose}
                  >
                    {link.icon && <span className={cn("mr-2", isActive ? "text-primary" : "text-base-content/50")}>{link.icon}</span>}
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
    </>
  );
}
