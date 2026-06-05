import React from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

const TermsOfUse = () => (
  <div className="bg-background min-h-screen py-24">
    <div className="container max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-3">
          <FileText size={20} className="text-secondary" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">Legal</span>
        </div>
        <h1 className="text-4xl font-heading font-bold text-primary mb-2">Terms of Use</h1>
        <p className="text-gray-400 text-sm mb-12">Last updated: May 2026 | MoaviaFragranse.com.au</p>

        <div className="space-y-8 text-gray-600 leading-relaxed text-sm">

          <section>
            <h2 className="text-xl font-heading font-bold text-primary mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using MoaviaFragranse.com.au ("the Platform"), you agree to be bound by these Terms of Use. If you do not agree, please do not use the Platform. These terms are governed by the laws of New South Wales, Australia.</p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-primary mb-3">2. About the Platform</h2>
            <p>MoaviaFragranse.com.au is an aggregator platform that lists fragrances, attars, and products sourced from global retailers. We are an independent third party and are not affiliated with, endorsed by, or acting as agents for any listed merchant.</p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-primary mb-3">3. Affiliate Disclosure</h2>
            <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-5">
              <p className="font-bold text-primary mb-2">Important: Affiliate Relationships</p>
              <p>MoaviaFragranse.com.au participates in affiliate programs. When you click a "Shop This Sale" or external link and make a purchase, we may receive a commission from the merchant at no additional cost to you. All outbound click-throughs are tracked through our redirect system for this purpose. This does not influence which sales are listed or how they are presented.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-primary mb-3">4. User Accounts</h2>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>You must be 18 years or older to create an account.</li>
              <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
              <li>You must provide accurate and current information during registration.</li>
              <li>You may not create accounts for others or use the platform for commercial data harvesting.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-primary mb-3">5. Purchases & Payments</h2>
            <p>For products sold directly on MoaviaFragranse.com.au:</p>
            <ul className="list-disc pl-6 space-y-1.5 mt-3">
              <li>Payments are processed securely by Stripe. We never store card details.</li>
              <li>All prices are in Australian Dollars (AUD) and include GST where applicable.</li>
              <li>Orders are subject to availability. We reserve the right to cancel orders if stock is unavailable.</li>
              <li>Returns and refunds are handled in accordance with Australian Consumer Law.</li>
            </ul>
            <p className="mt-3">For external merchant purchases via affiliate links, the merchant's own terms, pricing, and returns policies apply.</p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-primary mb-3">6. Sale Accuracy & Currency</h2>
            <p>We strive to maintain accurate sale listings, but sale details (prices, dates, availability) are sourced from third-party merchants and may change without notice. We use an automated daily validation script to detect expired or stale listings, but we do not guarantee real-time accuracy. Always verify current pricing and availability on the merchant's website.</p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-primary mb-3">7. Gated Content</h2>
            <p>Full sale details, prices, and direct merchant links are only visible to registered users. Registration is free. Gating is implemented server-side and is a core feature of the platform. You agree not to attempt to circumvent this mechanism.</p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-primary mb-3">8. Prohibited Conduct</h2>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Scraping, crawling, or bulk downloading platform data without written permission</li>
              <li>Using the platform for spam, phishing, or fraudulent activity</li>
              <li>Attempting to reverse-engineer or circumvent platform security</li>
              <li>Posting false, misleading, or defamatory content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-primary mb-3">9. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, MoaviaFragranse.com.au is not liable for any indirect, incidental, or consequential damages arising from your use of the platform, including losses from merchant transactions, inaccurate sale information, or third-party website issues.</p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-primary mb-3">10. Intellectual Property</h2>
            <p>All platform content, design, code, and branding is the property of MoaviaFragranse.com.au. Merchant names, logos, and product images remain the property of their respective owners and are used for identification purposes under nominative fair use.</p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-primary mb-3">11. Changes to Terms</h2>
            <p>We reserve the right to update these terms at any time. Continued use of the platform after changes constitutes acceptance of the revised terms. Material changes will be communicated via email to registered users.</p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-primary mb-3">12. Contact</h2>
            <p>For legal enquiries: <a href="mailto:support@moaviafragranse.com.au" className="text-secondary hover:underline">support@moaviafragranse.com.au</a></p>
          </section>
        </div>
      </motion.div>
    </div>
  </div>
);

export default TermsOfUse;
