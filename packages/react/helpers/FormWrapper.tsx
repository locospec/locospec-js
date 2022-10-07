import React from "react";
import {
  DataTableBase,
  NavigationPageHeading,
  ButtonBase,
} from "@reusejs/react";
import { CheckIcon, ChevronRightIcon, HomeIcon } from "@heroicons/react/solid";
import Link from "next/link";

const NextJSLink = (props: any) => {
  let { href, children, ...rest } = props;
  return (
    <Link href={href}>
      <a {...rest}>{children}</a>
    </Link>
  );
};

export default function FormWrapper({
  resourceSpec = {},
  title = "",
  description = "",
  helpContent = "",
  ...props
}: {
  resourceSpec: any;
  title?: any;
  description?: any;
  helpContent?: any;
  children: any;
}) {
  return (
    <div>
      <NavigationPageHeading
        linkRenderer={NextJSLink}
        titleText={() => (
          <div className="mt-2 text-xl text-gray-700 dark:text-gray-200">
            {title}
          </div>
        )}
        helperText={() => (
          <div className="mt-2 text-xs text-gray-700 dark:text-gray-200">
            {description}
          </div>
        )}
        homeIcon={HomeIcon}
        breadcrumbs={[
          {
            title: "Events",
            href: `/${resourceSpec?.name}`,
            home: true,
          },
        ]}
      />

      <div className="mt-5">{props.children}</div>
    </div>
  );
}
