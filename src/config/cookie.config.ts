import { CookieOptions } from "express";

export const getRefreshTokenCookieOptions = (): CookieOptions => {
  const isProduction = process.env.NODE_ENV === "production";
  const options: CookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  };

  if (process.env.COOKIE_DOMAIN) {
    options.domain = process.env.COOKIE_DOMAIN;
  }

  return options;
};

export const getRefreshTokenSetCookieOptions = (): CookieOptions => {
  return {
    ...getRefreshTokenCookieOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
};

export const getRefreshTokenClearCookieOptions = (): CookieOptions => {
  return getRefreshTokenCookieOptions();
};
