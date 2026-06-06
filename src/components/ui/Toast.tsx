"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface ToastContextValue {
  toast: (message: string, type?: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const [type, setType] = useState<"success" | "error" | "info">("info");

  const toast = useCallback(
    (msg: string, t: "success" | "error" | "info" = "info") => {
      setMessage(msg);
      setType(t);
      window.clearTimeout((toast as any)._t);
      (toast as any)._t = window.setTimeout(() => setMessage(null), 2600);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        className={`fixed left-1/2 bottom-5 z-[1200] -translate-x-1/2 px-4 py-3 rounded-xl text-white text-sm font-medium shadow-lg transition-all duration-200 ${
          message
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-3 pointer-events-none"
        }`}
        style={{
          background:
            type === "error"
              ? "rgba(150,40,40,0.96)"
              : type === "success"
              ? "rgba(15,107,68,0.96)"
              : "rgba(8,16,27,0.94)",
        }}
      >
        {message}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
