import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Search, Eye, Tag, ShoppingBag, ArrowRight, Lock, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const steps = [
  {
    icon: Search,
    number: '01',
    title: 'Discover MoaviaFragranse',
    description: 'Browse our curated feed of active authentic fragrances from top master perfumers and global brands. See teasers, notes, and details without signing up.',
    color: 'from-purple-500 to-indigo-500',
  },
  {
    icon: UserPlus,
    number: '02',
    title: 'Sign Up Free — Unlock Everything',
    description: 'Create a free account in 30 seconds. No credit card required. Once logged in, all prices, full descriptions, and direct seller links are instantly revealed across the entire platform.',
    color: 'from-secondary to-amber-500',
  },
  {
    icon: Eye,
    number: '03',
    title: 'See Full Details & Prices',
    description: 'View exact price ranges, complete sale descriptions, and countdown timers. Know exactly what\'s on sale, for how much, and until when — before you click through.',
    color: 'from-green-500 to-teal-500',
  },
  {
    icon: Globe,
    number: '04',
    title: 'Click Through to the Boutique',
    description: 'Hit "Shop This Item" and we\'ll take you directly to the partner\'s page. We log the click for our affiliate records — this is how we keep the platform free for you.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: ShoppingBag,
    number: '05',
    title: 'Or Buy Directly on MoaviaFragranse',
    description: 'Some products are available to purchase directly through MoaviaFragranse.com.au. Add to cart and checkout securely via Stripe — we handle fulfilment and dispatch.',
    color: 'from-pink-500 to-rose-500',
  },
];

const faqs = [
  { q: 'Is it free to use?', a: 'Yes — browsing is free for everyone. Creating an account is also free and unlocks full sale details, prices, and direct links.' },
  { q: 'Why do I need an account to see prices?', a: 'Price and link gating is how we protect our affiliate relationships and verify users are genuine shoppers. Registration takes under a minute.' },
  { q: 'Do you earn commission on my purchase?', a: 'When you click through to a partner and make a purchase, we may earn a small affiliate commission at no extra cost to you. This is how we fund the platform. Full disclosure is in our Terms of Use.' },
  { q: 'Are the listings real-time?', a: 'We source and verify product data manually, with a daily automated check for expired items and broken links. Prices and availability are always confirmed on the merchant\'s site at checkout.' },
  { q: 'Can I buy directly on MoaviaFragranse?', a: 'Yes — select products from partners can be purchased directly. Payments are processed securely by Stripe. We never handle your card details.' },
  { q: 'How do I report a stale or expired item?', a: 'Use the "Report" flag on any listing, or contact us at support@moaviafragranse.com.au. We review all reports within 24 hours.' },
];

const HowItWorks = () => (
  <div className="bg-background min-h-screen">
    {/* Hero */}
    <section className="pt-24 pb-16 text-center px-4">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
        <span className="text-[10px] font-bold uppercase tracking-widest text-secondary block mb-4">Platform Guide</span>
        <h1 className="text-4xl sm:text-6xl font-heading font-bold text-primary mb-5 leading-tight">
          How MoaviaFragranse<br />
          <span className="text-secondary">.com.au</span> Works
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto text-sm sm:text-base leading-relaxed mb-8">
          Premium perfumes and attars — all in one place. Sign up free and unlock prices, direct links, and curated fragrance selections.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link to="/register" className="btn btn-primary px-8 py-3.5 gap-2 text-sm">
            <UserPlus size={16} /> Create Free Account
          </Link>
          <Link to="/sales" className="btn border border-gray-200 text-primary hover:bg-gray-50 px-8 py-3.5 gap-2 text-sm">
            <Tag size={16} /> Browse Sales
          </Link>
        </div>
      </motion.div>
    </section>

    {/* Steps */}
    <section className="py-16 px-4">
      <div className="container max-w-4xl">
        <div className="flex flex-col gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 sm:p-10 flex flex-col sm:flex-row items-start gap-6 hover:shadow-md transition-shadow"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shrink-0 shadow-lg`}>
                <step.icon size={26} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[10px] font-black text-gray-300 tracking-widest">{step.number}</span>
                  <h2 className="text-xl font-heading font-bold text-primary">{step.title}</h2>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden sm:flex absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-gray-100 rounded-full items-center justify-center">
                  <ArrowRight size={14} className="text-gray-400 rotate-90" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Why free */}
    <section className="py-16 px-4 bg-primary text-white">
      <div className="container max-w-3xl text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <Lock size={32} className="mx-auto mb-5 text-secondary" />
          <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">Why Is It Free?</h2>
          <p className="text-white/70 leading-relaxed text-sm sm:text-base">
            MoaviaFragranse.com.au earns a small affiliate commission when you click through to a partner and make a purchase — at <strong className="text-white">no extra cost to you</strong>. This funds the platform and keeps it completely free. Account gating ensures clicks come from genuine shoppers, maintaining the quality of our affiliate relationships. Full disclosure in our{' '}
            <a href="/terms" className="text-secondary hover:underline">Terms of Use</a>.
          </p>
        </motion.div>
      </div>
    </section>

    {/* FAQ */}
    <section className="py-20 px-4">
      <div className="container max-w-3xl">
        <h2 className="text-3xl font-heading font-bold text-primary text-center mb-12">Frequently Asked Questions</h2>
        <div className="flex flex-col gap-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-6"
            >
              <h3 className="font-bold text-primary mb-2 text-sm">{faq.q}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{faq.q.includes('commission') ? <>{faq.a}</> : faq.a}</p>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm mb-4">Still have questions?</p>
          <Link to="/contact" className="btn btn-primary px-8 py-3.5 gap-2">
            <ArrowRight size={16} /> Contact Us
          </Link>
        </div>
      </div>
    </section>
  </div>
);

export default HowItWorks;
