import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

type LoginUser = {
  id: number;
  name: string;
  email: string;
};

export default function BookingPage() {
  const router = useRouter();
  const { roomId } = router.query;

  const [user, setUser] = useState<LoginUser | null>(null);
  const [checkingLogin, setCheckingLogin] = useState(true);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guestsCount, setGuestsCount] = useState('1');

  useEffect(() => {
    const fetchLoginUser = async () => {
      try {
        const response = await fetch('/api/me');
        const data = await response.json();

        if (!response.ok) {
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
      } finally {
        setCheckingLogin(false);
      }
    };

    if (!router.isReady) {
      return;
    }

    fetchLoginUser();
  }, [router]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!roomId || typeof roomId !== 'string') {
      alert('部屋IDが取得できません');
      return;
    }

    if (!checkIn || !checkOut || !guestsCount) {
      alert('必要項目を入力してください');
      return;
    }

    router.push({
      pathname: '/booking/confirm',
      query: {
        roomId,
        checkIn,
        checkOut,
        guestsCount,
      },
    });
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
      <h1 className="text-2xl font-bold text-gray-800 mb-2">予約入力</h1>

      {user && (
        <p className="text-gray-600 mb-6">
          ログイン中: {user.name}さん
        </p>
      )}

      <p className="text-gray-600 mb-6">部屋ID: {roomId}</p>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div>
          <label
            htmlFor="checkIn"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            チェックイン
          </label>
          <input
            id="checkIn"
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
          />
        </div>

        <div>
          <label
            htmlFor="checkOut"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            チェックアウト
          </label>
          <input
            id="checkOut"
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
          />
        </div>

        <div>
          <label
            htmlFor="guestsCount"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            人数
          </label>
          <input
            id="guestsCount"
            type="number"
            min="1"
            value={guestsCount}
            onChange={(e) => setGuestsCount(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600"
        >
          確認画面へ
        </button>
      </form>
    </main>
  );
}
