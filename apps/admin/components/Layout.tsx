/*
  This example requires Tailwind CSS v2.0+ 
  
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
*/
import { Fragment, useState } from "react";
import { Dialog, Menu, Transition } from "@headlessui/react";
import {
  BellIcon,
  CalendarIcon,
  ChartBarIcon,
  FolderIcon,
  HomeIcon,
  InboxIcon,
  MenuAlt2Icon,
  UsersIcon,
  LocationMarkerIcon,
  OfficeBuildingIcon,
  CurrencyRupeeIcon,
  MapIcon,
  LinkIcon,
  MenuAlt4Icon,
  MenuAlt3Icon,
  LibraryIcon,
  ChartSquareBarIcon,
  DocumentTextIcon,
  CubeTransparentIcon,
  AdjustmentsIcon,
  XIcon,
  DocumentIcon,
} from "@heroicons/react/outline";
import { SearchIcon } from "@heroicons/react/solid";
import MobileSidebar from "./MobileSidebar";
import StaticSidebar from "./StaticSidebar";
import TopNavBar from "./TopNavBar";

const navigation = [
  { name: "Topics", resource: "topics", icon: MenuAlt3Icon, current: true },
  { name: "States", resource: "states", icon: MenuAlt3Icon, current: true },
  {
    name: "Districts",
    resource: "districts",
    icon: MenuAlt3Icon,
    current: true,
  },
  { name: "Cities", resource: "cities", icon: MenuAlt3Icon, current: true },
];

const userNavigation = [
  { name: "Your Profile", href: "#" },
  { name: "Settings", href: "#" },
  { name: "Sign out", href: "#" },
];

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

export default function Layout(props: { children?: any }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/*
        This example requires updating your template:

        ```
        <html class="h-full bg-gray-100">
        <body class="h-full">
        ```
      */}
      <div>
        <MobileSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          navigation={navigation}
        />

        {/* Static sidebar for desktop */}
        <StaticSidebar navigation={navigation} />
        <div className="md:pl-64 flex flex-col flex-1">
          <main>
            <div className="py-6">{props.children}</div>
          </main>
        </div>
      </div>
    </>
  );
}
