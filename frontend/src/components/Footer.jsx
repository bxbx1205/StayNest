import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="w-full bg-surface-container-lowest border-t border-outline-variant/30">
      <div className="max-w-[1360px] mx-auto px-gutter pt-space-xl pb-space-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-space-lg mb-space-xl">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-space-sm mb-space-sm">
              <img alt="StayNest Brand Logo" className="h-7 w-auto object-contain" src="https://lh3.googleusercontent.com/aida/AEtjO1XlYijLMtk8Z8sfoSIrkYJMBp5iuqZYxcS6qywrNNTvSAxMsblSiemasw6ocSV7p0kPq6QPtVfqTNi9mWlah0JCzHR_GvFaa7_ZtzZQGxAtJWnzGydjUKomzGjdUuVZ5obsYQgZeHEZL9soxczLlYgQKPEYOnFfp68dlqV5DyeT525w9SPbsa_RmQBIqpvxHGnAjBncOq5FvyJAZiJ3d2R-28xkXWk-no73cYlxErzV" />
              <span className="font-headline-sm text-headline-sm text-on-surface">StayNest</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm mb-space-md">
              Curated sanctuaries and boutique escapes worldwide. Experiencing tranquil luxury, architectural refinement, and effortless hospitality across pristine global havens.
            </p>
            <div className="text-label-sm font-label-sm text-on-surface-variant">Concierge Assistance • Available 24/7</div>
          </div>
          <div className="lg:col-span-2">
            <h4 className="font-title-sm text-title-sm text-on-surface mb-space-sm">Hotel Locations</h4>
            <ul className="space-y-space-xs font-body-sm text-body-sm text-on-surface-variant">
              <li><Link to="#" className="hover:text-on-surface transition-colors">St. Moritz Sanctuary</Link></li>
              <li><Link to="#" className="hover:text-on-surface transition-colors">Amalfi Coastal Villa</Link></li>
              <li><Link to="#" className="hover:text-on-surface transition-colors">Kyoto Bamboo Pavilion</Link></li>
              <li><Link to="#" className="hover:text-on-surface transition-colors">Aspen Ridge Lodge</Link></li>
              <li><Link to="#" className="hover:text-on-surface transition-colors">Provençal Estate</Link></li>
            </ul>
          </div>
          <div className="lg:col-span-2">
            <h4 className="font-title-sm text-title-sm text-on-surface mb-space-sm">Concierge & Care</h4>
            <ul className="space-y-space-xs font-body-sm text-body-sm text-on-surface-variant">
              <li>
                <span className="block text-on-surface font-medium">Direct Line</span>
                <Link to="#" className="hover:text-on-surface transition-colors">+1 (800) 492-NEST</Link>
              </li>
              <li>
                <span className="block text-on-surface font-medium mt-space-xs">Private Enquiries</span>
                <Link to="#" className="hover:text-on-surface transition-colors">concierge@staynest.com</Link>
              </li>
              <li>
                <span className="block text-on-surface font-medium mt-space-xs">Guest Relations</span>
                <Link to="#" className="hover:text-on-surface transition-colors">VIP Arrival Lounge</Link>
              </li>
            </ul>
          </div>
          <div className="lg:col-span-4">
            <h4 className="font-title-sm text-title-sm text-on-surface mb-space-xs">The Private Gazette</h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-sm">
              Receive privileged access to off-market suites, seasonal unveilings, and curator portfolios.
            </p>
            <form className="flex flex-col sm:flex-row gap-2 max-w-md" onSubmit={e => e.preventDefault()}>
              <input className="flex-1 bg-surface-bright border border-outline-variant/40 rounded-lg px-4 py-2.5 font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-on-surface" placeholder="Enter your email" type="email" />
              <button className="bg-primary text-on-primary font-body-sm text-body-sm font-medium px-5 py-2.5 rounded-lg hover:bg-on-surface hover:text-on-primary transition-colors whitespace-nowrap min-h-[44px]" type="submit">Join Gazette</button>
            </form>
          </div>
        </div>
        <div className="pt-space-md border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-space-sm font-label-md text-label-md text-on-surface-variant">
          <div>© 2025 StayNest Hospitality Group Ltd. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <Link to="#" className="hover:text-on-surface transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-on-surface transition-colors">Terms of Service</Link>
            <Link to="#" className="hover:text-on-surface transition-colors">Cookie Preferences</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
