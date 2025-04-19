import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  onClose,
  title = "",
  children,
  className,
}) => {
  const [mounted, setMounted] = useState(false);

  // Ensure portal mount only happens client-side
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 opacity-0 animate-fadeIn backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative z-[1001] max-w-max w-full">
        <div
          className={`bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-6 animate-scaleIn ${className}`}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{title}</h2>
            <Button variant="ghost" onClick={onClose}>
              ✕
            </Button>
          </div>

          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CustomModal;
