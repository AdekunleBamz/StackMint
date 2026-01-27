'use client';

/**
 * Accordion Component
 * Expandable content sections with smooth animations
 * @module components/Accordion
 * @version 1.0.0
 */

import { useState, useRef, useEffect, memo, ReactNode, createContext, useContext } from 'react';

// Accordion Context for managing single/multiple open items
interface AccordionContextValue {
  openItems: string[];
  toggleItem: (id: string) => void;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

// Main Accordion Container
interface AccordionProps {
  children: ReactNode;
  type?: 'single' | 'multiple';
  defaultOpen?: string[];
  className?: string;
}

export function Accordion({
  children,
  type = 'single',
  defaultOpen = [],
  className = '',
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>(defaultOpen);

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (type === 'single') {
        return [id];
      }
      return [...prev, id];
    });
  };

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem }}>
      <div className={`space-y-2 ${className}`}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

// Accordion Item
interface AccordionItemProps {
  id: string;
  title: string;
  children: ReactNode;
  icon?: ReactNode;
  badge?: string;
  disabled?: boolean;
  className?: string;
}

function AccordionItemComponent({
  id,
  title,
  children,
  icon,
  badge,
  disabled = false,
  className = '',
}: AccordionItemProps) {
  const context = useContext(AccordionContext);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  if (!context) {
    throw new Error('AccordionItem must be used within an Accordion');
  }

  const { openItems, toggleItem } = context;
  const isOpen = openItems.includes(id);

  // Update content height when open state changes
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen, children]);

  return (
    <div
      className={`
        rounded-xl border border-gray-800 overflow-hidden
        ${disabled ? 'opacity-50' : ''}
        ${isOpen ? 'bg-gray-800/30' : 'bg-gray-900/50'}
        ${className}
      `}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => !disabled && toggleItem(id)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between gap-3 p-4 text-left
          transition-colors
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-gray-800/50'}
        `}
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${id}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {icon && <span className="text-gray-400 flex-shrink-0">{icon}</span>}
          <span className="font-medium text-white truncate">{title}</span>
          {badge && (
            <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium bg-purple-500/20 text-purple-400 rounded-full">
              {badge}
            </span>
          )}
        </div>

        {/* Chevron */}
        <svg
          className={`
            w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300
            ${isOpen ? 'rotate-180' : ''}
          `}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Content */}
      <div
        id={`accordion-content-${id}`}
        role="region"
        aria-hidden={!isOpen}
        style={{ height: contentHeight }}
        className="overflow-hidden transition-all duration-300 ease-out"
      >
        <div ref={contentRef} className="p-4 pt-0 text-gray-300">
          {children}
        </div>
      </div>
    </div>
  );
}

export const AccordionItem = memo(AccordionItemComponent);

// FAQ Accordion - specialized for FAQ sections
interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
  className?: string;
}

export function FAQAccordion({ items, className = '' }: FAQAccordionProps) {
  return (
    <Accordion type="single" className={className}>
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          id={`faq-${index}`}
          title={item.question}
          icon={<span className="text-purple-400">Q</span>}
        >
          {item.answer}
        </AccordionItem>
      ))}
    </Accordion>
  );
}

// Simple Collapsible - standalone without accordion context
interface CollapsibleProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  icon?: ReactNode;
  className?: string;
}

export function Collapsible({
  title,
  children,
  defaultOpen = false,
  icon,
  className = '',
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen, children]);

  return (
    <div className={`rounded-xl border border-gray-800 overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-gray-800/50 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          {icon}
          <span className="font-medium text-white">{title}</span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        style={{ height: contentHeight }}
        className="overflow-hidden transition-all duration-300 ease-out"
      >
        <div ref={contentRef} className="p-4 pt-0 text-gray-300">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Accordion;
