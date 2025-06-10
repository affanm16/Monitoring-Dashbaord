// Main Component, It servers as the Main entry point to the dashboard where different sections or tabs can be controlled
"use client";
import { useState, useEffect } from "react";
import React from "react";
import MDMS from "./mdms";
import DiskUsage from "./diskusage";
import axios from "axios";
import { Tab } from "./tabs";
import { RefreshCwIcon } from "lucide-react";
import FileExplorer from "./explorer";
import { useRouter } from "next/navigation";
const BACKEND_URL = "http://localhost:3003"; // Define backend URL
export default function Hero2() {
  const [activeTab, setActiveTab] = useState();
  const [tabs, setTabs] = useState([]);
  const [error, setError] = useState([]);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState();
  const [show, setshow] = useState(true);
  const [view, setView] = useState(true); // Initialize view to true directly
  const [theme, setTheme] = useState("light"); // Added theme state, default to light

  const router = useRouter();

  // Effect to load theme from localStorage on initial mount
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      setTheme(storedTheme);
      if (storedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      // Default to light theme if nothing is stored, and save it.
      localStorage.setItem("theme", "light");
      document.documentElement.classList.remove("dark");
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", newTheme); // Save theme to localStorage
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_URL}/api/services-folders`
          // "http://localhost:3003/api/services-folders"
        );
        console.log("Fetched /api/services-folders:", response.data); // Log fetched folder data
        setTabs(response.data);

        if (response.data && response.data.length > 0) {
          const initialTab =
            response.data.find(
              (tab) =>
                tab !== "Prod-Servers" &&
                tab !== "Monitoring" &&
                tab !== "Disk Usage" &&
                tab !== "sharedFolder"
            ) || response.data[0];
          setActiveTab(initialTab);
        } else {
          console.log("/api/services-folders returned no data or empty array");
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching /api/services-folders:", err.message);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchServiceData = async () => {
      if (!activeTab) {
        setData([]);
        setLoading(false); // Ensure loading is false if no activeTab
        return;
      }

      // Fetch data for the generic Tab component if activeTab is Dev-Servers, Test-Servers, or Prod-Servers
      if (
        activeTab === "Dev-Servers" ||
        activeTab === "Test-Servers" ||
        activeTab === "Prod-Servers" // Added Prod-Servers here
      ) {
        setLoading(true);
        setError(null);
        try {
          console.log(
            `Fetching service data for generic Tab: ${activeTab}, Path: ${activeTab}`
          );
          const result = await axios.post(
            `${BACKEND_URL}/api/services-files`,
            { filepath: activeTab }
          );
          console.log(`Data for generic Tab ${activeTab}:`, result.data);
          setData(result.data);
        } catch (err) {
          let errorMsg = `Error fetching data for generic Tab ${activeTab}: `;
          if (err.response) {
            errorMsg += `Status: ${err.response.status}, Data: ${JSON.stringify(err.response.data)}`;
            setError(
              `Server error: ${err.response.status}. ${
                typeof err.response.data === "string"
                  ? err.response.data
                  : err.response.data?.error || "Details in console."
              }`
            );
          } else if (err.request) {
            errorMsg += "No response from server.";
            setError("Network error or server not responding.");
          } else {
            errorMsg += err.message;
            setError(`Request setup error: ${err.message}.`);
          }
          console.error(errorMsg, err);
          setData([]);
        } finally {
          setLoading(false);
        }
      } else {
        // For other tabs with dedicated components (DiskUsage, FileExplorer for "sharedFolder"),
        // clear hero.js's generic 'data' and ensure its loading state is false.
        setData([]);
        setLoading(false);
        console.log(
          `Tab ${activeTab} uses a dedicated component or is not configured for generic data fetch in hero.js. Clearing hero.js data and loading state.`
        );
      }
    };

    fetchServiceData();
  }, [activeTab, BACKEND_URL]);

  const tabComponents = {
    "Disk Usage": <DiskUsage />,
    // "Prod-Servers": <MDMS />, // Removed: Prod-Servers will now use the generic Tab component
    sharedFolder: <FileExplorer />,
  };
  return (
    <div className={`${theme}`}> {/* Apply theme class to root div */}
      {view ? (
        <div className="min-h-screen p-4 md:p-8 bg-gray-100 dark:bg-slate-900 text-black dark:text-white transition-colors duration-300">
          <div className="flex items-center justify-between text-center w-full mb-4 md:mb-6">
            <h1 className="font-semibold text-3xl md:text-4xl"> {/* Changed to h1 for semantics */}
              Monitoring Dashboard
            </h1>
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-md bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
              title="Toggle Theme"
            >
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>
          </div>
          <div className="w-full max-w-[1300px] flex flex-col md:flex-row rounded-lg gap-4 md:gap-7 mx-auto p-2 md:p-0">
            <div className="w-full md:min-w-[22%] md:max-w-[22%] font-bold"> {/* Adjusted width */}
              <nav className="flex flex-col gap-2 py-4 px-3 w-full border bg-white dark:bg-slate-800 shadow-lg overflow-y-auto max-h-[40vh] md:max-h-[calc(100vh-120px)] md:h-[calc(100vh-120px)] rounded-lg border-gray-300 dark:border-slate-700 md:sticky md:top-8 transition-colors duration-300">
                <div
                  onClick={() => window.location.reload()}
                  className="border cursor-pointer rounded-md leading-none flex justify-center gap-2 items-center text-lg font-semibold bg-gray-50 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 border-gray-300 dark:border-slate-600 px-2 py-3 transition-colors duration-300"
                >
                  Refresh
                  <div className="hover:rotate-[360deg] duration-500">
                    <RefreshCwIcon width={14} height={14} />
                  </div>
                </div>
                <div className="border-b w-full border-black"></div>
                <>
                  <>
                    {tabs
                      .filter(
                        (tab) =>
                          tab != "Prod-Servers" &&
                          tab != "Monitoring" &&
                          tab !== "Dev-Servers" &&
                          tab !== "Test-Servers"
                      ) // Adjusted filter
                      .map((tab) => (
                        <button
                          key={tab}
                          className={`w-full px-4 py-2.5 text-sm text-left font-medium rounded-md transition-all duration-200 ease-in-out first-letter:uppercase  ${
                            activeTab === tab
                              ? "bg-green-600 dark:bg-green-700 text-white shadow-md scale-105"
                              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={() => {
                            setActiveTab(tab);
                          }}
                        >
                          {/* Custom naming for specific folders if needed, otherwise display tab name */}
                          {tab === "Dev-Servers"
                            ? "Dev Servers"
                            : tab === "Test-Servers"
                            ? "Test Servers"
                            : tab}
                        </button>
                      ))}
                    {/* Explicit buttons for Dev and Test Servers */}
                    {tabs.includes("Dev-Servers") && (
                      <button
                        key="Dev-Servers"
                        className={`w-full px-4 py-2.5 text-sm text-left font-medium rounded-md transition-all duration-200 ease-in-out ${
                          activeTab === "Dev-Servers"
                            ? "bg-green-600 dark:bg-green-700 text-white shadow-md scale-105"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white"
                        }`}
                        onClick={() => setActiveTab("Dev-Servers")}
                      >
                        Dev Servers
                      </button>
                    )}
                    {tabs.includes("Test-Servers") && (
                      <button
                        key="Test-Servers"
                        className={`w-full px-4 py-2.5 text-sm text-left font-medium rounded-md transition-all duration-200 ease-in-out ${
                          activeTab === "Test-Servers"
                            ? "bg-green-600 dark:bg-green-700 text-white shadow-md scale-105"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white"
                        }`}
                        onClick={() => setActiveTab("Test-Servers")}
                      >
                        Test Servers
                      </button>
                    )}
                  </>
                </>

                {tabs.includes("Prod-Servers") && (
                  <button
                    className={`w-full px-4 py-2.5 text-sm text-left font-medium rounded-md transition-all duration-200 ease-in-out ${
                      activeTab === "Prod-Servers"
                        ? "bg-green-600 dark:bg-green-700 text-white shadow-md scale-105"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white"
                    }`}
                    onClick={() => {
                      setActiveTab("Prod-Servers");
                    }}
                  >
                    Prod Servers
                  </button>
                )}

                <button
                  className={`w-full px-4 py-2.5 text-sm text-left font-medium rounded-md transition-all duration-200 ease-in-out ${
                    activeTab === "Disk Usage"
                      ? "bg-green-600 dark:bg-green-700 text-white shadow-md scale-105"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  onClick={() => setActiveTab("Disk Usage")}
                >
                  Disk Usage
                </button>

                <button
                  className={`w-full px-4 py-2.5 text-sm text-left font-medium rounded-md transition-all duration-200 ease-in-out ${
                    activeTab === "sharedFolder"
                      ? "bg-green-600 dark:bg-green-700 text-white shadow-md scale-105"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white"
                  }`}
                  onClick={() => setActiveTab("sharedFolder")}
                >
                  Shared Folder
                </button>
              </nav>
            </div>
            <div className="w-full md:min-w-[76%] md:max-w-[76%] overflow-y-auto"> {/* Adjusted width */}
              {tabComponents[activeTab] ? (
                tabComponents[activeTab]
              ) : (activeTab === "Dev-Servers" || activeTab === "Test-Servers" || activeTab === "Prod-Servers") ? (
                <Tab
                  activeTab={activeTab} 
                  Data={data}     // Corrected prop name to Data (uppercase D)
                  Loading={loading} // Corrected prop name to Loading (uppercase L)
                />
              ) : (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  {activeTab ? `Content for ${activeTab} is handled by a dedicated component or not configured for generic display.` : 'Select a tab to view content.'}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
