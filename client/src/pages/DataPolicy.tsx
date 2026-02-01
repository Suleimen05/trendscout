import { Database, ExternalLink, Shield, Clock, Download, Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

export function DataPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Database className="h-8 w-8 text-green-500" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Data Policy</h1>
        </div>

        <Card>
          <CardContent className="pt-6 prose dark:prose-invert max-w-none">
            <p className="text-muted-foreground text-sm">Effective Date: January 15, 2026</p>
            <p className="text-muted-foreground text-sm mb-6">Last Updated: January 15, 2026</p>

            <p className="lead">
              This Data Policy explains how Rizko.ai collects, processes, stores, and protects data from your connected social media accounts. We are committed to transparency about our data practices and compliance with platform-specific API requirements.
            </p>

            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg my-6">
              <p className="text-sm m-0"><strong>Our Commitment:</strong> We only access data you explicitly authorize. We use official platform APIs with OAuth authentication. We never post on your behalf or access private messages.</p>
            </div>

            {/* Quick Reference Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8 not-prose">
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg flex items-start gap-3">
                <Shield className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm mb-1">Read-Only Access</h4>
                  <p className="text-xs text-muted-foreground">We never post, modify, or delete content on your accounts</p>
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg flex items-start gap-3">
                <Lock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm mb-1">Encrypted Storage</h4>
                  <p className="text-xs text-muted-foreground">OAuth tokens and data are encrypted at rest</p>
                </div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg flex items-start gap-3">
                <Clock className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm mb-1">7-Day Deletion</h4>
                  <p className="text-xs text-muted-foreground">Data from disconnected accounts deleted within 7 days</p>
                </div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg flex items-start gap-3">
                <Download className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-sm mb-1">Data Export</h4>
                  <p className="text-xs text-muted-foreground">Request a copy of your data at any time</p>
                </div>
              </div>
            </div>

            <h2>1. Data We Collect from Connected Accounts</h2>

            <p>When you connect your social media accounts using OAuth, we request only the minimum permissions necessary to provide our analytics service:</p>

            <h3>1.1 TikTok</h3>
            <p>Via the official TikTok for Developers API:</p>
            <table className="w-full border-collapse my-4">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left py-2 px-3">Data Type</th>
                  <th className="text-left py-2 px-3">Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-3">Profile information</td>
                  <td className="py-2 px-3">Display your username and profile picture in dashboard</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3">Video list</td>
                  <td className="py-2 px-3">Show your published content for analysis</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3">Video statistics</td>
                  <td className="py-2 px-3">Views, likes, comments, shares for performance tracking</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3">Follower count</td>
                  <td className="py-2 px-3">Track audience growth over time</td>
                </tr>
              </tbody>
            </table>
            <p className="text-sm"><strong>We do NOT access:</strong> Private messages, drafts, followers list, or any content from other accounts.</p>

            <h3>1.2 Instagram</h3>
            <p>Via the official Meta (Instagram) Graph API for Business/Creator accounts:</p>
            <table className="w-full border-collapse my-4">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left py-2 px-3">Data Type</th>
                  <th className="text-left py-2 px-3">Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-3">Business/Creator profile</td>
                  <td className="py-2 px-3">Display account information in dashboard</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3">Media objects</td>
                  <td className="py-2 px-3">List your posts, reels, and stories for analysis</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3">Insights & metrics</td>
                  <td className="py-2 px-3">Engagement data, reach, impressions</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3">Follower demographics</td>
                  <td className="py-2 px-3">Aggregated audience insights (if available)</td>
                </tr>
              </tbody>
            </table>
            <p className="text-sm"><strong>We do NOT access:</strong> Direct messages, comments (as separate entity), or personal profile data.</p>
            <p className="text-sm"><strong>Note:</strong> Instagram integration requires a Business or Creator account linked to a Facebook Page.</p>

            <h3>1.3 YouTube</h3>
            <p>Via the official YouTube Data API:</p>
            <table className="w-full border-collapse my-4">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left py-2 px-3">Data Type</th>
                  <th className="text-left py-2 px-3">Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-3">Channel information</td>
                  <td className="py-2 px-3">Display channel name and thumbnail</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3">Video list</td>
                  <td className="py-2 px-3">Show your uploaded videos for analysis</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3">Video analytics</td>
                  <td className="py-2 px-3">Views, watch time, likes, comments count</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3">Subscriber count</td>
                  <td className="py-2 px-3">Track channel growth</td>
                </tr>
              </tbody>
            </table>
            <p className="text-sm"><strong>We do NOT access:</strong> Private videos, unlisted videos, comment content, or subscriber identities.</p>
            <p className="text-sm"><strong>YouTube API Compliance:</strong> Our use complies with <a href="https://developers.google.com/youtube/terms/api-services-terms-of-service" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">YouTube API Services Terms of Service</a>. By connecting YouTube, you also agree to the <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google Privacy Policy</a>.</p>

            <h2>2. How We Use Your Data</h2>

            <h3>2.1 Primary Uses</h3>
            <ul>
              <li><strong>Dashboard Analytics:</strong> Display your content performance metrics</li>
              <li><strong>AI Recommendations:</strong> Generate personalized insights using Google Gemini</li>
              <li><strong>Trend Analysis:</strong> Track your performance over time</li>
              <li><strong>Comparison:</strong> Compare metrics across your connected platforms</li>
            </ul>

            <h3>2.2 What We Never Do</h3>
            <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg my-4">
              <ul className="text-sm mb-0">
                <li>Post, edit, or delete any content on your social media accounts</li>
                <li>Access your private messages or conversations</li>
                <li>Sell your data to third parties</li>
                <li>Share your individual analytics with other users</li>
                <li>Use your data for advertising purposes</li>
                <li>Build profiles or databases of your followers</li>
                <li>Collect data from accounts you haven't connected</li>
              </ul>
            </div>

            <h2>3. Data Storage and Security</h2>

            <h3>3.1 How We Store Your Data</h3>
            <ul>
              <li><strong>OAuth Tokens:</strong> Encrypted using AES-256, stored separately from other data</li>
              <li><strong>Analytics Data:</strong> Stored in encrypted databases with access controls</li>
              <li><strong>Backups:</strong> Encrypted backups with limited retention periods</li>
            </ul>

            <h3>3.2 Security Measures</h3>
            <ul>
              <li>TLS 1.3 encryption for all data in transit</li>
              <li>AES-256 encryption for data at rest</li>
              <li>Role-based access controls for internal systems</li>
              <li>Regular security audits and penetration testing</li>
              <li>Incident response procedures</li>
              <li>Compliance with platform-specific security requirements</li>
            </ul>

            <h3>3.3 Third-Party Processors</h3>
            <p>Your data may be processed by:</p>
            <ul>
              <li><strong>Cloud Infrastructure:</strong> For secure hosting and storage</li>
              <li><strong>Google Gemini:</strong> For AI-powered analytics (anonymized/aggregated where possible)</li>
              <li><strong>Stripe:</strong> For payment processing only</li>
            </ul>
            <p>All processors are bound by Data Processing Agreements and process data only as instructed by us.</p>

            <h2>4. Data Retention</h2>

            <table className="w-full border-collapse my-4">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left py-2 px-3">Scenario</th>
                  <th className="text-left py-2 px-3">Retention Period</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-3">Active account</td>
                  <td className="py-2 px-3">Data retained while account is active</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3">Account deletion</td>
                  <td className="py-2 px-3">All data deleted within <strong>30 days</strong></td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3">Platform disconnected</td>
                  <td className="py-2 px-3">Platform data deleted within <strong>7 days</strong></td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3">OAuth token expiry</td>
                  <td className="py-2 px-3">Tokens refreshed automatically or deleted if refresh fails</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3">Backup data</td>
                  <td className="py-2 px-3">Purged within <strong>90 days</strong> of deletion request</td>
                </tr>
              </tbody>
            </table>

            <h2>5. Your Data Rights</h2>

            <h3>5.1 Disconnect Accounts</h3>
            <p>You can disconnect any social media account at any time from the "Connect Accounts" page. When you disconnect:</p>
            <ul>
              <li>OAuth access is immediately revoked</li>
              <li>All data from that platform is deleted within 7 days</li>
              <li>Historical analytics for that platform are permanently removed</li>
            </ul>

            <h3>5.2 Data Export</h3>
            <p>You can request a copy of all your data in a machine-readable format (JSON). Contact <a href="mailto:privacy@rizko.ai" className="text-blue-500 hover:underline">privacy@rizko.ai</a> to request an export.</p>

            <h3>5.3 Data Deletion</h3>
            <p>You can request complete deletion of your data:</p>
            <ul>
              <li><strong>Self-Service:</strong> Delete your account from Settings to remove all data</li>
              <li><strong>Request:</strong> Use our <Link to="/data-deletion" className="text-blue-500 hover:underline">Data Deletion Request</Link> page</li>
              <li><strong>Email:</strong> Contact <a href="mailto:privacy@rizko.ai" className="text-blue-500 hover:underline">privacy@rizko.ai</a></li>
            </ul>

            <h3>5.4 Revoke from Platform</h3>
            <p>You can also revoke Rizko.ai's access directly from each platform:</p>
            <ul>
              <li><strong>TikTok:</strong> Settings → Security → Connected Apps</li>
              <li><strong>Instagram/Facebook:</strong> Settings → Security → Apps and Websites</li>
              <li><strong>Google/YouTube:</strong> <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline inline-flex items-center gap-1">Google Account Permissions <ExternalLink className="h-3 w-3" /></a></li>
            </ul>

            <h2>6. Platform API Compliance</h2>

            <p>We comply with the developer policies of each platform:</p>

            <h3>6.1 TikTok Developer Terms</h3>
            <ul>
              <li>We follow TikTok's <a href="https://www.tiktok.com/legal/page/global/tik-tok-developer-terms-of-service/en" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Developer Terms of Service</a></li>
              <li>We maintain technical and administrative safeguards as required</li>
              <li>We provide complete and accurate privacy disclosures</li>
              <li>We do not collect data for unauthorized purposes or build user profiles</li>
            </ul>

            <h3>6.2 Meta (Instagram) Platform Terms</h3>
            <ul>
              <li>We comply with <a href="https://developers.facebook.com/terms/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Meta Platform Terms</a></li>
              <li>We only process data as outlined in this policy</li>
              <li>We do not use data for discrimination, surveillance, or profiling</li>
              <li>We maintain all required privacy policy versions</li>
            </ul>

            <h3>6.3 YouTube API Services</h3>
            <ul>
              <li>We comply with <a href="https://developers.google.com/youtube/terms/developer-policies" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">YouTube Developer Policies</a></li>
              <li>Users must agree to YouTube Terms of Service</li>
              <li>We provide clear data deletion processes</li>
              <li>We display links to YouTube's Terms and Google's Privacy Policy</li>
              <li>We do not store user data indefinitely</li>
            </ul>

            <h2>7. Data Processing for AI Features</h2>

            <p>When you use AI-powered features:</p>
            <ul>
              <li>Your content data is processed by Google Gemini to generate insights</li>
              <li>We minimize personal data sent to AI systems</li>
              <li>AI processing occurs in real-time; data is not stored by the AI provider</li>
              <li>Generated insights are stored in your account for future reference</li>
            </ul>

            <h2>8. International Data Transfers</h2>

            <p>Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards:</p>
            <ul>
              <li>Standard Contractual Clauses (SCCs) for EU data transfers</li>
              <li>Compliance with EU-US Data Privacy Framework where applicable</li>
              <li>Data Processing Agreements with all third-party processors</li>
            </ul>

            <h2>9. Children's Data</h2>

            <p>Our Service is not intended for users under 13 (or 16 in the EEA). We do not knowingly collect data from children. Social media platforms have their own age requirements that users must meet.</p>

            <h2>10. Updates to This Policy</h2>

            <p>We may update this Data Policy to reflect changes in our practices or legal requirements. We will notify you of material changes via email and/or in-app notification.</p>

            <h2>11. Contact Us</h2>

            <p>For questions about this Data Policy or to exercise your data rights:</p>
            <ul>
              <li><strong>Privacy Inquiries:</strong> <a href="mailto:privacy@rizko.ai" className="text-blue-500 hover:underline">privacy@rizko.ai</a></li>
              <li><strong>Data Deletion:</strong> <Link to="/data-deletion" className="text-blue-500 hover:underline">Request Data Deletion</Link></li>
              <li><strong>General Support:</strong> <a href="mailto:support@rizko.ai" className="text-blue-500 hover:underline">support@rizko.ai</a></li>
            </ul>

            <h2>12. Related Policies</h2>

            <p>This Data Policy should be read together with:</p>
            <ul>
              <li><Link to="/privacy-policy" className="text-blue-500 hover:underline">Privacy Policy</Link> - How we handle all personal information</li>
              <li><Link to="/terms-of-service" className="text-blue-500 hover:underline">Terms of Service</Link> - Terms governing use of our Service</li>
            </ul>

            <h2>Platform Privacy Policies</h2>
            <p>For information about how the platforms themselves handle your data:</p>
            <ul>
              <li><a href="https://www.tiktok.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline inline-flex items-center gap-1">TikTok Privacy Policy <ExternalLink className="h-3 w-3" /></a></li>
              <li><a href="https://privacycenter.instagram.com/policy" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline inline-flex items-center gap-1">Instagram Privacy Policy <ExternalLink className="h-3 w-3" /></a></li>
              <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline inline-flex items-center gap-1">Google Privacy Policy <ExternalLink className="h-3 w-3" /></a></li>
              <li><a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline inline-flex items-center gap-1">YouTube Terms of Service <ExternalLink className="h-3 w-3" /></a></li>
            </ul>

            <p className="text-sm text-muted-foreground mt-8">
              By connecting your social media accounts to Rizko.ai, you acknowledge that you have read and understood this Data Policy.
            </p>
          </CardContent>
        </Card>

        <div className="text-center space-x-4">
          <Link to="/privacy-policy" className="text-blue-500 hover:underline">Privacy Policy</Link>
          <span className="text-muted-foreground">|</span>
          <Link to="/terms-of-service" className="text-blue-500 hover:underline">Terms of Service</Link>
          <span className="text-muted-foreground">|</span>
          <Link to="/" className="text-blue-500 hover:underline">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
