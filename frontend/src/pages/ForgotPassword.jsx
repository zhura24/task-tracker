import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // We'll also store the token just for demonstration since we aren't actually emailing it
  const [demoToken, setDemoToken] = useState(null); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setDemoToken(null);
    setLoading(true);

    try {
      const res = await fetch('https://task-tracker-backend-ruddy.vercel.app/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Failed to process request');
      } else {
        setMessage(data.message);
        if (data.resetToken) {
          setDemoToken(data.resetToken);
        }
      }
    } catch (err) {
      setError('Network error, please try again later');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">Forgot Password</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-8">
          Enter your email address and we will send you a link to reset your password.
        </p>

        {error && <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        {message && (
          <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-3 rounded-lg mb-4 text-sm">
            {message}
          </div>
        )}
        
        {demoToken && (
          <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 p-3 rounded-lg mb-4 text-sm break-words">
            <strong>Demo Only:</strong> Use this link to reset:<br/>
            <Link to={`/reset-password?token=${demoToken}`} className="underline font-medium">
              Reset Password Link
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" required />
          </div>
          <button type="submit" disabled={loading} className={`w-full bg-indigo-600 text-white font-medium py-2 rounded-lg hover:bg-indigo-700 transition ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm">
          <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
