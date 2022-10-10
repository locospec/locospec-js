import { useRouter } from "next/router";

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

const StaticSidebar = ({ navigation = [] }: { navigation: any }) => {
  const router = useRouter();

  // console.log("router", router.query.resource);

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      {/* Sidebar component, swap this element with another sidebar if you like */}
      <div className="flex flex-col flex-grow pt-5 bg-indigo-700 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <img
            className="h-8 w-auto"
            src="https://tailwindui.com/img/logos/workflow-mark.svg?color=indigo&shade=300"
            alt="Workflow"
          />
        </div>
        <div className="mt-5 flex-1 flex flex-col">
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {navigation.map((item: any) => (
              <a
                key={item.name}
                href={`/${item.resource}`}
                className={classNames(
                  router.query.resource === item.resource
                    ? "bg-indigo-800 text-white"
                    : "text-indigo-100 hover:bg-indigo-600",
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                )}
              >
                <item.icon
                  className="mr-3 flex-shrink-0 h-6 w-6 text-indigo-300"
                  aria-hidden="true"
                />
                {item.name}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default StaticSidebar;
