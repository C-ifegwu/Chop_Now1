"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/30">
      <div className="container relative z-10 flex min-h-[80vh] flex-col items-center justify-center py-20 text-center md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl space-y-6"
        >
          <motion.h1 
            className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <span className="block">Delicious Meals</span>
            <span className="relative">
              <span className="relative z-10 bg-gradient-to-r from-amber-500 to-pink-500 bg-clip-text text-transparent">
                Delivered
              </span>
              <span className="absolute -bottom-2 left-0 h-3 w-full bg-gradient-to-r from-amber-500/20 to-pink-500/20 -rotate-1"></span>
            </span>
            <span className="block">To Your Doorstep</span>
          </motion.h1>
          
          <motion.p 
            className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Experience the finest selection of local cuisines prepared by top chefs and delivered fresh to your home or office.
          </motion.p>
          
          <motion.div 
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Button size="lg" className="group px-8 text-lg h-14">
              Order Now
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="outline" size="lg" className="px-8 text-lg h-14">
              View Menu
            </Button>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-gradient-to-r from-amber-400/20 to-pink-400/20 blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-gradient-to-r from-amber-400/20 to-pink-400/20 blur-3xl"></div>
      </div>
    </section>
  )
}
