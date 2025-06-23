/**
 * Design system for overlay components and interactive elements
 */

export const overlayDesign = {
  // Animation configurations
  animation: {
    smooth: {
      duration: 0.3,
      ease: "easeInOut"
    },
    spring: {
      type: "spring",
      stiffness: 300,
      damping: 30
    },
    bounce: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  },

  // Color system
  colors: {
    primary: {
      gradient: "from-purple-500 via-indigo-500 to-blue-500",
      text: "text-purple-400"
    },
    success: {
      gradient: "from-green-500 to-emerald-600",
      text: "text-green-400"
    },
    warning: {
      gradient: "from-amber-500 to-yellow-600",
      text: "text-amber-400"
    },
    danger: {
      gradient: "from-red-500 to-rose-600",
      text: "text-red-400"
    },
    info: {
      gradient: "from-blue-500 to-indigo-600",
      text: "text-blue-400"
    }
  },

  // Button styles
  button: {
    base: "transition-all duration-200 font-medium rounded-lg",
    primary: "bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700",
    ghost: "text-gray-300 hover:text-white hover:bg-white/10",
    sizes: {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg"
    }
  }
};

/**
 * Get progress bar color based on percentage
 */
export function getProgressColor(percentage: number): string {
  if (percentage >= 75) return overlayDesign.colors.success.gradient;
  if (percentage >= 50) return overlayDesign.colors.warning.gradient;
  if (percentage >= 25) return overlayDesign.colors.info.gradient;
  return overlayDesign.colors.danger.gradient;
}

/**
 * Get timer color based on time remaining percentage
 */
export function getTimerColor(timePercentage: number): string {
  if (timePercentage > 66) return overlayDesign.colors.success.text;
  if (timePercentage > 33) return overlayDesign.colors.warning.text;
  return overlayDesign.colors.danger.text;
}

/**
 * Get status color for different states
 */
export function getStatusColor(status: 'active' | 'inactive' | 'pending' | 'completed'): string {
  switch (status) {
    case 'active':
      return overlayDesign.colors.success.text;
    case 'pending':
      return overlayDesign.colors.warning.text;
    case 'inactive':
      return overlayDesign.colors.danger.text;
    case 'completed':
      return overlayDesign.colors.info.text;
    default:
      return 'text-gray-400';
  }
}