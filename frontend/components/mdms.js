// Components to Check the status of the MDMS servers through URLs
import React, { useEffect, useState } from "react";

const BACKEND_URL = "http://localhost:3003"; // Define backend URL

const MDMS = () => {
  const [data, setData] = useState([]); // Initialize with empty array
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const getMDMSdata = async () => {
      setLoading(true);
      try {
        // const response = await fetch("/api/mdmsfiles");
        const response = await fetch(`${BACKEND_URL}/api/mdmsfiles`); // Use absolute URL
        if (!response.ok) {
          // Handle HTTP errors
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const res = await response.json();
        setData(res);
      } catch (error) {
        console.log("Error while fetching MDMS data:", error);
        setData([]); // Set data to empty array on error
      } finally {
        setLoading(false);
      }
    };
    getMDMSdata();
  }, []);

  return (
    <div className="w-full bg-white/80 rounded-xl"> {/* Changed width to full */}
      {loading ? (
        <div className="p-4 text-center">Loading...</div> // Added padding and centering
      ) : (
        <div className="  ">
          <div className=" font-semibold text-xl p-4"> MDMS Servers</div>
          <div className="w-full border-b border-gray-300"></div>
          {data && data.length > 0 ? ( // Check if data exists and has items
            <div className=" grid grid-cols-1 xl:grid-cols-2 gap-6 p-6">
              {data.map((file, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-2 mt-4 p-4 border border-[#cccccc] shadow-xl rounded-lg  bg-white "
                >
                  {/* <div>{file.name}</div> Предполагая, что имя файла или сервиса есть в file.server_name или file.service_name */}
                  <div>Server: {file.server_name}</div>
                  <div>Service: {file.service_name}</div>
                  <iframe
                    className="border-2 border-black rounded-xl"
                    // src={file.link} // Assuming file.link contains the URL
                    // For local testing, if file.link is a path, it won't work directly in iframe.
                    // If file.link is meant to be content, iframe is not the right element.
                    // This part might need adjustment based on what `file.link` actually represents.
                    // If it's a URL to an external service:
                    src={file.link}
                    // If it's content to be displayed (e.g. HTML snippet from the file):
                    // srcDoc={file.link}
                    title={`${file.server_name} - ${file.service_name}`} // Added title for accessibility
                    width="100%" // Responsive width
                    height={"300px"} // Fixed height, adjust as needed
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center">No MDMS data available.</div> // Message for no data
          )}
        </div>
      )}
    </div>
  );
};
export default MDMS;
