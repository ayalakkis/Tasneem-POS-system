import type { Dictionary } from "./en";

/**
 * Arabic UI text (Modern Standard Arabic, standard retail terms).
 * Same keys as `en.ts`; TypeScript rejects anything missing or extra.
 * No hyphens or dashes in visible text.
 */
export const ar: Dictionary = {
  meta: {
    title: "نقطة البيع",
    description: "نظام نقطة البيع",
  },
  language: {
    label: "اللغة",
    ar: "العربية",
    en: "English",
  },
  theme: {
    label: "مظهر الألوان",
    system: "حسب النظام",
    light: "المظهر الفاتح",
    dark: "المظهر الداكن",
  },
  nav: {
    main: "القائمة الرئيسية",
    overview: "نظرة عامة",
    catalog: "المنتجات",
    peopleOrders: "العملاء والطلبات",
    pointOfSale: "نقطة البيع",
    dashboard: "لوحة التحكم",
    items: "الأصناف",
    categories: "الفئات",
    purchases: "المشتريات",
    customers: "العملاء",
    deliveries: "التوصيل",
    users: "المستخدمون",
    openPos: "فتح نقطة البيع",
    newSale: "بيع جديد",
    todaysInvoices: "فواتير اليوم",
    adminDashboard: "لوحة الإدارة",
  },
  roles: {
    ADMIN: "مدير",
    EMPLOYEE: "أمين صندوق",
  },
  shell: {
    logo: "شعار المتجر",
    openMenu: "فتح القائمة",
    closeMenu: "إغلاق القائمة",
    logOut: "تسجيل الخروج",
  },
  login: {
    tagline: "نقطة البيع",
    welcome: "أهلاً بعودتك",
    subtitle: "سجّل الدخول بحساب الموظف للمتابعة.",
    username: "اسم المستخدم",
    password: "كلمة المرور",
    showPassword: "إظهار كلمة المرور",
    hidePassword: "إخفاء كلمة المرور",
    signIn: "تسجيل الدخول",
    signingIn: "جارٍ تسجيل الدخول…",
    forgot: "نسيت كلمة المرور؟ اطلب من المدير إعادة تعيينها.",
    failed: "تعذّر تسجيل الدخول",
  },
  errors: {
    credentialsRequired: "اسم المستخدم وكلمة المرور مطلوبان",
    invalidCredentials: "اسم المستخدم أو كلمة المرور غير صحيحة",
  },
  units: {
    zero: "لا أصناف",
    one: "صنف واحد",
    two: "صنفان",
    few: "{count} أصناف",
    many: "{count} صنفاً",
    other: "{count} صنف",
  },
};
