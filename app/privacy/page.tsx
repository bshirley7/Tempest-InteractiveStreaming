'use client';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Button */}
          <div className="mb-8">
            <Link href="/">
              <Button variant="ghost" className="text-gray-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-brand-purple to-brand-pink bg-clip-text text-transparent">
              Privacy Policy
            </h1>
            <p className="text-gray-400">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">1. Information We Collect</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We collect information to provide and improve our interactive streaming platform services:
                </p>
                <ul className="list-disc ml-6 space-y-2">
                  <li><strong>Account Information:</strong> When you create an account, we collect your email address and basic profile information.</li>
                  <li><strong>Usage Data:</strong> We collect information about how you interact with our platform, including video viewing habits, poll responses, and engagement metrics.</li>
                  <li><strong>Technical Information:</strong> We automatically collect device information, IP addresses, browser type, and other technical data necessary for platform functionality.</li>
                  <li><strong>Interactive Data:</strong> We collect responses to polls, Q&A interactions, and other engagement features to provide first-party data insights.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">2. How We Use Your Information</h2>
              <div className="text-gray-300 space-y-4">
                <p>We use the information we collect to:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>Provide and maintain our streaming platform services</li>
                  <li>Enable interactive features like polls and Q&A</li>
                  <li>Generate anonymous analytics and engagement insights</li>
                  <li>Improve our platform performance and user experience</li>
                  <li>Communicate with you about your account and platform updates</li>
                  <li>Ensure platform security and prevent misuse</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">3. Information Sharing</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We respect your privacy and do not sell your personal information. We may share information in the following circumstances:
                </p>
                <ul className="list-disc ml-6 space-y-2">
                  <li><strong>With Your Consent:</strong> We may share information when you explicitly agree to such sharing.</li>
                  <li><strong>Anonymous Analytics:</strong> We may share aggregated, anonymous engagement data with content creators and organizations.</li>
                  <li><strong>Service Providers:</strong> We work with third-party providers who help us operate our platform (hosting, analytics, etc.).</li>
                  <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights and users.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">4. Data Security</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We implement appropriate security measures to protect your information, including:
                </p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments and updates</li>
                  <li>Access controls and authentication requirements</li>
                  <li>Secure cloud infrastructure and hosting</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">5. Your Rights</h2>
              <div className="text-gray-300 space-y-4">
                <p>You have the following rights regarding your personal information:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li><strong>Access:</strong> You can request access to the personal information we have about you.</li>
                  <li><strong>Correction:</strong> You can request that we correct inaccurate information.</li>
                  <li><strong>Deletion:</strong> You can request that we delete your personal information, subject to certain exceptions.</li>
                  <li><strong>Data Portability:</strong> You can request a copy of your data in a portable format.</li>
                  <li><strong>Opt-Out:</strong> You can opt-out of certain data collection and processing activities.</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">6. Cookies and Tracking</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We use cookies and similar technologies to enhance your experience on our platform. This includes:
                </p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>Essential cookies for platform functionality</li>
                  <li>Analytics cookies to understand platform usage</li>
                  <li>Performance cookies to optimize streaming quality</li>
                </ul>
                <p>You can manage cookie preferences through your browser settings.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">7. Children's Privacy</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Our platform is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it promptly.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">8. Changes to This Policy</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">9. Contact Us</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  If you have any questions about this Privacy Policy or our data practices, please contact us at:
                </p>
                <p>
                  <strong>Email:</strong> brandon.shirley@gmail.com<br />
                  <strong>Subject Line:</strong> Privacy Policy Inquiry
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}