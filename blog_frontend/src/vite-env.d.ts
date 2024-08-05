/// <reference types="vite/client" />

interface ImportMetaEnv {
    // Define your custom environment variables here
    VITE_API_URL: string;
    VITE_WEBSOCKET_SERVER_URL: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  