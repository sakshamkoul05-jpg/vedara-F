'use client';

import * as React from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const ToastProvider = ToastPrimitive.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      'fixed top-4 right-4 z-[100] flex max-h-screen w-full max-w-sm flex-col gap-2 p-4 outline-none',
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitive.Viewport.displayName;

const toastVariants = cva(
  'group relative flex w-full items-start gap-3 overflow-hidden rounded-xl border px-4 py-3 shadow-lg',
  {
    variants: {
      variant: {
        success: 'border-green-200 bg-green-50 text-green-900',
        error: 'border-red-200 bg-red-50 text-red-900',
        info: 'border-gold-200 bg-gold-50 text-vedara-900',
        warning: 'border-yellow-200 bg-yellow-50 text-yellow-900',
      },
    },
    defaultVariants: { variant: 'info' },
  }
);

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root>,
    VariantProps<typeof toastVariants> {
  description?: string;
}

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  ToastProps & { onDismiss?: () => void }
>(({ className, variant = 'info', title, description, onDismiss, ...props }, ref) => {
  const Icon = iconMap[(variant as ToastVariant) || 'info'] || Info;
  const [progress, setProgress] = React.useState(100);
  const duration = props.duration || 5000;

  React.useEffect(() => {
    if (props.open === false) return;
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, [props.open, duration]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      layout
    >
      <ToastPrimitive.Root
        ref={ref}
        className={cn(toastVariants({ variant }), className)}
        {...props}
      >
        <Icon className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="flex-1 space-y-1">
          {title && (
            <ToastPrimitive.Title className="text-sm font-semibold">
              {title}
            </ToastPrimitive.Title>
          )}
          {description && (
            <ToastPrimitive.Description className="text-sm opacity-90">
              {description}
            </ToastPrimitive.Description>
          )}
        </div>
        <ToastPrimitive.Close
          onClick={onDismiss}
          className="shrink-0 rounded-full p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/5 focus:opacity-100 focus:outline-none"
        >
          <X className="h-4 w-4" />
        </ToastPrimitive.Close>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5">
          <div
            className="h-full rounded-full bg-current transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </ToastPrimitive.Root>
    </motion.div>
  );
});
Toast.displayName = 'Toast';

const ToastTitle = ToastPrimitive.Title;
const ToastDescription = ToastPrimitive.Description;
const ToastClose = ToastPrimitive.Close;

type ToasterToast = {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

type Action = { type: 'ADD_TOAST'; toast: ToasterToast } | { type: 'DISMISS_TOAST'; toastId: string };

type State = { toasts: ToasterToast[] };

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_TOAST':
      return { ...state, toasts: [action.toast, ...state.toasts] };
    case 'DISMISS_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.toastId) };
    default:
      return state;
  }
}

let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

function useToast() {
  const [state, dispatch] = React.useReducer(reducer, { toasts: [] });

  const toast = React.useCallback(
    ({ title, description, variant, duration }: Omit<ToasterToast, 'id'>) => {
      const id = genId();
      dispatch({ type: 'ADD_TOAST', toast: { id, title, description, variant, duration } });

      const timeout = setTimeout(() => {
        dispatch({ type: 'DISMISS_TOAST', toastId: id });
        toastTimeouts.delete(id);
      }, duration || 5000);

      toastTimeouts.set(id, timeout);
      return id;
    },
    []
  );

  const dismiss = React.useCallback((toastId: string) => {
    const timeout = toastTimeouts.get(toastId);
    if (timeout) {
      clearTimeout(timeout);
      toastTimeouts.delete(toastId);
    }
    dispatch({ type: 'DISMISS_TOAST', toastId });
  }, []);

  return { toasts: state.toasts, toast, dismiss };
}

function ToastContainer({ toasts, dismiss }: { toasts: ToasterToast[]; dismiss: (id: string) => void }) {
  return (
    <AnimatePresence mode="popLayout">
      {toasts.map((t) => (
        <Toast
          key={t.id}
          open={true}
          onOpenChange={(open) => { if (!open) dismiss(t.id); }}
          title={t.title}
          description={t.description}
          variant={t.variant}
          duration={t.duration}
          onDismiss={() => dismiss(t.id)}
        />
      ))}
    </AnimatePresence>
  );
}

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastContainer,
  useToast,
};
