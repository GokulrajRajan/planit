import Link from "next/link";
import { HOW_IT_WORKS, type ProductCategory, type ProductPage } from "@/lib/content/services";
import type { SiteSettings } from "@/lib/site-data";
import { EnquiryForm } from "./EnquiryForm";
import { CheckList, FaqList, Note, Section, Steps } from "./page-kit";

type Tone = "paper" | "cream";

/**
 * The body of a category or product page (app/(site)/[category]): opening copy, extra sections, who it's
 * for, how it works, FAQs and the enquiry form. Sections alternate paper and cream, starting with paper.
 */
export function ProductBody({
  content,
  cards,
  related,
  settings,
}: {
  content: ProductCategory | ProductPage;
  /** A category's pages, shown as cards after the opening copy. */
  cards?: { title: string; summary: string; href: string }[];
  /** Links beside the enquiry form. */
  related: { title: string; links: { label: string; href: string }[] };
  settings: SiteSettings;
}) {
  let index = 0;
  const tone = (): Tone => (index++ % 2 === 0 ? "paper" : "cream");

  const opening = (
    <div className="prose">
      {content.heading && <h2 className="section-title section-title--small">{content.heading}</h2>}
      {content.intro.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      {content.signoff && (
        <p>
          <strong>{content.signoff}</strong>
        </p>
      )}
      {/* Pages with a "Who it's for" section link the calculator there instead. */}
      {content.calculator && !content.goodFor && (
        <p className="section-link">
          Try our <Link href={content.calculator.href}>{content.calculator.label}</Link> for an illustrative estimate.
        </p>
      )}
      {content.note && <Note>{content.note}</Note>}
      {content.disclaimer && (
        <Note>
          <strong>Disclaimer:</strong> {content.disclaimer}
        </Note>
      )}
    </div>
  );

  return (
    <>
      <Section tone={tone()}>
        {content.list ? (
          <div className="two-col">
            {opening}
            <div>
              <h2 className="section-title section-title--small">{content.list.title}</h2>
              <CheckList items={content.list.items} />
            </div>
          </div>
        ) : (
          opening
        )}
      </Section>

      {cards && cards.length > 0 && (
        <Section tone={tone()} title={`Explore ${content.title}`}>
          <div className="card-grid">
            {cards.map((card) => (
              <Link key={card.href} className="card" href={card.href}>
                <h3>{card.title}</h3>
                <p>{card.summary}</p>
                <span className="card__more">Learn more →</span>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {content.sections?.map((section) => {
        const body = (
          <div className="prose">
            {section.subtitle && (
              <p>
                <strong>{section.subtitle}</strong>
              </p>
            )}
            {section.body?.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        );
        return (
          <Section key={section.title} tone={tone()} title={section.title}>
            {section.items ? (
              <div className="two-col">
                {body}
                <CheckList items={section.items} />
              </div>
            ) : (
              body
            )}
          </Section>
        );
      })}

      {content.goodFor && (
        <Section tone={tone()} title="Who it's for">
          <CheckList items={content.goodFor} />
          {content.calculator && (
            <p className="section-link">
              Try our <Link href={content.calculator.href}>{content.calculator.label}</Link> to see an illustrative
              estimate.
            </p>
          )}
        </Section>
      )}

      {content.howItWorks && (
        <Section tone={tone()} title="How it works">
          <Steps steps={HOW_IT_WORKS} />
        </Section>
      )}

      {content.faqs && (
        <Section tone={tone()} title="Questions we often hear">
          <FaqList faqs={content.faqs} />
        </Section>
      )}

      <Section tone={tone()} id="enquiry" title={`Talk to us about ${content.title}`}>
        <div className="two-col">
          <EnquiryForm defaultService={content.enquiryValue} />
          <aside className="side-links">
            <h3>{related.title}</h3>
            <ul>
              {related.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
            {settings.visible_sections.client_login && settings.portal_url && (
              <p>
                Already a client?{" "}
                <a href={settings.portal_url} target="_blank" rel="noopener noreferrer">
                  Log in to your portal
                </a>
                .
              </p>
            )}
          </aside>
        </div>
      </Section>
    </>
  );
}
