import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const [area, setArea] = useState('');

  const handleSearch = () => {
    const query = area ? `?area=${encodeURIComponent(area)}` : '';
    router.push(`/hotels${query}`);
  };

  return (
    <main className="max-w-4xl mx-auto p-6">
      <section className="h-[600px] bg-cover bg-center flex items-center justify-center animate-heroZoom"
        style={{
          backgroundImage: "url('/travel_forest.png')",
          opacity: 0.8
        }}>
        <div className="bg-black/40 p-8 rounded text-center text-white animate-zoom">
          <h1 className="text-4xl mb-4">
            place to stay booking</h1>
          <label htmlFor="area" className="m-4">目的地から検索</label>
          <br />
          <input
            id="area"
            type="text"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="例: 神奈川"
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 my-2"
          />
          <br />
          <button
            onClick={handleSearch}
            className="bg-orange-500 px-4 py-2 rounded hover:bg-orange-600"
          >
            検索する
          </button>
        </div>
      </section>
    </main>
  );
}
