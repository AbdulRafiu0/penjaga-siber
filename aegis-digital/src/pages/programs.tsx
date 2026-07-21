import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Shield, Lock, Code, Globe, Brain, FileCode, Coffee, Layers, Zap, Palette, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MainLayout } from '@/components/layout/MainLayout';

export default function Programs() {
  const programs = [
    {
      icon: Lock,
      title: 'Cyber Security',
      duration: '8 weeks',
      level: 'Intermediate',
      description: 'Master advanced threat detection, penetration testing, and security infrastructure design. Learn to protect systems from evolving cyber threats.',
      skills: ['Ethical Hacking', 'Network Security', 'Incident Response', 'Security Auditing'],
    },
    {
      icon: Shield,
      title: 'Security Analysis',
      duration: '8 weeks',
      level: 'Beginner',
      description: 'Analyze security vulnerabilities, conduct risk assessments, and develop comprehensive security strategies for organizations.',
      skills: ['Risk Assessment', 'Compliance', 'Security Frameworks', 'Threat Analysis'],
    },
    {
      icon: Code,
      title: 'Software Development',
      duration: '8 weeks',
      level: 'Intermediate',
      description: 'Build production-grade applications using modern development practices, clean architecture, and collaborative workflows.',
      skills: ['Full-Stack Development', 'API Design', 'Testing', 'DevOps'],
    },
    {
      icon: Globe,
      title: 'Web Development',
      duration: '8 weeks',
      level: 'Beginner',
      description: 'Create responsive, accessible web applications using cutting-edge frameworks and industry best practices.',
      skills: ['React', 'TypeScript', 'Responsive Design', 'Web Performance'],
    },
    {
      icon: Brain,
      title: 'Artificial Intelligence',
      duration: '8 weeks',
      level: 'Advanced',
      description: 'Develop intelligent systems using machine learning, deep learning, and natural language processing techniques.',
      skills: ['Machine Learning', 'Neural Networks', 'NLP', 'Model Deployment'],
    },
    {
      icon: FileCode,
      title: 'Python Programming',
      duration: '8 weeks',
      level: 'Beginner',
      description: 'Master Python for data analysis, automation, web development, and scientific computing applications.',
      skills: ['Data Structures', 'OOP', 'Libraries', 'Automation'],
    },
    {
      icon: Coffee,
      title: 'Java Programming',
      duration: '8 weeks',
      level: 'Intermediate',
      description: 'Build robust enterprise applications using Java, Spring Boot, and modern JVM technologies.',
      skills: ['Core Java', 'Spring Framework', 'JPA', 'Microservices'],
    },
    {
      icon: Layers,
      title: 'C++ Programming',
      duration: '8 weeks',
      level: 'Advanced',
      description: 'Master systems programming, performance optimization, and low-level computing with modern C++.',
      skills: ['Memory Management', 'STL', 'Concurrency', 'Performance'],
    },
    {
      icon: Zap,
      title: 'JavaScript Programming',
      duration: '8 weeks',
      level: 'Beginner',
      description: 'Learn JavaScript from fundamentals to advanced concepts including async programming and modern ES6+ features.',
      skills: ['ES6+', 'Async/Await', 'DOM Manipulation', 'Node.js'],
    },
    {
      icon: FileCode,
      title: 'TypeScript Programming',
      duration: '8 weeks',
      level: 'Intermediate',
      description: 'Build type-safe applications with TypeScript, enhancing code quality and developer productivity.',
      skills: ['Type Systems', 'Generics', 'Advanced Types', 'Tooling'],
    },
    {
      icon: Palette,
      title: 'UI/UX Design',
      duration: '8 weeks',
      level: 'Beginner',
      description: 'Design beautiful, intuitive user experiences through research, prototyping, and iterative design processes.',
      skills: ['User Research', 'Wireframing', 'Prototyping', 'Design Systems'],
    },
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 grid-texture opacity-30" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Internship Programs</h1>
            <p className="text-xl text-muted-foreground">
              Choose from 11 specialized tracks designed to accelerate your career in technology
            </p>
          </motion.div>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programs.map((program, index) => (
              <motion.div
                key={program.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <Card className="h-full flex flex-col hover:border-primary transition-all duration-300 group">
                  <CardContent className="p-6 flex-1">
                    <program.icon className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary">{program.duration}</Badge>
                      <Badge variant="outline">{program.level}</Badge>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-3">{program.title}</h3>
                    <p className="text-muted-foreground mb-4">{program.description}</p>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-primary">Key Skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {program.skills.map((skill) => (
                          <span
                            key={skill}
                            className="text-xs bg-muted px-2 py-1 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="p-6 pt-0">
                    {/* Updated Link from /apply to /register */}
                    <Link href="/register" className="w-full">
                      <Button className="w-full group" data-testid={`button-apply-${program.title.toLowerCase().replace(/\s+/g, '-')}`}>
                        Apply Now
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-4xl font-bold mb-6">Not Sure Which Program?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Our team can help you choose the right track based on your background and career goals
            </p>
            <Link href="/contact">
              <Button size="lg" variant="outline" data-testid="button-contact-programs">
                Contact Our Advisors
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </MainLayout>
  );
}