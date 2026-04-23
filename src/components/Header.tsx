import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

type LoginUser = {
  id: number;
  name: string;
  email: string;
} | null;

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<LoginUser>(null);
  const [loading, setLoading] = useState(true);

  const fetchLoginUser = async () => {
    try {
      setLoading(true);

      const response = await fetch('/api/me');
      const data = await response.json();

      if (!response.ok) {
        setUser(null);
        return;
      }

      setUser(data.user);
    } catch (error) {
      console.error('ログインユーザー取得エラー:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoginUser();
  }, []);

  useEffect(() => {
    const handleAuthChanged = () => {
      fetchLoginUser();
    };

    window.addEventListener('auth-changed', handleAuthChanged);

    return () => {
      window.removeEventListener('auth-changed', handleAuthChanged);
    };
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'ログアウトに失敗しました');
        return;
      }

      setUser(null);
      window.dispatchEvent(new Event('auth-changed'));
      router.push('/');
    } catch (error) {
      console.error(error);
      alert('通信エラーが発生しました');
    }
  };

  return (
    <header className="bg-white shadow px-6 py-4">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        <Link href="/" className="text-2xl font-bold text-orange-500">
          travel-site
        </Link>

        <nav className="flex items-center gap-6 text-gray-700">
          <Link href="/" className="hover:underline underline-offset-4">
            ホーム
          </Link>

          {loading ? (
            <span className="text-sm text-gray-400">読み込み中...</span>
          ) : user ? (
            <>
              <span className="text-sm text-gray-600">{user.name}さん</span>

              <Link
                href="/mypage"
                className="hover:underline underline-offset-4"
              >
                マイページ
              </Link>

              <button
                onClick={handleLogout}
                className="hover:underline underline-offset-4"
              >
                ログアウト
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hover:underline underline-offset-4"
              >
                ログイン
              </Link>

              <Link
                href="/signup"
                className="hover:underline underline-offset-4"
              >
                新規登録
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
