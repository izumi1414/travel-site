import type { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

const COOKIE_NAME = 'loginUserId';

export function setLoginCookie(res: NextApiResponse, userId: number) {
  const cookie = serialize(COOKIE_NAME, String(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  res.setHeader('Set-Cookie', cookie);
}

export function clearLoginCookie(res: NextApiResponse) {
  const cookie = serialize(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  res.setHeader('Set-Cookie', cookie);
}

export function getUserIdFromCookie(req: NextApiRequest): number | null {
  const cookieValue = req.cookies[COOKIE_NAME];

  if (!cookieValue) {
    return null;
  }

  const userId = Number(cookieValue);

  if (Number.isNaN(userId)) {
    return null;
  }

  return userId;
}
