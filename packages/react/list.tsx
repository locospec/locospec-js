import {
  ButtonBase,
  DataTableBase,
  NavigationPageHeading,
  ModalConfirm,
} from "@reusejs/react";
import { useEffect, useState, useRef } from "react";
import { callMental } from "./helpers/callMental";
import Divider from "./helpers/divider";
import resolveByDot from "./helpers/resolveByDot";
import {
  PlusIcon,
  XIcon,
  CubeIcon,
  KeyIcon,
  ArrowRightIcon,
  PencilIcon,
  CheckIcon,
} from "@heroicons/react/solid";

const Content = () => {
  return (
    <div>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
        <CheckIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
      </div>
      <div className="mt-3 text-center sm:mt-5">
        <div className="text-lg font-medium leading-6 text-gray-900">
          {"Remove Resource"}
        </div>
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            Are you sure you want to remove?
          </p>
        </div>
      </div>
    </div>
  );
};

const List = ({ resourceSpec, router }: { resourceSpec: any; router: any }) => {
  const callOnRowClick = async (item: any) => {
    router.push(`/${resourceSpec.name}/${item.uuid}`);
  };
  const [ready, setReady] = useState(false);
  const tableRef = useRef<any>(null);

  const [filtersFromQuery, setFiltersFromQuery] = useState<any>([]);

  const [config, setConfig] = useState<any>({
    enableRowClick: false,
    filterable: true,
    onRowClick: callOnRowClick,
    columns: [],
  });

  const viewResource = async (item: any) => {
    router.push(`/${resourceSpec.name}/${item.uuid}`);
  };

  const editResource = async (item: any) => {
    router.push(`/${resourceSpec.name}/edit/${item.uuid}`);
  };

  const deleteResource = async (item: any) => {
    if (
      await ModalConfirm({
        timeout: 0,
        backgroundColor: "bg-white",
        backgroundOpacity: "opacity-50",
        heading: "Remove Resource?",
        description: "Are you sure you want to remove?",
        yesText: "Go Ahead",
        content: Content,
        yesButtonClasses: {
          backgroundColor: "bg-green-600 shadow-sm hover:bg-green-700",
        },
      })
    ) {
      await callMental(resourceSpec.name, `_delete`, {
        filterBy: [
          {
            attribute: "uuid",
            op: "in",
            value: [item.uuid],
          },
        ],
      });

      if (tableRef && tableRef.current) {
        tableRef?.current?.refresh();
      }
    }
  };

  useEffect(() => {
    const columns = resourceSpec?.attributes
      ?.filter((attribute: any) => {
        return resolveByDot("ui.list.display", attribute) === true;
      })
      .map((attribute: any, index: any) => {
        let column: any = {
          label: attribute.label,
        };

        if (attribute.relation) {
          column["identifier"] = resolveByDot("relation.resolveTo", attribute);

          column["resolver"] = (d: any) => {
            return (
              <div
                key={index}
                className="text-sm text-gray-900 dark:text-white"
              >
                {resolveByDot(
                  `${attribute.ui.list.displayKey}`,
                  d[attribute.identifier]
                )}
              </div>
            );
          };
          return column;
        }
        if (attribute.mutateFrom) {
          column["identifier"] = attribute.identifier;

          column["resolver"] = (d: any) => {
            return (
              <div className="text-sm text-gray-900 dark:text-white">
                {resolveByDot(
                  `${attribute.ui.list.displayKey}`,
                  d[attribute.identifier]
                )}
              </div>
            );
          };
          return column;
        } else {
          column["identifier"] = attribute.identifier;

          column["resolver"] = (d: any) => {
            // if (resolveByDot("type", detailProps) === "boolean") {
            //   if (localValue === true) {
            //     localValue = "Yes";
            //   }
            //   if (localValue === false) {
            //     localValue = "No";
            //   }
            //   // console.log("localValue", localValue);
            // }

            if (resolveByDot(`ui.list.type`, attribute) === "boolean") {
              return (
                <div className="text-sm text-gray-900 dark:text-white">
                  {d[attribute.identifier] === true ? "Yes" : "No"}
                </div>
              );
            } else {
              return (
                <div className="text-sm text-gray-900 dark:text-white">
                  {d[attribute.identifier]}
                </div>
              );
            }
          };

          if (resolveByDot("ui.list.filterBy", attribute) === "like") {
            column["filterable"] = {
              type: "text",
            };
          }

          return column;
        }
      });

    columns.push({
      label: "",
      filterable: {
        type: "clear",
      },
      actions: true,
      resolver: (d: any) => {
        return (
          <div className="flex justify-center items-center space-x-2">
            <div>
              <ArrowRightIcon
                className="flex-shrink-0 h-4 w-4 text-green-500 hover:text-green-700 cursor-pointer"
                aria-hidden="true"
                onClick={() => viewResource(d)}
              />
            </div>

            <div>
              <PencilIcon
                className="flex-shrink-0 h-4 w-4 text-yellow-500 hover:text-yellow-700 cursor-pointer"
                aria-hidden="true"
                onClick={() => editResource(d)}
              />
            </div>

            <div>
              <XIcon
                className="flex-shrink-0 h-4 w-4 text-red-400 hover:text-red-600 cursor-pointer"
                aria-hidden="true"
                onClick={() => deleteResource(d)}
              />
            </div>
          </div>
        );
      },
    });

    setConfig((prev: any) => {
      prev["columns"] = columns;
      return { ...prev };
    });

    let filterBy: any = [];

    Object.entries(router.query).forEach((q: any) => {
      let [key, value] = q;
      if (key.startsWith("filterBy-")) {
        key = key.replace(/filterBy-/, "");

        filterBy.push({
          attribute: key,
          op: "eq",
          value: value,
        });
      }
    });

    setFiltersFromQuery(filterBy);
    setReady(true);
  }, []);

  const HeadingActions = () => {
    let params: any = {};

    filtersFromQuery.forEach((element: any) => {
      params[`prefillValue-${element.attribute}`] = element.value;
    });

    return (
      <>
        <ButtonBase
          type="button"
          label="Create"
          onClick={() => {
            router.push(
              `/${resourceSpec.name}/create?${new URLSearchParams(
                params
              ).toString()}`
            );
          }}
        />
      </>
    );
  };

  return (
    <>
      <NavigationPageHeading
        titleText={() => (
          <div className="mt-2 text-xl text-gray-700 dark:text-gray-200">
            {resourceSpec.label}
          </div>
        )}
        actions={HeadingActions}
        breadcrumbs={[]}
      />

      <Divider />

      {ready && (
        <DataTableBase
          ref={tableRef}
          sortColumn={0}
          sortOrder={"asc"}
          perPage={10}
          params={{}}
          config={config}
          dataSource={async (params: any) => {
            let payload: any = {};
            payload["limitBy"] = {};
            payload["limitBy"]["per_page"] = params.per_page;
            payload["limitBy"]["page"] = params.page;

            let filterBy: any = filtersFromQuery;

            Object.keys(params.filters).forEach((element) => {
              filterBy.push({
                attribute: element,
                op: "like",
                value: params.filters[element],
              });
            });

            payload["filterBy"] = filterBy;

            const response: any = await callMental(
              resourceSpec.name,
              `_read`,
              payload
            );

            // console.log("data", response);

            return {
              data: response.data,
              pagination: {
                total: response.meta.total,
              },
            };
          }}
        />
      )}
    </>
  );
};

export default List;
