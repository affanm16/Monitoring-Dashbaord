import { FaCircle } from "react-icons/fa";

export const Tab = ({ activeTab, Data, Loading }) => {
  return (
    <div className="w-full border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-lg">
      <div className="first-letter:uppercase font-semibold text-xl p-4 text-gray-800 dark:text-gray-200">
        {activeTab}
      </div>
      <div className="h-0 w-full border-b border-gray-300 dark:border-gray-600"></div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 p-7">
        {Loading ? (
          <div className="col-span-full flex justify-center items-center text-gray-500 dark:text-gray-400">
            Loading...
          </div>
        ) : (
          <>
            {[...Data]
              .sort((a, b) => a.server_name.localeCompare(b.server_name))
              ?.map((server, index) => (
                <div
                  key={index}
                  className={`shadow-md hover:shadow-xl transition-shadow duration-300 rounded-lg p-6 bg-white dark:bg-slate-700 border dark:border-slate-600 w-full flex flex-col ${
                    server.server_status === "Up"
                      ? "border-gray-300"
                      : "border-red-500 border-2"
                  }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {server.server_name}
                    </h1>
                  </div>
                  <div className="mb-3 flex items-center">
                    <span className="mr-2 text-gray-700 dark:text-gray-300">
                      Status:
                    </span>
                    <FaCircle
                      className={`h-3 w-3 mr-1 ${
                        server.server_status === "Up"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    />
                    <p
                      className={`font-medium ${
                        server.server_status === "Up"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {server.server_status || "Checking..."}
                    </p>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                    <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      Services:
                    </h2>
                    <ul className="space-y-1">
                      {server.services.map((s, serviceIndex) => (
                        <li
                          key={serviceIndex}
                          className="text-gray-700 dark:text-gray-300 text-sm"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <span className="mr-2">{s.service_name}</span>
                              <span
                                className={`font-medium ${
                                  s.service_status === "active"
                                    ? "text-green-500"
                                    : !isNaN(s.service_status)
                                    ? "text-blue-500"
                                    : "text-red-500"
                                }`}
                              >
                                {s.service_status}
                              </span>
                            </div>
                            {(() => {
                              const now = new Date();
                              const timestamp = new Date(s.service_timestamp);
                              const isOld =
                                !isNaN(timestamp) &&
                                now - timestamp > 12 * 60 * 60 * 1000;
                              return (
                                <span
                                  className={`text-xs ${
                                    isOld
                                      ? "text-red-500 dark:text-red-400"
                                      : "text-gray-500 dark:text-gray-400"
                                  }`}
                                >
                                  {s.service_timestamp}
                                </span>
                              );
                            })()}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
          </>
        )}
      </div>
    </div>
  );
};
