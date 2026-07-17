import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Shield, Code, Lock, Palette, Brain, ArrowRight, Users, Award, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MainLayout } from '@/components/layout/MainLayout';

function AnimatedCounter({ end, duration = 2000, suffix = '+' }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView || end === 0) return;
    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function Home() {
  const [activeInternCount, setActiveInternCount] = useState(0);

  // Fetch real intern count on load
  useEffect(() => {
    fetch('https://aegis-api.rafiuraza474.workers.dev/api/applications')
      .then(res => res.json())
      .then(data => {
        if (data.success) setActiveInternCount(data.applications.length);
      })
      .catch(err => console.error("Could not fetch stats", err));
  }, []);

  const programs = [
    { icon: Lock, title: 'Cyber Security', description: 'Master threat detection and security protocols' },
    { icon: Shield, title: 'Security Analysis', description: 'Analyze and fortify digital infrastructures' },
    { icon: Code, title: 'Software Development', description: 'Build robust, scalable applications' },
    { icon: Brain, title: 'Artificial Intelligence', description: 'Develop intelligent systems and ML models' },
    { icon: Palette, title: 'UI/UX Design', description: 'Craft intuitive, beautiful user experiences' },
  ];

  return (
    <MainLayout>
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden py-20">
        <div className="container mx-auto px-4 text-center z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Shield className="h-20 w-20 text-primary mx-auto mb-6 glow-blue-strong" />
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">Secure Your <span className="text-primary">Future</span></h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">Join the next generation of tech professionals through elite, multi-discipline internship programs.</p>
            <div className="flex gap-4 justify-center">
              <Link href="/apply"><Button size="lg" className="text-lg glow-blue">Apply Now <ArrowRight className="ml-2" /></Button></Link>
              <Link href="/verify"><Button size="lg" variant="outline" className="text-lg">Verify Certificate</Button></Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center"><Users className="h-12 w-12 text-primary mx-auto mb-4" /><div className="text-5xl font-bold text-primary mb-2"><AnimatedCounter end={activeInternCount} /></div><p className="text-muted-foreground">Active Interns</p></div>
          <div className="text-center"><Award className="h-12 w-12 text-primary mx-auto mb-4" /><div className="text-5xl font-bold text-primary mb-2"><AnimatedCounter end={11} /></div><p className="text-muted-foreground">Programs Offered</p></div>
          <div className="text-center"><TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" /><div className="text-5xl font-bold text-primary mb-2">2026</div><p className="text-muted-foreground">Founded</p></div>
        </div>
      </section>

      <section className="py-20 container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-16">Elite Programs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {programs.map((p) => (
            <Card key={p.title} className="hover:border-primary transition-all glow-blue-strong">
              <CardContent className="p-6"><p.icon className="h-10 w-10 text-primary mb-4" /><h3 className="text-xl font-semibold mb-2">{p.title}</h3><p className="text-muted-foreground">{p.description}</p></CardContent>
            </Card>
          ))}
        </div>
      </section>
    </MainLayout>
  );
}