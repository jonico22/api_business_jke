import { Response } from "express";

export const setSessionCookie = (res: Response, token: string, expiresAt: Date) => {
  res.cookie("session-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
};