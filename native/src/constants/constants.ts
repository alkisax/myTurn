// native\src\constants\constants.ts

export const backendUrl =
  process.env.EXPO_PUBLIC_BACKEND_URL ??
  'https://myturn.portfolio-projects.space/api';

export const publicWebUrl =
  process.env.EXPO_PUBLIC_PUBLIC_WEB_URL ??
  'https://myturn.portfolio-projects.space';

export const publicTabletTicketStorageKey =
  "myturn-public-tablet-ticket";

export const CHAT_RELAY_URL = "https://signalr-room-relay.portfolio-projects.space";
export const CHAT_SIGNALR_URL = `${CHAT_RELAY_URL}/room`;

export const appName = "My Turn";

export const bannerAdUnitId = "ca-app-pub-change later";
export const interstitialAdUnitId = "ca-app-pub-change later";
