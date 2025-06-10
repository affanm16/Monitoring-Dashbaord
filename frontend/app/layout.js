"use client"
import localFont from "next/font/local";
import "./globals.css";
import Script from 'next/script'; // Import Script

// import { PublicClientApplication } from "@azure/msal-browser";
// import { MsalProvider } from "@azure/msal-react";
// import { msalConfig } from "@/config/authConfig";


const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// const msalInstance = new PublicClientApplication(msalConfig);
// async function initializeMsal() {
//   await msalInstance.initialize();
// }
// initializeMsal();


export default function RootLayout({ children }) {
  return (
    // <MsalProvider instance={msalInstance}>
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-switcher" strategy="beforeInteractive">
          {`
            try {
              const theme = localStorage.getItem('theme');
              if (theme === 'dark') {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            } catch (_) {}
          `}
        </Script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
    // </MsalProvider>
  );
}
