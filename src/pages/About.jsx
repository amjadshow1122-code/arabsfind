import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Globe, Award } from 'lucide-react';

const About = () => {
  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary py-32 relative overflow-hidden" style={{ backgroundColor: 'var(--color-primary)' }}>
        <div className="container relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-heading text-white mb-6"
          >
            Our Story
          </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-300 max-w-2xl mx-auto font-body"
            >
              Connecting fragrance lovers with premium perfumes, authentic attar oils, and traditional Islamic wear in one unified platform.
            </motion.p>
        </div>
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-6 h-full">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border-r border-white/20 h-full"></div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="section-padding bg-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <div>
              <span className="text-secondary font-bold uppercase tracking-[0.2em] text-sm mb-4 block" style={{ color: 'var(--color-secondary)' }}>Our Philosophy</span>
              <h2 className="text-4xl md:text-5xl mb-8 leading-tight">Authentic Perfumes & Attars — All In One Place</h2>
              <p className="text-gray-500 mb-6 leading-relaxed font-light">
                MoaviaFragranse.com.au was founded to aggregate the finest authentic fragrances, oud wood, and premium attars from the most respected master perfumers. We believe premium scents should be accessible without sacrificing authenticity.
              </p>
              <p className="text-gray-500 mb-10 leading-relaxed font-light">
                Our platform brings you closer to the authentic traditions of perfumery, connecting you directly to authorized artisans and global fragrance houses.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div className="flex flex-col gap-2">
                  <h4 className="text-3xl font-heading font-bold text-primary">50+</h4>
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Master Perfumers</p>
                </div>
                <div className="flex flex-col gap-2">
                  <h4 className="text-3xl font-heading font-bold text-primary">100%</h4>
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Authentic Oils</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1000" 
                alt="Luxury Perfume" 
                className="w-full h-[600px] object-cover rounded-sm shadow-md"
              />
              <div className="absolute -bottom-10 -left-10 bg-secondary p-10 hidden lg:block" style={{ backgroundColor: 'var(--color-secondary)' }}>
                <p className="text-white text-2xl font-heading italic max-w-[200px]">"The true beauty is in the essence."</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="section-padding bg-background">
        <div className="container text-center mb-16">
          <h2 className="text-4xl md:text-5xl mb-4">Our Core Values</h2>
          <div className="w-20 h-1 bg-secondary mx-auto" style={{ backgroundColor: 'var(--color-secondary)' }}></div>
        </div>
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="flex flex-col items-center text-center gap-6">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-secondary shadow-sm">
                <Shield size={32} />
              </div>
              <h3 className="text-xl font-heading font-bold">Authenticity</h3>
              <p className="text-sm text-gray-500 leading-relaxed font-light">Every fragrance on our platform is sourced directly from verified master perfumers, ensuring 100% genuine products and undiluted oils.</p>
            </div>
            <div className="flex flex-col items-center text-center gap-6">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-secondary shadow-sm">
                <Award size={32} />
              </div>
              <h3 className="text-xl font-heading font-bold">Curation</h3>
              <p className="text-sm text-gray-500 leading-relaxed font-light">We hand-select premium scents so you only see the finest perfumes, rare oud, and authentic attars.</p>
            </div>
            <div className="flex flex-col items-center text-center gap-6">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-secondary shadow-sm">
                <Users size={32} />
              </div>
              <h3 className="text-xl font-heading font-bold">Integrity</h3>
              <p className="text-sm text-gray-500 leading-relaxed font-light">We maintain strong relationships with global artisans and respect the craft behind every bottle.</p>
            </div>
            <div className="flex flex-col items-center text-center gap-6">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-secondary shadow-sm">
                <Globe size={32} />
              </div>
              <h3 className="text-xl font-heading font-bold">Crawl Security</h3>
              <p className="text-sm text-gray-500 leading-relaxed font-light">Our nightly automation crawlers review active sales constantly to eliminate stale links.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-heading italic text-primary mb-8 leading-relaxed">
              "Our mission is to bring the finest global fragrances, oud, and traditional wear into a single, trusted destination, making premium scents accessible and secure."
            </h2>
            <div className="w-12 h-[1px] bg-gray-200 mx-auto mb-8"></div>
            <span className="font-bold uppercase tracking-widest text-xs text-gray-400">Founding Vision, 2026</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
