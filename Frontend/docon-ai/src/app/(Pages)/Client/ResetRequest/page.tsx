'use client';

import { useState } from 'react';

export default function ResetRequestPage() {
  const [input, setInput] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/user/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_or_username: input }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Reset link has been sent to your email.');
        setInput('');
      } else {
        setError(data.detail || 'Something went wrong.');
      }
    } catch {
      setError('Server error. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-[#166394]">Forgot Password?</h2>
        <p className="text-sm text-gray-600 mb-4">Enter your username or email. We'll send you a reset link.</p>

        {error && <p className="text-red-500 mb-2">{error}</p>}
        {message && <p className="text-green-600 mb-2">{message}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Email or Username"
            className="w-full px-4 py-2 border rounded shadow"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#166394] text-white py-2 rounded hover:bg-[#1e4561] transition"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
}
