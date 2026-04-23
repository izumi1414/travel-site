import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/db';
import { getUserIdFromCookie } from '../../../lib/auth';

type BookingHistoryRow = {
  booking_id: number;
  hotel_name: string;
  room_name: string;
  check_in: string;
  check_out: string;
  guests_count: number;
  total_price: number;
  status: string;
  created_at: string;
};

type Data =
  | { bookings: BookingHistoryRow[] }
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
    return res.status(401).json({ error: 'ログインが必要です' });
  }

  try {
    const result = await pool.query<BookingHistoryRow>(
      `
      SELECT
        b.id AS booking_id,
        h.name AS hotel_name,
        r.name AS room_name,
        b.check_in,
        b.check_out,
        b.guests_count,
        b.total_price,
        b.status,
        b.created_at
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      JOIN hotels h ON r.hotel_id = h.id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
      `,
      [userId]
    );

    return res.status(200).json({
      bookings: result.rows,
    });
  } catch (error) {
    console.error('予約履歴取得エラー:', error);
    return res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
}
