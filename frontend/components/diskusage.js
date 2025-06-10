// This component Monitors the disks(the one with /dev in their name) of a server
// It shows the total space and utilized space in form of bars
import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DiskUsage = () => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const [diskfiles, setdiskfiles] = useState([]);
  const [titles, setTitles] = useState([]);
  const [filesystem, setfilesystems] = useState([]);
  const [system, setsystems] = useState();
  const [server, setServer] = useState();
  const [usage, setUsage] = useState();
  const [chartdata, setchartdata] = useState();
  const [serverTab, setServerTab] = useState(1);
  const options = {
    responsive: true,
    maintainAspectRatio: true, // Explicitly set, true is default
    aspectRatio: 2, // Makes chart taller (width:height ratio, default is 2)
    animation: false, // Disable all animations
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: document.documentElement.classList.contains('dark') ? '#e2e8f0' : '#334155', // Adjust legend color for theme
        }
      },
      title: {
        display: true,
        text: (ctx) => ctx.chart.data.labels[0], // Display filesystem name as title
        color: document.documentElement.classList.contains('dark') ? '#e2e8f0' : '#334155',
        font: {
          size: 16
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: document.documentElement.classList.contains('dark') ? '#cbd5e1' : '#475569',
        },
        grid: {
          color: document.documentElement.classList.contains('dark') ? '#334155' : '#e2e8f0',
        }
      },
      y: {
        ticks: {
          color: document.documentElement.classList.contains('dark') ? '#cbd5e1' : '#475569',
        },
        grid: {
          color: document.documentElement.classList.contains('dark') ? '#334155' : '#e2e8f0',
        }
      }
    }
  };
  const BACKEND_URL = "http://localhost:3003"; // Define backend URL

  useEffect(() => {
    const getDiskdata = async () => {
      try {
        // const response = await fetch("/api/disk-usage");
        const response = await fetch(`${BACKEND_URL}/api/disk-usage`); // Use absolute URL
        const res = await response.json();
        const charts = [];
        setdiskfiles(res);

        res.forEach((file) => {
          // charts.push(file.fileName.split("_")[0]); // Original line, might cause error if fileName is not present
          charts.push(file.server_name); // Assumes server_name is directly available
        });
        setTitles(charts);
        setLoading(false);
      } catch (error) {
        console.log("Error while fetching Disk Usage data:", error); // Corrected log message
      }
    };
    getDiskdata();
  }, []);

  const convertToGB = (value) => {
    const number = parseFloat(value);
    const unit = value.replace(/[^a-zA-Z]/g, "");

    if (unit.startsWith("M")) {
      return number / 1024;
    } else if (unit.startsWith("T")) {
      return number * 1024;
    } else if (unit.startsWith("K")) {
      return number / 1000000;
    } else {
      return number;
    }
  };

  const SetCurrentServer = (server, issystem) => {
    const CurrentServer = diskfiles.filter(
      // (file) => file.fileName.split("_")[0] === server // Original line
      (file) => file.server_name === server // Use server_name
    );
    const mounts = {
      // name: CurrentServer[0].fileName.split("_")[0], // Original line
      name: CurrentServer[0]?.server_name, // Use server_name
      date: new Date(CurrentServer[0].lastChecked.replace(" ", "T")),
      mountarray: [],
    };
    CurrentServer[0]?.diskUsage.forEach((file) => {
      mounts.mountarray.push(file);
    });

    setfilesystems(mounts);
    setServer(server);
    setData(CurrentServer);

    if (issystem) {
      setsystems(issystem);
      const impdata = CurrentServer[0].diskUsage.filter(
        (file) => file.filesystem === issystem
      );
      setUsage(CurrentServer[0]?.diskUsage?.map((d) => d.usage));
      setchartdata({
        labels: [impdata[0]?.filesystem],
        datasets: [
          {
            label: "Used(GB)",
            data: [convertToGB(impdata[0]?.used)],
            backgroundColor: document.documentElement.classList.contains('dark') ? "#059669" : "#10b981", // Darker green for dark, lighter for light
            borderColor: document.documentElement.classList.contains('dark') ? "#047857" : "#059669",
            borderWidth: 1,
            borderRadius: 5, // Adjusted for a more modern look
            barThickness: 35, // Reduced bar thickness
            categoryPercentage: 0.2,
          },
          {
            label: "Size(GB)",
            data: [convertToGB(impdata[0]?.size)],
            backgroundColor: document.documentElement.classList.contains('dark') ? "#10b981" : "#6ee7b7", // Lighter green for dark, very light for light
            borderColor: document.documentElement.classList.contains('dark') ? "#059669" : "#34d399",
            borderWidth: 1,
            borderRadius: 5, // Adjusted
            barThickness: 35, // Reduced bar thickness
            categoryPercentage: 0.2,
          },
        ],
      });
    }
  };
  useEffect(() => {
    if (titles?.length > 0) {
      SetCurrentServer(titles[0]);
      // setServerTab(0); // This line was causing an issue if titles[0] didn't immediately set server, leading to a mismatch.
                           // serverTab state logic might need re-evaluation if specific tab highlighting is crucial beyond active server.
                           // For now, ensuring SetCurrentServer is called is the priority.
                           // If serverTab is primarily for styling the selected server in the list,
                           // its update should be directly tied to when 'server' state changes or within SetCurrentServer.
      const initialServerName = titles[0];
      SetCurrentServer(initialServerName);
      const initialServerIndex = titles.findIndex(title => title === initialServerName);
      if (initialServerIndex !== -1) {
        setServerTab(initialServerIndex);
      }
    }
  }, [titles]);

  return (
    <div className="text-gray-800 dark:text-gray-200">
      {loading ? (
        <div className="flex justify-center items-center h-[70vh] text-gray-500 dark:text-gray-400">Loading Disk Usage Data...</div>
      ) : (
        <div className="bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-lg">
          <div className="font-semibold p-4 text-xl text-gray-800 dark:text-gray-100 border-b border-gray-300 dark:border-slate-700">Monitoring Servers - Disk Usage</div>

          <div className="min-h-[calc(80vh-60px)] flex flex-col md:flex-row gap-4 p-4 md:p-6">
            <div className="w-full md:w-[27%] bg-white dark:bg-slate-700/50 h-auto md:max-h-[calc(80vh-100px)] overflow-y-auto sticky top-5 border border-gray-300 dark:border-slate-600 py-3 px-2 rounded-lg shadow-md">
              {titles.map((title, index) => (
                <div
                  key={index}
                  onClick={() => {
                    SetCurrentServer(title);
                    setServerTab(index);
                  }}
                  className={`py-2.5 px-3 transition-all font-medium rounded-md cursor-pointer my-1 text-sm ${
                    server === title && serverTab === index
                      ? "bg-green-600 dark:bg-green-700 text-white shadow-sm"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-600"
                  }`}
                >
                  {title}
                </div>
              ))}
            </div>
            <div className="w-full md:w-[73%] flex flex-col items-center bg-white dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600 py-4 px-3 rounded-lg shadow-md">
            {(()=> {
                    let displayDate = "Date not available";
                    if (filesystem?.date) {
                      const timestampTest = new Date(filesystem.date);
                      if (!isNaN(timestampTest.getTime())) { // Check if date is valid
                        displayDate = `Last checked on ${timestampTest.toLocaleString("en-US",{
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}`;
                      }
                    }
                    const isOld = filesystem?.date && (new Date() - new Date(filesystem.date) > 12 * 60 * 60 * 1000);

                    return(
                    <div className={`py-2 mb-4 text-sm ${isOld && displayDate !== "Date not available" ? "text-red-500 dark:text-red-400" : "text-gray-600 dark:text-gray-400"}`}>
                      {displayDate}
                    </div>
                    );
                  })()}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8 w-full px-2 md:px-4">
                {filesystem?.mountarray?.map((name, index) => (
                  <div key={index} className="h-fit p-2 bg-gray-50 dark:bg-slate-600/30 rounded-md shadow">
                    <Bar
                      options={options} // Ensure options are dynamically updated for theme changes if needed, or re-render chart
                      data={{
                        labels: [name.filesystem],
                        datasets: [
                          {
                            label: "Used(GB)",
                            data: [convertToGB(name.used)],
                            backgroundColor: document.documentElement.classList.contains('dark') ? "#059669" : "#10b981",
                            borderColor: document.documentElement.classList.contains('dark') ? "#047857" : "#059669",
                            borderWidth: 1,
                            borderRadius: 5,
                            barThickness: 35,
                            // categoryPercentage: 0.2, // Can often be omitted for auto sizing
                          },
                          {
                            label: "Size(GB)",
                            data: [convertToGB(name.size)],
                            backgroundColor: document.documentElement.classList.contains('dark') ? "#10b981" : "#6ee7b7",
                            borderColor: document.documentElement.classList.contains('dark') ? "#059669" : "#34d399",
                            borderWidth: 1,
                            borderRadius: 5,
                            barThickness: 35,
                            // categoryPercentage: 0.2,
                          },
                        ],
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiskUsage;
