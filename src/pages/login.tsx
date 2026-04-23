import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      alert('メールアドレスとパスワードを入力してください');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'ログインに失敗しました');
        return;
      }

      window.dispatchEvent(new Event('auth-changed'));

      const redirect =
        typeof router.query.redirect === 'string'
          ? router.query.redirect
          : '/mypage';

      router.push(redirect);
    } catch (error) {
      console.error(error);
      alert('通信エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">ログイン</h1>

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            パスワード
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 disabled:bg-orange-300"
        >
          {loading ? 'ログイン中...' : 'ログインする'}
        </button>
      </form>

      <p className="mt-6 text-sm text-gray-600">
        アカウントをお持ちでない方は{' '}
        <Link href="/signup" className="text-orange-500 hover:underline">
          新規登録
        </Link>
      </p>
    </main>
  );
}
