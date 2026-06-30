import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';
import * as DialogPrimitive from '@radix-ui/react-dialog';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  side?: 'left' | 'right' | 'top' | 'bottom';
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Drawer({ isOpen, onClose, side = 'right', title, description, children, className }: DrawerProps) {
  const slideVariants = {
    closed: {
      x: side === 'right' ? '100%' : side === 'left' ? '-100%' : 0,
      y: side === 'bottom' ? '100%' : side === 'top' ? '-100%' : 0,
    },
    open: {
      x: 0,
      y: 0,
    }
  };

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {isOpen && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              />
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content asChild forceMount>
              <motion.div
                initial="closed"
                animate="open"
                exit="closed"
                variants={slideVariants}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className={cn(
                  "fixed z-50 flex flex-col gap-4 bg-surface-elevated p-6 shadow-2xl outline-none",
                  side === 'right' ? 'inset-y-0 right-0 h-full w-3/4 max-w-sm border-l border-border-default' : '',
                  side === 'left' ? 'inset-y-0 left-0 h-full w-3/4 max-w-sm border-r border-border-default' : '',
                  side === 'top' ? 'inset-x-0 top-0 w-full border-b border-border-default' : '',
                  side === 'bottom' ? 'inset-x-0 bottom-0 w-full border-t border-border-default rounded-t-2xl' : '',
                  className
                )}
              >
                {(title || description) && (
                  <div className="flex flex-col gap-1">
                    {title && <DialogPrimitive.Title className="text-lg font-semibold tracking-tight text-text-primary">{title}</DialogPrimitive.Title>}
                    {description && <DialogPrimitive.Description className="text-sm text-text-secondary">{description}</DialogPrimitive.Description>}
                  </div>
                )}
                <div className="flex-1 overflow-y-auto overflow-x-hidden">
                  {children}
                </div>
                <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-canvas transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 disabled:pointer-events-none">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </DialogPrimitive.Close>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
