'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import { useT } from '@/hooks/useT';
import { useNavigationStore } from '@/stores/navigation-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Shield,
  DollarSign,
  GraduationCap,
  Users,
  Phone,
  Mail,
  MapPin,
  Globe,
  Menu,
  X,
  ChevronRight,
  Star,
  Clock,
  BookOpen,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  PhoneCall,
  FileSearch,
  Rocket,
  Home,
  Briefcase,
  ArrowRight,
} from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from '@/components/ui/carousel';

/* ── animated counter ──────────────────────────────────────────── */
function useCountUp(end: number, duration = 2000, startCounting = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!startCounting) return;
    let current = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      current += step;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration, startCounting]);
  return count;
}

function AnimatedCounter({ end, suffix }: { end: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const count = useCountUp(end, 2000, inView);
  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

/* ── main component ────────────────────────────────────────────── */
export function LandingPage() {
  const { t, language, setLanguage } = useT();
  const navigate = useNavigationStore(s => s.navigate);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const testimonials = [
    {
      name: language === 'es' ? 'Maria Garcia' : 'Maria Garcia',
      role: language === 'es' ? 'Cliente desde 2023' : 'Client since 2023',
      text: language === 'es'
        ? 'Rey Smart Solution transformo mi vida financiera. Mi puntaje subio 120 puntos en solo 6 meses.'
        : 'Rey Smart Solution transformed my financial life. My score went up 120 points in just 6 months.',
      rating: 5,
    },
    {
      name: language === 'es' ? 'Carlos Rodriguez' : 'Carlos Rodriguez',
      role: language === 'es' ? 'Cliente desde 2022' : 'Client since 2022',
      text: language === 'es'
        ? 'El equipo es profesional y dedicado. Me guiaron paso a paso en todo el proceso.'
        : 'The team is professional and dedicated. They guided me step by step through the entire process.',
      rating: 5,
    },
    {
      name: language === 'es' ? 'Ana Martinez' : 'Ana Martinez',
      role: language === 'es' ? 'Cliente desde 2024' : 'Client since 2024',
      text: language === 'es'
        ? 'Gracias a sus cursos educativos, ahora entiendo como funciona el credito. Pude comprar mi primera casa.'
        : 'Thanks to their educational courses, I now understand how credit works. I was able to buy my first home.',
      rating: 5,
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const navLinks = [
    { label: t.nav.services, href: '#services' },
    { label: t.nav.courses, href: '#how-it-works' },
    { label: t.nav.courses, href: '#courses' },
  ];

  const scrollTo = (href: string) => {
    setMobileMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Carousel auto-play logic
  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      carouselApi?.scrollNext();
    }, 4000);
  }, [carouselApi]);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!carouselApi) return;
    startAutoPlay();
    const onSelect = () => setCurrentSlide(carouselApi.selectedScrollSnap());
    carouselApi.on('select', onSelect);
    return () => {
      stopAutoPlay();
      carouselApi.off('select', onSelect);
    };
  }, [carouselApi, startAutoPlay, stopAutoPlay]);

  const carouselServices = [
    {
      icon: Shield,
      title: t.landing.creditRepair,
      desc: t.landing.creditRepairLongDesc,
      shortDesc: t.landing.creditRepairDesc,
      gradient: 'from-teal-600 via-teal-500 to-cyan-500',
      iconBg: 'bg-teal-400/30',
      btnClass: 'bg-white text-teal-700 hover:bg-teal-50',
    },
    {
      icon: DollarSign,
      title: t.landing.consolidation,
      desc: t.landing.consolidationLongDesc,
      shortDesc: t.landing.consolidationDesc,
      gradient: 'from-emerald-600 via-emerald-500 to-green-500',
      iconBg: 'bg-emerald-400/30',
      btnClass: 'bg-white text-emerald-700 hover:bg-emerald-50',
    },
    {
      icon: GraduationCap,
      title: t.landing.education,
      desc: t.landing.educationLongDesc,
      shortDesc: t.landing.educationDesc,
      gradient: 'from-amber-500 via-amber-600 to-orange-500',
      iconBg: 'bg-amber-400/30',
      btnClass: 'bg-white text-amber-800 hover:bg-amber-50',
    },
    {
      icon: Users,
      title: t.landing.counseling,
      desc: t.landing.counselingLongDesc,
      shortDesc: t.landing.counselingDesc,
      gradient: 'from-rose-600 via-rose-500 to-pink-500',
      iconBg: 'bg-rose-400/30',
      btnClass: 'bg-white text-rose-700 hover:bg-rose-50',
    },
    {
      icon: Home,
      title: t.landing.homeBuying,
      desc: t.landing.homeBuyingLongDesc,
      shortDesc: t.landing.homeBuyingDesc,
      gradient: 'from-purple-600 via-purple-500 to-violet-500',
      iconBg: 'bg-purple-400/30',
      btnClass: 'bg-white text-purple-700 hover:bg-purple-50',
    },
    {
      icon: Briefcase,
      title: t.landing.businessCredit,
      desc: t.landing.businessCreditLongDesc,
      shortDesc: t.landing.businessCreditDesc,
      gradient: 'from-sky-600 via-sky-500 to-cyan-500',
      iconBg: 'bg-sky-400/30',
      btnClass: 'bg-white text-sky-700 hover:bg-sky-50',
    },
  ];

  const services = [
    { icon: Shield, title: t.landing.creditRepair, desc: t.landing.creditRepairDesc, color: 'bg-teal-100 text-teal-600' },
    { icon: DollarSign, title: t.landing.consolidation, desc: t.landing.consolidationDesc, color: 'bg-emerald-100 text-emerald-600' },
    { icon: GraduationCap, title: t.landing.education, desc: t.landing.educationDesc, color: 'bg-amber-100 text-amber-600' },
    { icon: Users, title: t.landing.counseling, desc: t.landing.counselingDesc, color: 'bg-rose-100 text-rose-600' },
  ];

  const steps = [
    { icon: Phone, title: t.landing.step1, desc: t.landing.step1Desc, num: '01' },
    { icon: FileSearch, title: t.landing.step2, desc: t.landing.step2Desc, num: '02' },
    { icon: Rocket, title: t.landing.step3, desc: t.landing.step3Desc, num: '03' },
  ];

  const courses = [
    {
      title: 'Credit Fundamentals 101',
      desc: language === 'es'
        ? 'Aprende los fundamentos del credito, desde como funciona hasta como construir un historial solido.'
        : 'Learn the fundamentals of credit, from how it works to building a solid history.',
      gradient: 'from-teal-500 to-teal-700',
      icon: BookOpen,
    },
    {
      title: language === 'es' ? 'Estrategias de Consolidacion de Deudas' : 'Debt Consolidation Strategies',
      desc: language === 'es'
        ? 'Descubre las mejores estrategias para consolidar deudas y reducir pagos mensuales.'
        : 'Discover the best strategies to consolidate debt and reduce monthly payments.',
      gradient: 'from-emerald-500 to-emerald-700',
      icon: DollarSign,
    },
    {
      title: language === 'es' ? 'Guia para Compradores Primerizos' : 'First-Time Homebuyer Guide',
      desc: language === 'es'
        ? 'Todo lo que necesitas saber para comprar tu primera casa con el mejor credito posible.'
        : 'Everything you need to know to buy your first home with the best credit possible.',
      gradient: 'from-teal-600 to-emerald-600',
      icon: GraduationCap,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ── Navbar ───────────────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
            : 'bg-transparent'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('landing')}>
              <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-gray-900">Rey Smart Solution</span>
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map(link => (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className="text-sm font-medium text-gray-600 hover:text-teal-600 transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-teal-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Globe className="w-4 h-4" />
                {language === 'en' ? 'ES' : 'EN'}
              </button>
              <Button
                onClick={() => navigate('login')}
                variant="outline"
                className="hidden sm:inline-flex border-teal-600 text-teal-600 hover:bg-teal-50"
              >
                {t.auth.login}
              </Button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-600"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden pb-4 border-t border-gray-100"
            >
              {navLinks.map(link => (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className="block w-full text-left py-2 text-sm font-medium text-gray-600 hover:text-teal-600"
                >
                  {link.label}
                </button>
              ))}
              <div className="flex gap-2 mt-3">
                <Button
                  onClick={() => { navigate('login'); setMobileMenuOpen(false); }}
                  variant="outline"
                  className="flex-1 border-teal-600 text-teal-600"
                >
                  {t.auth.login}
                </Button>
                <Button
                  onClick={() => { navigate('register'); setMobileMenuOpen(false); }}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
                >
                  {t.landing.getStarted}
                </Button>
              </div>
            </motion.div>
          )}
        </nav>
      </header>

      {/* ── Hero Section ────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-800" />
        {/* Floating shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl" />
          <div className="absolute top-20 right-1/4 w-4 h-4 bg-teal-400/30 rounded-full animate-pulse" />
          <div className="absolute top-1/2 right-20 w-3 h-3 bg-emerald-400/30 rounded-full animate-pulse delay-700" />
          <div className="absolute bottom-1/3 left-1/4 w-2 h-2 bg-teal-300/40 rounded-full animate-pulse delay-1000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                {t.landing.heroTitle}
              </h1>
              <p className="mt-6 text-lg text-teal-100/90 max-w-xl leading-relaxed">
                {t.landing.heroSubtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-10">
                <Button
                  onClick={() => navigate('register')}
                  size="lg"
                  className="bg-white text-teal-700 hover:bg-teal-50 px-8 py-6 text-base font-semibold rounded-xl shadow-lg"
                >
                  {t.landing.getStarted}
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/40 text-white hover:bg-white/10 px-8 py-6 text-base rounded-xl"
                >
                  <PhoneCall className="w-5 h-5 mr-2" />
                  {t.landing.scheduleConsultation}
                </Button>
              </div>
            </motion.div>

            {/* Score card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 text-white">
                  <div className="space-y-6">
                    <div>
                      <p className="text-teal-200 text-sm">{language === 'es' ? 'Puntaje Antes' : 'Score Before'}</p>
                      <p className="text-4xl font-bold">489</p>
                      <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                        <div className="bg-red-400 h-2 rounded-full" style={{ width: '40%' }} />
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="bg-white/20 rounded-full p-3">
                        <Rocket className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="text-teal-200 text-sm">{language === 'es' ? 'Puntaje Despues' : 'Score After'}</p>
                      <p className="text-4xl font-bold">742</p>
                      <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                        <div className="bg-green-300 h-2 rounded-full" style={{ width: '85%' }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 rounded-xl p-3">
                      <Star className="w-5 h-5 text-yellow-400" />
                      <span className="text-sm">{language === 'es' ? '+253 puntos en 6 meses' : '+253 points in 6 months'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Service Carousel ───────────────────────────── */}
      <section className="py-16 sm:py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              {t.landing.serviceCarouselTitle}
            </h2>
          </motion.div>

          <div className="relative px-8 sm:px-14">
            <Carousel
              opts={{ loop: true }}
              setApi={setCarouselApi}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {carouselServices.map((service, i) => (
                  <CarouselItem key={i} className="pl-4 md:basis-full lg:basis-full">
                    <div
                      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${service.gradient} p-6 sm:p-8 md:p-10 lg:p-12 min-h-[320px] sm:min-h-[360px] flex items-center`}
                      onMouseEnter={stopAutoPlay}
                      onMouseLeave={startAutoPlay}
                    >
                      {/* Decorative background icon */}
                      <div className="absolute right-4 bottom-4 sm:right-8 sm:bottom-8 opacity-[0.08] pointer-events-none">
                        <service.icon className="w-40 h-40 sm:w-56 sm:h-56 lg:w-72 lg:h-72 text-white" />
                      </div>
                      {/* Decorative circles */}
                      <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                      <div className="absolute -bottom-12 left-1/3 w-48 h-48 bg-white/5 rounded-full blur-3xl" />

                      <div className="relative z-10 w-full flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
                        {/* Icon */}
                        <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${service.iconBg} backdrop-blur-sm flex items-center justify-center flex-shrink-0`}>
                          <service.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 sm:mb-3">
                            {service.title}
                          </h3>
                          <p className="text-sm sm:text-base text-white/85 leading-relaxed max-w-2xl mb-6">
                            {service.shortDesc}
                          </p>
                          <div className="flex flex-wrap gap-3">
                            <Button
                              onClick={() => navigate('register')}
                              className={`${service.btnClass} px-5 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base font-semibold shadow-lg`}
                            >
                              {t.landing.getStarted}
                              <ArrowRight className="w-4 h-4 ml-1.5" />
                            </Button>
                            <Button
                              variant="outline"
                              className="border-white/50 text-white hover:bg-white/15 backdrop-blur-sm px-5 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base"
                            >
                              {t.landing.learnMore}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-0 sm:-left-14 bg-white/90 text-gray-800 hover:bg-white border-gray-200 shadow-lg hover:shadow-xl transition-all" />
              <CarouselNext className="right-0 sm:-right-14 bg-white/90 text-gray-800 hover:bg-white border-gray-200 shadow-lg hover:shadow-xl transition-all" />
            </Carousel>

            {/* Dot indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {carouselServices.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    carouselApi?.scrollTo(i);
                    stopAutoPlay();
                    startAutoPlay();
                  }}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    i === currentSlide
                      ? 'w-8 bg-teal-600'
                      : 'w-2.5 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Services Section ────────────────────────────── */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{t.landing.services}</h2>
            <p className="mt-4 text-lg text-gray-600">{t.landing.servicesSubtitle}</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border-0 shadow-md hover:shadow-xl transition-shadow duration-300 group cursor-pointer">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${service.color}`}>
                      <service.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{service.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────── */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{t.landing.howItWorks}</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-10 left-1/6 right-1/6 h-0.5 bg-teal-200" />
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center relative"
              >
                <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-teal-600 text-white mb-6 shadow-lg shadow-teal-600/25 z-10">
                  <span className="text-2xl font-bold">{step.num}</span>
                </div>
                <div className="w-14 h-14 rounded-xl bg-teal-50 flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-7 h-7 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 max-w-xs mx-auto">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Section ───────────────────────────────── */}
      <section className="py-16 bg-gradient-to-r from-teal-600 to-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { end: 2500, suffix: '+', label: t.landing.clientsHelped },
              { end: 15000, suffix: '+', label: t.landing.disputesResolved },
              { end: 85, suffix: '+', label: t.landing.avgImprovement },
              { end: 500, suffix: '+', label: t.landing.coursesCompleted },
            ].map((stat, i) => (
              <div key={i} className="text-center text-white">
                <p className="text-3xl sm:text-4xl font-bold">
                  <AnimatedCounter end={stat.end} suffix={stat.suffix} />
                </p>
                <p className="mt-2 text-teal-100 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Courses ────────────────────────────── */}
      <section id="courses" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-14">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{t.landing.featuredCourses}</h2>
            </motion.div>
            <Button
              variant="outline"
              className="border-teal-600 text-teal-600 hover:bg-teal-50"
              onClick={() => navigate('login')}
            >
              {t.landing.viewAll}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border-0 shadow-md hover:shadow-xl transition-shadow duration-300 group cursor-pointer">
                  <CardContent className="p-6">
                    <div className={`w-full h-36 rounded-xl bg-gradient-to-br ${course.gradient} flex items-center justify-center mb-4`}>
                      <course.icon className="w-12 h-12 text-white/80" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">{course.desc}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>3h 30m</span>
                      </div>
                      <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white text-xs">
                        {language === 'es' ? 'Inscribirse' : 'Enroll Now'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{t.landing.testimonials}</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`h-full border-0 shadow-md ${i === currentTestimonial ? 'ring-2 ring-teal-600' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: item.rating }).map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 italic leading-relaxed mb-4">
                      &ldquo;{item.text}&rdquo;
                    </p>
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white text-sm font-bold">
                        {item.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentTestimonial(i)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  i === currentTestimonial ? 'bg-teal-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact Section ─────────────────────────────── */}
      <section id="contact" className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white">{t.landing.contactUs}</h2>
            <p className="mt-4 text-lg text-gray-400">{t.landing.contactSubtitle}</p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="border-0 bg-gray-800 text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-teal-600/20 flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-teal-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{t.landing.callUs}</h3>
                <p className="text-gray-400">(407) 432-8872</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-gray-800 text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-teal-600/20 flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-teal-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{t.landing.emailUs}</h3>
                <p className="text-gray-400">info@reysmartsolution.com</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-gray-800 text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-teal-600/20 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-teal-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{t.landing.visitUs}</h3>
                <p className="text-gray-400 text-sm">7800 S US Hwy 17/92, Ste 194<br />Fern Park, FL 32730</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="bg-gray-950 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg text-white">Rey Smart Solution</span>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                {language === 'es'
                  ? 'Transformando vidas a traves de soluciones financieras inteligentes.'
                  : 'Transforming lives through smart financial solutions.'}
              </p>
              <div className="flex gap-3">
                {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-teal-600 flex items-center justify-center transition-colors">
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">{t.landing.aboutUs}</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-teal-400 transition-colors">{t.landing.aboutUs}</a></li>
                <li><a href="#services" className="hover:text-teal-400 transition-colors">{t.landing.services}</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">{t.landing.privacyPolicy}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">{t.nav.courses}</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#courses" className="hover:text-teal-400 transition-colors">{t.landing.featuredCourses}</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors">{t.landing.contactUs}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">{t.landing.contactUs}</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  (407) 432-8872
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  info@reysmartsolution.com
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                  <span>7800 S US Hwy 17/92, Ste 194, Fern Park, FL 32730</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">&copy; 2024 Rey Smart Solution. {t.landing.footerRights}</p>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-teal-400 transition-colors">{t.landing.privacyPolicy}</a>
              <a href="#" className="hover:text-teal-400 transition-colors">{t.landing.termsOfService}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
