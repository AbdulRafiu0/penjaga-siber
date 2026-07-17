import { motion } from 'framer-motion';
import { Shield, Target, Users, Award, Eye, Heart, Code2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { MainLayout } from '@/components/layout/MainLayout';

export default function About() {
  // TODO: Update with your real details.
  const leaders = [
    { name: '[Your Name]', role: 'Founder & CEO', background: '[Add your background here]' },
  ];

  const values = [
    { icon: Shield, title: 'Security First', description: 'We prioritize the safety and security of all our programs and participants' },
    { icon: Target, title: 'Excellence', description: 'We maintain the highest standards in everything we do' },
    { icon: Users, title: 'Collaboration', description: 'We believe in the power of teamwork and shared knowledge' },
    { icon: Award, title: 'Recognition', description: 'We celebrate achievements and milestones at every step' },
    { icon: Eye, title: 'Transparency', description: 'We operate with complete openness and integrity' },
    { icon: Heart, title: 'Passion', description: 'We are driven by our commitment to student success' },
  ];

  // Technologies used in our programs (not corporate partnerships/endorsements).
  const technologies = [
    { icon: Code2, name: 'React' },
    { icon: Code2, name: 'Node.js' },
    { icon: Code2, name: 'Python' },
    { icon: Code2, name: 'TypeScript' },
    { icon: Code2, name: 'PostgreSQL' },
    { icon: Code2, name: 'Docker' },
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
            <Shield className="h-16 w-16 text-primary mx-auto mb-6 glow-blue" />
            <h1 className="text-5xl md:text-6xl font-bold mb-6">About Aegis Digital</h1>
            <p className="text-xl text-muted-foreground">
              Building the bridge between academic learning and professional excellence in technology
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold mb-6 text-center">Our Mission</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Aegis Digital was founded on a simple belief: exceptional talent deserves exceptional opportunities. 
              We exist to bridge the gap between academic theory and industry practice, providing students with 
              real-world experience in cutting-edge technology fields.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Through rigorous, hands-on programs led by industry experts, we prepare the next generation of 
              technology leaders. Our interns don't just learn—they build, create, and solve real problems for 
              real organizations.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Leadership Team</h2>
            <p className="text-xl text-muted-foreground">Committed to your success</p>
          </motion.div>

          <div className="grid grid-cols-1 max-w-sm mx-auto gap-6">
            {leaders.map((leader, index) => (
              <motion.div
                key={leader.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6 text-center">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Users className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">{leader.name}</h3>
                    <p className="text-primary text-sm mb-2">{leader.role}</p>
                    <p className="text-sm text-muted-foreground">{leader.background}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Founding Story */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-8">Our Story</h2>
              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                <p>
                  {/* TODO: Replace with your real founding story. */}
                  Aegis Digital was founded on a simple belief: exceptional talent deserves exceptional
                  opportunities. We're building a bridge between academic theory and industry practice,
                  giving students real, hands-on experience in cutting-edge technology fields.
                </p>
                <p>
                  We're just getting started — add your own story here: why you founded the company,
                  what problem you're solving, and what makes your programs different.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Our Core Values</h2>
            <p className="text-xl text-muted-foreground">The principles that guide everything we do</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full hover:border-primary transition-all duration-300">
                  <CardContent className="p-6">
                    <value.icon className="h-10 w-10 text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Technologies We Use</h2>
            <p className="text-xl text-muted-foreground">The stack our interns work with</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {technologies.map((tech, index) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col items-center justify-center gap-2"
              >
                <tech.icon className="h-10 w-10 text-muted-foreground hover:text-primary transition-colors" />
                <span className="text-sm text-muted-foreground">{tech.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
