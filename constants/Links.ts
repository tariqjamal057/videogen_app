const rawBaseUrl =
  process.env.EXPO_PUBLIC_BASE_URL || "http://backend.clipzovideoai.com";
const BASE_URL = rawBaseUrl.endsWith("/") ? rawBaseUrl : `${rawBaseUrl}/`;

export const Links = {
  terms: `${BASE_URL}terms.html`,
  privacy: `${BASE_URL}privacy.html`,
};

export const plans = {
  videogen_credits_15: "videogen_credits_15", // 299
  videogen_credits_35: "videogen_credits_35", // 699
  videogen_credits_100: "videogen_credits_100", // 1999
};
