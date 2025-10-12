import React from 'react'
import './TermsPrivacy.css'

export default function TermsPrivacy() {
  return (
    <div className="terms-privacy-container">
      <div className="terms-privacy-content">
        <header className="terms-header">
          <h1>Order of the Fallen Star Discord Bot</h1>
          <h2>Terms of Service & Privacy Policy</h2>
          <p className="last-updated">Last Updated: October 12, 2025</p>
        </header>

        <section className="terms-section">
          <h3>Terms of Service</h3>
          
          <div className="subsection">
            <h4>1. Acceptance of Terms</h4>
            <p>
              By using the Order of the Fallen Star Discord bot ("the Bot"), you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use the Bot.
            </p>
          </div>

          <div className="subsection">
            <h4>2. Description of Service</h4>
            <p>
              The Bot provides Discord server management features, Star Citizen organization tools, 
              and community interaction capabilities for members of the Order of the Fallen Star organization.
            </p>
          </div>

          <div className="subsection">
            <h4>3. User Conduct</h4>
            <ul>
              <li>You must not use the Bot for any illegal or unauthorized purposes</li>
              <li>You must not attempt to disrupt, damage, or interfere with the Bot's operation</li>
              <li>You must follow Discord's Terms of Service and Community Guidelines</li>
              <li>You must respect other users and maintain appropriate conduct</li>
            </ul>
          </div>

          <div className="subsection">
            <h4>4. Limitations and Restrictions</h4>
            <p>
              The Bot is provided "as is" without warranties of any kind. We reserve the right to:
            </p>
            <ul>
              <li>Modify or discontinue the Bot at any time</li>
              <li>Restrict access to users who violate these terms</li>
              <li>Update these terms with reasonable notice</li>
            </ul>
          </div>

          <div className="subsection">
            <h4>5. Liability</h4>
            <p>
              Order of the Fallen Star and its members are not liable for any damages resulting from 
              the use or inability to use the Bot. Use of the Bot is at your own risk.
            </p>
          </div>
        </section>

        <section className="privacy-section">
          <h3>Privacy Policy</h3>

          <div className="subsection">
            <h4>1. Information We Collect</h4>
            <p>The Bot may collect the following information:</p>
            <ul>
              <li>Discord user IDs and usernames</li>
              <li>Server IDs and channel information</li>
              <li>Message content when directly interacting with Bot commands</li>
              <li>User activity data related to Bot functionality</li>
            </ul>
          </div>

          <div className="subsection">
            <h4>2. How We Use Information</h4>
            <p>Collected information is used to:</p>
            <ul>
              <li>Provide and improve Bot functionality</li>
              <li>Manage organization membership and roles</li>
              <li>Facilitate community interaction and events</li>
              <li>Ensure compliance with server rules</li>
            </ul>
          </div>

          <div className="subsection">
            <h4>3. Information Sharing</h4>
            <p>
              We do not sell, trade, or share your personal information with third parties, except:
            </p>
            <ul>
              <li>When required by law or legal process</li>
              <li>With your explicit consent</li>
              <li>To protect the rights and safety of users</li>
            </ul>
          </div>

          <div className="subsection">
            <h4>4. Data Security</h4>
            <p>
              We implement reasonable security measures to protect collected data. However, 
              no method of transmission over the internet is 100% secure.
            </p>
          </div>

          <div className="subsection">
            <h4>5. Data Retention</h4>
            <p>
              We retain data only as long as necessary for Bot functionality. 
              Users may request data deletion by contacting us through Discord.
            </p>
          </div>

          <div className="subsection">
            <h4>6. Your Rights</h4>
            <p>You have the right to:</p>
            <ul>
              <li>Request information about data we have collected</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt out of data collection by not using the Bot</li>
            </ul>
          </div>
        </section>

        <section className="contact-section">
          <h3>Contact Information</h3>
          <p>
            If you have questions about these Terms of Service or Privacy Policy, 
            please contact us through our Discord server:
          </p>
          <a 
            href="https://discord.gg/3dhZ38nbNZ" 
            target="_blank" 
            rel="noopener noreferrer"
            className="contact-link"
          >
            Join Our Discord Server
          </a>
        </section>

        <footer className="terms-footer">
          <p>
            © 2025 Order of the Fallen Star. These terms are effective as of the date listed above 
            and may be updated periodically.
          </p>
        </footer>
      </div>
    </div>
  )
}
