import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import pool from '../../lib/db';
import { setLoginCookie } from '../../lib/auth';

type ExistingUserRow = {
  id: number;
};

type InsertedUserRow = {
  id: number;
  name: string;
  email: string;
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

const SALT_ROUNDS = 10;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, password } = req.body as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (!name || !email || !password) {
    return res.status(400).json({ error: '名前・メールアドレス・パスワードは必須です' });
  }

  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedPassword = password.trim();

  if (!trimmedName || !trimmedEmail || !trimmedPassword) {
    return res.status(400).json({ error: '未入力の項目があります' });
  }

  if (trimmedPassword.length < 8) {
    return res.status(400).json({ error: 'パスワードは8文字以上で入力してください' });
  }

  try {
    const existingUserResult = await pool.query<ExistingUserRow>(
      `
      SELECT id
      FROM users
      WHERE email = $1
      `,
      [trimmedEmail]
    );

    if (existingUserResult.rows.length > 0) {
      return res.status(409).json({ error: 'このメールアドレスはすでに登録されています' });
    }

    const hashedPassword = await bcrypt.hash(trimmedPassword, SALT_ROUNDS);

    const insertResult = await pool.query<InsertedUserRow>(
      `
      INSERT INTO users (name, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, name, email
      `,
      [trimmedName, trimmedEmail, hashedPassword]
    );

    const newUser = insertResult.rows[0];

    setLoginCookie(res, newUser.id);

    return res.status(201).json({
      message: 'ユーザー登録が完了しました',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error('ユーザー登録エラー:', error);
    return res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
}
