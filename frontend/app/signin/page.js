"use client";

// import { loginRequest, msalConfig } from "@/config/authConfig";
// import { useMsal } from "@azure/msal-react";
// import { useRouter } from "next/navigation";
import React from "react"; // useEffect, useState might not be needed anymore
// import { jwtDecode } from "jwt-decode";
// import { InteractionStatus } from "@azure/msal-browser";

const Page = () => {
  // const { instance, accounts, inProgress } = useMsal();
  // const router = useRouter();
  // const [loading, setLoading] = useState(true); // Not needed if not doing auth
  // const [firstLogin, setFirstLogin] = useState(true); // Not needed

  // const checkAuth = async () => {
  //   // All logic here should be commented or removed
  // };

  // useEffect(() => {
  //   // Auth check logic was here
  // }, []); // Removed inProgress dependency

  // Render a simple message or redirect if necessary, but no auth logic
  return (
    <div className="h-screen flex items-center justify-center">
      Sign-in page is bypassed for local development.
    </div>
  );
};

export default Page;
