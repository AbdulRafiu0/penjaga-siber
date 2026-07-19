import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CheckCircle, ArrowRight, ArrowLeft, Loader2, XCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const SCREENING_QUIZ = [
  { id: 1, question: "Which transport layer protocol guarantees packet delivery through connection-oriented three-way handshaking sequences?", options: ["UDP", "IPSEC", "TCP", "ICMP"], correctIndex: 2 },
  { id: 2, question: "If a local subnet mask is defined as 255.255.255.0, what is its standard CIDR routing notation profile?", options: ["/24", "/16", "/32", "/8"], correctIndex: 0 },
  { id: 3, question: "A network diagnostic sniffer captures traffic targeting local port 443. What protocol is being analyzed?", options: ["HTTP", "HTTPS", "SSH", "FTP"], correctIndex: 1 },
  { id: 4, question: "Logic Analysis: Five network node packets run sequentially. Node B paths after Node A. Node C paths before Node B. If Node A is first, what position is Node C?", options: ["Fourth Position", "First Position", "Second Position", "Third Position"], correctIndex: 2 },
  { id: 5, question: "An automated packet routing rule states: 'Deny all traffic unless source originates from secure Node X or is verified as an active ping.' If a non-ping packet from unverified Node Y hits the gate, what occurs?", options: ["The packet is cleanly dropped", "The packet routes successfully", "The network cluster resets", "The packet is cloned"], correctIndex: 0 },
  { id: 6, question: "What is the primary function of the Address Resolution Protocol (ARP) within a local environment setup?", options: ["Map domain names to static IPs", "Translate 32-bit IP addresses to 48-bit MAC hardware keys", "Encapsulate data into secure payloads", "Balance load across cluster instances"], correctIndex: 1 },
  { id: 7, question: "Which core protocol operates directly at Layer 3 (Network Layer) of the standard OSI interconnect stack?", options: ["TLS", "TCP", "IPv6", "SMTP"], correctIndex: 2 },
  { id: 8, question: "If a router interface receives a packet whose destination network is completely missing from its local routing table metrics, what baseline step occurs?", options: ["It broadcasts it to all subnets", "It forwards the data payload to its Default Gateway route", "It safely caches it indefinitely", "It generates a new routing path row dynamically"], correctIndex: 1 },
  { id: 9, question: "What default destination network port identifier is mapped to standard unencrypted Domain Name System (DNS) query lookups?", options: ["Port 53", "Port 80", "Port 22", "Port 161"], correctIndex: 0 },
  { id: 10, question: "Logic Analysis: A processing loop requires Node Alpha to authenticate before Node Beta, but Node Gamma must fire before Node Alpha. What is the absolute final node configuration sequence?", options: ["Beta -> Alpha -> Gamma", "Gamma -> Alpha -> Beta", "Alpha -> Gamma -> Beta", "Gamma -> Beta -> Alpha"], correctIndex: 1 },
  { id: 11, question: "Which command-line utility triggers localized ICMP echo request packets to verify routing node reachability status?", options: ["netstat", "nslookup", "ping", "ssh-keygen"], correctIndex: 2 },
  { id: 12, question: "What is the primary operational objective behind deploying Dynamic Host Configuration Protocol (DHCP) models?", options: ["Encrypt cleartext channel data streams", "Automate lease distribution of IP addresses across endpoints", "Filter outbound web app endpoints", "Secure active database row states"], correctIndex: 1 },
  { id: 13, question: "Which transmission medium behavior describes an unexpected degradation of signal strength as it crosses network line thresholds?", options: ["Jitter", "Latency", "Attenuation", "Crosstalk"], correctIndex: 2 },
  { id: 14, question: "What protocol leverages a structured tracking table framework to securely translate public cluster WAN IPs back to internal subnet hosts?", options: ["NAT", "BGP", "RIPv2", "OSPF"], correctIndex: 0 },
  { id: 15, question: "Logic Analysis: If all compromised nodes are isolated, and Node 7 is currently reporting active data corruption metrics, which parameter statement is mathematically certain?", options: ["Node 7 must be isolated immediately", "All nodes are corrupted", "The core database cluster has crashed", "Inbound traffic is safely encrypted"], correctIndex: 0 },
  { id: 16, question: "Which network topology configuration links every operational node directly to a single centralized distribution switch hub?", options: ["Ring Topology", "Mesh Architecture", "Star Topology", "Bus System Layout"], correctIndex: 2 },
  { id: 17, question: "What maximum byte allocation threshold is reserved for standard IPv4 header spaces lacking customized options markers?", options: ["20 Bytes", "40 Bytes", "64 Bytes", "1500 Bytes"], correctIndex: 0 },
  { id: 18, question: "Which monitoring metric flags the microsecond fluctuations or variations in packet arrival time metrics over a transmission loop?", options: ["Bandwidth scale", "Jitter variance", "Throughput maximum", "Static latency response"], correctIndex: 1 },
  { id: 19, question: "What protocol operates on network ports 20 and 21 to coordinate large cleartext data file transfers across edge arrays?", options: ["SSH", "SFTP", "FTP", "TFTP"], correctIndex: 2 },
  { id: 20, question: "Final Logic Evaluation: An admin rule verifies: 'A user is granted dashboard access ONLY if they clear security validation AND hold active course registration parameters.' If a user holds validation but lacks registration metrics, what occurs?", options: ["Access is safely denied", "The system bypasses the rules", "Access is temporarily initialized", "The database creates a placeholder"], correctIndex: 0 }
];

const formSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  country: z.string().min(2, 'Country is required'),
  program: z.string().min(1, 'Please select a program'),
  education: z.string().min(1, 'Please select your education level'),
  linkedin: z.string().optional(),
  github: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function Register() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizFailed, setQuizFailed] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});

  const { toast } = useToast();
  const { internName } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: internName || '',
      email: '',
      password: '',
      phone: '',
      country: '',
      program: '',
      education: '',
      linkedin: '',
      github: '',
    },
  });

  const programs = [
    'Cyber Security',
    'Security Analysis',
    'Software Development',
    'Web Development',
    'Artificial Intelligence',
    'Python Programming',
    'Java Programming',
    'C++ Programming',
    'JavaScript Programming',
    'TypeScript Programming',
    'UI/UX Design',
  ];

  const educationLevels = [
    'High School',
    'Associate Degree',
    'Bachelor\'s Degree (In Progress)',
    'Bachelor\'s Degree (Completed)',
    'Master\'s Degree (In Progress)',
    'Master\'s Degree (Completed)',
    'PhD',
  ];

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      // 1. Get existing ID or generate a new one for this new registration
      let userId = localStorage.getItem('aegis_userId') || crypto.randomUUID();
      localStorage.setItem('aegis_userId', userId);

      // 2. Prepare the details object
      const applicationDetails = JSON.stringify({
        fullName: data.fullName,
        phone: data.phone,
        country: data.country,
        education: data.education,
        linkedin: data.linkedin,
        github: data.github,
        studentEmail: data.email,
        quizScore: quizScore
      });
      
      // ... now proceed with your existing fetch() call ...

      const response = await fetch('https://aegis-api.rafiuraza474.workers.dev/api/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          programName: data.program,
          details: applicationDetails,
          password: data.password
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Server rejected application asset submission.');
      }

      const refNum = `AEG-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
      setReferenceNumber(refNum);
      setSubmitted(true);

      toast({
        title: 'Application Received!',
        description: 'Your background details have been stored successfully.',
      });

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Could not write application record to database.';
      console.error("Database Write Error:", errorMessage);
      
      toast({
        variant: 'destructive',
        title: 'Submission Error',
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuizSubmit = () => {
    let score = 0;
    SCREENING_QUIZ.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        score++;
      }
    });

    setQuizScore(score);

    if (score >= 12) {
      setStep(4);
    } else {
      setQuizFailed(true);
    }
  };

  const quizPassed = quizScore !== null && quizScore >= 12;

  const nextStep = async () => {
    let fieldsToValidate: (keyof FormData)[] = [];
    
    if (step === 1) {
      fieldsToValidate = ['fullName', 'email', 'password', 'phone', 'country'];
    } else if (step === 2) {
      fieldsToValidate = ['program', 'education'];
    } else if (step === 4) {
      fieldsToValidate = ['linkedin', 'github'];
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setStep(step + 1);
    }
  };

  const handleStep3Next = () => {
    if (quizPassed) {
      // Already passed on a prior visit to this step - just continue on.
      setStep(4);
    } else if (currentQuestionIndex < 19) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleQuizSubmit();
    }
  };

  const handleRetakeQuiz = () => {
    setQuizScore(null);
    setQuizFailed(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
  };

  const prevStep = () => {
    if (step === 3) {
      if (quizFailed) {
        setQuizFailed(false);
        setQuizScore(null);
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setStep(2);
      } else if (quizPassed) {
        // Don't strand the user on the last question - go straight back.
        setStep(2);
      } else if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex((prev) => prev - 1);
      } else {
        setStep(2);
      }
    } else if (step === 4) {
      setStep(3);
    } else {
      setStep(step - 1);
    }
  };

  if (submitted) {
    return (
      <MainLayout>
        <div className="min-h-[80vh] flex items-center justify-center py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4 sm:px-6 lg:px-8"
          >
            <Card className="max-w-2xl mx-auto border-primary glow-blue">
              <CardContent className="p-12 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="inline-block mb-6"
                >
                  <CheckCircle className="h-24 w-24 text-primary" />
                </motion.div>
                
                <h2 className="text-4xl font-bold mb-4">Application Submitted!</h2>
                <p className="text-xl text-muted-foreground mb-8">
                  Thank you for applying to Penjaga Siber. We've received your application and will review it shortly.
                </p>
                
                <div className="bg-muted p-6 rounded-lg mb-8">
                  <p className="text-sm text-muted-foreground mb-2">Your Reference Number</p>
                  <p className="text-2xl font-mono font-bold text-primary" data-testid="text-reference-number">
                    {referenceNumber}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Please save this number for your records
                  </p>
                </div>
                
                <p className="text-muted-foreground mb-8">
                  You will receive a confirmation email within 24 hours. Our team will contact you within 3-5 business days regarding the next steps.
                </p>
                
                <Button type="button" onClick={() => window.location.href = '/'} data-testid="button-return-home">
                  Return to Home
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Apply to Penjaga Siber</h1>
              <p className="text-xl text-muted-foreground">Step {step} of 5</p>
            </div>

            <div className="mb-8">
              <div className="flex justify-between mb-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div
                    key={s}
                    className={`flex-1 h-2 mx-1 rounded-full transition-colors ${
                      s <= step ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>
                  {step === 1 && 'Personal Information'}
                  {step === 2 && 'Program Selection'}
                  {step === 3 && 'Cybersecurity Screening'}
                  {step === 4 && 'Professional Profiles'}
                  {step === 5 && 'Review & Submit'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <AnimatePresence mode="wait">
                      {step === 1 && (
                        <motion.div
                          key="step1"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-4"
                        >
                          <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Name" {...field} data-testid="input-full-name" disabled={isSubmitting} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="mails@example.com" {...field} data-testid="input-email" disabled={isSubmitting} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="At least 6 characters" {...field} data-testid="input-password" disabled={isSubmitting} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="+1 234 567 8900" {...field} data-testid="input-phone" disabled={isSubmitting} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Country</FormLabel>
                                <FormControl>
                                  <Input placeholder="United States" {...field} data-testid="input-country" disabled={isSubmitting} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                      )}

                      {step === 2 && (
                        <motion.div
                          key="step2"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-4"
                        >
                          <FormField
                            control={form.control}
                            name="program"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Select Program</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-program">
                                      <SelectValue placeholder="Choose a program" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {programs.map((program) => (
                                      <SelectItem key={program} value={program}>
                                        {program}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="education"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Education Level</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-education">
                                      <SelectValue placeholder="Select your education level" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {educationLevels.map((level) => (
                                      <SelectItem key={level} value={level}>
                                        {level}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                      )}

                      {step === 3 && (
                        <motion.div
                          key="step3"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-4"
                        >
                          {quizFailed ? (
                            <div className="text-center py-8">
                              <XCircle className="h-16 w-16 text-destructive mx-auto" />
                              <h3 className="text-2xl font-bold mt-4">Screening Failed</h3>
                              <p className="text-lg text-muted-foreground mt-2">
                                You scored {quizScore}/20. Minimum passing score is 12/20.
                              </p>
                              <Button 
                                type="button" 
                                className="mt-6"
                                data-testid="button-retry-exam"
                                onClick={handleRetakeQuiz}
                              >
                                Retry Exam
                              </Button>
                            </div>
                          ) : quizPassed ? (
                            <div className="text-center py-8">
                              <CheckCircle className="h-16 w-16 text-primary mx-auto" />
                              <h3 className="text-2xl font-bold mt-4">Screening Passed</h3>
                              <p className="text-lg text-muted-foreground mt-2" data-testid="text-quiz-score">
                                You scored {quizScore}/20.
                              </p>
                              <Button
                                type="button"
                                variant="outline"
                                className="mt-6"
                                data-testid="button-retake-exam"
                                onClick={handleRetakeQuiz}
                              >
                                Retake Screening
                              </Button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 mb-2">
                                <Shield className="h-5 w-5 text-primary" />
                                <span className="font-semibold">Question {currentQuestionIndex + 1} of 20</span>
                              </div>
                              <Progress value={((currentQuestionIndex + 1) / 20) * 100} className="mb-6" />
                              
                              <div className="bg-muted/50 p-6 rounded-lg">
                                <p className="text-lg font-medium mb-6">
                                  {SCREENING_QUIZ[currentQuestionIndex].question}
                                </p>
                                <div className="space-y-3">
                                  {SCREENING_QUIZ[currentQuestionIndex].options.map((opt, idx) => (
                                    <Button
                                      key={idx}
                                      type="button"
                                      variant={selectedAnswers[currentQuestionIndex] === idx ? "default" : "outline"}
                                      className="w-full justify-start h-auto py-4 px-6 text-left whitespace-normal font-normal"
                                      data-testid={`button-quiz-option-${idx}`}
                                      onClick={() => setSelectedAnswers({ ...selectedAnswers, [currentQuestionIndex]: idx })}
                                    >
                                      {opt}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            </>
                          )}
                        </motion.div>
                      )}

                      {step === 4 && (
                        <motion.div
                          key="step4"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-4"
                        >
                          <FormField
                            control={form.control}
                            name="linkedin"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>LinkedIn URL (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://linkedin.com/in/yourprofile" {...field} data-testid="input-linkedin" disabled={isSubmitting} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="github"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>GitHub URL (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://github.com/yourusername" {...field} data-testid="input-github" disabled={isSubmitting} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>
                      )}

                      {step === 5 && (
                        <motion.div
                          key="step5"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-6"
                        >
                          <div className="bg-muted p-6 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <p className="text-sm text-muted-foreground">Full Name</p>
                              <p className="font-semibold" data-testid="text-review-name">{form.getValues('fullName')}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Email</p>
                              <p className="font-semibold" data-testid="text-review-email">{form.getValues('email')}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Password</p>
                              <p className="font-semibold" data-testid="text-review-password">
                                {'•'.repeat(Math.min(form.getValues('password')?.length || 0, 12)) || 'Not set'}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Phone</p>
                              <p className="font-semibold" data-testid="text-review-phone">{form.getValues('phone')}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Country</p>
                              <p className="font-semibold" data-testid="text-review-country">{form.getValues('country')}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Program</p>
                              <p className="font-semibold text-primary" data-testid="text-review-program">{form.getValues('program')}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Education Level</p>
                              <p className="font-semibold" data-testid="text-review-education">{form.getValues('education')}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">LinkedIn</p>
                              <p className="font-semibold" data-testid="text-review-linkedin">{form.getValues('linkedin') || 'Not provided'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">GitHub</p>
                              <p className="font-semibold" data-testid="text-review-github">{form.getValues('github') || 'Not provided'}</p>
                            </div>
                            
                            <div className="col-span-1 md:col-span-2 pt-4 border-t border-border">
                              <p className="text-sm text-muted-foreground">Cybersecurity Screening</p>
                              <p className="font-semibold text-green-500" data-testid="text-review-quiz-score">
                                Score: {quizScore} / 20 (Passed)
                              </p>
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground text-center">
                            Please review your information carefully before submitting
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex justify-between pt-6">
                      {step > 1 && !(step === 3 && quizFailed) && (
                        <Button type="button" variant="outline" onClick={prevStep} data-testid="button-previous" disabled={isSubmitting}>
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          {step === 3 && !quizPassed && currentQuestionIndex > 0 ? 'Previous Question' : 'Previous'}
                        </Button>
                      )}
                      
                      {step < 5 && !(step === 3 && quizFailed) && (
                        <Button 
                          type="button" 
                          className="ml-auto" 
                          data-testid="button-next"
                          onClick={step === 3 ? handleStep3Next : nextStep} 
                          disabled={
                            isSubmitting || 
                            (step === 3 && !quizPassed && selectedAnswers[currentQuestionIndex] === undefined)
                          }
                        >
                          {step === 3
                            ? (quizPassed ? 'Continue' : (currentQuestionIndex < 19 ? 'Next Question' : 'Submit Exam'))
                            : 'Next'}
                          {!(step === 3 && !quizPassed) && <ArrowRight className="ml-2 h-4 w-4" />}
                        </Button>
                      )}

                      {step === 5 && (
                        <Button type="submit" className="ml-auto glow-blue" data-testid="button-submit-application" disabled={isSubmitting}>
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            'Submit Application'
                          )}
                        </Button>
                      )}
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}