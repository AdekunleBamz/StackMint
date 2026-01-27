'use client';

/**
 * Grid Component
 * Responsive grid layout system
 * @module components/Grid
 * @version 1.0.0
 */

import { memo, ReactNode } from 'react';

interface GridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  responsive?: boolean;
  className?: string;
}

const columnClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  12: 'grid-cols-12',
};

const responsiveColumnClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
  6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
  12: 'grid-cols-4 sm:grid-cols-6 lg:grid-cols-12',
};

const gapClasses = {
  none: 'gap-0',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

function GridComponent({
  children,
  columns = 4,
  gap = 'md',
  responsive = true,
  className = '',
}: GridProps) {
  const colClass = responsive ? responsiveColumnClasses[columns] : columnClasses[columns];

  return (
    <div className={`grid ${colClass} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
}

/**
 * Grid Item with span support
 */
interface GridItemProps {
  children: ReactNode;
  span?: 1 | 2 | 3 | 4 | 5 | 6 | 12 | 'full';
  rowSpan?: 1 | 2 | 3 | 4;
  className?: string;
}

export function GridItem({
  children,
  span = 1,
  rowSpan = 1,
  className = '',
}: GridItemProps) {
  const colSpanClasses = {
    1: 'col-span-1',
    2: 'col-span-2',
    3: 'col-span-3',
    4: 'col-span-4',
    5: 'col-span-5',
    6: 'col-span-6',
    12: 'col-span-12',
    full: 'col-span-full',
  };

  const rowSpanClasses = {
    1: 'row-span-1',
    2: 'row-span-2',
    3: 'row-span-3',
    4: 'row-span-4',
  };

  return (
    <div className={`${colSpanClasses[span]} ${rowSpanClasses[rowSpan]} ${className}`}>
      {children}
    </div>
  );
}

/**
 * Container with max-width
 */
interface ContainerProps {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: boolean;
  center?: boolean;
  className?: string;
}

export function Container({
  children,
  size = 'xl',
  padding = true,
  center = true,
  className = '',
}: ContainerProps) {
  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-5xl',
    xl: 'max-w-6xl',
    '2xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div className={`
      ${sizeClasses[size]}
      ${center ? 'mx-auto' : ''}
      ${padding ? 'px-4 sm:px-6 lg:px-8' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
}

/**
 * Section wrapper with spacing
 */
interface SectionProps {
  children: ReactNode;
  id?: string;
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Section({
  children,
  id,
  spacing = 'lg',
  className = '',
}: SectionProps) {
  const spacingClasses = {
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16',
    xl: 'py-24',
  };

  return (
    <section id={id} className={`${spacingClasses[spacing]} ${className}`}>
      {children}
    </section>
  );
}

/**
 * Flex container utilities
 */
interface FlexProps {
  children: ReactNode;
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Flex({
  children,
  direction = 'row',
  align = 'center',
  justify = 'start',
  wrap = false,
  gap = 'md',
  className = '',
}: FlexProps) {
  const directionClasses = {
    row: 'flex-row',
    col: 'flex-col',
    'row-reverse': 'flex-row-reverse',
    'col-reverse': 'flex-col-reverse',
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline',
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  return (
    <div className={`
      flex
      ${directionClasses[direction]}
      ${alignClasses[align]}
      ${justifyClasses[justify]}
      ${wrap ? 'flex-wrap' : ''}
      ${gapClasses[gap]}
      ${className}
    `}>
      {children}
    </div>
  );
}

/**
 * Stack - vertical flex container
 */
interface StackProps {
  children: ReactNode;
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  className?: string;
}

export function Stack({
  children,
  gap = 'md',
  align = 'stretch',
  className = '',
}: StackProps) {
  return (
    <Flex direction="col" gap={gap} align={align} className={className}>
      {children}
    </Flex>
  );
}

/**
 * HStack - horizontal flex container
 */
export function HStack({
  children,
  gap = 'md',
  align = 'center',
  className = '',
}: StackProps) {
  return (
    <Flex direction="row" gap={gap} align={align} className={className}>
      {children}
    </Flex>
  );
}

/**
 * Center - centers content both horizontally and vertically
 */
interface CenterProps {
  children: ReactNode;
  className?: string;
}

export function Center({ children, className = '' }: CenterProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      {children}
    </div>
  );
}

/**
 * Spacer - flexible space in flex containers
 */
export function Spacer() {
  return <div className="flex-1" />;
}

/**
 * Divider - visual separator
 */
interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function Divider({ orientation = 'horizontal', className = '' }: DividerProps) {
  if (orientation === 'vertical') {
    return <div className={`w-px bg-gray-800 self-stretch ${className}`} />;
  }
  return <hr className={`border-t border-gray-800 ${className}`} />;
}

export default memo(GridComponent);
