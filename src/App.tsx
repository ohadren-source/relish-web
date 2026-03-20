import { useState } from 'react';
import './App.css';

export default function App() {
  const [wisdomCount, setWisdomCount] = useState(9);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const STRIPE_URL = 'https://buy.stripe.com/28E00l3HOg638gA6hxa3u00';
  const BACKEND_URL = 'https://sauc-e-backend-production.up.railway.app';

  const handleAsk = async () => {
    if (!question.trim()) return;
    if (wisdomCount <= 0) {
      window.location.href = STRIPE_URL;
      return;
    }

    setLoading(true);
    setAnswer('');

    try {
      const res = await fetch(`${BACKEND_URL}/api/relish/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, user: 'web-user' }),
      });

      if (res.ok) {
        const data = await res.json();
        setAnswer(data.answer);
        setWisdomCount((prev) => Math.max(0, prev - 1));
      } else {
        setAnswer('Error. Try again.');
      }
    } catch (error) {
      setAnswer('Connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
      <div className="mb-8">
        <img src="/icon.jpg" alt="RELISH" width={120} height={120} />
      </div>

      <h1 className="text-4xl font-bold text-black mb-2">RELISH</h1>
      <p className="text-lg text-gray-600 mb-8">(3,6,9)</p>

      <div className="mb-6 bg-teal-100 border-2 border-teal-500 rounded-lg px-4 py-2">
        <p className="text-teal-800 font-semibold">{wisdomCount} free left</p>
      </div>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask your question..."
        className="w-full max-w-md h-24 p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-teal-500 mb-4"
      />

      <button onClick={handleAsk} disabled={loading} className="bg-teal-500 hover:bg-teal-600 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-lg mb-6 transition">
        {loading ? 'Thinking...' : 'Ask'}
      </button>

      {answer && (
        <div className="w-full max-w-md bg-gray-100 border-l-4 border-teal-500 p-4 rounded-lg">
          <p className="text-gray-800">{answer}</p>
        </div>
      )}

      {wisdomCount === 0 && (
        <a href={STRIPE_URL} target="_blank" rel="noopener noreferrer" className="mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition">
          Get More Wisdom
        </a>
      )}
    </div>
  );
}