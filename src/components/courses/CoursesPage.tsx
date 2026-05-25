'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useT } from '@/hooks/useT';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Search, Clock, Users, GraduationCap, BookOpen, Play, ChevronRight,
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// ── Types ─────────────────────────────────────────────────────────────
interface Lesson {
  id: string;
  title: string;
  titleEs: string;
  duration: string;
}

interface Course {
  id: string;
  title: string;
  titleEs: string;
  description: string;
  descriptionEs: string;
  fullDescription: string;
  fullDescriptionEs: string;
  category: string;
  categoryEs: string;
  level: string;
  duration: string;
  enrolledCount: number;
  lessons: Lesson[];
  gradient: string;
}

// ── Demo Data ─────────────────────────────────────────────────────────
const DEMO_COURSES: Course[] = [
  {
    id: 'CRS-001',
    title: 'Credit Fundamentals 101',
    titleEs: 'Fundamentos de Crédito 101',
    description: 'Learn the basics of credit scores, reports, and how the credit system works.',
    descriptionEs: 'Aprende los conceptos básicos de puntajes crediticios, reportes y cómo funciona el sistema de crédito.',
    fullDescription: 'This comprehensive course covers everything you need to know about credit fundamentals. From understanding how credit scores are calculated to learning what appears on your credit report, this beginner-friendly course provides a solid foundation for anyone looking to improve their financial literacy. Topics include the five factors of credit scoring, how to read a credit report, and common credit myths debunked.',
    fullDescriptionEs: 'Este curso completo cubre todo lo que necesitas saber sobre los fundamentos del crédito. Desde entender cómo se calculan los puntajes de crédito hasta aprender qué aparece en tu reporte, este curso para principiantes proporciona una base sólida para cualquier persona que busque mejorar su educación financiera.',
    category: 'Credit Basics',
    categoryEs: 'Fundamentos de Crédito',
    level: 'Beginner',
    duration: '45min',
    enrolledCount: 1247,
    gradient: 'from-teal-500 to-emerald-600',
    lessons: [
      { id: 'L1', title: 'What is Credit?', titleEs: '¿Qué es el Crédito?', duration: '5 min' },
      { id: 'L2', title: 'Understanding Credit Scores', titleEs: 'Entendiendo los Puntajes', duration: '8 min' },
      { id: 'L3', title: 'Reading Your Credit Report', titleEs: 'Leyendo tu Reporte', duration: '7 min' },
      { id: 'L4', title: 'The 5 Factors of Credit Scoring', titleEs: 'Los 5 Factores del Puntaje', duration: '10 min' },
      { id: 'L5', title: 'Common Credit Myths', titleEs: 'Mitos Comunes del Crédito', duration: '8 min' },
      { id: 'L6', title: 'Building Good Credit Habits', titleEs: 'Construyendo Buenos Hábitos', duration: '7 min' },
    ],
  },
  {
    id: 'CRS-002',
    title: 'Debt Consolidation Strategies',
    titleEs: 'Estrategias de Consolidación',
    description: 'Master strategies for consolidating debt and lowering your monthly payments effectively.',
    descriptionEs: 'Domina las estrategias para consolidar deudas y reducir tus pagos mensuales de manera efectiva.',
    fullDescription: 'Take control of your debt with proven consolidation strategies. This intermediate-level course teaches you how to evaluate different consolidation options including balance transfers, personal loans, and debt management programs. Learn how to calculate the true cost of debt, negotiate with creditors, and create a realistic payoff timeline that works for your budget.',
    fullDescriptionEs: 'Toma el control de tus deudas con estrategias probadas de consolidación. Este curso de nivel intermedio te enseña cómo evaluar diferentes opciones de consolidación.',
    category: 'Consolidation',
    categoryEs: 'Consolidación',
    level: 'Intermediate',
    duration: '60min',
    enrolledCount: 834,
    gradient: 'from-amber-500 to-orange-600',
    lessons: [
      { id: 'L1', title: 'Types of Debt', titleEs: 'Tipos de Deuda', duration: '8 min' },
      { id: 'L2', title: 'Consolidation Options', titleEs: 'Opciones de Consolidación', duration: '10 min' },
      { id: 'L3', title: 'Balance Transfer Strategies', titleEs: 'Estrategias de Transferencia', duration: '12 min' },
      { id: 'L4', title: 'Debt Management Plans', titleEs: 'Planes de Manejo de Deuda', duration: '10 min' },
      { id: 'L5', title: 'Negotiating with Creditors', titleEs: 'Negociando con Acreedores', duration: '10 min' },
      { id: 'L6', title: 'Creating a Payoff Plan', titleEs: 'Creando un Plan de Pago', duration: '10 min' },
    ],
  },
  {
    id: 'CRS-003',
    title: 'Budgeting for Success',
    titleEs: 'Presupuesto para el Éxito',
    description: 'Create and maintain a budget that works for your lifestyle and financial goals.',
    descriptionEs: 'Crea y mantén un presupuesto que funcione para tu estilo de vida y metas financieras.',
    fullDescription: 'Master the art of budgeting with practical tools and techniques that actually work. This beginner-friendly course walks you through creating a personalized budget, tracking expenses, and building an emergency fund. Includes downloadable budget templates and interactive exercises to help you develop lasting financial habits.',
    fullDescriptionEs: 'Domina el arte del presupuesto con herramientas y técnicas prácticas que realmente funcionan.',
    category: 'Budgeting',
    categoryEs: 'Presupuesto',
    level: 'Beginner',
    duration: '30min',
    enrolledCount: 2103,
    gradient: 'from-emerald-500 to-green-600',
    lessons: [
      { id: 'L1', title: 'Why Budgeting Matters', titleEs: 'Por qué Importa el Presupuesto', duration: '5 min' },
      { id: 'L2', title: 'Types of Budgets', titleEs: 'Tipos de Presupuestos', duration: '6 min' },
      { id: 'L3', title: '50/30/20 Rule Explained', titleEs: 'Regla 50/30/20 Explicada', duration: '5 min' },
      { id: 'L4', title: 'Tracking Your Expenses', titleEs: 'Rastreando tus Gastos', duration: '7 min' },
      { id: 'L5', title: 'Emergency Fund Building', titleEs: 'Construyendo Fondo de Emergencia', duration: '7 min' },
    ],
  },
  {
    id: 'CRS-004',
    title: 'First-Time Homebuyer Guide',
    titleEs: 'Guía para Primer Comprador',
    description: 'Everything you need to know about buying your first home and qualifying for a mortgage.',
    descriptionEs: 'Todo lo que necesitas saber sobre comprar tu primera casa y calificar para una hipoteca.',
    fullDescription: 'Navigate the home buying process with confidence. This advanced course covers credit score requirements for mortgages, down payment assistance programs, the pre-approval process, and closing costs. Learn from real case studies and get expert tips on improving your credit to qualify for the best mortgage rates available.',
    fullDescriptionEs: 'Navega el proceso de compra de vivienda con confianza. Este curso avanzado cubre los requisitos de puntaje de crédito para hipotecas.',
    category: 'Home Buying',
    categoryEs: 'Compra de Vivienda',
    level: 'Advanced',
    duration: '90min',
    enrolledCount: 567,
    gradient: 'from-rose-500 to-pink-600',
    lessons: [
      { id: 'L1', title: 'Are You Ready to Buy?', titleEs: '¿Estás Listo para Comprar?', duration: '10 min' },
      { id: 'L2', title: 'Credit Score Requirements', titleEs: 'Requisitos de Puntaje', duration: '12 min' },
      { id: 'L3', title: 'Down Payment Options', titleEs: 'Opciones de Enganche', duration: '15 min' },
      { id: 'L4', title: 'Mortgage Types Explained', titleEs: 'Tipos de Hipoteca', duration: '15 min' },
      { id: 'L5', title: 'Pre-Approval Process', titleEs: 'Proceso de Pre-Aprobación', duration: '12 min' },
      { id: 'L6', title: 'Closing Costs & Fees', titleEs: 'Costos de Cierre y Tarifas', duration: '13 min' },
      { id: 'L7', title: 'First-Time Buyer Programs', titleEs: 'Programas para Primer Comprador', duration: '13 min' },
    ],
  },
  {
    id: 'CRS-005',
    title: 'Understanding Credit Scores',
    titleEs: 'Entendiendo los Puntajes',
    description: 'Deep dive into how credit scores are calculated and strategies to boost yours.',
    descriptionEs: 'Profundización en cómo se calculan los puntajes y estrategias para mejorar el tuyo.',
    fullDescription: 'Go beyond the basics and truly understand the mechanics of credit scoring. This beginner-friendly but detailed course explains each factor of the FICO score in depth, provides actionable strategies to improve your score, and teaches you how to spot errors on your report that could be dragging your score down.',
    fullDescriptionEs: 'Ve más allá de lo básico y entiende verdaderamente la mecánica de los puntajes de crédito.',
    category: 'Credit Basics',
    categoryEs: 'Fundamentos de Crédito',
    level: 'Beginner',
    duration: '45min',
    enrolledCount: 1589,
    gradient: 'from-cyan-500 to-teal-600',
    lessons: [
      { id: 'L1', title: 'FICO vs VantageScore', titleEs: 'FICO vs VantageScore', duration: '8 min' },
      { id: 'L2', title: 'Payment History Impact', titleEs: 'Impacto del Historial de Pagos', duration: '8 min' },
      { id: 'L3', title: 'Credit Utilization', titleEs: 'Utilización de Crédito', duration: '10 min' },
      { id: 'L4', title: 'Length of Credit History', titleEs: 'Longitud del Historial', duration: '7 min' },
      { id: 'L5', title: 'Credit Mix & Inquiries', titleEs: 'Mezcla de Crédito e Consultas', duration: '12 min' },
    ],
  },
  {
    id: 'CRS-006',
    title: 'Business Credit Building',
    titleEs: 'Construcción de Crédito Empresarial',
    description: 'Learn how to establish and grow business credit separate from your personal credit.',
    descriptionEs: 'Aprende cómo establecer y hacer crecer el crédito empresarial separado de tu crédito personal.',
    fullDescription: 'Separate your business and personal finances by building strong business credit. This advanced course covers how to establish a business credit profile, secure vendor credit lines, obtain business credit cards, and leverage business credit for financing. Includes step-by-step action plans for new and existing business owners.',
    fullDescriptionEs: 'Separa tus finanzas personales y empresariales construyendo un crédito empresarial sólido.',
    category: 'Business Credit',
    categoryEs: 'Crédito Empresarial',
    level: 'Advanced',
    duration: '60min',
    enrolledCount: 423,
    gradient: 'from-violet-500 to-purple-600',
    lessons: [
      { id: 'L1', title: 'Business vs Personal Credit', titleEs: 'Crédito Empresarial vs Personal', duration: '10 min' },
      { id: 'L2', title: 'Forming Your Business Entity', titleEs: 'Formando tu Entidad', duration: '10 min' },
      { id: 'L3', title: 'EIN and DUNS Numbers', titleEs: 'Números EIN y DUNS', duration: '8 min' },
      { id: 'L4', title: 'Vendor Credit Lines', titleEs: 'Líneas de Crédito Comercial', duration: '12 min' },
      { id: 'L5', title: 'Business Credit Cards', titleEs: 'Tarjetas de Crédito Empresarial', duration: '10 min' },
      { id: 'L6', title: 'Financing Your Growth', titleEs: 'Financiando tu Crecimiento', duration: '10 min' },
    ],
  },
];

// ── Constants ─────────────────────────────────────────────────────────
const CATEGORY_OPTIONS = ['All', 'Credit Basics', 'Consolidation', 'Budgeting', 'Home Buying', 'Business Credit'];
const LEVEL_OPTIONS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const LEVEL_COLORS: Record<string, string> = {
  Beginner: 'bg-emerald-100 text-emerald-700',
  Intermediate: 'bg-amber-100 text-amber-700',
  Advanced: 'bg-rose-100 text-rose-700',
};

const GRADIENT_STYLES: Record<string, string> = {
  'from-teal-500 to-emerald-600': 'bg-gradient-to-br from-teal-500 to-emerald-600',
  'from-amber-500 to-orange-600': 'bg-gradient-to-br from-amber-500 to-orange-600',
  'from-emerald-500 to-green-600': 'bg-gradient-to-br from-emerald-500 to-green-600',
  'from-rose-500 to-pink-600': 'bg-gradient-to-br from-rose-500 to-pink-600',
  'from-cyan-500 to-teal-600': 'bg-gradient-to-br from-cyan-500 to-teal-600',
  'from-violet-500 to-purple-600': 'bg-gradient-to-br from-violet-500 to-purple-600',
};

// ── Component ─────────────────────────────────────────────────────────
export function CoursesPage() {
  const { t, language } = useT();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [levelFilter, setLevelFilter] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // ── Filtering ──
  const filtered = useMemo(() => {
    return DEMO_COURSES.filter(c => {
      const s = search.toLowerCase();
      const matchSearch = !s
        || c.title.toLowerCase().includes(s)
        || c.titleEs.toLowerCase().includes(s)
        || c.description.toLowerCase().includes(s);
      const matchCategory = categoryFilter === 'All' || c.category === categoryFilter;
      const matchLevel = levelFilter === 'All' || c.level === levelFilter;
      return matchSearch && matchCategory && matchLevel;
    });
  }, [search, categoryFilter, levelFilter]);

  // ── Translations helpers ──
  const getText = useCallback((course: Course, field: 'title' | 'description' | 'fullDescription' | 'category') => {
    if (language === 'es') {
      const key = `${field}Es` as keyof Course;
      return (course[key] as string) || course[field];
    }
    return course[field];
  }, [language]);

  const levelLabel = useCallback((level: string) => {
    if (language === 'es') {
      switch (level) {
        case 'Beginner': return 'Principiante';
        case 'Intermediate': return 'Intermedio';
        case 'Advanced': return 'Avanzado';
        default: return level;
      }
    }
    return level;
  }, [language]);

  const categoryLabel = useCallback((cat: string) => {
    if (language === 'es') {
      switch (cat) {
        case 'All': return 'Todas las Categorías';
        case 'Credit Basics': return 'Fundamentos de Crédito';
        case 'Consolidation': return 'Consolidación';
        case 'Budgeting': return 'Presupuesto';
        case 'Home Buying': return 'Compra de Vivienda';
        case 'Business Credit': return 'Crédito Empresarial';
        default: return cat;
      }
    }
    if (cat === 'All') return t.courses.allCategories;
    return cat;
  }, [language, t.courses.allCategories]);

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t.courses.title}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {filtered.length} {t.common.results.toLowerCase()}
          </p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={() => setShowCreate(true)}>
          <GraduationCap className="w-4 h-4 mr-2" />{t.courses.createCourse}
        </Button>
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder={t.courses.search}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={v => { setCategoryFilter(v); }}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder={t.courses.category} />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_OPTIONS.map(c => (
              <SelectItem key={c} value={c}>{categoryLabel(c)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={levelFilter} onValueChange={v => { setLevelFilter(v); }}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder={t.courses.level} />
          </SelectTrigger>
          <SelectContent>
            {LEVEL_OPTIONS.map(l => (
              <SelectItem key={l} value={l}>{l === 'All' ? t.courses.allLevels : levelLabel(l)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Course Grid ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <GraduationCap className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500">{t.common.noResults}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card className="h-full border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden">
                <CardContent className="p-0">
                  {/* Gradient Thumbnail */}
                  <div className={`h-40 ${GRADIENT_STYLES[course.gradient] || 'bg-gradient-to-br from-teal-500 to-emerald-600'} flex items-center justify-center relative`}>
                    <GraduationCap className="w-16 h-16 text-white/30" />
                    <div className="absolute bottom-3 left-3">
                      <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-xs">
                        {getText(course, 'category')}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge className={`${LEVEL_COLORS[course.level]} backdrop-blur-sm text-xs`}>
                        {levelLabel(course.level)}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-5">
                    {/* Title */}
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors line-clamp-1">
                      {getText(course, 'title')}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                      {getText(course, 'description')}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {course.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        {course.lessons.length} {t.courses.lessons.toLowerCase()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {course.enrolledCount.toLocaleString()}
                      </span>
                    </div>

                    {/* Action */}
                    <Button
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                      size="sm"
                      onClick={() => setSelectedCourse(course)}
                    >
                      View Details
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Course Detail Dialog ── */}
      <Dialog open={!!selectedCourse} onOpenChange={open => { if (!open) setSelectedCourse(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
          {selectedCourse && (
            <>
              <DialogHeader className="sr-only">
                <DialogTitle>{getText(selectedCourse, 'title')}</DialogTitle>
                <DialogDescription>{getText(selectedCourse, 'description')}</DialogDescription>
              </DialogHeader>

              <ScrollArea className="max-h-[80vh]">
                <div className="pr-4">
                  {/* Course Header */}
                  <div className={`rounded-xl ${GRADIENT_STYLES[selectedCourse.gradient] || 'bg-gradient-to-br from-teal-500 to-emerald-600'} p-8 text-white -mx-6 -mt-6 mb-6`}>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-white/20 text-white border-white/30 text-xs">
                        {getText(selectedCourse, 'category')}
                      </Badge>
                      <Badge className={`${LEVEL_COLORS[selectedCourse.level].replace(/100/g, '50').replace(/text-/g, 'text-').replace(/700/g, '200')} bg-white/10 text-white border-white/20 text-xs`}>
                        {levelLabel(selectedCourse.level)}
                      </Badge>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">
                      {getText(selectedCourse, 'title')}
                    </h2>
                    <p className="text-white/80 text-sm line-clamp-2">
                      {getText(selectedCourse, 'description')}
                    </p>
                    <div className="flex flex-wrap gap-4 mt-5 text-sm text-white/90">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {selectedCourse.duration}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4" />
                        {selectedCourse.lessons.length} {t.courses.lessons.toLowerCase()}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        {selectedCourse.enrolledCount.toLocaleString()} {t.courses.enrolledStudents.toLowerCase()}
                      </span>
                    </div>
                  </div>

                  {/* Full Description */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {language === 'es' ? 'Descripción del Curso' : 'Course Description'}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {getText(selectedCourse, 'fullDescription')}
                    </p>
                  </div>

                  <Separator className="mb-6" />

                  {/* Lesson List */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {t.courses.lessons}
                    </h3>
                    <div className="space-y-2">
                      {selectedCourse.lessons.map((lesson, idx) => (
                        <div
                          key={lesson.id}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-sm font-semibold text-teal-600 shrink-0">
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {language === 'es' ? lesson.titleEs : lesson.title}
                            </p>
                            <p className="text-xs text-gray-400">{lesson.duration}</p>
                          </div>
                          <Play className="w-4 h-4 text-teal-500 shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Enroll Button */}
                  <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white py-5 text-base" onClick={() => setSelectedCourse(null)}>
                    <GraduationCap className="w-5 h-5 mr-2" />
                    {t.courses.enroll}
                  </Button>
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Create Course Dialog (Admin) ── */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t.courses.createCourse}</DialogTitle>
            <DialogDescription>Add a new course to the platform.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title (English)</Label>
              <Input placeholder="Course title..." />
            </div>
            <div className="space-y-2">
              <Label>Title (Spanish)</Label>
              <Input placeholder="Título del curso..." />
            </div>
            <div className="space-y-2">
              <Label>Description (English)</Label>
              <Textarea rows={3} placeholder="Course description..." />
            </div>
            <div className="space-y-2">
              <Label>Description (Spanish)</Label>
              <Textarea rows={3} placeholder="Descripción del curso..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.courses.category}</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Credit Basics">Credit Basics</SelectItem>
                    <SelectItem value="Consolidation">Consolidation</SelectItem>
                    <SelectItem value="Budgeting">Budgeting</SelectItem>
                    <SelectItem value="Home Buying">Home Buying</SelectItem>
                    <SelectItem value="Business Credit">Business Credit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t.courses.level}</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t.courses.duration}</Label>
              <Input placeholder="e.g. 45min" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>{t.common.cancel}</Button>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white">{t.common.create}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
