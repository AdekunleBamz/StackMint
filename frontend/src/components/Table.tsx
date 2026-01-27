'use client';

/**
 * Table Component
 * Data table with sorting and selection
 * @module components/Table
 * @version 1.0.0
 */

import { memo, useState, useCallback, ReactNode } from 'react';

// Types
export interface Column<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  sortable?: boolean;
  render?: (item: T, index: number) => ReactNode;
  align?: 'left' | 'center' | 'right';
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  selectable?: boolean;
  selectedKeys?: string[];
  onSelectionChange?: (keys: string[]) => void;
  sortable?: boolean;
  defaultSort?: { key: string; direction: 'asc' | 'desc' };
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  emptyMessage?: string;
  loading?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  compact?: boolean;
  className?: string;
}

function TableComponent<T extends Record<string, unknown>>({
  data,
  columns,
  keyExtractor,
  selectable = false,
  selectedKeys = [],
  onSelectionChange,
  sortable = false,
  defaultSort,
  onSort,
  emptyMessage = 'No data available',
  loading = false,
  striped = false,
  hoverable = true,
  compact = false,
  className = '',
}: TableProps<T>) {
  const [sortState, setSortState] = useState(defaultSort || { key: '', direction: 'asc' as const });

  const handleSort = useCallback((key: string) => {
    if (!sortable) return;
    
    const newDirection = sortState.key === key && sortState.direction === 'asc' ? 'desc' : 'asc';
    setSortState({ key, direction: newDirection });
    onSort?.(key, newDirection);
  }, [sortable, sortState, onSort]);

  const handleSelectAll = useCallback(() => {
    if (selectedKeys.length === data.length) {
      onSelectionChange?.([]);
    } else {
      onSelectionChange?.(data.map(keyExtractor));
    }
  }, [data, keyExtractor, selectedKeys, onSelectionChange]);

  const handleSelectRow = useCallback((key: string) => {
    if (selectedKeys.includes(key)) {
      onSelectionChange?.(selectedKeys.filter(k => k !== key));
    } else {
      onSelectionChange?.([...selectedKeys, key]);
    }
  }, [selectedKeys, onSelectionChange]);

  const getCellValue = (item: T, column: Column<T>): ReactNode => {
    if (column.render) {
      return column.render(item, data.indexOf(item));
    }
    const value = item[column.key as keyof T];
    if (value === null || value === undefined) return '-';
    return String(value);
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div className={`overflow-x-auto rounded-xl border border-gray-800 ${className}`}>
      <table className="w-full">
        {/* Header */}
        <thead className="bg-gray-800/50">
          <tr>
            {selectable && (
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedKeys.length === data.length && data.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={`
                  px-4 py-3 font-medium text-gray-400 text-sm uppercase tracking-wider
                  ${alignClasses[column.align || 'left']}
                  ${column.sortable !== false && sortable ? 'cursor-pointer select-none hover:text-white' : ''}
                `}
                style={{ width: column.width }}
                onClick={() => column.sortable !== false && handleSort(String(column.key))}
              >
                <div className={`flex items-center gap-1 ${column.align === 'right' ? 'justify-end' : column.align === 'center' ? 'justify-center' : ''}`}>
                  {column.header}
                  {sortable && column.sortable !== false && sortState.key === String(column.key) && (
                    <svg 
                      className={`w-4 h-4 transition-transform ${sortState.direction === 'desc' ? 'rotate-180' : ''}`}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody className="divide-y divide-gray-800">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 5 }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {selectable && (
                  <td className="px-4 py-3">
                    <div className="w-4 h-4 bg-gray-800 rounded animate-pulse" />
                  </td>
                )}
                {columns.map((column) => (
                  <td key={String(column.key)} className={`px-4 ${compact ? 'py-2' : 'py-3'}`}>
                    <div className="h-4 bg-gray-800 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td 
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="px-4 py-12 text-center text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => {
              const key = keyExtractor(item);
              const isSelected = selectedKeys.includes(key);

              return (
                <tr
                  key={key}
                  className={`
                    transition-colors
                    ${striped && index % 2 === 1 ? 'bg-gray-900/50' : ''}
                    ${hoverable ? 'hover:bg-gray-800/50' : ''}
                    ${isSelected ? 'bg-purple-600/10' : ''}
                  `}
                >
                  {selectable && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(key)}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={`
                        px-4 ${compact ? 'py-2' : 'py-3'} text-gray-300
                        ${alignClasses[column.align || 'left']}
                      `}
                    >
                      {getCellValue(item, column)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

/**
 * DataTable with built-in pagination
 */
interface DataTableProps<T> extends Omit<TableProps<T>, 'data'> {
  data: T[];
  pageSize?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  totalItems?: number;
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  pageSize = 10,
  currentPage = 1,
  onPageChange,
  totalItems,
  ...props
}: DataTableProps<T>) {
  const total = totalItems ?? data.length;
  const totalPages = Math.ceil(total / pageSize);
  
  // If external pagination, use data as-is; otherwise slice
  const displayData = totalItems ? data : data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-4">
      <TableComponent data={displayData} {...props} />
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-gray-500">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, total)} of {total}
          </p>
          
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let page: number;
              if (totalPages <= 5) {
                page = i + 1;
              } else if (currentPage <= 3) {
                page = i + 1;
              } else if (currentPage >= totalPages - 2) {
                page = totalPages - 4 + i;
              } else {
                page = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={page}
                  type="button"
                  onClick={() => onPageChange?.(page)}
                  className={`
                    w-10 h-10 rounded-lg font-medium transition-colors
                    ${page === currentPage 
                      ? 'bg-purple-600 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }
                  `}
                >
                  {page}
                </button>
              );
            })}
            
            <button
              type="button"
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * ActivityTable - pre-styled for NFT activity
 */
interface NFTActivity {
  id: string;
  type: 'sale' | 'transfer' | 'mint' | 'list' | 'offer' | 'cancel';
  nft: {
    name: string;
    image: string;
  };
  from: string;
  to: string;
  price?: number;
  timestamp: Date;
}

interface ActivityTableProps {
  activities: NFTActivity[];
  loading?: boolean;
  className?: string;
}

export function ActivityTable({
  activities,
  loading = false,
  className = '',
}: ActivityTableProps) {
  const typeIcons = {
    sale: { icon: '💰', color: 'text-green-400' },
    transfer: { icon: '↗️', color: 'text-blue-400' },
    mint: { icon: '✨', color: 'text-purple-400' },
    list: { icon: '📋', color: 'text-yellow-400' },
    offer: { icon: '🏷️', color: 'text-cyan-400' },
    cancel: { icon: '❌', color: 'text-red-400' },
  };

  const columns: Column<NFTActivity>[] = [
    {
      key: 'type',
      header: 'Event',
      width: '120px',
      render: (item) => {
        const config = typeIcons[item.type];
        return (
          <div className="flex items-center gap-2">
            <span>{config.icon}</span>
            <span className={`font-medium ${config.color}`}>
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </span>
          </div>
        );
      },
    },
    {
      key: 'nft',
      header: 'Item',
      render: (item) => (
        <div className="flex items-center gap-3">
          <img 
            src={item.nft.image} 
            alt={item.nft.name}
            className="w-10 h-10 rounded-lg object-cover"
          />
          <span className="font-medium text-white">{item.nft.name}</span>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      align: 'right',
      render: (item) => item.price ? (
        <span className="font-medium text-white">{item.price.toFixed(2)} STX</span>
      ) : (
        <span className="text-gray-500">—</span>
      ),
    },
    {
      key: 'from',
      header: 'From',
      render: (item) => (
        <span className="text-purple-400 font-mono text-sm">
          {item.from.slice(0, 6)}...{item.from.slice(-4)}
        </span>
      ),
    },
    {
      key: 'to',
      header: 'To',
      render: (item) => (
        <span className="text-purple-400 font-mono text-sm">
          {item.to.slice(0, 6)}...{item.to.slice(-4)}
        </span>
      ),
    },
    {
      key: 'timestamp',
      header: 'Time',
      align: 'right',
      render: (item) => {
        const now = new Date();
        const diff = now.getTime() - item.timestamp.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        let timeStr = '';
        if (minutes < 60) timeStr = `${minutes}m ago`;
        else if (hours < 24) timeStr = `${hours}h ago`;
        else if (days < 7) timeStr = `${days}d ago`;
        else timeStr = item.timestamp.toLocaleDateString();

        return <span className="text-gray-400 text-sm">{timeStr}</span>;
      },
    },
  ];

  return (
    <TableComponent
      data={activities}
      columns={columns}
      keyExtractor={(item) => item.id}
      loading={loading}
      hoverable
      className={className}
    />
  );
}

export default memo(TableComponent) as typeof TableComponent;
