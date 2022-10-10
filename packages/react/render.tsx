import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { BetaForm as useBetaForm } from "@reusejs/react";
import CreateOrEditForm from "./CreateOrEdit";
import List from "./list";
import View from "./view";
import Pivot from "./pivot";
import Link from "next/link";
import { callLoco, getByUuid } from "./helpers/callLoco";
import resolveByDot from "./helpers/resolveByDot";

const LocoSpecUI = (router: any, prefix: any) => {
  const resource = router.query.resource;

  const [routePrefix, setRoutePrefix] = useState(prefix);
  const [action, setAction] = useState("none");
  const [resourceSpec, setResourceSpec] = useState<any>({});
  const [resourceData, setResourceData] = useState<any>({});
  const [primaryIdentifier, setPrimaryIdentifier] = useState<any>({});
  const formInstance = useBetaForm({});

  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      if (resource !== undefined) {
        let resourceConfig: any = await callLoco(
          routePrefix,
          resource,
          "_config"
        );
        setResourceSpec(resourceConfig);

        let endpoint = router.query?.loco;
        // console.log("router.query", router.query, endpoint);

        if (endpoint !== undefined && endpoint.length > 0) {
          if (endpoint[0] === "edit") {
            setAction("update");
            setPrimaryIdentifier(endpoint[1]);

            (async () => {
              await setReady(false);

              const data: any = await callLoco(routePrefix, resource, `_read`, {
                filterBy: [
                  {
                    attribute: "uuid",
                    op: "eq",
                    value: endpoint[1],
                  },
                ],
              });

              await Promise.all([setResourceData(data?.data?.[0])]);

              await setReady(true);
            })();
          } else if (endpoint[0] == "create") {
            setAction("create");
            setReady(true);
          } else if (endpoint[0] == "has-many-via-pivot") {
            setPrimaryIdentifier(endpoint[1]);
            setAction("pivot");
            setReady(true);
          } else {
            setAction("read");
            setPrimaryIdentifier(endpoint[0]);
            (async () => {
              setReady(true);
            })();
          }
        } else {
          setAction("read_all");
          (async () => {
            setReady(true);
          })();
        }
      }
    })();
  }, [resource, router]);

  const showUI = () => {
    // console.log("Called show me something");

    if (Object.keys(resourceSpec)) {
      return (
        <>
          {/* {resource}
          <h1>{action}</h1>
          <h1>{JSON.stringify(ready)}</h1> */}

          {ready && (action === "create" || action === "update") && (
            <CreateOrEditForm
              resourceSpec={resourceSpec}
              resourceData={resourceData}
              action={action}
              router={router}
              formInstance={formInstance}
              primaryIdentifier={primaryIdentifier}
              routePrefix={routePrefix}
            />
          )}

          {ready && action === "pivot" && (
            <>
              <Pivot
                resourceSpec={resourceSpec}
                router={router}
                formInstance={formInstance}
                primaryIdentifier={primaryIdentifier}
                routePrefix={routePrefix}
              />{" "}
            </>
          )}

          {ready && action === "read_all" && (
            <>
              <List
                resourceSpec={resourceSpec}
                router={router}
                routePrefix={routePrefix}
              />
            </>
          )}

          {ready && action === "read" && (
            <>
              <View
                resourceSpec={resourceSpec}
                router={router}
                primaryIdentifier={primaryIdentifier}
                routePrefix={routePrefix}
              />
            </>
          )}
        </>
      );
    } else {
      return <>Loading..</>;
    }
  };

  return {
    action,
    setAction,
    resourceSpec,
    setResourceSpec,
    showUI,
  };
};

export default LocoSpecUI;
