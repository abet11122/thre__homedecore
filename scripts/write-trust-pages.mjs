import fs from 'node:fs';
const files = {
  'src/pages/about.astro': `---
import PageLayout from '../layouts/PageLayout.astro';
import { SITE } from '../site';
---
<PageLayout title="About" eyebrow="About this site" description="How Small Cozy Home creates its decorating guides, uses stock photography and distinguishes general inspiration from documented projects." lede="Decorating references, with clear limits on what they demonstrate.">
  <p>{SITE.name} publishes home decorating and organization guides. The name <a href={'/author/' + SITE.authorSlug + '/'}>Editorial Team</a> is a publication byline. It is not a personal identity, professional qualification, or claim that a particular designer has tested these ideas.</p>
  <h2>How the archive is made</h2>
  <p>The archive includes programmatically generated drafts. A content review identified repeated passages and overlapping topics. Those drafts are excluded from the current archive while useful existing material is consolidated. A published guide offers general planning references; it should not be read as a record of an owner's personal project.</p>
  <p>A first-hand project, measurement, price, time estimate, review or quotation needs a traceable source before it can be presented as such. We do not supply invented personal experience or qualifications. Publication dates are the dates stored with the guides, rather than evidence of when a photographed room was built.</p>
  <h2>What the photographs show</h2>
  <p>The current guides use stock photographs for illustration. A stock photograph does not show work completed by this publication, and may illustrate a general atmosphere rather than every detail of a suggested layout. Hosting a copy on this site does not make it an original photograph. Source and license links accompany article photo credits where available.</p>
  <h2>Using a guide in your own home</h2>
  <p>Measure doors, drawers, walkways and the actual product before buying. Building conditions, lease terms and budgets vary. Follow the manufacturer's installation instructions and load limits, and ask a qualified installer when the wall construction or fixing method is uncertain.</p>
  <h2>Funding and corrections</h2>
  <p>Some product links earn a commission; a disclosure appears near those recommendations. Advertising is currently disabled. Read the <a href="/disclosure/">disclosure</a> and <a href="/privacy-policy/">privacy policy</a> for details.</p>
  <p>Send a correction, question about ownership, or image-credit concern through the <a href="/contact/">contact page</a>, including the relevant URL and supporting information.</p>
</PageLayout>
`,
  'src/pages/contact.astro': `---
import PageLayout from '../layouts/PageLayout.astro';
import { SITE } from '../site';
---
<PageLayout title="Contact" eyebrow="Get in touch" description="Contact Small Cozy Home by email about a guide, image credit, ownership, privacy request or correction. No web form submission is collected." lede="Questions and corrections by email.">
  <h2>Email</h2>
  <p>The contact address configured for this publication is <a href={'mailto:' + SITE.email}>{SITE.email}</a>. Include the page URL, what needs correcting, and any source or photograph that helps explain the issue.</p>
  <p><a class="btn btn-primary" href={'mailto:' + SITE.email + '?subject=Small%20Cozy%20Home%20enquiry'}>Open your email app</a></p>
  <p>This link opens your own email application. No message is submitted to this website and no delivery confirmation is shown here.</p>
  <h2>Image and privacy enquiries</h2>
  <p>Use the same address for image ownership or credit concerns, questions about the publication, and privacy requests. Please avoid sending confidential information that is not needed to handle the enquiry.</p>
  <h2>Domain email</h2>
  <p>A domain mailbox has not been configured here. Owner setup placeholder: <strong>[CONTACT EMAIL AT YOUR DOMAIN]</strong>. The configured email link above remains available.</p>
</PageLayout>
`,
  'src/pages/privacy-policy.astro': `---
import PageLayout from '../layouts/PageLayout.astro';
import { SITE } from '../site';
---
<PageLayout title="Privacy Policy" eyebrow="Legal" description="How Small Cozy Home handles browser-saved ideas, email enquiries and technical requests. Advertising and analytics scripts are currently disabled." lede="The data involved in reading this site and saving ideas." updated="October 14, 2026">
  <p>This policy covers {SITE.name} at {SITE.url}. Contact <a href={'mailto:' + SITE.email}>{SITE.email}</a> with privacy questions or requests.</p>
  <h2>Reading and saving ideas</h2>
  <p>There is no account, login or newsletter signup. The saved-ideas feature stores article identifiers in your browser's local storage. Clear saved ideas or site data in your browser to remove them; clearing storage can also remove other preferences for this site.</p>
  <h2>Email enquiries</h2>
  <p>Contact links open your email application rather than submitting a web form. If you send an email, the recipient and email service process your address, message and any attachments. Send only the information needed for your enquiry.</p>
  <h2>Technical requests</h2>
  <p>Delivering this site requires requests to its hosting provider, which may process IP addresses, browser information, request times and access logs. This page does not claim a particular hosting provider or retention period without owner confirmation.</p>
  <h2>Advertising, analytics and external services</h2>
  <p>This version does not load advertising or analytics scripts. It does not load the Pinterest tracking script or remote font stylesheets. Illustrative images are served from this site's own assets.</p>
  <p>Affiliate and other external links lead to websites with their own privacy policies. Using a Pinterest share button opens Pinterest only after you choose to use it. See the <a href="/disclosure/">disclosure</a> for information about affiliate links.</p>
  <h2>Requests and changes</h2>
  <p>You may contact the publication about information you have supplied or rights available under applicable law. The owner must verify the relevant records before responding; this policy makes no unsupported promise about a consent platform or automatic deletion service.</p>
  <p>This policy should be reviewed whenever the site's data practices change. Advertising or tracking must not be enabled on the basis of an unverified claim that consent tools are configured.</p>
</PageLayout>
`,
};
for(const [file,content] of Object.entries(files))fs.writeFileSync(file,content);
