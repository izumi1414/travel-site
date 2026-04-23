import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/db';
import { getUserIdFromCookie } from '../../../lib/auth';

type BookingRequestBody = {
  roomId?: number;
  checkIn?: string;
  checkOut?: string;
  guestsCount?: number;
};

type Data =
  | {
      message: string;
      bookingId: number;
    }
  | { error: string };

type RoomRow = {
  id: number;
  hotel_id: number;
  name: string;
  price: number;
  capacity: number;
  stock: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const userId = getUserIdFromCookie(req);

  if (!userId) {
    return res.status(401).json({ error: '予約にはログインが必要です' });
  }

  const { roomId, checkIn, checkOut, guestsCount } =
    req.body as BookingRequestBody;

  if (!roomId || !checkIn || !checkOut || !guestsCount) {
    return res.status(400).json({ error: '必要項目が不足しています' });
  }

  const parsedRoomId = Number(roomId);
  const parsedGuestsCount = Number(guestsCount);

  if (Number.isNaN(parsedRoomId) || Number.isNaN(parsedGuestsCount)) {
    return res.status(400).json({ error: '数値項目が不正です' });
  }

  if (parsedGuestsCount <= 0) {
    return res.status(400).json({ error: '宿泊人数が不正です' });
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (
    Number.isNaN(checkInDate.getTime()) ||
    Number.isNaN(checkOutDate.getTime())
  ) {
    return res.status(400).json({ error: '日付の形式が不正です' });
  }

  const diffMs = checkOutDate.getTime() - checkInDate.getTime();
  const nights = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (nights <= 0) {
    return res
      .status(400)
      .json({ error: 'チェックアウト日はチェックイン日の後にしてください' });
  }

  try {
    const roomResult = await pool.query<RoomRow>(
      `
      SELECT id, hotel_id, name, price, capacity, stock
      FROM rooms
      WHERE id = $1
      `,
      [parsedRoomId]
    );

    if (roomResult.rows.length === 0) {
      return res.status(404).json({ error: '部屋が見つかりません' });
    }

    const room = roomResult.rows[0];

    if (parsedGuestsCount > room.capacity) {
      return res
        .status(400)
        .json({ error: '宿泊人数が部屋の定員を超えています' });
    }

    const totalPrice = room.price * nights;

    const insertResult = await pool.query<{ id: number }>(
      `
      INSERT INTO bookings (
        user_id,
        room_id,
        check_in,
        check_out,
        guests_count,
        total_price
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
      `,
      [
        userId,
        parsedRoomId,
        checkIn,
        checkOut,
        parsedGuestsCount,
        totalPrice,
      ]
    );

    return res.status(201).json({
      message: '予約を登録しました',
      bookingId: insertResult.rows[0].id,
    });
  } catch (error) {
    console.error('予約登録エラー:', error);
    return res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
}
