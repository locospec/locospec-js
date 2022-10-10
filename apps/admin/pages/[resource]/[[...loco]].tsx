import type { NextPage } from "next";
import { useEffect } from "react";

import { useRouter } from "next/router";
import { useLocoRenderer } from "@locospec/react";

const Loco: NextPage = () => {
  const router = useRouter();

  useEffect(() => {
    console.log("Mounted loco page");
  }, []);

  const { action, setAction, resourceSpec, setResourceSpec, showUI } =
    useLocoRenderer(router, "loco");

  if (router.query.resource !== undefined) {
    return <div className="max-w-7xl mx-auto p-6">{showUI()}</div>;
  } else {
    return <>Loading...</>;
  }
};

export default Loco;
