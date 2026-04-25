import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { 
  Briefcase, 
  TrendingUp, 
  HelpCircle, 
  ClipboardCheck, 
  Home, 
  GraduationCap, 
  ShieldCheck,
  ArrowRight,
  Shield,
  Clock,
  CheckCircle2
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center bg-cream pt-12 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-8 max-w-2xl">
            <div className="space-y-4">
              <h1 className="font-heading text-5xl md:text-6xl lg:text-[4rem] font-bold text-rhino leading-[1.1]">
                Coming Home Shouldn&apos;t Mean Starting From Zero.
                <span className="block mt-4 text-desert text-3xl md:text-4xl lg:text-5xl font-medium italic opacity-90">
                  Ang Pag-uwi ay Hindi Simula ng Kawalan.
                </span>
              </h1>
              <p className="font-body text-lg text-rhino/70 leading-relaxed max-w-lg">
                Sundo connects returning OFWs with verified consultants who&apos;ve walked the same path — for business, benefits, reintegration, and everything in between.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register?intent=ofw">
                <Button className="h-14 px-8 text-lg rounded-xl shadow-xl shadow-rhino/10 group">
                  Find a Consultant
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/register?intent=consultant">
                <Button variant="ghost" className="h-14 px-8 text-lg rounded-xl border-2">
                  Become a Consultant
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-6 pt-4 border-t border-akaroa/20">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-cream bg-akaroa flex items-center justify-center text-xs font-bold text-rhino">
                    {/* Placeholder for user avatars */}
                  </div>
                ))}
              </div>
              <p className="font-body text-sm text-rhino/60 font-medium">
                Joined by <span className="text-rhino font-bold">12,000+</span> OFWs and Experts
              </p>
            </div>
          </div>

          <div className="hidden lg:block relative h-[600px]">
            <div className="absolute inset-0 bg-akaroa/10 rounded-[3rem] -rotate-3 blur-3xl" />
            <div className="relative h-full w-full bg-white/40 backdrop-blur-sm rounded-[2.5rem] border border-akaroa/20 shadow-2xl overflow-hidden flex items-center justify-center">
              {/* Placeholder Box for Hero Image */}
              <div className="w-full h-full bg-rhino/5 flex flex-col items-center justify-center p-12 text-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-akaroa/20 flex items-center justify-center">
                  <ShieldCheck className="w-12 h-12 text-rhino" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-heading text-2xl font-bold text-rhino">Safe Reintegration</h3>
                  <p className="font-body text-sm text-rhino/60 max-w-xs mx-auto">
                    Trusted, expert guidance protected by Sundo Escrow and AI validation.
                  </p>
                </div>
              </div>
              
              {/* Floating cards */}
              <div className="absolute top-12 -left-8 bg-white p-4 rounded-2xl shadow-xl border border-akaroa/10 flex items-center gap-4 animate-float">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-rhino/40 font-body uppercase tracking-wider font-bold">Milestone 1</p>
                  <p className="text-sm text-rhino font-bold font-body">Escrow Released</p>
                </div>
              </div>

              <div className="absolute bottom-12 -right-8 bg-white p-6 rounded-2xl shadow-xl border border-akaroa/10 space-y-3 animate-float-delayed">
                <p className="text-xs text-rhino/40 font-body uppercase tracking-wider font-bold">New Request</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-akaroa/20" />
                  <div>
                    <p className="text-sm text-rhino font-bold font-body">Maria S.</p>
                    <p className="text-[10px] text-rhino/50 font-body">Business Consultation</p>
                  </div>
                </div>
                <Button size="sm" className="w-full h-8 text-[10px]">Accept Guidance</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-rhino/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-1/4 h-1/3 bg-desert/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="font-heading text-4xl font-bold text-rhino">Three Steps to Safety</h2>
            <p className="font-body text-rhino/60 leading-relaxed">
              We&apos;ve built a structured process to ensure you get the expert help you need without any of the risks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Create your verified account",
                desc: "Every user is document-verified to ensure a community of trust.",
                icon: Shield
              },
              {
                step: "02",
                title: "Book a matched Consultant",
                desc: "Browse experts filtered by your specific reintegration needs.",
                icon: Briefcase
              },
              {
                step: "03",
                title: "Get guided with Escrow",
                desc: "Your money stays in our vault until work is delivered and AI-validated.",
                icon: ShieldCheck
              }
            ].map((item, i) => (
              <div key={i} className="relative group p-8 rounded-[2rem] hover:bg-cream/50 transition-colors border border-transparent hover:border-akaroa/20">
                <div className="absolute -top-6 left-8 bg-rhino text-white font-heading font-bold text-xl w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg group-hover:bg-desert transition-colors">
                  {item.step}
                </div>
                <div className="space-y-6 pt-4">
                  <div className="w-16 h-16 rounded-2xl bg-akaroa/10 flex items-center justify-center text-rhino">
                    <item.icon className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-heading text-xl font-bold text-rhino">{item.title}</h3>
                    <p className="font-body text-sm text-rhino/60 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Consultation Categories */}
      <section id="categories" className="py-24 bg-cream/40 px-6 border-y border-akaroa/20">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <h2 className="font-heading text-4xl font-bold text-rhino">What do you need help with?</h2>
              <p className="font-body text-rhino/60 leading-relaxed">
                Expert guidance across the entire OFW reintegration journey.
              </p>
            </div>
            <Link href="/consultants">
              <Button variant="ghost" className="rounded-xl px-6">
                Explore All Categories
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Business", icon: TrendingUp, desc: "Registration, planning, and operations." },
              { label: "Work (Local)", icon: Briefcase, desc: "Job matching and local employment tips." },
              { label: "General", icon: HelpCircle, desc: "Personalized advice for any situation." },
              { label: "Benefits", icon: ClipboardCheck, desc: "OWWA, SSS, and PhilHealth claims." },
              { label: "Retirement", icon: Home, desc: "Financial planning and property." },
              { label: "Reintegration", icon: ShieldCheck, desc: "Psychosocial and family support." },
              { label: "Education", icon: GraduationCap, desc: "Scholarships and skills upgrading." },
            ].map((cat, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-akaroa/10 hover:shadow-xl hover:shadow-rhino/5 transition-all group cursor-pointer hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-rhino/5 flex items-center justify-center text-rhino mb-6 group-hover:bg-rhino group-hover:text-white transition-colors">
                  <cat.icon className="w-6 h-6" />
                </div>
                <h4 className="font-heading text-xl font-bold text-rhino mb-2">{cat.label}</h4>
                <p className="font-body text-sm text-rhino/60 leading-relaxed">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Indicators Section */}
      <section className="py-24 bg-rhino px-6 overflow-hidden relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-12">
            <div className="space-y-4">
              <h2 className="font-heading text-4xl font-bold text-white leading-tight">
                Designed for Absolute Trust
              </h2>
              <p className="font-body text-akaroa/60 text-lg leading-relaxed">
                Sundo is not a gig market. It is trust infrastructure built specifically for the OFW context.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {[
                { title: "AI-Validated Proof", desc: "Google Gemini scans deliverables against contracts." },
                { title: "Sundo Escrow Vault", desc: "Funds released only when work is approved." },
                { title: "Verified Identity", desc: "DMW/DFA ready document verification." },
                { title: "Expert Vetting", desc: "Consultants are vetted for real-world experience." }
              ].map((item, i) => (
                <div key={i} className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-akaroa/20 flex items-center justify-center text-akaroa">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h4 className="font-heading text-lg font-bold text-white">{item.title}</h4>
                  <p className="font-body text-sm text-akaroa/50 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-12 space-y-8 relative z-10">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-akaroa/20" />
                  <div>
                    <h5 className="text-white font-bold font-heading">Consultation Agreement</h5>
                    <p className="text-akaroa/40 text-xs font-body italic">Signed Apr 26, 2026</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-white/5">
                {[
                  { label: "Phase 1: Mobilization", status: "Released", amount: "₱4,000" },
                  { label: "Phase 2: Discovery", status: "AI Validating", amount: "₱5,000" },
                  { label: "Phase 3: Strategy", status: "Locked", amount: "₱5,000" },
                ].map((p, i) => (
                  <div key={i} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${p.status === 'Released' ? 'bg-green-400' : p.status === 'AI Validating' ? 'bg-yellow-400 animate-pulse' : 'bg-white/20'}`} />
                      <p className="text-sm text-white/80 font-body">{p.label}</p>
                    </div>
                    <p className="text-sm text-white font-bold font-body">{p.amount}</p>
                  </div>
                ))}
              </div>

              <div className="bg-akaroa/10 rounded-2xl p-6 flex items-center gap-4 border border-akaroa/5">
                <Clock className="w-8 h-8 text-akaroa animate-spin-slow" />
                <div className="space-y-1">
                  <p className="text-xs text-akaroa/60 font-body uppercase tracking-widest font-bold">Escrow Vault</p>
                  <p className="text-lg text-white font-bold font-heading">₱14,000 Locked Securely</p>
                </div>
              </div>
            </div>
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-desert/20 rounded-full blur-[150px] opacity-20" />
          </div>
        </div>
      </section>

      {/* For Consultants Section */}
      <section id="for-consultants" className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto rounded-[3rem] bg-akaroa/10 p-12 lg:p-24 overflow-hidden relative border border-akaroa/20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 relative z-10">
              <div className="space-y-4">
                <span className="text-desert font-body font-bold text-sm uppercase tracking-[0.2em]">Share your expertise</span>
                <h2 className="font-heading text-4xl lg:text-5xl font-bold text-rhino">Turn your experience into income.</h2>
                <p className="font-body text-rhino/60 text-lg leading-relaxed max-w-lg">
                  Join a community of verified OFW returnees and professionals guiding the next generation of homecoming workers.
                </p>
              </div>

              <ul className="space-y-4 font-body text-rhino/70">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-desert" />
                  Verified, premium professional profile
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-desert" />
                  Guaranteed, escrow-backed payments
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-desert" />
                  Stripe Express for instant local payouts
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-desert" />
                  Digital Credibility Score for top performers
                </li>
              </ul>

              <Link href="/register?intent=consultant">
                <Button className="h-14 px-10 text-lg rounded-xl">
                  Become a Consultant
                </Button>
              </Link>
            </div>

            <div className="relative">
              {/* Placeholder Box for Consultant Image */}
              <div className="aspect-square bg-rhino/5 rounded-[2.5rem] border-2 border-dashed border-akaroa/40 flex items-center justify-center p-12 text-center group">
                <div className="space-y-4">
                  <div className="w-20 h-20 rounded-2xl bg-akaroa/20 flex items-center justify-center text-rhino mx-auto group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-10 h-10" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-rhino">Expert Consultant View</h3>
                  <p className="text-xs text-rhino/40 font-body max-w-[200px] mx-auto">
                    Manage your bookings and track earnings with a premium dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="absolute top-0 right-0 w-96 h-96 bg-desert/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        </div>
      </section>

      {/* Crisis Context CTA */}
      <section className="py-24 bg-cream border-t border-akaroa/10 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-10">
          <div className="space-y-4">
            <h2 className="font-heading text-4xl font-bold text-rhino">40,000+ OFWs. One platform to guide them home.</h2>
            <p className="font-body text-rhino/60 leading-relaxed text-lg italic">
              &ldquo;No one understands the journey better than those who have already completed it. Sundo is where we meet you, wherever you are in your homecoming.&rdquo;
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button className="h-14 px-12 text-lg rounded-xl shadow-lg">
                Join the Mission
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
