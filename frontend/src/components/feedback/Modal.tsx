import { useEffect } from "react";
import type { ReactNode } from "react";
import { motion } from "motion/react";

type ModalProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function Modal({ title, onClose, children }: ModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="modal-overlay"
      initial={{ opacity: 0 }}
      onClick={onClose}
      role="presentation"
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <motion.div
        animate={{ opacity: 1, scale: 1, y: 0 }}
        aria-label={title}
        aria-modal="true"
        className="modal"
        initial={{ opacity: 0, scale: 0.9, y: 28 }}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        transition={{ type: "spring", stiffness: 360, damping: 26, mass: 0.9 }}
      >
        <div className="modal-header">
          <h2>{title}</h2>
          <motion.button
            aria-label="閉じる"
            className="modal-close"
            onClick={onClose}
            type="button"
            whileHover={{ rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            ×
          </motion.button>
        </div>
        <div className="modal-body">{children}</div>
      </motion.div>
    </motion.div>
  );
}
