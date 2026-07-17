import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Shield, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      <div className="absolute inset-0 grid-texture opacity-30" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center relative z-10 px-4"
      >
        <motion.div
          animate={{ 
            rotate: [0, -5, 5, -5, 5, 0],
          }}
          transition={{ 
            duration: 0.5,
            repeat: Infinity,
            repeatDelay: 3,
          }}
          className="inline-block mb-6"
        >
          <Shield className="h-24 w-24 text-primary animate-glitch" />
        </motion.div>
        
        <motion.h1
          className="text-9xl font-bold mb-4 text-primary animate-glitch"
          animate={{ 
            textShadow: [
              '0 0 10px rgba(59, 130, 246, 0.5)',
              '0 0 20px rgba(59, 130, 246, 0.8)',
              '0 0 10px rgba(59, 130, 246, 0.5)',
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          404
        </motion.h1>
        
        <h2 className="text-3xl font-bold mb-4">Access Denied</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-md mx-auto">
          The page you're looking for has been secured or doesn't exist in our system
        </p>
        
        <Link href="/">
          <Button size="lg" className="glow-blue" data-testid="button-home">
            <Home className="mr-2 h-5 w-5" />
            Return to Base
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
