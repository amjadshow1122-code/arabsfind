import React from 'react';
import { motion } from 'framer-motion';
import { Cookie } from 'lucide-react';

const CookiePolicy = () => (
  <div className="bg-background min-h-screen py-24">
    <div className="container max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-3">
          <Cookie size={20} className="text-secondary" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">Legal</span>
        </div>
        <h1 className="text-4xl font-heading font-bold text-primary mb-2">Cookie Policy</h1>
        <p className="text-gray-400 text-sm mb-12">Last updated: May 2026 | Al-Moavia Fragrance.com</p>

        <div className="space-y-8 text-gray-600 leading-relaxed text-sm">

          <section>
            <h2 className="text-xl font-heading font-bold text-primary mb-3">What Are Cookies?</h2>
            <p>Cookies are small text files stored on your device when you visit a website. They help us remember your preferences, keep you logged in, and understand how the platform is used.</p>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-primary mb-3">Cookies We Use</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse mt-2">
                <thead>
                  <tr className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-400">
                    <th className="text-left px-4 py-3 font-bold">Category</th>
                    <th className="text-left px-4 py-3 font-bold">Purpose</th>
                    <th className="text-left px-4 py-3 font-bold">Required?</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { cat: 'Strictly Necessary', purpose: 'Session management, authentication (Supabase JWT), CSRF protection', req: 'Yes — cannot opt out' },
                    { cat: 'Functional', purpose: 'Remembering your cart, currency preferences, and display settings', req: 'Yes' },
                    { cat: 'Performance / Analytics', purpose: 'Aggregate, anonymised data about how pages are used to improve the platform', req: 'Optional' },
                    { cat: 'Affiliate Tracking', purpose: 'Tracking click-outs to partner merchants for commission reconciliation (session_id only)', req: 'Yes — core to service' },
                  ].map(row => (
                    <tr key={row.cat} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-bold text-primary">{row.cat}</td>
                      <td className="px-4 py-3">{row.purpose}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${row.req.includes('Optional') ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'}`}>
                          {row.req}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-primary mb-3">Managing Cookies</h2>
            <p>You can control cookies through your browser settings. Note that disabling strictly necessary cookies may prevent you from logging in or using core features. Most browsers allow you to:</p>
            <ul className="list-disc pl-6 space-y-1.5 mt-3">
              <li>View and delete existing cookies</li>
              <li>Block cookies from specific sites</li>
              <li>Set your browser to notify you when cookies are set</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-primary mb-3">Third-Party Cookies</h2>
            <p>Some third-party services we use may set their own cookies:</p>
            <ul className="list-disc pl-6 space-y-1.5 mt-3">
              <li><strong>Stripe:</strong> Set during the checkout process for fraud prevention</li>
              <li><strong>Email providers (Klaviyo/Mailchimp):</strong> Set if you click links in our emails</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-heading font-bold text-primary mb-3">Questions?</h2>
            <p>Contact us at <a href="mailto:support@al-moavia fragrance.com" className="text-secondary hover:underline">support@al-moavia fragrance.com</a>. For more on our data practices, see our <a href="/privacy" className="text-secondary hover:underline">Privacy Policy</a>.</p>
          </section>
        </div>
      </motion.div>
    </div>
  </div>
);

export default CookiePolicy;
