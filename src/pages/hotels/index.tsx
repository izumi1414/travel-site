import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

type Hotel = {
  id: number;
  name: string;
  area: string;
  description: string | null;
  image_url: string | null;
  min_price: number;
};

export default function HotelsPage() {
  const router = useRouter();
  const { area } = router.query;

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await fetch('/api/hotels');
        const data = await response.json();

        if (!response.ok) {
          alert(data.error || 'ホテル一覧の取得に失敗しました');
          return;
        }

        let filteredHotels = data.hotels as Hotel[];

        if (typeof area === 'string' && area.trim() !== '') {
          filteredHotels = filteredHotels.filter((hotel) =>
            hotel.area.includes(area)
          );
        }

        setHotels(filteredHotels);
      } catch (error) {
        console.error(error);
        alert('通信エラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [area]);

  if (loading) {
    return <div style={{ padding: '24px' }}>読み込み中...</div>;
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-center">ホテル一覧</h1>

      {typeof area === 'string' && area && (
        <p>検索条件: {area}</p>
      )}

      {hotels.length === 0 ? (
        <p>ホテルが見つかりませんでした。</p>
      ) : (
        <div className="space-y-4">
          {hotels.map((hotel) => (
            <div
              key={hotel.id}
              className="border border-gray-200 rounded-lg p-5 shadow-sm bg-white"
            >
              <h2 className="text-xl">{hotel.name}</h2>
              <p>エリア: {hotel.area}</p>
              <p>{hotel.description}</p>
              <p>最安料金: {hotel.min_price.toLocaleString()}円〜</p>

              <Link href={`/hotels/${hotel.id}`} className="text-blue-600 underline">詳細を見る</Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
