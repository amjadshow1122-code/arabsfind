import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Mail, MapPin } from 'lucide-react';

const PrivacyPolicy = () => (
  <div className="bg-background min-h-screen py-24">
    <div className="container max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-3">
          <Shield size={20} className="text-secondary" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">Legal</span>
        </div>
        <h1 className="text-4xl font-heading font-bold text-primary mb-2">Privacy Policy</h1>
        <p className="text-gray-400 text-sm mb-12">Last updated: May 2026 | MoaviaFragranse.com.au</p>

        <div className="prose prose-sm max-w-none space-y-8 text-gray-600 leading-relaxed">

          <section>
            <h2 className="text-xl font-heading font-bold text-primary mb-3">1. About Us</h2>
            <p>MoaviaFragranse.com.au ("we", "us", "our") is an Australian fragrance sales aggregator. We are committed to protecting your personal information in accordance with the <em>Privacy Act 1988</em> (Cth) and the Australian Privacy Principles (APPs).</p>
            <div className="bg-gray-50 rounded-xl p-5 mt-4 text-sm space-y-1.5">
              <p className="flex items-center gap-2"><Mail size={14} className="text-secondary shrink-0" /> support@moaviafragranse.com.au</p>
              <p className="flex items-center gap-2"><MapPin size={14} className="text-secondary shrink-0" /> Australia</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-primary mb-3">2. Information We Collect</h2>
            <p>We collect information you provide directly, including:</p>
            <ul className="list-disc pl-6 space-y-1.5 mt-3">
              <li><strong>Account information:</strong> Name, email address, and password when you register.</li>
              <li><strong>Order information:</strong> Shipping address and order details when you purchase directly on our platform. Payment details are processed by Stripe — we never store card numbers.</li>
              <li><strong>Usage data:</strong> Pages visited, sale links clicked, search queries, and affiliate click tracking data.</li>
              <li><strong>Newsletter preferences:</strong> Email address and subscription topics if you sign up for marketing communications.</li>
              <li><strong>Cookies:</strong> Session cookies, preference cookies, and optional analytics cookies. See our <a href="/cookies" className="text-secondary hover:underline">Cookie Policy</a> for details.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-primary mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>To provide and improve the MoaviaFragranse.com.au platform</li>
              <li>To process your orders and send order confirmations</li>
              <li>To gate full sale details and prices behind a free account (data masking)</li>
              <li>To track affiliate click-outs for commission reconciliation</li>
              <li>To send transactional emails (order confirms, password resets)</li>
              <li>To send marketing newsletters, if you have opted in</li>
              <li>To detect and prevent fraud and abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-primary mb-3">4. Affiliate Disclosure</h2>
            <p>MoaviaFragranse.com.au earns affiliate commissions when you click through to partner boutique websites. All outbound links are tracked through our internal redirect system (<code>/go/sale/[id]</code>). This tracking logs your user ID, the sale or product clicked, the merchant, and the timestamp. This data is used solely for commission reconciliation and is never sold.</p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-primary mb-3">5. Data Sharing</h2>
            <p>We do not sell your personal data. We may share limited data with:</p>
            <ul className="list-disc pl-6 space-y-1.5 mt-3">
              <li><strong>Stripe:</strong> Payment processing. Governed by <a href="https://stripe.com/au/privacy" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">Stripe's Privacy Policy</a>.</li>
              <li><strong>Supabase:</strong> Our database and authentication provider.</li>
              <li><strong>Email service provider (ESP):</strong> Klaviyo or Mailchimp for newsletter delivery.</li>
              <li><strong>Analytics providers:</strong> Aggregate, anonymised analytics data only.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-primary mb-3">6. Your Rights</h2>
            <p>Under the Privacy Act 1988, you have the right to:</p>
            <ul className="list-disc pl-6 space-y-1.5 mt-3">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your account and associated data</li>
              <li>Opt out of marketing communications at any time (unsubscribe link in every email)</li>
            </ul>
            <p className="mt-3">To exercise these rights, contact us at <a href="mailto:support@moaviafragranse.com.au" className="text-secondary hover:underline">support@moaviafragranse.com.au</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-primary mb-3">7. Data Retention</h2>
            <p>We retain your account data for as long as your account is active. Order records are kept for 7 years for tax compliance. You may request deletion of your account at any time, subject to legal retention requirements.</p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-primary mb-3">8. Security</h2>
            <p>We implement industry-standard security measures including encrypted connections (HTTPS/TLS), hashed passwords, and row-level security on our database. Despite these measures, no online service can guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-primary mb-3">9. Changes to This Policy</h2>
            <p>We may update this policy from time to time. We'll notify registered users of material changes via email. Continued use of the platform after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-primary mb-3">10. Contact & Complaints</h2>
            <p>For privacy enquiries or complaints, contact us at <a href="mailto:support@moaviafragranse.com.au" className="text-secondary hover:underline">support@moaviafragranse.com.au</a>. If you are unsatisfied, you may lodge a complaint with the <a href="https://www.oaic.gov.au/" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">Office of the Australian Information Commissioner (OAIC)</a>.</p>
          </section>
        </div>
      </motion.div>
    </div>
  </div>
);

export default PrivacyPolicy;
