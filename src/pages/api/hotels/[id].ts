import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/db';

type Hotel = {
  id: number;
  name: string;
  area: string;
  description: string | null;
  image_url: string | null;
};

type Room = {
  id: number;
  hotel_id: number;
  name: string;
  price: number;
  capacity: number;
  stock: number;
};

type Data =
  | {
      hotel: Hotel;
      rooms: Room[];
    }
  | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const hotelId = Number(id);

  if (Number.isNaN(hotelId)) {
    return res.status(400).json({ error: 'ホテルIDが不正です' });
  }

  try {
    const hotelResult = await pool.query<Hotel>(
      `
      SELECT id, name, area, description, image_url
      FROM hotels
      WHERE id = $1
      `,
      [hotelId]
    );

    if (hotelResult.rows.length === 0) {
      return res.status(404).json({ error: 'ホテルが見つかりません' });
    }

    const roomResult = await pool.query<Room>(
      `
      SELECT id, hotel_id, name, price, capacity, stock
      FROM rooms
      WHERE hotel_id = $1
      ORDER BY id ASC
      `,
      [hotelId]
    );

    return res.status(200).json({
      hotel: hotelResult.rows[0],
      rooms: roomResult.rows,
    });
  } catch (error) {
    console.error('ホテル詳細取得エラー:', error);
    return res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
}
