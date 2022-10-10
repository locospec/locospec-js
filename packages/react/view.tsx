import React, { useEffect, useState, useMemo } from "react";
import { callLoco, getByUuid } from "./helpers/callLoco";
import {
  DataTableBase,
  NavigationPageHeading,
  ButtonBase,
  FileBrowser,
} from "@reusejs/react";
import { CheckIcon, ChevronRightIcon, HomeIcon } from "@heroicons/react/solid";
import Link from "next/link";
import resolveByDot from "./helpers/resolveByDot";
import { DateTime } from "luxon";

const NextJSLink = (props: any) => {
  let { href, children, ...rest } = props;
  return (
    <Link href={href}>
      <a {...rest}>{children}</a>
    </Link>
  );
};

const ListPreview = ({
  items,
  valueKey = "name",
}: {
  items: any;
  valueKey: any;
}) => {
  return (
    <>
      {items.map((item: any, index: any) => (
        <li key={index}>{item[valueKey]}</li>
      ))}
    </>
  );
};

const View = ({
  resourceSpec,
  router,
  primaryIdentifier,
  routePrefix,
}: {
  resourceSpec: any;
  router: any;
  primaryIdentifier: any;
  routePrefix: any;
}) => {
  const [readOne, setReadOne] = useState<any>({});
  const [hasManyAttributes, setHasManyAttributes] = useState<any>([]);
  const [hasManyViaPivotAttributes, setHasManyViaPivotAttributes] =
    useState<any>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    console.log("view mounted");

    const attributes = resourceSpec.attributes;

    let hasManyAttributes = attributes
      .filter((c: any) => {
        return c.relation && c.relation.type === "has_many";
      })
      .map((c: any) => {
        return c;
      });

    setHasManyAttributes(hasManyAttributes);

    let hasManyViaPivotAttributes = attributes
      .filter((c: any) => {
        return c.relation && c.relation.type === "has_many_via_pivot";
      })
      .map((c: any) => {
        return c;
      });

    setHasManyViaPivotAttributes(hasManyViaPivotAttributes);

    (async () => {
      const response: any = await getByUuid(
        routePrefix,
        resourceSpec.name,
        primaryIdentifier
      );
      setReadOne(response);
      setReady(true);
    })();
  }, []);

  const HeadingActions = () => {
    // console.log("hasManyAttributes", hasManyAttributes);

    return (
      <div className="flex space-x-2">
        {hasManyAttributes.length > 0 &&
          hasManyAttributes
            .filter((attribute: any) => {
              return resolveByDot("ui.detail.display", attribute) === true;
            })
            .map((attribute: any) => {
              let params = attribute.relation.filter || {};
              params[attribute.relation.foreignKey] = primaryIdentifier;
              let filterByParams: any = {};
              for (const key in params) {
                if (Object.prototype.hasOwnProperty.call(params, key)) {
                  const element = params[key];
                  filterByParams[`filterBy-${key}`] = element;
                }
              }

              return (
                <ButtonBase
                  key={attribute.identifier}
                  type="button"
                  label={attribute.label}
                  onClick={() => {
                    router.push(
                      `/${attribute.relation.resource}?${new URLSearchParams(
                        filterByParams
                      ).toString()}`
                    );
                  }}
                />
              );
            })}

        {hasManyViaPivotAttributes.length > 0 &&
          hasManyViaPivotAttributes
            .filter((attribute: any) => {
              return resolveByDot("ui.detail.display", attribute) === true;
            })
            .map((attribute: any) => {
              let filterByParams: any = attribute.relation;

              return (
                <ButtonBase
                  key={attribute.identifier}
                  type="button"
                  label={attribute.label}
                  onClick={() => {
                    router.push(
                      `/${
                        resourceSpec.name
                      }/has-many-via-pivot/${primaryIdentifier}/${
                        attribute.relation.resource
                      }?${new URLSearchParams(filterByParams).toString()}`
                    );
                  }}
                />
              );
            })}
        <ButtonBase
          type="button"
          label="Edit"
          onClick={() => {
            router.push(`/${resourceSpec.name}/edit/${primaryIdentifier}`);
          }}
        />
      </div>
    );
  };

  const getValue = (attribute: any) => {
    let localValue: any = "-";
    let detailProps = resolveByDot(`ui.detail`, attribute);

    if (readOne[attribute.identifier] !== undefined) {
      if (attribute.relation) {
        if (attribute.ui.detail.displayKey === undefined) {
          localValue = readOne[attribute.identifier];
        } else {
          localValue = resolveByDot(
            `${attribute.ui.detail.displayKey}`,
            readOne[attribute.identifier]
          );
        }
      } else if (attribute.mutateFrom) {
        if (attribute.ui.detail.displayKey === undefined) {
          localValue = readOne[attribute.identifier];
        } else {
          localValue = resolveByDot(
            `${attribute.ui.detail.displayKey}`,
            readOne[attribute.identifier]
          );
        }
      } else {
        localValue = readOne[attribute.identifier];
      }
    } else {
    }

    if (resolveByDot("type", detailProps) === "date") {
      localValue = DateTime.fromISO(localValue).toFormat(
        "MMM dd, yyyy, hh:mm a"
      );
    }

    if (resolveByDot("type", detailProps) === "file") {
      // localValue = localValue.uuid;
    }

    if (resolveByDot("type", detailProps) === "boolean") {
      if (localValue === true) {
        localValue = "Yes";
      }
      if (localValue === false) {
        localValue = "No";
      }
      // console.log("localValue", localValue);
    }

    return localValue;
  };

  const formList = useMemo(
    () =>
      resourceSpec?.attributes
        ?.filter((attribute: any) => {
          return resolveByDot(`ui.detail.display`, attribute) === true;
        })
        .map((attribute: any, index: any) => (
          <div className="sm:col-span-2" key={index}>
            <dt className="text-xs font-medium text-gray-400 uppercase">
              {attribute.label.replace(/_/, " ")}
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {resolveByDot(`ui.detail.type`, attribute) === "file" &&
                resolveByDot("relation.type", attribute) === "has_many" && (
                  <FileBrowser files={getValue(attribute)} />
                )}

              {resolveByDot(`ui.detail.type`, attribute) === "list" &&
                resolveByDot("relation.type", attribute) === "has_many" && (
                  <ListPreview
                    items={getValue(attribute)}
                    valueKey={
                      resolveByDot(`ui.detail.valueKey`, attribute) || "name"
                    }
                  />
                )}

              {resolveByDot(`ui.detail.type`, attribute) === "list" &&
                resolveByDot("relation.type", attribute) ===
                  "has_many_via_pivot" && (
                  <ListPreview
                    items={getValue(attribute)}
                    valueKey={
                      resolveByDot(`ui.detail.valueKey`, attribute) || "name"
                    }
                  />
                )}

              {resolveByDot(`ui.detail.type`, attribute) === "file" &&
                resolveByDot("relation.type", attribute) === "has_one" && (
                  <div>File Preview</div>
                )}

              {resolveByDot(`ui.detail.type`, attribute) === "date" &&
                getValue(attribute)}

              {resolveByDot(`ui.detail.type`, attribute) === "boolean" &&
                getValue(attribute)}

              {resolveByDot(`ui.detail.type`, attribute) === undefined &&
                getValue(attribute)}
            </dd>
          </div>
        )),
    [resourceSpec, readOne]
  );

  return (
    <>
      {ready && (
        <>
          <NavigationPageHeading
            titleText={() => (
              <div className="mt-2 text-xl text-gray-700 dark:text-gray-200">
                {resourceSpec.label}
              </div>
            )}
            actions={HeadingActions}
            linkRenderer={NextJSLink}
            homeIcon={HomeIcon}
            breadcrumbs={[
              {
                title: "Events",
                href: `/${resourceSpec?.name}`,
                home: true,
              },
            ]}
          />
          <div className="mt-5 border px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              {formList}
            </dl>
          </div>
        </>
      )}
    </>
  );
};

export default View;
