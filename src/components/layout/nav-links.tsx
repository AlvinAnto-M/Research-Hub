"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FolderKanban, FileText, Search, Bookmark } from 'lucide-react';
import { SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';

const links = [
  { href: '/projects', icon: FolderKanban, label: 'My Projects' },
  { href: '/report-generator', icon: FileText, label: 'Report Generator' },
  { href: '/research-ahead', icon: Search, label: 'Paper Analyzer' },
  { href: '/bookmarks', icon: Bookmark, label: 'Saved Papers' },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname.startsWith(link.href);
        return (
          <SidebarMenuItem key={link.href}>
            <SidebarMenuButton asChild isActive={isActive} tooltip={link.label}>
              <Link href={link.href}>
                <Icon />
                <span>{link.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </>
  );
}
