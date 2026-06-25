import { motion, type HTMLMotionProps } from "framer-motion"

export function SlideUp({ children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2, ease: [0.175, 0.885, 0.32, 1.275] }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
