/// <reference types="vite/client" />

interface ImportMetaEnv {
  BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
