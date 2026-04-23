import Link from 'next/link';

export default function BookingCompletePage() {
  return (
    <main style={{ padding: '24px' }}>
      <h1 className="text-center">予約完了</h1>
      <p className="text-center">ご予約ありがとうございました。</p>

      <div style={{ marginTop: '24px' }}>
        <Link href="/" className="text-blue-600 underline text-center">トップへ戻る</Link>
      </div>
    </main>
  );
}
