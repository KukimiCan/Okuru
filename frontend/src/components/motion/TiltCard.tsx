import type { MouseEvent, ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

type TiltCardProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  onClick?: () => void;
};

export function TiltCard({ children, className, delay = 0, onClick }: TiltCardProps) {
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [8, -8]), {
    damping: 20,
    stiffness: 220,
  });
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-8, 8]), {
    damping: 20,
    stiffness: 220,
  });

  function handleMouseMove(event: MouseEvent<HTMLButtonElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5);
    pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5);
  }

  function handleMouseLeave() {
    pointerX.set(0);
    pointerY.set(0);
  }

  return (
    <motion.button
      className={className}
      initial={{ opacity: 0, y: 24 }}
      onClick={onClick}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      type="button"
      viewport={{ margin: "-40px", once: true }}
      whileHover={{ scale: 1.04, y: -4 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.button>
  );
}
