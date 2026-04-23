import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import pool from '../../lib/db';
import { setLoginCookie } from '../../lib/auth';

type UserRow = {
  id: number;
  name: string;
  email: string;
  password: string;
};

type Data =
  | {
      message: string;
      user: {
        id: number;
        name: string;
        email: string;
      };
    }
  | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    return res.status(400).json({ error: 'メールアドレスとパスワードは必須です' });
  }

  try {
    const result = await pool.query<UserRow>(
      `
      SELECT id, name, email, password
      FROM users
      WHERE email = $1
      `,
      [email.trim().toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'メールアドレスまたはパスワードが違います' });
    }

    const user = result.rows[0];

    const isMatched = await bcrypt.compare(password, user.password);

    if (!isMatched) {
      return res.status(401).json({ error: 'メールアドレスまたはパスワードが違います' });
    }

    setLoginCookie(res, user.id);

    return res.status(200).json({
      message: 'ログインしました',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('ログインエラー:', error);
    return res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
}
