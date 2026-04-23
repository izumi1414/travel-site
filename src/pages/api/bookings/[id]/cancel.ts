import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../../lib/db';

type Data =
  | { message: string }
  | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: '予約IDが必要です' });
  }

  const bookingId = Number(id);

  if (Number.isNaN(bookingId)) {
    return res.status(400).json({ error: '予約IDが不正です' });
  }

  try {
    const bookingResult = await pool.query<{ id: number; status: string }>(
      `
      SELECT id, status
      FROM bookings
      WHERE id = $1
      `,
      [bookingId]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: '予約が見つかりません' });
    }

    const booking = bookingResult.rows[0];

    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'この予約はすでにキャンセル済みです' });
    }

    await pool.query(
      `
      UPDATE bookings
      SET status = 'cancelled'
      WHERE id = $1
      `,
      [bookingId]
    );

    return res.status(200).json({ message: '予約をキャンセルしました' });
  } catch (error) {
    console.error('予約キャンセルエラー:', error);
    return res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
}
