import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../lib/utils'
import { Sparkles, Users, Radio, Shield } from 'lucide-react'

interface AuthLayoutProps {
  children: React.ReactNode
  className?: string
}

const features = [
  { icon: Radio, text: "Instant global voice & video matching" },
  { icon: Users, text: "Public and private interest-based rooms" },
  { icon: Shield, text: "Secure, anonymous, and moderated environment" },
];

/**
 * AuthLayout — Premium split-screen layout for authentication.
 * Used by: Login, Register
 */
export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div className={cn('min-h-screen w-full bg-canvas flex', className)}>
      {/* Left Form Side */}
      <div className="w-full lg:w-[45%] flex flex-col items-center justify-center p-6 sm:p-12 z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm mx-auto"
        >
          {children}
        </motion.div>
      </div>

      {/* Right Graphic Side (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-brand-primary border-l border-border-default/20 items-center justify-center">
        {/* Dynamic Abstract Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary to-brand-primary/40 z-0"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-white/5 blur-3xl mix-blend-overlay"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-black/20 blur-3xl mix-blend-overlay"></div>
        
        {/* Premium Grid Pattern Overlay */}
        <div 
          className="absolute inset-0 z-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative z-10 max-w-lg p-12"
        >
          <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 mb-6 shadow-2xl">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight tracking-tight">
            Connect beyond borders.
          </h2>
          <p className="text-white/80 text-lg mb-10 leading-relaxed font-medium">
            FOUDY is the premium platform for spontaneous, meaningful conversations. Drop in and meet the world.
          </p>

          <ul className="space-y-4">
            {features.map((feature, idx) => (
              <motion.li 
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + (idx * 0.1) }}
                className="flex items-center gap-4 text-white/90"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-sm">
                  <feature.icon className="w-4 h-4" />
                </div>
                <span className="font-medium">{feature.text}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  )
}
