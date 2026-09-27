import React, { useEffect } from "react";

export const LEGAL_PAGES = {
  terms: {
    id: "terms",
    title: "Terms of Service",
    badge: "Legal Agreement",
    lastUpdated: "March 2026",
    content: (
      <div className="legal-article">
        <section>
          <h3>1. Acceptance of Terms</h3>
          <p>
            By accessing or using <strong>BG Eraser</strong> (the "Service", "we", "us", or "our"), available at this website, you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you must discontinue the use of our Service immediately.
          </p>
          <p>
            These Terms apply to all visitors, users, and others who access or use the Service. We reserve the right to modify or replace these Terms at any time without prior notice. Your continued use of the Service following any revisions constitutes full acceptance of those changes.
          </p>
        </section>

        <section>
          <h3>2. Description of the Service</h3>
          <p>
            BG Eraser provides a free, client-side, AI-assisted image background removal utility powered by WebAssembly (WASM) neural networks that execute directly in your web browser. 
          </p>
          <p>
            <strong>Local Processing Architecture:</strong> Unlike traditional cloud-based SaaS editors, all computational tasks, neural inferences, canvas rendering, and pixel manipulations take place strictly on your local device hardware. We do not transmit, upload, inspect, or store your original or processed images on any remote server.
          </p>
        </section>

        <section>
          <h3>3. User Representations & Content Ownership</h3>
          <p>
            You retain 100% full ownership, copyright, and intellectual property rights to any images, graphics, or photographs you import into the Service.
          </p>
          <p>By using the Service, you represent and warrant that:</p>
          <ul>
            <li>You own or have obtained all necessary licenses, rights, and permissions to use and edit the images you process.</li>
            <li>Your use of the Service does not infringe upon any third party’s intellectual property, privacy, or proprietary rights.</li>
            <li>You will not use the Service to process unlawful, defamatory, obscene, harassing, hateful, or harmful imagery.</li>
          </ul>
        </section>

        <section>
          <h3>4. Prohibited Uses & Acceptable Conduct</h3>
          <p>You agree not to use the Service:</p>
          <ul>
            <li>In any way that violates any applicable local, national, or international law or regulation.</li>
            <li>To attempt to reverse-engineer, decompile, disable, or tamper with any security measures or license protections of the platform.</li>
            <li>To launch automated bots, denial-of-service (DDoS) floods, or automated scrapers designed to overload or degrade the website infrastructure.</li>
            <li>To resell or commercially white-label the Service directly as your own proprietary engine without explicit written permission.</li>
          </ul>
        </section>

        <section>
          <h3>5. "AS IS" Warranty Disclaimer</h3>
          <div className="legal-callout">
            <p>
              <strong>DISCLAIMER:</strong> THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, ACCURACY, QUALITY, OR NON-INFRINGEMENT.
            </p>
          </div>
          <p>
            We do not warrant that the Service will be uninterrupted, error-free, completely secure, or that edge-detection algorithms will achieve 100% flawless hair, fur, or translucent cutout accuracy on every photo.
          </p>
        </section>

        <section>
          <h3>6. Limitation of Liability</h3>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL THE OPERATORS, DEVELOPERS, AFFILIATES, OR PARTNERS OF BG ERASER BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES (INCLUDING LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES) ARISING FROM OR RELATED TO:
          </p>
          <ul>
            <li>Your access to, use of, or inability to access or use the Service;</li>
            <li>Any third-party conduct or content on the Service;</li>
            <li>Any loss, corruption, or degradation of image data on your local device.</li>
          </ul>
        </section>

        <section>
          <h3>7. Indemnification</h3>
          <p>
            You agree to defend, indemnify, and hold harmless BG Eraser, its developers, contractors, and affiliates from and against any and all claims, damages, liabilities, costs, losses, and legal fees arising from or related to your use of the Service, your violation of these Terms, or your violation of any rights of a third party.
          </p>
        </section>

        <section>
          <h3>8. Termination & Service Modifications</h3>
          <p>
            We reserve the right to modify, suspend, or terminate access to all or part of the Service at any time, with or without notice, for any reason, including maintenance, feature updates, or breach of these Terms.
          </p>
        </section>

        <section>
          <h3>9. Governing Law</h3>
          <p>
            These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions. Any legal action or dispute arising under these Terms shall be resolved exclusively in courts located within the jurisdiction of New Delhi, India.
          </p>
        </section>

        <section>
          <h3>10. Contact Information</h3>
          <p>
            If you have questions regarding these Terms of Service, please contact our legal team at{" "}
            <a href="mailto:support@devv.in" className="legal-email-link">support@devv.in</a>.
          </p>
        </section>
      </div>
    ),
  },

  general: {
    id: "general",
    title: "General Terms & Conditions",
    badge: "Business Policy",
    lastUpdated: "March 2026",
    content: (
      <div className="legal-article">
        <section>
          <h3>1. Scope of Application</h3>
          <p>
            These General Terms and Conditions ("GTC") govern the contractual relationship between BG Eraser and any user accessing our web utility. These provisions apply uniformly to private consumers, professional freelance creators, and commercial enterprises utilizing our free utilities.
          </p>
        </section>

        <section>
          <h3>2. Free Nature of the Platform</h3>
          <p>
            BG Eraser is provided as a 100% free tool. We do not require paid subscriptions, mandatory memberships, credit card entries, or paywalled tokens.
          </p>
          <p>
            Because we execute computations locally in your browser, our operating server infrastructure costs remain minimal. Monetization is achieved exclusively via non-intrusive contextual online advertising (such as Google AdSense) and voluntary open-source contributions.
          </p>
        </section>

        <section>
          <h3>3. Service Availability & Performance</h3>
          <p>
            While we strive to ensure maximum availability (aiming for 99.9% uptime), uninterrupted access cannot be technically guaranteed. System maintenance, updates, browser incompatibilities, WebAssembly API support in older devices, and network constraints may temporarily affect functionality.
          </p>
          <p>
            Hardware requirements: For optimal background removal velocity, modern browsers (Google Chrome 90+, Mozilla Firefox 89+, Safari 15+, Microsoft Edge 90+) supporting WebAssembly SIMD and WebGL/WebGPU acceleration are recommended.
          </p>
        </section>

        <section>
          <h3>4. User Obligations & Data Backup</h3>
          <p>
            You are exclusively responsible for maintaining external backups of all original source photographs. BG Eraser does not maintain a server database or recovery mechanism for lost files. Once your browser session or tab is closed, any transient canvas state or in-progress edits will be cleared from volatile device memory.
          </p>
        </section>

        <section>
          <h3>5. Intellectual Property Rights</h3>
          <p>
            All website trademarks, service marks, user interface designs, custom CSS styling, vector animations, codebases, and documentation are the proprietary intellectual property of BG Eraser and its contributors, protected by copyright and international intellectual property laws.
          </p>
        </section>

        <section>
          <h3>6. Severability Clause</h3>
          <p>
            If any provision of these GTC is deemed invalid, unlawful, or unenforceable by an authoritative court of competent jurisdiction, that specific provision shall be limited or severed to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
          </p>
        </section>

        <section>
          <h3>7. Amendments</h3>
          <p>
            We reserve the right to amend these GTC at our sole discretion. Any changes will be published directly on this page with an updated revision date.
          </p>
        </section>
      </div>
    ),
  },

  privacy: {
    id: "privacy",
    title: "Privacy Policy",
    badge: "GDPR & CCPA Compliant",
    lastUpdated: "March 2026",
    content: (
      <div className="legal-article">
        <div className="legal-highlight-box">
          <h4>🔒 Core Privacy Guarantee</h4>
          <p>
            <strong>Your images NEVER leave your device.</strong> When you drop or select a photo on BG Eraser, our AI neural model executes 100% inside your browser via client-side WebAssembly. Zero image pixels are transmitted to our servers or stored on third-party cloud disks.
          </p>
        </div>

        <section>
          <h3>1. Introduction & Overview</h3>
          <p>
            At BG Eraser, accessible from this website, one of our main priorities is the privacy of our visitors. This Privacy Policy document outlines the types of information that is collected and recorded by BG Eraser and how we use it, in strict accordance with the General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA), and global data protection standards.
          </p>
        </section>

        <section>
          <h3>2. Zero Image Upload Architecture</h3>
          <p>
            Traditional photo editors send your high-resolution images to cloud GPU datacenters where they may be inspected, logged, cached, or used to train third-party AI models. 
          </p>
          <p>
            <strong>BG Eraser is fundamentally different:</strong> We ship an optimized ONNX neural network weights file directly to your browser memory. Processing runs on your device's CPU/GPU via WebAssembly SIMD. No image data is ever transmitted, monitored, stored, or sold.
          </p>
        </section>

        <section>
          <h3>3. Information We Collect</h3>
          <p>We collect only minimal, non-personally identifiable technical metrics necessary to operate and maintain the website:</p>
          <ul>
            <li>
              <strong>Standard Server Log Files:</strong> Like most web servers, our hosting provider records standard web logs including Internet Protocol (IP) addresses, browser type, Internet Service Provider (ISP), date/time stamps, referring/exit pages, and number of clicks. These are not linked to any personally identifiable information and are used solely for analyzing trends, administering the site, and preventing DDoS attacks.
            </li>
            <li>
              <strong>Local Storage Data:</strong> We store a single key-value setting in your browser’s <code>localStorage</code> (<code>bgeraser_theme: "light" | "dark"</code>) to remember your chosen visual theme across page reloads. This data never leaves your browser.
            </li>
          </ul>
        </section>

        <section>
          <h3>4. Google DoubleClick DART Cookies & Third-Party Advertising</h3>
          <p>
            Google is a third-party vendor on our site. It uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to our site and other sites on the internet.
          </p>
          <p>
            Visitors may choose to decline the use of DART cookies by visiting the Google Ad and Content Network Privacy Policy at the following URL:{" "}
            <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="legal-ext-link">
              https://policies.google.com/technologies/ads
            </a>.
          </p>
          <p>
            Third-party ad servers or ad networks use technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on BG Eraser. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.
          </p>
          <p>
            <em>Note: BG Eraser has no access to or control over these cookies that are used by third-party advertisers.</em>
          </p>
        </section>

        <section>
          <h3>5. Third-Party Privacy Policies</h3>
          <p>
            BG Eraser's Privacy Policy does not apply to other advertisers or websites. Thus, we advise you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options.
          </p>
          <p>
            You can choose to disable cookies through your individual browser options. To know more detailed information about cookie management with specific web browsers, it can be found at the browsers' respective websites.
          </p>
        </section>

        <section>
          <h3>6. CCPA Privacy Rights (Do Not Sell My Personal Information)</h3>
          <p>Under the CCPA, California consumers have the right to:</p>
          <ul>
            <li>Request that a business disclose the categories and specific pieces of personal data that a business has collected about consumers.</li>
            <li>Request that a business delete any personal data about the consumer that a business has collected.</li>
            <li>Request that a business that sells a consumer's personal data, not sell the consumer's personal data.</li>
          </ul>
          <p>
            <strong>Our Pledge:</strong> We do not sell, rent, trade, or monetize personal user information under any circumstances. If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact us.
          </p>
        </section>

        <section>
          <h3>7. GDPR Data Protection Rights</h3>
          <p>We want to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:</p>
          <ul>
            <li><strong>The right to access</strong> – You have the right to request copies of your personal data.</li>
            <li><strong>The right to rectification</strong> – You have the right to request that we correct any information you believe is inaccurate.</li>
            <li><strong>The right to erasure</strong> – You have the right to request that we erase your personal data, under certain conditions.</li>
            <li><strong>The right to restrict processing</strong> – You have the right to request that we restrict the processing of your personal data, under certain conditions.</li>
            <li><strong>The right to object to processing</strong> – You have the right to object to our processing of your personal data, under certain conditions.</li>
            <li><strong>The right to data portability</strong> – You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</li>
          </ul>
        </section>

        <section>
          <h3>8. Children's Information (COPPA Compliance)</h3>
          <p>
            Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity.
          </p>
          <p>
            BG Eraser does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will do our best efforts to promptly remove such information from our records.
          </p>
        </section>

        <section>
          <h3>9. Contacting Our Data Protection Officer</h3>
          <p>
            For privacy inquiries, GDPR/CCPA requests, or technical audits, please reach out to us at:{" "}
            <a href="mailto:privacy@devv.in" className="legal-email-link">privacy@devv.in</a>.
          </p>
        </section>
      </div>
    ),
  },

  cookies: {
    id: "cookies",
    title: "Cookie Policy",
    badge: "Transparency Notice",
    lastUpdated: "March 2026",
    content: (
      <div className="legal-article">
        <section>
          <h3>1. What Are Cookies?</h3>
          <p>
            Cookies are small text files stored on your computer or mobile device when you visit a website. They are widely used to make websites work efficiently, save user interface preferences, and provide analytical reporting for website owners.
          </p>
        </section>

        <section>
          <h3>2. How We Use Cookies</h3>
          <p>BG Eraser utilizes cookies and browser local storage for the following specific purposes:</p>
          <ul>
            <li>
              <strong>Essential Preferences (Local Storage):</strong> We use HTML5 Local Storage to remember whether you selected Light Theme or Dark Theme (<code>bgeraser_theme</code>). This does not track personal identity.
            </li>
            <li>
              <strong>Advertising & Monetization Cookies (Google AdSense):</strong> Third-party advertising partners, including Google AdSense, use cookies to serve ads based on your visit to this website and other websites across the web. These cookies enable Google and its advertising partners to serve ads relevant to your interests.
            </li>
            <li>
              <strong>Anonymous Traffic Analytics:</strong> Aggregated, anonymized visit metrics to monitor website speed, peak visitor times, and geographic demand without tracking individual users.
            </li>
          </ul>
        </section>

        <section>
          <h3>3. Specific Cookies & Technologies We May Use</h3>
          <div className="legal-table-wrap">
            <table className="legal-table">
              <thead>
                <tr>
                  <th>Cookie / Storage Name</th>
                  <th>Type</th>
                  <th>Purpose</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>bgeraser_theme</code></td>
                  <td>Local Storage (First-Party)</td>
                  <td>Remembers Light or Dark mode UI preference</td>
                  <td>Persistent until cleared</td>
                </tr>
                <tr>
                  <td><code>__gads</code>, <code>__gpi</code></td>
                  <td>Advertising (Google AdSense)</td>
                  <td>Measures ad interactions, prevents ad fraud and ad over-delivery</td>
                  <td>Up to 13 months</td>
                </tr>
                <tr>
                  <td><code>IDE</code>, <code>ANID</code></td>
                  <td>Advertising (Google DoubleClick)</td>
                  <td>Delivers personalized or non-personalized display ads</td>
                  <td>Up to 1 year</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h3>4. How to Control and Delete Cookies</h3>
          <p>
            You have the full right to decide whether to accept or reject cookies. You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website, though some advertising features may not function optimally.
          </p>
          <p>To opt out of personalized advertising across the web:</p>
          <ul>
            <li>
              <strong>Google Ads Settings:</strong>{" "}
              <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="legal-ext-link">
                https://adssettings.google.com
              </a>
            </li>
            <li>
              <strong>Digital Advertising Alliance (DAA):</strong>{" "}
              <a href="https://optout.aboutads.info" target="_blank" rel="noopener noreferrer" className="legal-ext-link">
                https://optout.aboutads.info
              </a>
            </li>
            <li>
              <strong>European Interactive Digital Advertising Alliance (EDAA):</strong>{" "}
              <a href="https://www.youronlinechoices.com" target="_blank" rel="noopener noreferrer" className="legal-ext-link">
                https://www.youronlinechoices.com
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h3>5. Updates to This Cookie Policy</h3>
          <p>
            We may update this Cookie Policy from time to time in order to reflect changes to the cookies we use or for other operational, legal, or regulatory reasons. Please re-visit this Cookie Policy regularly to stay informed.
          </p>
        </section>
      </div>
    ),
  },

  imprint: {
    id: "imprint",
    title: "Imprint / Legal Notice",
    badge: "Impressum (EU/US Standards)",
    lastUpdated: "March 2026",
    content: (
      <div className="legal-article">
        <section>
          <h3>1. Information According to Legal Regulations</h3>
          <p>
            This website is an independent, free open-source AI productivity utility designed and operated for public benefit.
          </p>
          <div className="legal-meta-card">
            <p><strong>Platform Name:</strong> BG Eraser (AI In-Browser Background Remover)</p>
            <p><strong>Primary URL:</strong> <a href="/" className="legal-ext-link">https://bgeraser.devv.in</a></p>
            <p><strong>Project Lead & Developer:</strong> Dev Sharma</p>
            <p><strong>Engineering Jurisdiction:</strong> New Delhi, India</p>
            <p><strong>Official Contact Email:</strong> <a href="mailto:support@devv.in" className="legal-email-link">support@devv.in</a></p>
            <p><strong>Open-Source Repository:</strong> <a href="https://github.com/dev998889/bg-remover" target="_blank" rel="noopener noreferrer" className="legal-ext-link">github.com/dev998889/bg-remover</a></p>
          </div>
        </section>

        <section>
          <h3>2. Disclaimer of Liability for Content</h3>
          <p>
            As a service provider, we are responsible for our own content on these pages under general law. However, we are not obligated to monitor transmitted or stored third-party information or to investigate circumstances that indicate illegal activity. Obligations to remove or block the use of information under general laws remain unaffected.
          </p>
        </section>

        <section>
          <h3>3. Disclaimer for External Links</h3>
          <p>
            Our website may contain links to external websites of third parties, over whose contents we have no influence. Therefore, we cannot assume any liability for these external contents. The respective provider or operator of the pages is always responsible for the contents of the linked pages.
          </p>
        </section>

        <section>
          <h3>4. Copyright & DMCA Notice</h3>
          <p>
            The content, source code, logos, and graphics created by the site operators on these pages are subject to international copyright laws. Duplication, processing, distribution, or any form of commercialization beyond the scope of the copyright law requires the prior written consent of its respective author or creator.
          </p>
          <p>
            <strong>DMCA Takedown Notice:</strong> If you believe that your copyrighted work has been infringed on our website, please send a written notification to <a href="mailto:dmca@devv.in" className="legal-email-link">dmca@devv.in</a> with:
          </p>
          <ul>
            <li>Identification of the copyrighted work claimed to have been infringed;</li>
            <li>Identification of the material claimed to be infringing with sufficient detail for us to locate it;</li>
            <li>Your contact information (name, address, phone number, and email address);</li>
            <li>A statement of good faith belief that the disputed use is not authorized by the copyright owner;</li>
            <li>A statement under penalty of perjury that the information in your notice is accurate.</li>
          </ul>
        </section>

        <section>
          <h3>5. Dispute Resolution</h3>
          <p>
            We are neither obligated nor willing to participate in dispute settlement proceedings before a consumer arbitration board.
          </p>
        </section>
      </div>
    ),
  },
};

export default function LegalModal({ activeTab = "privacy", onClose, onSelectTab }) {
  const currentDoc = LEGAL_PAGES[activeTab] || LEGAL_PAGES.privacy;

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="legal-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="legal-modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Modal Top Bar */}
        <div className="legal-modal-header">
          <div className="legal-header-left">
            <button className="btn-legal-back" onClick={onClose} title="Back to BG Eraser App">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>Back to App</span>
            </button>
            <div className="legal-header-title-wrap">
              <h2>{currentDoc.title}</h2>
              <div className="legal-header-meta">
                <span className="legal-badge">{currentDoc.badge}</span>
                <span className="legal-updated">Last Updated: {currentDoc.lastUpdated}</span>
              </div>
            </div>
          </div>

          <div className="legal-header-right">
            <button
              className="btn-legal-print"
              onClick={() => window.print()}
              title="Print or Save this document as PDF"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              <span>Print / PDF</span>
            </button>
            <button className="btn-legal-close" onClick={onClose} title="Close window (Esc)" aria-label="Close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Legal Navigation Tabs Strip */}
        <div className="legal-nav-tabs">
          {Object.values(LEGAL_PAGES).map((page) => (
            <button
              key={page.id}
              className={`legal-tab-btn ${activeTab === page.id ? "active" : ""}`}
              onClick={() => onSelectTab(page.id)}
            >
              {page.title}
            </button>
          ))}
        </div>

        {/* Document Content Scroll Area */}
        <div className="legal-modal-body">
          <div className="legal-document-container">
            {currentDoc.content}

            <div className="legal-footer-signature">
              <div className="legal-sig-badge">🛡️ Verified Compliant</div>
              <p>
                BG Eraser adheres strictly to Google Publisher Policies, Google AdSense Webmaster Quality Guidelines, CCPA consumer rights, and European Union GDPR mandates.
              </p>
              <button className="btn-legal-return" onClick={onClose}>
                ✓ I Understand & Return to BG Eraser
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
