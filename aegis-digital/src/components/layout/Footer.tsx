import { Link } from 'wouter';
import { Shield, Linkedin, Twitter, Github } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">Penjaga Siber</span>
            </div>
            <p className="text-xs font-medium tracking-wide text-primary/80 mb-2">
              • Cybersecurity<br/>
              • Training<br/>
              • Digital Defense
            </p>
            <p className="text-sm text-muted-foreground">
              Securing the future of tech professionals through world class internship programs.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/programs" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Programs
                </Link>
              </li>
              <li>
                <Link href="/apply" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Apply Now
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Verify</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/verify" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Certificate Verification
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <div className="flex gap-4 mb-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-linkedin">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://github.com/penjagasiber" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-github">
                <Github className="h-5 w-5" />
              </a>
            </div>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Contact Us
            </Link>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Penjaga Siber. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
