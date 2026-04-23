import type { NextApiRequest, NextApiResponse } from 'next';
import { clearLoginCookie } from '../../lib/auth';

type Data =
  | { message: string }
  | { error: string };

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  clearLoginCookie(res);

  return res.status(200).json({
    message: 'ログアウトしました',
  });
}
