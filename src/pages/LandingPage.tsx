import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Briefcase, UserCheck, Cpu, ShieldCheck } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold tracking-tight">IntelliHire</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Log In</Button>
            </Link>
            <Link to="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Hire Smarter with AI
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The end-to-end recruitment platform that uses AI to screen resumes, 
            conduct interviews, and evaluate candidates automatically.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="px-8">Post a Job</Button>
            </Link>
            <Link to="/jobs">
              <Button size="lg" variant="outline" className="px-8">Browse Jobs</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Core Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Briefcase className="w-10 h-10 mb-4 text-blue-500" />
                <CardTitle>AI Resume Parsing</CardTitle>
                <CardDescription>
                  Extract structured data from resumes and match them against job descriptions instantly.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <UserCheck className="w-10 h-10 mb-4 text-green-500" />
                <CardTitle>AI Voice Interviews</CardTitle>
                <CardDescription>
                  Automated real-time voice interviews with dynamic question generation and evaluation.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <ShieldCheck className="w-10 h-10 mb-4 text-purple-500" />
                <CardTitle>Smart Proctoring</CardTitle>
                <CardDescription>
                  Webcam-based monitoring to ensure interview integrity and detect anomalies.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2026 IntelliHire. Built for excellence in recruitment.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
