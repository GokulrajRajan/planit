import { describe, expect, it } from "vitest";
import { phoneLinks } from "./phone";

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
