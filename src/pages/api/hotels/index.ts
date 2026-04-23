import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../../lib/db';

type HotelRow = {
  id: number;
  name: string;
  area: string;
  description: string | null;
  image_url: string | null;
  min_price: number;
};

type Data =
  | { hotels: HotelRow[] }
  | { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await pool.query<HotelRow>(
      `
      SELECT
        h.id,
        h.name,
        h.area,
        h.description,
        h.image_url,
        MIN(r.price) AS min_price
      FROM hotels h
      JOIN rooms r ON h.id = r.hotel_id
      GROUP BY h.id, h.name, h.area, h.description, h.image_url
      ORDER BY h.id ASC
      `
    );

    return res.status(200).json({ hotels: result.rows });
  } catch (error) {
    console.error('ホテル一覧取得エラー:', error);
    return res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
}
