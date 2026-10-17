// app/fit/page.tsx

'use client';

import { useState } from 'react';
import type { JdAnalysis } from '@/lib/jdfit/types';

export default function FitPage() {
  const [jobDescription, setJobDescription] = useState('');
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [email, setEmail] = useState('');
  const [analysis, setAnalysis] = useState<JdAnalysis | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [consentFull, setConsentFull] = useState(false);
  const [consentAnon, setConsentAnon] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAnalysis(null);
    setLoading(true);
    try {
      const resp = await fetch('/api/jdfit/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data.error ?? 'Analysis error');
      } else {
        setAnalysis(data.analysis);
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Network error';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const resp = await fetch('/api/jdfit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription,
          company: company || undefined,
          jobTitle: jobTitle || undefined,
          email: email || undefined,
          consentFull,
          consentAnon,
        }),
      });
      if (!resp.ok) {
        let errMsg = 'Save error';
        const ct = resp.headers.get('content-type') ?? '';
        if (ct.includes('application/json')) {
          const errData = await resp.json();
          errMsg = errData.error ?? errMsg;
        }
        setError(errMsg);
      } else {
        const ct = resp.headers.get('content-type') ?? '';
        if (ct.includes('application/json')) {
          try {
            await resp.json();
          } catch {
            // ignore malformed or empty JSON
          }
        }
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Network error';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 text-white flex flex-col items-center p-8">
      <h1 className="text-4xl font-bold mb-6">JD‑Fit Analyzer</h1>
      <form onSubmit={handleAnalyze} className="bg-black bg-opacity-60 backdrop-blur-lg rounded-xl p-6 w-full max-w-2xl space-y-4">
        <div>
          <label className="block mb-1 font-medium">Job Description (required)</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            required
            rows={6}
            className="w-full rounded p-2 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Company (optional)"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="rounded p-2 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            placeholder="Job Title (optional)"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className="rounded p-2 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="email"
            placeholder="Email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded p-2 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded transition"
        >
          {loading ? 'Analyzing…' : 'Analyze'}
        </button>
        {error && <p className="text-red-400 mt-2">{error}</p>}
      </form>

      {analysis && (
        <div className="mt-8 w-full max-w-2xl bg-black bg-opacity-50 backdrop-blur-md rounded-xl p-4">
          <h2 className="text-2xl font-semibold mb-2">Analysis Result</h2>
          <pre className="text-sm whitespace-pre-wrap">
            {JSON.stringify({ analysis, meta: { company: company || null, jobTitle: jobTitle || null, email: email || null } }, null, 2)}
          </pre>
          <div className="flex items-center space-x-4 mt-4">
            <label className="flex items-center">
              <input type="checkbox" checked={consentFull} onChange={(e) => setConsentFull(e.target.checked)} className="mr-2" />
              Save full submission
            </label>
            <label className="flex items-center">
              <input type="checkbox" checked={consentAnon} onChange={(e) => setConsentAnon(e.target.checked)} className="mr-2" />
              Contribute anonymous insights
            </label>
            <button onClick={handleSave} disabled={saving} className="py-1 px-3 bg-green-600 hover:bg-green-500 rounded">
              {saving ? 'Saving…' : 'Save Choices'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
