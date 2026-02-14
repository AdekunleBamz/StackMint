'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

/**
 * Breadcrumb Component
 * Navigation aid showing current page location
 * @module components/Breadcrumb
 * @version 1.0.0
 */

interface BreadcrumbItem {
  label: string;
  href: string;
}

const ROUTE_LABELS: Record<string, string> = {
  collections: 'Collections',
  marketplace: 'Marketplace',
  mint: 'Mint',
  profile: 'Profile',
};

export default function Breadcrumb() {
  const pathname = usePathname();

  const items = useMemo(() => {
    if (!pathname || pathname === '/') return [];

    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];
    
    let currentPath = '';
    
    segments.forEach((segment) => {
      currentPath += `/${segment}`;
      breadcrumbs.push({
        label: ROUTE_LABELS[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
        href: currentPath,
      });
    });

    return breadcrumbs;
  }, [pathname]);

  if (items.length === 0) return null;

  return (
    <nav className="flex mb-6" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/30 backdrop-blur-sm">
        <li className="inline-flex items-center">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-purple-300 transition-all duration-200 group"
          >
            <svg 
              className="w-4 h-4 mr-2 group-hover:scale-110 group-hover:text-purple-400 transition-all duration-200" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Home
          </Link>
        </li>
        
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={item.href}>
              <div className="flex items-center">
                <svg 
                  className="w-5 h-5 text-gray-600 mx-1 hover:text-gray-500 transition-colors" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                {isLast ? (
                  <span 
                    className="text-sm font-semibold text-purple-300 md:ml-1 bg-purple-500/10 px-2 py-1 rounded" 
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-700/40 px-2 py-1 rounded transition-all duration-200"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
