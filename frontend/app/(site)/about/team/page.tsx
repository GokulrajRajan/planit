import type { Metadata } from "next";
import { getSiteSettings, getTeam } from "@/lib/site-data";
import { CtaBand, PageHero, Section } from "../../../components/site/page-kit";

export const metadata: Metadata = {
  title: "Our Team",
  description: "Meet the people at Planit.",
};

export default async function TeamPage() {
  const [settings, team] = await Promise.all([getSiteSettings(), getTeam()]);
  // Profiles appear only once real ones are added and the section is switched on in the admin panel.
  const showTeam = settings.visible_sections.team && team.length > 0;

  return (
    <main id="main">
      <PageHero
        crumbs={[{ label: "About Us", href: "" }, { label: "Our Team", href: "" }]}
        title="Our team"
        intro="The people you'll work with when you invest with Planit."
      />

      <Section tone="paper">
        {showTeam ? (
          <ul className="team-grid">
            {team.map((member) => (
              <li key={member.id} className="card team-card">
                {member.photo_url && (
                  // Photos can be hosted anywhere the admin chooses.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={member.photo_url} alt="" loading="lazy" />
                )}
                <h3>{member.name}</h3>
                {member.designation && <p className="team-card__role">{member.designation}</p>}
                {member.qualifications && <p className="team-card__quals">{member.qualifications}</p>}
                {member.bio && <p>{member.bio}</p>}
                {member.linkedin_url && (
                  <a className="card__more" href={member.linkedin_url} target="_blank" rel="noopener noreferrer">
                    LinkedIn profile →
                  </a>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-state">Team profiles will be published here soon.</p>
        )}
      </Section>

      <CtaBand cta={settings.cta} title="Talk to us" />
    </main>
  );
}
