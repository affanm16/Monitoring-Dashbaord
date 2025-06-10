"use client";
// import { loginRequest } from "@/config/authConfig";
// import { useMsal } from "@azure/msal-react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react"; // useState might not be needed
import Hero from "@/components/hero";
// import AuthGuard from "@/components/authGuard";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    // const token = sessionStorage.getItem("token");
    // if (!token) {
    //   router.push("/signin"); // This redirection is commented out
    // }
  }, [router]); // router dependency

  return (
    // <AuthGuard>
      <Hero />
    // </AuthGuard>
  );
}
