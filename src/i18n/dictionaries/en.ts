import type { Plural } from "../plural";

/**
 * English UI text. This file defines the shape of every dictionary: `ar.ts`
 * must have exactly the same keys, or the build fails.
 * Item, category and customer names are shop data and are never translated.
 */
export const en = {
  meta: {
    title: "Point of Sale",
    description: "Point of sale system",
  },
  language: {
    label: "Language",
    ar: "العربية",
    en: "English",
  },
  theme: {
    label: "Color theme",
    system: "System theme",
    light: "Light theme",
    dark: "Dark theme",
  },
  nav: {
    main: "Main",
    overview: "Overview",
    catalog: "Catalog",
    peopleOrders: "People & orders",
    pointOfSale: "Point of sale",
    dashboard: "Dashboard",
    items: "Items",
    categories: "Categories",
    purchases: "Purchases",
    customers: "Customers",
    deliveries: "Deliveries",
    users: "Users",
    openPos: "Open POS",
    newSale: "New Sale",
    todaysInvoices: "Today's Invoices",
    adminDashboard: "Admin dashboard",
  },
  roles: {
    ADMIN: "Administrator",
    EMPLOYEE: "Cashier",
  },
  shell: {
    logo: "Shop logo",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    logOut: "Log out",
  },
  login: {
    tagline: "Point of sale",
    welcome: "Welcome back",
    subtitle: "Sign in with your staff account to continue.",
    username: "Username",
    password: "Password",
    showPassword: "Show password",
    hidePassword: "Hide password",
    signIn: "Sign in",
    signingIn: "Signing in…",
    forgot: "Forgot your password? Ask an administrator to reset it.",
    failed: "Login failed",
  },
  errors: {
    credentialsRequired: "Username and password are required",
    invalidCredentials: "Invalid username or password",
  },
  // Plural example used by later chunks; kept here so the shape is fixed early.
  units: { one: "{count} item", other: "{count} items" } as Plural,
};

export type Dictionary = typeof en;
