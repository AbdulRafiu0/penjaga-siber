import { useState } from 'react';
import { useLocation } from 'wouter';
import { Shield, Network, CheckCircle, XCircle, ChevronRight, ChevronLeft, UserPlus, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
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

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [wizardStep, setWizardStep] = useState<'form' | 'quiz' | 'failed'>('form');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [isRegistering, setIsRegistering] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWizardStep('quiz');
  };

  const handleQuizFinish = async () => {
    let correctCount = 0;
    SCREENING_QUIZ.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) correctCount++;
    });

    if (correctCount >= 12) {
      setIsRegistering(true);
      try {
        const response = await fetch('https://aegis-api.rafiuraza474.workers.dev/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, quizScore: correctCount })
        });
        const data = await response.json();
        if (data.success) {
          toast({ title: 'Success', description: 'Account created.' });
          setLocation('/login');
        } else {
          throw new Error(data.message || 'Registration failed');
        }
      } catch (err: any) {
        toast({ variant: 'destructive', title: 'Error', description: err.message });
        setWizardStep('form');
      } finally {
        setIsRegistering(false);
      }
    } else {
      setWizardStep('failed');
    }
  };

  const currentQ = SCREENING_QUIZ[currentQuestionIndex];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      {wizardStep === 'form' && (
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle>Register Account</CardTitle>
            <CardDescription>Enter your details. You will take a 20-question screening test next.</CardDescription>
          </CardHeader>
          <form onSubmit={handleFormSubmit}>
            <CardContent className="space-y-4">
              <Input placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              <Input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
              <Input type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
            </CardContent>
            <CardFooter><Button className="w-full">Proceed to Screening</Button></CardFooter>
          </form>
        </Card>
      )}

      {wizardStep === 'quiz' && (
        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader>
            <CardTitle>Technical Screening ({currentQuestionIndex + 1}/20)</CardTitle>
            <Progress value={((currentQuestionIndex + 1) / 20) * 100} />
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg font-medium">{currentQ.question}</p>
            {currentQ.options.map((opt, idx) => (
              <Button key={idx} variant={selectedAnswers[currentQuestionIndex] === idx ? "default" : "outline"} className="w-full justify-start text-left h-auto py-3 px-4" onClick={() => setSelectedAnswers({...selectedAnswers, [currentQuestionIndex]: idx})}>
                {opt}
              </Button>
            ))}
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="ghost" onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))} disabled={currentQuestionIndex === 0}>Back</Button>
            <Button onClick={() => currentQuestionIndex === 19 ? handleQuizFinish() : setCurrentQuestionIndex(prev => prev + 1)}>
               {isRegistering ? <Loader2 className="animate-spin" /> : (currentQuestionIndex === 19 ? "Submit Exam" : "Next")}
            </Button>
          </CardFooter>
        </Card>
      )}

      {wizardStep === 'failed' && (
        <Card className="p-8 text-center max-w-sm">
            <XCircle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-xl font-bold mt-4">Screening Failed</h2>
            <p className="text-sm text-muted-foreground mt-2">You need 12/20 to pass.</p>
            <Button className="mt-4 w-full" onClick={() => { setWizardStep('form'); setCurrentQuestionIndex(0); setSelectedAnswers({}); }}>Retry</Button>
        </Card>
      )}
    </div>
  );
}