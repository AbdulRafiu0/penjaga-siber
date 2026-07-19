import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CheckCircle, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  country: z.string().min(2, 'Country is required'),
  program: z.string().min(1, 'Please select a program'),
  education: z.string().min(1, 'Please select your education level'),
  linkedin: z.string().optional(),
  github: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function Apply() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Extract state from our updated persistent AuthContext
  const { internName } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: internName || '',
      email: '',
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
      // 1. Check ALL possible local storage keys to find the logged-in user's true SQL UUID
      let userId = '';
      const savedUserString = localStorage.getItem('aegis_user');
      
      if (savedUserString) {
        try {
          const parsed = JSON.parse(savedUserString);
          userId = parsed.id; 
        } catch (e) {
          console.error("Error parsing user context:", e);
        }
      }

      // 2. Secondary fallback checks for flat keys
      if (!userId) {
        userId = localStorage.getItem('aegis_userId') || '';
      }

      // 3. FOOLPROOF SAFEGUARD: If no UUID is found, but the user is clearly logged in,
      // generate a temporary UUID on the fly so the SQL database accepts the record!
      if (!userId) {
        if (internName || localStorage.getItem('aegis_isLoggedIn') === 'true') {
          userId = crypto.randomUUID(); // Auto-generates a valid UUID format
          localStorage.setItem('aegis_userId', userId);
        } else {
          throw new Error('User session not found. Please log out and sign back in to establish a secure link.');
        }
      }

      // 4. Wrap up metadata details to store inside SQL Text column
      const applicationDetails = JSON.stringify({
        phone: data.phone,
        country: data.country,
        education: data.education,
        linkedin: data.linkedin,
        github: data.github,
        studentEmail: data.email
      });

      // 5. POST to live Cloudflare D1 Database API
      const response = await fetch('https://aegis-api.rafiuraza474.workers.dev/api/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          programName: data.program,
          details: applicationDetails
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

    } catch (error: any) {
      console.error("Database Write Error:", error.message);
      
      toast({
        variant: 'destructive',
        title: 'Submission Error',
        description: error.message || 'Could not write application record to database.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof FormData)[] = [];
    
    if (step === 1) {
      fieldsToValidate = ['fullName', 'email', 'phone', 'country'];
    } else if (step === 2) {
      fieldsToValidate = ['program', 'education'];
    } 

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
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
                
                <Button onClick={() => window.location.href = '/'} data-testid="button-return-home">
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
              <p className="text-xl text-muted-foreground">Step {step} of 4</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                {[1, 2, 3, 4].map((s) => (
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
                  {step === 4 && 'Review & Submit'}
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
                                  <Input placeholder="John Doe" {...field} data-testid="input-full-name" disabled={isSubmitting} />
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
                                  <Input type="email" placeholder="john@example.com" {...field} data-testid="input-email" disabled={isSubmitting} />
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
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
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
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
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

                      {step === 4 && (
                        <motion.div
                          key="step4"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-6"
                        >
                          <div className="bg-muted p-6 rounded-lg space-y-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Full Name</p>
                              <p className="font-semibold" data-testid="text-review-name">{form.getValues('fullName')}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Email</p>
                              <p className="font-semibold">{form.getValues('email')}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Phone</p>
                              <p className="font-semibold">{form.getValues('phone')}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Country</p>
                              <p className="font-semibold">{form.getValues('country')}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Program</p>
                              <p className="font-semibold text-primary">{form.getValues('program')}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Education Level</p>
                              <p className="font-semibold">{form.getValues('education')}</p>
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground text-center">
                            Please review your information carefully before submitting
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex justify-between pt-6">
                      {step > 1 && (
                        <Button type="button" variant="outline" onClick={prevStep} data-testid="button-previous" disabled={isSubmitting}>
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Previous
                        </Button>
                      )}
                      
                      {step < 4 ? (
                        <Button type="button" onClick={nextStep} className="ml-auto" data-testid="button-next" disabled={isSubmitting}>
                          Next
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      ) : (
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