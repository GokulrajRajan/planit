import { Fragment } from "react";
import { phoneLinks } from "@/lib/phone";

/** One tappable link per number in a phone field such as "98406 61811 / 98407 61811". */
export function PhoneLinks({ phone }: { phone: string }) {
  return phoneLinks(phone).map((link, i) => (
    <Fragment key={link.href}>
      {i > 0 && " / "}
      <a className="whitespace-nowrap" href={link.href}>
        {link.label}
      </a>
    </Fragment>
  ));
}
