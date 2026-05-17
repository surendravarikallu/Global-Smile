import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageSquare, Smartphone, AlertCircle, CheckCircle2, History } from 'lucide-react';

export default function CommunicationTest() {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState<'SMS' | 'WHATSAPP'>('SMS');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; msg: string; sid?: string } | null>(null);

  const handleTestSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/notifications/test-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, message, channel }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setResult({ success: true, msg: 'Message sent successfully!', sid: data.sid });
      } else {
        setResult({ success: false, msg: data.error || 'Failed to send message' });
      }
    } catch (error: any) {
      setResult({ success: false, msg: error.message || 'Network error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Communication Test Hub</h1>
        <p className="text-gray-500">Manually trigger and monitor SMS & WhatsApp messages via Twilio.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Send Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <Send className="w-5 h-5 mr-2 text-indigo-600" />
            Send Test Message
          </h2>

          <form onSubmit={handleTestSend} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Phone Number</label>
              <input
                type="text"
                placeholder="+1234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">Must include country code (e.g., +91 for India).</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Channel</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setChannel('SMS')}
                  className={`flex-1 flex items-center justify-center py-2 px-4 rounded-lg border ${
                    channel === 'SMS' 
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  SMS
                </button>
                <button
                  type="button"
                  onClick={() => setChannel('WHATSAPP')}
                  className={`flex-1 flex items-center justify-center py-2 px-4 rounded-lg border ${
                    channel === 'WHATSAPP' 
                      ? 'border-green-600 bg-green-50 text-green-700' 
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  WhatsApp
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message Body</label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                placeholder="Hello, this is a test from Global Smile..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send {channel} Test
                </>
              )}
            </button>
          </form>

          {/* Result Panel */}
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`mt-6 p-4 rounded-lg border ${
                result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-start">
                {result.success ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 mr-3 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 shrink-0" />
                )}
                <div>
                  <h4 className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                    {result.success ? 'Delivered' : 'Delivery Failed'}
                  </h4>
                  <p className={`text-sm mt-1 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                    {result.msg}
                  </p>
                  {result.sid && (
                    <p className="text-xs text-green-600 mt-2 font-mono break-all">SID: {result.sid}</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Instructions / Monitoring Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div className="bg-slate-900 rounded-xl shadow-sm p-6 text-white">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-indigo-400">
              <History className="w-5 h-5 mr-2" />
              Webhook Monitoring
            </h2>
            <p className="text-slate-300 text-sm mb-4">
              To monitor real-time incoming replies from patients on localhost, you need to use a tunneling service to bypass the 403 Forbidden error.
            </p>
            
            <div className="bg-black/50 rounded-lg p-4 font-mono text-sm border border-slate-700">
              <div className="text-green-400 mb-2"># 1. Stop ngrok and run localtunnel instead:</div>
              <div className="text-white mb-4">npx localtunnel --port 5000</div>
              
              <div className="text-green-400 mb-2"># 2. Copy the resulting URL and append the webhook path:</div>
              <div className="text-slate-400">https://your-url.loca.lt<span className="text-indigo-400">/api/notifications/webhook</span></div>
            </div>

            <p className="text-slate-400 text-xs mt-4">
              * Localtunnel bypasses the "browser warning" screen that Ngrok free tier injects, which causes the Twilio 403 errors.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Twilio Sandbox Opt-In</h3>
            <p className="text-sm text-gray-600 mb-4">
              If your WhatsApp messages are failing silently, the recipient MUST send the sandbox keyword to your Twilio number first.
            </p>
            <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg text-sm border border-yellow-200">
              Check your Twilio console for the specific keyword (e.g. "join science-fiction") and text it to +1 415 523 8886.
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
