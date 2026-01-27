'use client';

/**
 * DragAndDrop Component
 * Drag and drop functionality for lists and grids
 * @module components/DragAndDrop
 * @version 1.0.0
 */

import { memo, useState, useRef, ReactNode, DragEvent, useCallback } from 'react';

// Types
interface DragItem<T> {
  id: string;
  data: T;
  index: number;
}

interface DraggableListProps<T> {
  items: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T, index: number, isDragging: boolean) => ReactNode;
  onReorder: (items: T[]) => void;
  direction?: 'vertical' | 'horizontal';
  className?: string;
}

export function DraggableList<T>({
  items,
  keyExtractor,
  renderItem,
  onReorder,
  direction = 'vertical',
  className = '',
}: DraggableListProps<T>) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const draggedItem = useRef<T | null>(null);

  const handleDragStart = (e: DragEvent<HTMLDivElement>, item: T, index: number) => {
    draggedItem.current = item;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', keyExtractor(item));
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTargetIndex(index);
  };

  const handleDragLeave = () => {
    setDropTargetIndex(null);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === index) {
      setDraggedIndex(null);
      setDropTargetIndex(null);
      return;
    }

    const newItems = [...items];
    const [removed] = newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, removed);
    
    onReorder(newItems);
    setDraggedIndex(null);
    setDropTargetIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDropTargetIndex(null);
    draggedItem.current = null;
  };

  const containerClasses = direction === 'horizontal' 
    ? 'flex flex-row gap-3' 
    : 'flex flex-col gap-2';

  return (
    <div className={`${containerClasses} ${className}`}>
      {items.map((item, index) => {
        const key = keyExtractor(item);
        const isDragging = draggedIndex === index;
        const isDropTarget = dropTargetIndex === index;

        return (
          <div
            key={key}
            draggable
            onDragStart={(e) => handleDragStart(e, item, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`
              transition-all duration-200 cursor-grab active:cursor-grabbing
              ${isDragging ? 'opacity-50 scale-95' : ''}
              ${isDropTarget && !isDragging ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-gray-900' : ''}
            `}
          >
            {renderItem(item, index, isDragging)}
          </div>
        );
      })}
    </div>
  );
}

/**
 * SortableItem - Individual sortable item wrapper
 */
interface SortableItemProps {
  children: ReactNode;
  handle?: ReactNode;
  className?: string;
}

export function SortableItem({
  children,
  handle,
  className = '',
}: SortableItemProps) {
  return (
    <div className={`flex items-center gap-3 p-3 bg-gray-800/50 border border-gray-700/50 rounded-xl ${className}`}>
      {handle || (
        <div className="flex-shrink-0 text-gray-500 cursor-grab active:cursor-grabbing">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>
      )}
      <div className="flex-1">{children}</div>
    </div>
  );
}

/**
 * DropZone - File drop zone area
 */
interface DropZoneProps {
  onDrop: (files: File[]) => void;
  accept?: string[];
  multiple?: boolean;
  maxSize?: number;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
}

export function DropZone({
  onDrop,
  accept = ['image/*'],
  multiple = true,
  maxSize = 10 * 1024 * 1024, // 10MB
  disabled = false,
  children,
  className = '',
}: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFiles = (files: File[]): File[] => {
    return files.filter((file) => {
      // Check file type
      if (accept.length > 0) {
        const isValidType = accept.some((type) => {
          if (type.endsWith('/*')) {
            return file.type.startsWith(type.replace('/*', ''));
          }
          return file.type === type || file.name.endsWith(type);
        });
        if (!isValidType) {
          setError(`Invalid file type: ${file.type}`);
          return false;
        }
      }

      // Check file size
      if (file.size > maxSize) {
        setError(`File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB (max ${maxSize / 1024 / 1024}MB)`);
        return false;
      }

      return true;
    });
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
      setError(null);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    const filesToProcess = multiple ? droppedFiles : [droppedFiles[0]];
    const validFiles = validateFiles(filesToProcess);

    if (validFiles.length > 0) {
      onDrop(validFiles);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = validateFiles(selectedFiles);
      if (validFiles.length > 0) {
        onDrop(validFiles);
      }
    }
    e.target.value = '';
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-2xl p-8 text-center
        transition-all duration-200 cursor-pointer
        ${isDragOver 
          ? 'border-purple-500 bg-purple-500/10' 
          : 'border-gray-600 hover:border-gray-500'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${error ? 'border-red-500/50' : ''}
        ${className}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept.join(',')}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      {children || (
        <div className="space-y-4">
          <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center ${isDragOver ? 'bg-purple-500/20' : 'bg-gray-800'}`}>
            <svg className={`w-7 h-7 ${isDragOver ? 'text-purple-400' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <p className="text-white font-medium">
              {isDragOver ? 'Drop files here' : 'Drag & drop files or click to browse'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {accept.join(', ')} • Max {maxSize / 1024 / 1024}MB per file
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 text-sm text-red-400">{error}</div>
      )}
    </div>
  );
}

/**
 * DraggableGrid - Grid layout with drag and drop
 */
interface DraggableGridProps<T> {
  items: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T, index: number, isDragging: boolean) => ReactNode;
  onReorder: (items: T[]) => void;
  columns?: 2 | 3 | 4 | 5 | 6;
  className?: string;
}

export function DraggableGrid<T>({
  items,
  keyExtractor,
  renderItem,
  onReorder,
  columns = 4,
  className = '',
}: DraggableGridProps<T>) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  const columnClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
    6: 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTargetIndex(index);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === index) {
      setDraggedIndex(null);
      setDropTargetIndex(null);
      return;
    }

    const newItems = [...items];
    const [removed] = newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, removed);
    
    onReorder(newItems);
    setDraggedIndex(null);
    setDropTargetIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDropTargetIndex(null);
  };

  return (
    <div className={`grid ${columnClasses[columns]} gap-4 ${className}`}>
      {items.map((item, index) => {
        const key = keyExtractor(item);
        const isDragging = draggedIndex === index;
        const isDropTarget = dropTargetIndex === index;

        return (
          <div
            key={key}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={() => setDropTargetIndex(null)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`
              transition-all duration-200 cursor-grab active:cursor-grabbing
              ${isDragging ? 'opacity-50 scale-95' : ''}
              ${isDropTarget && !isDragging ? 'ring-2 ring-purple-500 rounded-xl' : ''}
            `}
          >
            {renderItem(item, index, isDragging)}
          </div>
        );
      })}
    </div>
  );
}

/**
 * KanbanColumn - Kanban board column
 */
interface KanbanColumnProps {
  id: string;
  title: string;
  count: number;
  color?: string;
  children: ReactNode;
  onDrop?: (itemId: string, fromColumnId: string) => void;
  className?: string;
}

export function KanbanColumn({
  id,
  title,
  count,
  color = 'purple',
  children,
  onDrop,
  className = '',
}: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const colorClasses: Record<string, string> = {
    purple: 'bg-purple-500/20 text-purple-400',
    blue: 'bg-blue-500/20 text-blue-400',
    green: 'bg-green-500/20 text-green-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    red: 'bg-red-500/20 text-red-400',
    gray: 'bg-gray-500/20 text-gray-400',
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const data = e.dataTransfer.getData('application/json');
    if (data && onDrop) {
      try {
        const { itemId, columnId } = JSON.parse(data);
        if (columnId !== id) {
          onDrop(itemId, columnId);
        }
      } catch {
        // Invalid data
      }
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        flex flex-col min-w-[280px] rounded-2xl
        bg-gray-900/50 border transition-all
        ${isDragOver ? 'border-purple-500 bg-purple-500/5' : 'border-gray-700/50'}
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-white">{title}</h3>
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colorClasses[color]}`}>
            {count}
          </span>
        </div>
        <button className="p-1 text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Cards */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

/**
 * KanbanCard - Draggable kanban card
 */
interface KanbanCardProps {
  id: string;
  columnId: string;
  children: ReactNode;
  className?: string;
}

export function KanbanCard({
  id,
  columnId,
  children,
  className = '',
}: KanbanCardProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify({ itemId: id, columnId }));
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`
        p-3 rounded-xl bg-gray-800/50 border border-gray-700/50
        cursor-grab active:cursor-grabbing transition-all
        hover:border-gray-600/50
        ${isDragging ? 'opacity-50 scale-95' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

/**
 * NFTReorderGrid - Reorder NFTs for collection showcase
 */
interface NFT {
  id: string;
  name: string;
  image: string;
}

interface NFTReorderGridProps {
  nfts: NFT[];
  onReorder: (nfts: NFT[]) => void;
  maxItems?: number;
  className?: string;
}

export function NFTReorderGrid({
  nfts,
  onReorder,
  maxItems = 6,
  className = '',
}: NFTReorderGridProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleReorder = useCallback((newNfts: NFT[]) => {
    onReorder(newNfts.slice(0, maxItems));
  }, [maxItems, onReorder]);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-400">
          Drag to reorder • {nfts.length}/{maxItems} featured
        </p>
      </div>
      <DraggableGrid
        items={nfts}
        keyExtractor={(nft) => nft.id}
        onReorder={handleReorder}
        columns={3}
        renderItem={(nft, index, isDragging) => (
          <div
            className={`
              relative aspect-square rounded-xl overflow-hidden
              border-2 transition-all
              ${isDragging ? 'border-purple-500' : 'border-transparent'}
            `}
          >
            <img
              src={nft.image}
              alt={nft.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-2 left-2 right-2">
              <p className="text-white text-sm font-medium truncate">{nft.name}</p>
            </div>
            <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center">
              <span className="text-xs text-white font-medium">{index + 1}</span>
            </div>
          </div>
        )}
      />
    </div>
  );
}

export default memo(DraggableList);
