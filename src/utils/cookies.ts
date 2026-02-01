import { Response } from "express";

const isProduction = process.env.NODE_ENV === 'production';

export const setSessionCookie = (res: Response, token: string, expiresAt: Date) => {
  res.cookie("session-token", token, {
      httpOnly: true,
      secure: isProduction, 
      sameSite: isProduction ? "none" : "lax", 
      path: "/",
      expires: expiresAt,
  });
};