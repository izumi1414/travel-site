import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

type BookingHistory = {
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

type LoginUser = {
  id: number;
  name: string;
  email: string;
};

export default function MyPage() {
  const router = useRouter();

  const [user, setUser] = useState<LoginUser | null>(null);
  const [bookings, setBookings] = useState<BookingHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPageData = async () => {
    try {
      setLoading(true);
      setError('');

      const meResponse = await fetch('/api/me');
      const meData = await meResponse.json();

      if (!meResponse.ok) {
        setError(meData.error || 'ユーザー情報の取得に失敗しました');
        return;
      }

      if (!meData.user) {
        router.replace(`/login?redirect=${encodeURIComponent(router.asPath)}`);
        return;
      }

      setUser(meData.user);

      const historyResponse = await fetch('/api/bookings/history');
      const historyData = await historyResponse.json();

      if (!historyResponse.ok) {
        setError(historyData.error || '予約履歴の取得に失敗しました');
        return;
      }

      setBookings(historyData.bookings);
    } catch (err) {
      console.error(err);
      setError('通信エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString('ja-JP');
  };

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-8">
        <p className="text-gray-600">読み込み中...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-8">
        <p className="text-red-500">{error}</p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">マイページ</h1>
      {user && (
        <p className="text-gray-600 mb-6">{user.name}さんの予約履歴</p>
      )}

      {bookings.length === 0 ? (
        <p className="text-gray-600">予約履歴はありません。</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.booking_id}
              className="border border-gray-200 rounded-lg p-5 shadow-sm bg-white"
            >
              <div className="flex justify-between items-start mb-3 gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {booking.hotel_name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    部屋: {booking.room_name}
                  </p>
                </div>

                <span
                  className={`text-sm font-medium px-3 py-1 rounded-full ${
                    booking.status === 'confirmed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {booking.status === 'confirmed' ? '予約済み' : 'キャンセル済み'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
                <p>
                  <span className="font-medium">チェックイン:</span>{' '}
                  {formatDate(booking.check_in)}
                </p>
                <p>
                  <span className="font-medium">チェックアウト:</span>{' '}
                  {formatDate(booking.check_out)}
                </p>
                <p>
                  <span className="font-medium">人数:</span>{' '}
                  {booking.guests_count}名
                </p>
                <p>
                  <span className="font-medium">合計金額:</span>{' '}
                  {booking.total_price.toLocaleString()}円
                </p>
                <p>
                  <span className="font-medium">予約日:</span>{' '}
                  {formatDate(booking.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
