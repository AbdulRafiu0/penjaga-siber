import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { MainLayout } from '@/components/layout/MainLayout';

export default function FAQ() {
  const faqs = [
    {
      question: 'Who is eligible to apply for Penjaga Siber internships?',
      answer: 'Our programs are open to students currently enrolled in or recently graduated from accredited educational institutions. We accept applicants from high school through graduate level, depending on the program. A passion for technology and commitment to learning are our primary requirements.',
    },
    {
      question: 'How long do the internship programs last?',
      answer: 'Program duration varies by track, ranging from 4 to 8 weeks. Each program is designed to provide comprehensive training while fitting into academic schedules. Specific durations are listed on individual program pages.',
    },
    {
      question: 'Are the internships remote or onsite?',
      answer: 'All Penjaga Siber internships are fully remote, allowing you to participate from anywhere in the world. We use industry-standard collaboration tools and maintain regular video meetings with mentors and peers.',
    },
    {
      question: 'Do I receive a certificate upon completion?',
      answer: 'Yes! Upon successfully completing your program, you will receive an official Penjaga Siber certificate. This certificate can be verified through our online verification system and is recognized by employers worldwide.',
    },
    {
      question: 'Are the internships paid or do they offer stipends?',
      answer: 'Selected high-performing interns may be eligible for stipends or performance bonuses. While most positions are educational internships focused on skill development, we recognize exceptional contributions through our recognition programs.',
    },
    {
      question: 'What is the application process?',
      answer: 'The application process involves: (1) Submitting an online application with your background and program choice, (2) Review by our selection committee , (3) Potential interview with program coordinators, (4) Onboarding and program start. The entire process typically takes 1-2 days.',
    },
    {
      question: 'Can I apply to multiple programs?',
      answer: 'We recommend focusing on one program that best aligns with your goals and background. However, if you have strong interests in multiple areas, you may indicate a second choice in your application. Our advisors can help you choose the best fit.',
    },
    {
      question: 'What time commitment is required?',
      answer: 'Most programs require 6-10 hours per week, with flexible scheduling to accommodate academic commitments. Some advanced programs may require more intensive periods during project milestones. We design schedules to be manageable alongside other responsibilities.',
    },
    {
      question: 'Will I work on real projects?',
      answer: 'Absolutely. All our programs include hands-on projects based on real industry scenarios. You will build portfolio pieces, contribute to open-source projects, or work on simulated client work—all under expert mentorship.',
    },
    {
      question: 'What kind of support and mentorship is provided?',
      answer: 'Each intern is paired with an industry professional mentor who provides weekly guidance, code reviews, and career advice. Additionally, you will have access to our learning resources, community forums, and regular office hours with program instructors.',
    },
    {
      question: 'Do I need prior experience to apply?',
      answer: 'Requirements vary by program. Beginner-level programs assume little to no prior experience, while intermediate and advanced tracks expect foundational knowledge. Check individual program pages for specific prerequisites.',
    },
    {
      question: 'How competitive is the selection process?',
      answer: 'We maintain high standards to ensure program quality. Acceptance rates vary by program, but we look for motivated learners who demonstrate genuine interest and commitment rather than just existing expertise. Your application essay and interview are crucial components.',
    },
  ];

  return (
    <MainLayout>
      <div className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <HelpCircle className="h-16 w-16 text-primary mx-auto mb-6 glow-blue" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
              <p className="text-xl text-muted-foreground">
                Everything you need to know about Penjaga Siber internships
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <AccordionItem value={`item-${index}`} className="border border-border rounded-lg px-6 bg-card">
                    <AccordionTrigger className="text-left hover:no-underline">
                      <span className="font-semibold">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 text-center bg-card p-8 rounded-lg border border-border"
            >
              <h3 className="text-2xl font-bold mb-4">Still Have Questions?</h3>
              <p className="text-muted-foreground mb-6">
                Our team is here to help. Reach out to us directly.
              </p>
              <a href="/contact">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                  data-testid="button-contact-faq"
                >
                  Contact Us
                </motion.button>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}
