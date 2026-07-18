import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Shield, Code, Lock, Palette, Brain, CheckCircle, ArrowRight, Users, Award, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MainLayout } from '@/components/layout/MainLayout';

function AnimatedCounter({ end, duration = 2000, suffix = '+' }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function Home() {
  const [activeInterns, setActiveInterns] = useState(0);

  useEffect(() => {
    fetch('https://aegis-api.rafiuraza474.workers.dev/api/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setActiveInterns(data.activeInterns);
      })
      .catch((err) => console.error('Failed to load stats:', err));
  }, []);

  const programs = [
    { icon: Lock, title: 'Cyber Security', description: 'Master threat detection and security protocols' },
    { icon: Shield, title: 'Security Analysis', description: 'Analyze and fortify digital infrastructures' },
    { icon: Code, title: 'Software Development', description: 'Build robust, scalable applications' },
    { icon: Brain, title: 'Artificial Intelligence', description: 'Develop intelligent systems and ML models' },
    { icon: Palette, title: 'UI/UX Design', description: 'Craft intuitive, beautiful user experiences' },
  ];

  const timeline = [
    { step: 1, title: 'Apply Online', description: 'Submit your application through our streamlined portal' },
    { step: 2, title: 'Review Process', description: 'Our team evaluates your profile and experience' },
    { step: 3, title: 'Onboarding', description: 'Get access to resources and meet your mentor' },
    { step: 4, title: 'Complete Program', description: 'Work on real projects and earn your certificate' },
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 grid-texture opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-block mb-6"
            >
              <Shield className="h-20 w-20 text-primary glow-blue-strong" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
            >
              Secure Your <span className="text-primary">Future</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Join the next generation of tech professionals through elite, multi-discipline internship programs
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/register">
                <Button size="lg" className="text-lg glow-blue group" data-testid="button-apply-hero">
                  Apply Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/programs">
                <Button size="lg" variant="outline" className="text-lg" data-testid="button-programs-hero">
                  Explore Programs
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <div className="text-5xl font-bold text-primary mb-2">
                <AnimatedCounter end={activeInterns} />
              </div>
              <p className="text-muted-foreground">Active Interns</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <Award className="h-12 w-12 text-primary mx-auto mb-4" />
              <div className="text-5xl font-bold text-primary mb-2">
                <AnimatedCounter end={11} />
              </div>
              <p className="text-muted-foreground">Programs Offered</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center"
            >
              <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
              <div className="text-5xl font-bold text-primary mb-2">
                <AnimatedCounter end={2026} duration={800} suffix="" />
              </div>
              <p className="text-muted-foreground">Founded</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Programs Showcase */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Elite Programs</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose from 11 specialized tracks designed to accelerate your career
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program, index) => (
              <motion.div
                key={program.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full hover:border-primary transition-all duration-300 group cursor-pointer glow-blue-strong">
                  <CardContent className="p-6">
                    <program.icon className="h-10 w-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-semibold mb-2">{program.title}</h3>
                    <p className="text-muted-foreground">{program.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: programs.length * 0.1 }}
            >
              <Link href="/programs">
                <Card className="h-full border-dashed border-2 hover:border-primary transition-all duration-300 cursor-pointer flex items-center justify-center min-h-[200px]">
                  <CardContent className="p-6 text-center">
                    <p className="text-lg font-semibold text-primary mb-2">+6 More Programs</p>
                    <p className="text-sm text-muted-foreground">View all specializations</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Your Path to Success</h2>
            <p className="text-xl text-muted-foreground">Four simple steps to launch your career</p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {timeline.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="flex gap-6 mb-12 last:mb-0"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg glow-blue">
                    {item.step}
                  </div>
                  {index < timeline.length - 1 && (
                    <div className="w-0.5 h-20 bg-border ml-6 mt-2" />
                  )}
                </div>
                <div className="pt-2">
                  <h3 className="text-2xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 grid-texture opacity-30" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Begin?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join ambitious students who are building their future in tech
            </p>
            <Link href="/register">
              <Button size="lg" className="text-lg glow-blue" data-testid="button-apply-cta">
                Start Your Application
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </MainLayout>
  );
}