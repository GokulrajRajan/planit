import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/site-data";
import { EnquiryForm } from "../../components/site/EnquiryForm";
import { PageHero, Section } from "../../components/site/page-kit";
import { SocialLinks } from "../../components/site/SocialLinks";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Book a free consultation with Planit, or send us your question.",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const { office, visible_sections: visible } = settings;
  const cityLine = [office.city, office.state].filter(Boolean).join(", ");
  const addressLines = [office.address_line1, office.address_line2, [cityLine, office.pincode].filter(Boolean).join(" ")].filter(
    Boolean,
  );
  const hasDetails = addressLines.length > 0 || office.phone || office.email || office.hours;

  return (
    <main id="main">
      <PageHero
        crumbs={[{ label: "Contact Us", href: "" }]}
        title="Book a free consultation"
        intro="Tell us a little about yourself and what you'd like help with. We'll get back to you to find a time that suits you."
      />

      <Section tone="paper">
        <div className="two-col">
          <div id="enquiry">
            <h2 className="section-title section-title--small">Send us a message</h2>
            <EnquiryForm />
          </div>

          <aside className="contact-details">
            {hasDetails ? (
              <>
                <h2 className="section-title section-title--small">Visit or call</h2>
                <address>
                  {office.legal_name && <strong>{office.legal_name}</strong>}
                  {addressLines.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </address>
                <dl>
                  {office.phone && (
                    <>
                      <dt>Phone</dt>
                      <dd>
                        <a href={`tel:${office.phone.replace(/[^\d+]/g, "")}`}>{office.phone}</a>
                      </dd>
                    </>
                  )}
                  {office.email && (
                    <>
                      <dt>Email</dt>
                      <dd>
                        <a href={`mailto:${office.email}`}>{office.email}</a>
                      </dd>
                    </>
                  )}
                  {office.hours && (
                    <>
                      <dt>Hours</dt>
                      <dd>{office.hours}</dd>
                    </>
                  )}
                </dl>
                {office.google_business_url && (
                  <a className="card__more" href={office.google_business_url} target="_blank" rel="noopener noreferrer">
                    Find us on Google →
                  </a>
                )}
              </>
            ) : (
              <p className="empty-state">Our office details will be published here soon. Meanwhile, send us a message.</p>
            )}
            {visible.social_links && (
              <>
                <h3>Follow us</h3>
                <SocialLinks links={settings.social_links} />
              </>
            )}
          </aside>
        </div>
      </Section>

      {visible.office_map && office.map_embed_url && (
        <Section title="Find us">
          <iframe
            className="map-frame"
            src={office.map_embed_url}
            title="Map showing the Planit office"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </Section>
      )}
    </main>
  );
}
