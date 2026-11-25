import { describe, expect, it } from "vitest";
import { CLIENT_ARN, phoneLinks, withClientInfo } from "./client-info";
import type { SiteSettings } from "./site-data";

/** Only the parts withClientInfo reads; everything in the admin panel is still empty. */
const settings = (office = {}, registration = {}, registrationOn = true) =>
  ({
    office: { address_line1: null, address_line2: null, city: null, state: null, pincode: null, phone: null, email: null, ...office },
    registration: { arn: null, euin: null, ...registration },
    sections: { registration_details: registrationOn },
    visible_sections: { registration_details: false, office_map: false },
  }) as unknown as SiteSettings;

describe("client details", () => {
  it("fill what the admin panel hasn't been given", () => {
    const result = withClientInfo(settings());
    expect(result.office).toMatchObject({ address_line1: "No. 90, P S Sivaswamy Salai", city: "Chennai", pincode: "600004", email: null });
    expect(result.office.phone).toContain("98406 61811");
    expect(result.registration.arn).toBe(CLIENT_ARN);
    expect(result.visible_sections).toEqual({ registration_details: true, office_map: false });
  });

  it("give way to values saved in the admin panel", () => {
    const result = withClientInfo(settings({ phone: "044 1234 5678" }, { arn: "ARN-1" }));
    expect(result.office.phone).toBe("044 1234 5678");
    expect(result.registration.arn).toBe("ARN-1");
  });

  it("never mix with an address typed in the admin panel", () => {
    const { office } = withClientInfo(settings({ address_line1: "12 New Street", city: "Coimbatore" }));
    expect(office).toMatchObject({ address_line1: "12 New Street", address_line2: null, city: "Coimbatore", pincode: null });
  });

  it("respect the admin's switch for the registration details", () => {
    expect(withClientInfo(settings({}, {}, false)).visible_sections.registration_details).toBe(false);
  });
});

describe("phone links", () => {
  it("make one tel: link per number", () => {
    expect(phoneLinks("+91 98406 61811 / +91 98407 61811")).toEqual([
      { label: "+91 98406 61811", href: "tel:+919840661811" },
      { label: "+91 98407 61811", href: "tel:+919840761811" },
    ]);
  });

  it("add the country code to a bare mobile number only", () => {
    expect(phoneLinks("9840661811")).toEqual([{ label: "9840661811", href: "tel:+919840661811" }]);
    expect(phoneLinks("1800 123 456")).toEqual([{ label: "1800 123 456", href: "tel:1800123456" }]);
    expect(phoneLinks("")).toEqual([]);
  });
});
