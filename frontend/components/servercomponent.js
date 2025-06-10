// Checks the Status of various services for iRODS servers as well as other servers
"use client"
import { useEffect, useState } from "react";
import axios from "axios";
import { FaCircle } from "react-icons/fa";
export default function ServerComponent({api}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statuses, setStatuses] = useState([]);

  // Fetch server statuses (pinging logic)
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const response = await axios.get(
          `/api/otherservers-status?flag=${api}`
          // `http://localhost:3003/api/otherservers-status?flag=${api}`
        );
        const status = response.data;
        setStatuses(status);
        setLoading(false)
      } catch {
        console.error("error fetching statuses:", error)
      }
    }
    fetchStatuses()
    const intervalId = setInterval(() => {
      fetchStatuses();
      console.log("i have been triggered after 15 mins");
    }, 15 * 60 * 1000)
    return () => clearInterval(intervalId)
  }, []);

  return (
    <div>
      {" "}
      {loading && <p>Loading...</p>} {error && <p>Error: {error}</p>}{" "}
      {!loading && !error && (
        <div className="grid grid-cols-2 gap-4 bg-white p-7 justify-items-center">
          {" "}
          {
            statuses?.map((server, index) => (
              <div
                key={index}
                className={`shadow-md hover:shadow-xl transition-shadow duration-300 rounded-lg px-2 py-6 border-gray-300 border-[1px] w-full h-fit ${server.server_status === "Up" ? "" : "border-red-500 border-[2px]"
                  }`}
              >
                {" "}
                <h1 className="p-2 font-semibold">{server.server_name}</h1>{" "}
                <div
                  className="p-2 font-bold text-black"
                >
                  {" "}
                  <div className="flex flex-row gap-1">
                    Status:
                    <div className="flex flex-row justify-center items-center">
                      <FaCircle
                        className={`h-3 w-3 ${server.server_status == "Up"
                          ? " text-green-400"
                          : " text-red-500"
                          }`}
                      />
                    </div>
                    <p className={`h-3 w-3 ${server.server_status == "Up"
                      ? " text-green-400"
                      : " text-red-500"
                      }`}>{server.server_status || "Checking..."} </p>
                  </div>
                </div>{" "}
                <ul className="list-disc pl-5">
                  {" "}
                  {" "}
                  <div className="flex flex-col">
                    {
                      server.services.map((s, index) => (
                        <li key={index} className="text-gray-700">
                          <div key={index} className="w-full justify-between flex items-center">
                            <div className="flex gap-1 items-center">
                              <span>{s.service_name}</span>
                              <span className={`text-sm ${s.service_status == "active" ? " text-green-400" :!isNaN(s.service_status)? "text-blue-400": " text-red-500"}`}>{s.service_status}</span>
                            </div>
                            <div className="flex justify-end">
                            {(()=>{
                            const now = new Date();
                            const timestamp = new Date(s.service_timestamp);
                            const isOld = !isNaN(timestamp) && now - timestamp >12*60*60*1000;
                            return(
                              <span className={`pl-2 ${isOld ? "text-red-600" : ""}`}>
                                Updated: {s.service_timestamp}
                              </span>
                            );
                          })()}
                            </div>
                          </div>
                        </li>
                      ))
                    }
                  </div>
                  {" "}
                </ul>{" "}
              </div>
            ))}{" "}
        </div>
      )}{" "}
    </div>
  );
}
