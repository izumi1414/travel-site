import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../lib/db';
import { getUserIdFromCookie } from '../../lib/auth';

type UserRow = {
  id: number;
  name: string;
  email: string;
};

type Data =
  | {
      user: UserRow | null;
    }
  | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = getUserIdFromCookie(req);

  if (!userId) {
    return res.status(200).json({ user: null });
  }

  try {
    const result = await pool.query<UserRow>(
      `
      SELECT id, name, email
      FROM users
      WHERE id = $1
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({ user: null });
    }

    return res.status(200).json({
      user: result.rows[0],
    });
  } catch (error) {
    console.error('ユーザー取得エラー:', error);
    return res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
}
