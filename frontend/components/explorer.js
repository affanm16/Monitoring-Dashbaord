/*
This component is responsible for displaying a tab in the dashboard that lists all folders and log files from which the dashboard retrieves data, allowing users to browse and interact
*/

"use client";
import { ChevronLeft, File, Folder, Download } from "lucide-react"; // Added Download icon
import { useState, useEffect } from "react";

// Function to trigger download
const downloadFile = (filename, content) => {
  const element = document.createElement("a");
  const file = new Blob([content], { type: "text/plain" });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element); // Required for this to work in FireFox
  element.click();
  document.body.removeChild(element);
};

export default function FileExplorer() {
  const [path, setPath] = useState([]); // Path as array
  const [items, setItems] = useState([]);
  const [fileContent, setFileContent] = useState(null);
  const [loading, setLoading] = useState(true);

  // const BACKEND_URL = "/api";
  const BACKEND_URL = "http://localhost:3003"; // Define backend URL


  const currentPath = path.join("/");

  useEffect(() => {
    setLoading(true); // Set loading true at the start of fetch
    // fetch(`${BACKEND_URL}/files?path=${encodeURIComponent(currentPath)}`)
    fetch(`${BACKEND_URL}/api/files?path=${encodeURIComponent(currentPath)}`) // Corrected URL
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log(`Fetched /api/files?path=${currentPath}: `, data); // Log fetched file/folder data
        if (data.type === "directory") {
          setItems(data.items);
          setFileContent(null);
        } else if (data.type === "file") {
          setFileContent(data.content);
          setItems([]); 
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(`Error fetching /api/files?path=${currentPath}:`, err);
        setItems([]); // Clear items on error
        setFileContent(null); // Clear file content on error
        setLoading(false);
      });
  }, [currentPath, BACKEND_URL]); // Added BACKEND_URL to dependencies

  const navigateTo = (item) => {
    setPath([...path, item.name]);
  };

  const goBack = () => {
    if (path.length > 0) {
      const newPath = [...path];
      newPath.pop();
      setPath(newPath);
    }
  };
  return (
    <div className="p-4 rounded-xl max-h-[80vh] overflow-y-auto bg-white/80 dark:bg-slate-800/80 shadow-lg text-gray-800 dark:text-gray-200">
      {!loading ? (
        <>
          <div className="flex items-center mb-4">
            <button
              onClick={goBack}
              disabled={path.length === 0}
              className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white px-4 py-2 flex gap-2 items-center rounded-md disabled:opacity-50 transition-colors duration-200"
            >
              <ChevronLeft size={20}/> Back
            </button>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center font-medium h-[20vh] text-gray-500 dark:text-gray-400">Loading...</div>
      )}

      {!fileContent && (
        <div className={`${path.length === 0 ? "flex flex-row flex-wrap gap-6" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"} mt-4`}> {/* Responsive grid for inner items */}
          {items.map((item, index) => (
            <div key={index} className="p-1">
              <button
                onClick={() => navigateTo(item)}
                className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 p-3 rounded-lg flex flex-col justify-center items-center w-full text-center transition-colors duration-200 shadow hover:shadow-md"
              >
                {item.isDirectory ? (
                  <div className="mb-2">
                    <Folder
                      width={60}
                      height={60}
                      className="text-yellow-500 dark:text-yellow-400"
                      // fill="#F8D775" // Using Tailwind classes for color now
                    />
                  </div>
                ) : (
                  <div className="mb-2">
                    <File 
                      width={50}
                      height={50} 
                      className="text-blue-500 dark:text-blue-400" 
                    />
                  </div>
                )}
                <span className="text-sm break-all">{item.name}</span>
              </button>
            </div>
          ))}
        </div>
      )}
      {fileContent && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-100">File Content:</h2>
            <button
              onClick={() => downloadFile(path[path.length -1], fileContent)}
              className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-3 py-1.5 flex gap-2 items-center rounded-md transition-colors duration-200 text-sm"
              title="Download File Content"
            >
              <Download size={16}/> Download
            </button>
          </div>
          <pre className="bg-gray-100 dark:bg-slate-700 p-4 rounded-md whitespace-pre-wrap overflow-y-auto text-sm text-gray-700 dark:text-gray-300 shadow">
            {path.includes("Monitoring")
              ? fileContent
              : fileContent.split("\n").reverse().join("\n")}
          </pre>
        </div>
      )}
    </div>
  );
}
