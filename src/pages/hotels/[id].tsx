import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';

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

export default function HotelDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!router.isReady || !id) return;

    const fetchHotelDetail = async () => {
      try {
        const response = await fetch(`/api/hotels/${id}`);
        const data = await response.json();

        if (!response.ok) {
          alert(data.error || 'ホテル詳細の取得に失敗しました');
          return;
        }

        setHotel(data.hotel);
        setRooms(data.rooms);
      } catch (error) {
        console.error(error);
        alert('通信エラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchHotelDetail();
  }, [router.isReady, id]);

  if (loading) {
    return <div style={{ padding: '24px' }}>読み込み中...</div>;
  }

  if (!hotel) {
    return <div style={{ padding: '24px' }}>ホテル情報がありません。</div>;
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <div className="bg-white rounded-xl p-6 mb-6 mx-8">
        <h1 className="text-xl">{hotel.name}</h1>
        <p>エリア: {hotel.area}</p>
        <p>{hotel.description}</p>
      </div>

      <h2 className="mt-6 text-center">部屋一覧</h2>

      {rooms.length === 0 ? (
        <p>部屋情報がありません。</p>
      ) : (
        <div style={{ marginTop: '16px' }}>
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-md p-6 mb-6 mx-8"
              style={{
                border: '1px solid #ccc'
              }}
            >
              <h3>{room.name}</h3>
              <p>料金: {room.price.toLocaleString()}円 / 泊</p>
              <p>定員: {room.capacity}名</p>
              <p>残り: {room.stock}</p>

              <Link href={`/booking?roomId=${room.id}`} className="text-blue-600 underline">
                この部屋を予約する
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
