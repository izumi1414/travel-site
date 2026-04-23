import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

type LoginUser = {
  id: number;
  name: string;
  email: string;
};

export default function BookingConfirmPage() {
  const router = useRouter();
  const { roomId, checkIn, checkOut, guestsCount } = router.query;

  const [user, setUser] = useState<LoginUser | null>(null);
  const [checkingLogin, setCheckingLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLoginUser = async () => {
      try {
        const response = await fetch('/api/me');
        const data = await response.json();

        if (!response.ok) {
          alert(data.error || 'ユーザー情報の取得に失敗しました');
          setCheckingLogin(false);
          return;
        }

        if (!data.user) {
          router.replace(`/login?redirect=${encodeURIComponent(router.asPath)}`);
          return;
        }

        setUser(data.user);
      } catch (error) {
        console.error(error);
        alert('通信エラーが発生しました');
      } finally {
        setCheckingLogin(false);
      }
    };

    fetchLoginUser();
  }, [router]);

  const handleBooking = async () => {
    if (
      typeof roomId !== 'string' ||
      typeof checkIn !== 'string' ||
      typeof checkOut !== 'string' ||
      typeof guestsCount !== 'string'
    ) {
      alert('予約情報が不足しています');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId: Number(roomId),
          checkIn,
          checkOut,
          guestsCount: Number(guestsCount),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || '予約に失敗しました');

        if (response.status === 401) {
          router.push('/login');
        }
        return;
      }

      router.push('/booking/complete');
    } catch (error) {
      console.error(error);
      alert('通信エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  if (checkingLogin) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-8">
        <p className="text-gray-600">ログイン状態を確認中...</p>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">予約確認</h1>

      {user && (
        <p className="text-gray-600 mb-6">
          ログイン中: {user.name}さん
        </p>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-3">
        <p>部屋ID: {roomId}</p>
        <p>チェックイン: {checkIn}</p>
        <p>チェックアウト: {checkOut}</p>
        <p>人数: {guestsCount}</p>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          戻る
        </button>

        <button
          onClick={handleBooking}
          disabled={loading}
          className="px-4 py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600 disabled:bg-orange-300"
        >
          {loading ? '送信中...' : '予約を確定する'}
        </button>
      </div>
    </main>
  );
}
