import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Search,
  MapPin,
  ShieldCheck,
  TrendingUp,
  FileCheck2,
  Compass,
  ArrowRight,
  Layers,
  Sparkles,
  Droplets,
  Building,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { listingService } from '../../services/listingService';
import { DISTRICTS } from '../../data/tnLocations';
import { Button, Card, Badge } from '../ui';

// Number counter animation component using real values only
const AnimatedCounter = ({ targetValue, duration = 1.2 }) => {
  const [count, setCount] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      setCount(targetValue);
      return;
    }

    let start = 0;
    const end = parseInt(targetValue, 10) || 0;
    if (start === end) {
      setCount(end);
      return;
    }

    const totalSteps = 30;
    const stepTime = (duration * 1000) / totalSteps;
    const increment = (end - start) / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [targetValue, duration, shouldReduceMotion]);

  return <span>{count}</span>;
};

export const LandingPage = () => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const [searchDistrict, setSearchDistrict] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [realMetrics, setRealMetrics] = useState({
    totalListings: 0,
    districtsCount: 0,
    verifiedCount: 0,
  });

  useEffect(() => {
    try {
      const all = listingService.getListings();
      const published = all.filter((l) => l.status === 'published');
      const uniqueDistricts = new Set(all.map((l) => l.district)).size;
      const verified = all.filter((l) => l.is_verified).length;

      setRealMetrics({
        totalListings: published.length || all.length,
        districtsCount: uniqueDistricts,
        verifiedCount: verified,
      });
    } catch (e) {}
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (searchDistrict !== 'all') query.set('district', searchDistrict);
    if (searchKeyword.trim()) query.set('q', searchKeyword.trim());
    navigate(`/buy?${query.toString()}`);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  };

  return (
    <div className="overflow-hidden">
      {/* 1. Hero Section with Map Grid and Animated Entrance */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 bg-map-grid bg-slate-50 dark:bg-navy-950 border-b border-slate-200/80 dark:border-navy-800 transition-colors">
        {/* Subtle Ambient Gradient Blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 dark:bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center max-w-3xl mx-auto space-y-6"
          >
            {/* Tagline Badge */}
            <motion.div variants={itemVariants} className="inline-flex">
              <Badge variant="teal" size="md" icon={ShieldCheck} className="shadow-sm">
                Tamil Nadu Geospatial Land Intelligence & Marketplace
              </Badge>
            </motion.div>

            {/* Confident Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.12]"
            >
              Understand the Land.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-500 dark:from-teal-400 dark:to-cyan-300">
                Decide with Confidence.
              </span>
            </motion.h1>

            {/* Narrative Subtitle */}
            <motion.p
              variants={itemVariants}
              className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed"
            >
              Deterministic 4-pillar land suitability scoring, strictly separated 4-metric valuation boundaries, and confidential revenue document verification for Tamil Nadu land parcels.
            </motion.p>

            {/* Search Input Bar */}
            <motion.form
              variants={itemVariants}
              onSubmit={handleHeroSearch}
              className="mt-8 p-2 sm:p-2.5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/80 shadow-soft dark:shadow-card-dark flex flex-col sm:flex-row items-center gap-2 max-w-2xl mx-auto"
            >
              {/* District Select */}
              <div className="w-full sm:w-44 flex-shrink-0">
                <select
                  value={searchDistrict}
                  onChange={(e) => setSearchDistrict(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                >
                  <option value="all">All Districts (TN)</option>
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Keyword Search */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Village, Taluk, Survey #, or Title..."
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl text-xs sm:text-sm bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full sm:w-auto flex-shrink-0 shadow-sm"
              >
                <span>Find Land</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.form>

            {/* Real Database Metrics Ribbon (Zero Fabrication) */}
            <motion.div
              variants={itemVariants}
              className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto border-t border-slate-200/80 dark:border-navy-800"
            >
              <div className="text-center">
                <div className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white">
                  <AnimatedCounter targetValue={realMetrics.totalListings} />
                </div>
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Real Parcels Listed
                </div>
              </div>

              <div className="text-center">
                <div className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white">
                  <AnimatedCounter targetValue={realMetrics.districtsCount} />
                </div>
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  TN Districts Active
                </div>
              </div>

              <div className="text-center">
                <div className="font-heading font-extrabold text-xl sm:text-2xl text-teal-600 dark:text-teal-400">
                  4 Pillars
                </div>
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  0–100 Pure Scoring
                </div>
              </div>

              <div className="text-center">
                <div className="font-heading font-extrabold text-xl sm:text-2xl text-cyan-600 dark:text-cyan-400">
                  0% Fake
                </div>
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Strict Data Integrity
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 2. 4 Deterministic Analysis Pillars Section */}
      <section className="py-16 sm:py-24 bg-white dark:bg-navy-900 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Deterministic Scoring Engine
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Four Pillars of Land Intelligence
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              Every parcel is mathematically evaluated on 4 distinct pillars (0–25 points each), summing to a total score of 0–100 with zero speculative projections.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Pillar 1: Location & Access',
                score: '0 – 25 pts',
                desc: 'Straight-line road width, proximity to State/National highways, freight corridors, and civic transit nodes.',
                icon: Compass,
                color: 'text-teal-600 dark:text-teal-400',
                bg: 'bg-teal-50 dark:bg-teal-950/60',
              },
              {
                title: 'Pillar 2: Water & Soil',
                score: '0 – 25 pts',
                desc: 'Borewell yield depth, open-well access, seasonal water table, soil classification (Red, Alluvial, Black), and agricultural viability.',
                icon: Droplets,
                color: 'text-cyan-600 dark:text-cyan-400',
                bg: 'bg-cyan-50 dark:bg-cyan-950/60',
              },
              {
                title: 'Pillar 3: Title & Cadastre',
                score: '0 – 25 pts',
                desc: 'Patta/Chitta registry, survey sub-division clarity, 15+ year Encumbrance Certificate (EC) history, and litigation risk check.',
                icon: FileCheck2,
                color: 'text-emerald-600 dark:text-emerald-400',
                bg: 'bg-emerald-50 dark:bg-emerald-950/60',
              },
              {
                title: 'Pillar 4: Development Feasibility',
                score: '0 – 25 pts',
                desc: 'Zoning compatibility, DTCP / CMDA master plan compliance, panchayat approvals, and realistic future conversion potential.',
                icon: Building,
                color: 'text-purple-600 dark:text-purple-400',
                bg: 'bg-purple-50 dark:bg-purple-950/60',
              },
            ].map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <Card
                  key={idx}
                  hoverLift={true}
                  className="p-5 sm:p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className={`w-12 h-12 rounded-2xl ${pillar.bg} ${pillar.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {pillar.title}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                      {pillar.desc}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-400">Score Range:</span>
                    <span className="font-mono text-teal-600 dark:text-teal-400">{pillar.score}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Four-Metric Valuation Strict Separation Showcase */}
      <section className="py-16 sm:py-24 bg-slate-50 dark:bg-navy-950 border-t border-b border-slate-200/80 dark:border-navy-800 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              Pricing Transparency
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Four Strictly Separated Valuation Metrics
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              We never blend asking prices with government rates or black-box predictions. Each metric is independently labeled and verified.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                num: '1',
                title: 'Asking Price',
                sub: 'Seller Quotation',
                desc: 'Direct listing price quoted by landowner, normalized into INR per Sq Ft and INR per Cent.',
                badge: 'Seller-Provided',
                badgeColor: 'amber',
              },
              {
                num: '2',
                title: 'Guideline Value',
                sub: 'TN Government Base',
                desc: 'Official Registration Department benchmark rate for the survey number and revenue village.',
                badge: 'Verified Ground Truth',
                badgeColor: 'teal',
              },
              {
                num: '3',
                title: 'Observed Value',
                sub: 'Sub-Registrar Registry',
                desc: 'Recent registered sale deed comparables within a 15 km geographic radius.',
                badge: 'Cadastral Evidence',
                badgeColor: 'emerald',
              },
              {
                num: '4',
                title: 'AI Indicative Range',
                sub: 'Deterministic Estimate',
                desc: 'Calculated ONLY when >= 3 verified comparables exist. Otherwise clearly states insufficient data.',
                badge: 'Algorithmic Bounds',
                badgeColor: 'cyan',
              },
            ].map((metric, i) => (
              <Card key={i} className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-navy-800 text-teal-700 dark:text-teal-300 font-mono font-bold text-xs flex items-center justify-center border border-teal-200 dark:border-navy-700">
                      {metric.num}
                    </span>
                    <Badge variant={metric.badgeColor} size="xs">
                      {metric.badge}
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {metric.title}
                  </h3>
                  <div className="text-[11px] font-semibold text-slate-400 mb-2">{metric.sub}</div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {metric.desc}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Proptech Call-to-Action */}
      <section className="py-16 sm:py-24 bg-white dark:bg-navy-900 transition-colors">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-navy-900 via-navy-850 to-charcoal-900 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                Decision Confidence
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                Ready to Experience Verified Land Discovery?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                Search verified Tamil Nadu land parcels on an interactive Leaflet map, review 4-pillar suitability reports, or list your parcel with our 6-step seller wizard.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  variant="cyan"
                  size="lg"
                  onClick={() => navigate('/buy')}
                  icon={Search}
                  className="w-full sm:w-auto"
                >
                  Explore Marketplace
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/sell')}
                  className="w-full sm:w-auto border-slate-600 text-white hover:bg-white/10"
                >
                  List Land (6-Step Wizard)
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
