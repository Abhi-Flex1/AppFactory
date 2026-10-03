/** Primary navigation, shared by the top bar and the mobile tab bar. */
export const NAV = [
  { href: "/", label: "Home", symbol: "home", exact: true },
  { href: "/ports", label: "Ports", symbol: "grid" },
  { href: "/architecture", label: "Patterns", symbol: "layers" },
  { href: "/builders", label: "Builders", symbol: "user" }
];

export const SITE = {
  name: "AppFactory",
  tagline: "Global apps ported to OpenHarmony & HarmonyOS",
  url: "https://appfactoryhos.vercel.app",
  repo: "https://github.com/Abhi-Flex1/AppFactory",
  quickstart:
    "git clone https://github.com/Abhi-Flex1/AppFactory.git && cd AppFactory && npm install && npm start"
};

export const isActive = (path, item) => (item.exact ? path === item.href : path.startsWith(item.href));