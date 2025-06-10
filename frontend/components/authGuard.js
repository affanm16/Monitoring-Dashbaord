// import { loginRequest } from "@/config/authConfig";
// import { InteractionStatus } from "@azure/msal-browser";
// import { useMsal } from "@azure/msal-react";
// import { useRouter } from "next/navigation";
import React from "react"; // useEffect, useState might not be needed

const AuthGuard = ({ children }) => {
  // const { instance, inProgress, accounts } = useMsal();
  // const router = useRouter();

  // useEffect(() => {
  //   if (inProgress === "none") {
  //     const activeAccount = instance.getActiveAccount();
  //     if (!activeAccount) {
  //       instance.loginRedirect(loginRequest);
  //     }
  //   }
  // }, [inProgress, instance, router]);

  return <>{children}</>; // Always render children
};

export default AuthGuard;
