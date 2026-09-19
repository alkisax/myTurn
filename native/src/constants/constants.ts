// native\src\constants\constants.ts

export const backendUrl =
  process.env.EXPO_PUBLIC_BACKEND_URL ??
  'https://myturn.portfolio-projects.space/api';

export const publicWebUrl =
  process.env.EXPO_PUBLIC_PUBLIC_WEB_URL ??
  'https://myturn.portfolio-projects.space';

export const publicTabletTicketStorageKey =
  "myturn-public-tablet-ticket";

export const appName = "My Turn";

// test
export const bannerAdUnitId = 'ca-app-pub-3940256099942544/9214589741';
export const interstitialAdUnitId = 'ca-app-pub-3940256099942544/1033173712';

// production
// export const bannerAdUnitId = "ca-app-pub-4041382605494077/4503369631";
// export const interstitialAdUnitId = "ca-app-pub-4041382605494077/7886237568";
