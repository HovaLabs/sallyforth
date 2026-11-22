/// <reference types="vite/client" />
/// <reference types="react-router" />
/// <reference types="@shopify/oxygen-workers-types" />
/// <reference types="@shopify/hydrogen/react-router-types" />

// Enhance TypeScript's built-in typings.
import '@total-typescript/ts-reset';

declare global {
  interface Env {
    /** Public Hydrogen storefront origin used in canonical URLs and sitemaps. */
    PUBLIC_SITE_URL?: string;
    /** Admin API token for the newsletter custom app (write_customers). Server-only. */
    PRIVATE_ADMIN_API_ACCESS_TOKEN?: string;
  }
}
