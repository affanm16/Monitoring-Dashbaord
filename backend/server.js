const express = require("express");
const ping = require("ping");
const dotenv = require("dotenv");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const rateLimit = require("express-rate-limit");

dotenv.config();
const app = express();
const port = process.env.PORT || 3003;
app.use(cors());

//applying rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 350,
  message: "Too many requests , Try again laterr!!",
  headers: true,
});

app.use(limiter);
app.use(express.json());

const active = "Up";
const inactive = "Down";
// Update sharedFolderPath to point to 'backend/Dashboard/'
const sharedFolderPath = path.join(__dirname, "Dashboard");

// Remove old, unused path variables
// const irodsLogFilePath = "/media/dashboard/irods";
// const otherServersLogFilePath = "/media/dashboard/other-servers";
// const mdmsServersLogFilePath = "/media/dashboard/mdms";
// const directoryPath = "/media/dashboard/Monitoring";

const ROOT = path.resolve(sharedFolderPath);
function addServiceStatus(server, serviceStatus) {
  serviceStatus.push({
    server_name: server?.split("_")[0],
    service_name: server?.split("_")[1].split(".")[0],
    service_timestamp: null,
    service_status: serviceStatus,
  });
}

app.get("/api/services-folders", limiter, (req, res) => {
  fs.readdir(sharedFolderPath, (err, file) => {
    if (err) {
      return res.status(500).send("Unable to scan directory: " + err);
    }
    res.json(file);
  });
});

app.post("/api/services-files", limiter, (req, res) => {
  let filess = [];
  let serviceStatus = [];
  const { filepath } = req.body;
  let logFilePath;

  if (!filepath) {
    return res.status(400).json({ error: "file path is required" });
  }

  const baseDir = path.resolve(sharedFolderPath);
  const requestedPath = path.resolve(path.join(baseDir, filepath));

  if (!requestedPath.startsWith(baseDir)) {
    return res.status(403).json({ error: "Access Denied" });
  }
  logFilePath = requestedPath;

  fs.readdir(logFilePath, async (err, files) => {
    if (err) {
      return res.status(500).send("Unable to scan directory: " + err);
    }
    filess = files;

    const finalStatus = await Promise.all(
      filess.map(async (server) => {
        try {
          const filePath = path.join(logFilePath, `${server}`);
          // Update ping logic to use only the server name from the file
          const serverResult = (await ping.promise.probe(server.split("_")[0]))
            .alive
            ? active
            : inactive;

          if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            if (stats.size === 0) {
              const server_name = server.split("_")[0];
              const service_name =
                server.split("_")[1]?.split(".")[0] || "Unknown";
              const status1 = serviceStatus.find(
                (s) => s.server_name === server_name
              );
              if (status1) {
                status1.services.push({
                  service_name,
                  service_timestamp: "-",
                  service_status: "No Data",
                  raw_content: raw_content, // Add raw_content here
                });
              } else {
                serviceStatus.push({
                  server_name,
                  server_status: serverResult,
                  services: [
                    {
                      service_name,
                      service_timestamp: "Empty File",
                      service_status: "Empty File",
                      raw_content: raw_content, // Add raw_content here
                    },
                  ],
                });
              }
              return;
            }
            const data = fs.readFileSync(filePath, "utf8").trim();
            const raw_content = fs.readFileSync(filePath, "utf8"); // Read raw content

            if (data) {
              const lines = data.split("\n");
              const lastLine = lines[lines.length - 1];

              // Check if lastLine has the expected format : TimeStamp ~ Status
              // example: 2025-02-26 17:50:02 ~ active
              if (lastLine.includes("~")) {
                const [timestamp, status] = lastLine
                  .split(" ~ ")
                  .map((item) => item.trim());
                if (timestamp && status) {
                  const server_name = server.split("_")[0];
                  const status1 = serviceStatus.find(
                    (s) => s.server_name === server_name
                  );

                  if (status1) {
                    status1.services.push({
                      service_name: server.split("_")[1].split(".")[0],
                      service_timestamp: timestamp.trim(),
                      service_status: status.trim(),
                      raw_content: raw_content, // Add raw_content here
                    });

                    return;
                  }
                  serviceStatus.push({
                    server_name: server.split("_")[0],
                    server_status: serverResult,
                    services: [
                      {
                        service_name: server.split("_")[1].split(".")[0],
                        service_timestamp: timestamp.trim(),
                        service_status: status.trim(),
                        raw_content: raw_content, // Add raw_content here
                      },
                    ],
                  });
                } else {
                  console.log(
                    `Unexpected format in file ${server}: ${lastLine}`
                  );

                  addServiceStatus(server, "Format Error");
                }
              } else {
                console.log(`File ${server} is empty.`);
                addServiceStatus(server, "Empty File");
              }
            } else {
              console.log(`File ${server} does not exist.`);
              addServiceStatus(server, "File not found");
            }
          }
        } catch (err) {
          console.error(`Error reading file for ${server}:`, err);
          addServiceStatus(server, "Unknown");
        }
      })
    );
    res.json(serviceStatus);
  });
});

app.get("/api/files", limiter, (req, res) => {
  const inputPath = req.query.path || "";
  const requestedPath = path.resolve(ROOT, inputPath);
  if (!requestedPath.startsWith(ROOT)) {
    return res.status(403).json({ error: "Access Denied" });
  }

  try {
    const stat = fs.lstatSync(requestedPath);

    if (stat.isFile()) {
      const content = fs.readFileSync(requestedPath, "utf8");
      return res.json({ type: "file", content });
    } else if (stat.isDirectory()) {
      const items = fs.readdirSync(requestedPath).map((name) => {
        const itemPath = path.join(requestedPath, name);
        const isDirectory = fs.lstatSync(itemPath).isDirectory();
        return { name, isDirectory };
      });
      return res.json({ type: "directory", items });
    } else {
      return res.status(400).json({ error: "Invalid Path" });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/mdmsfiles", limiter, (req, res) => {
  const prodServersPath = path.join(sharedFolderPath, "Prod-Servers"); // Updated path
  fs.readdir(prodServersPath, (err, files) => {
    // Use updated path
    if (err) {
      return res.status(500).send("Unable to scan directory: " + err);
    }

    const mdmsdata = [];

    files.forEach((file) => {
      const filePath = path.join(prodServersPath, file); // Use updated path
      const content = fs.readFileSync(filePath, "utf8");
      const parts = file.split(".")[0].split("_"); // Split filename "Server_Service.txt"
      const server_name = parts[0];
      const service_name = parts[1] || "Unknown"; // Handle cases where service name might be missing

      mdmsdata.push({
        server_name: server_name,
        service_name: service_name,
        link: content, // Content of the file
      });
    });

    res.json(mdmsdata);
  });
});

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});

app.get("/api/disk-usage", limiter, (req, res) => {
  const monitoringPath = path.join(sharedFolderPath, "Monitoring"); // Path to Monitoring directory
  fs.readdir(monitoringPath, (err, files) => {
    // Read from Monitoring directory
    if (err) return res.status(500).json({ error: "Error reading directory" });

    let fileData = [];

    files.forEach((file) => {
      const filePath = path.join(monitoringPath, file); // Use Monitoring path
      const data = fs.readFileSync(filePath, "utf-8");
      const lines = data.split("\n").filter((line) => line.trim() !== "");

      if (lines.length < 2) return; // Skip empty or malformed files

      const timestamp = lines[0].trim(); // First line contains timestamp
      const diskData = lines.slice(1).map((line) => {
        const parts = line.split(/\s+/);
        return {
          filesystem: parts[0],
          size: parts[1],
          used: parts[2],
          available: parts[3],
          usage: parseFloat(parts[4]), // Convert percentage to float
          mount: parts[5],
        };
      });

      fileData.push({
        server_name: file.split(".")[0], // Extract server name from filename (e.g., "Server1" from "Server1.txt")
        lastChecked: timestamp,
        diskUsage: diskData,
      });
    });
    res.json(fileData);
  });
});
