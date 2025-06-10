
export const msalConfig = {
    auth: {
      clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
      authority: process.env.NEXT_PUBLIC_AUTHORITY,
      redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI,
    },
    cache: {
      cacheLocation: "sessionStorage",
      storeAuthStateInCookie: false,
    },
  };
  
  export const loginRequest = {
    scopes: [process.env.NEXT_PUBLIC_SCOPES],
  };