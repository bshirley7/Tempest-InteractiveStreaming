'use client';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TermsOfService() {
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
              Terms of Service
            </h1>
            <p className="text-gray-400">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">1. Acceptance of Terms</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  By accessing or using Tempest's interactive streaming platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Service.
                </p>
                <p>
                  These Terms apply to all users of the Service, including viewers, content creators, and organizations.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">2. Description of Service</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Tempest provides an interactive streaming platform that enables:
                </p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>Live and on-demand video streaming</li>
                  <li>Interactive features including polls, Q&A, and real-time engagement</li>
                  <li>First-party data collection through viewer interactions</li>
                  <li>Analytics and insights for content creators and organizations</li>
                  <li>Advertising and monetization capabilities</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">3. User Accounts</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  To access certain features of the Service, you may need to create an account. You agree to:
                </p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>Provide accurate and complete information when creating your account</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                  <li>Be responsible for all activities that occur under your account</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">4. Acceptable Use</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:
                </p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>Upload, stream, or share content that is illegal, harmful, or violates others' rights</li>
                  <li>Harass, abuse, or harm other users of the Service</li>
                  <li>Attempt to gain unauthorized access to the Service or other users' accounts</li>
                  <li>Use the Service to distribute spam, malware, or other malicious content</li>
                  <li>Interfere with or disrupt the Service or servers connected to the Service</li>
                  <li>Violate any applicable laws or regulations</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">5. Content and Intellectual Property</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  <strong>Your Content:</strong> You retain ownership of content you upload or stream through the Service. By using the Service, you grant us a license to host, store, and distribute your content as necessary to provide the Service.
                </p>
                <p>
                  <strong>Our Content:</strong> The Service, including its design, functionality, and underlying technology, is owned by Tempest and protected by intellectual property laws.
                </p>
                <p>
                  <strong>Third-Party Content:</strong> You are responsible for ensuring you have the necessary rights to use any third-party content in your streams.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">6. Data Collection and Analytics</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  By using our interactive features (polls, Q&A, etc.), you acknowledge that:
                </p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>Your interactions may be collected and analyzed to provide insights</li>
                  <li>Anonymous, aggregated data may be shared with content creators and organizations</li>
                  <li>This data helps improve the Service and enhance user experience</li>
                  <li>You can opt-out of certain data collection activities as described in our Privacy Policy</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">7. Service Availability</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We strive to provide reliable service, but we cannot guarantee that the Service will be available at all times. The Service may be temporarily unavailable due to:
                </p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>Scheduled maintenance</li>
                  <li>Technical issues or system failures</li>
                  <li>Circumstances beyond our reasonable control</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">8. Termination</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We may terminate or suspend your access to the Service at any time, without prior notice, for conduct that we believe violates these Terms or is harmful to other users or the Service.
                </p>
                <p>
                  You may terminate your account at any time by contacting us or using account deletion features in the Service.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">9. Disclaimers and Limitation of Liability</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  <strong>Disclaimers:</strong> The Service is provided "as is" without warranties of any kind, either express or implied.
                </p>
                <p>
                  <strong>Limitation of Liability:</strong> To the maximum extent permitted by law, Tempest shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">10. Indemnification</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  You agree to indemnify and hold harmless Tempest from any claims, damages, or expenses arising from your use of the Service, your content, or your violation of these Terms.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">11. Governing Law</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  These Terms are governed by and construed in accordance with the laws of the United States, without regard to conflict of law principles.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">12. Changes to Terms</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We reserve the right to modify these Terms at any time. We will notify users of material changes by posting the updated Terms on our website and updating the "Last updated" date.
                </p>
                <p>
                  Your continued use of the Service after changes to the Terms constitutes acceptance of the new Terms.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-white">13. Contact Information</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <p>
                  <strong>Email:</strong> brandon.shirley@gmail.com<br />
                  <strong>Subject Line:</strong> Terms of Service Inquiry
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}