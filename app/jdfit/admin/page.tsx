// app/jdfit/admin/page.tsx

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface CounterItem {
  counter_key: string;
  count: number;
}

interface SkillItem {
  skill_key: string;
  display_label: string;
  required_occurrences: number;
  preferred_occurrences: number;
  strong_matches: number;
  partial_matches: number;
  gaps: number;
  insufficient_evidence: number;
}

interface SubmissionItem {
  id: string;
  job_description: string;
  company: string | null;
  job_title: string | null;
  visitor_email: string | null;
  created_at: string;
}

interface AdminDashboardData {
  skillAggregates: SkillItem[];
  counters: CounterItem[];
  submissions?: SubmissionItem[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/jdfit/admin/data', {
        method: 'GET',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Unauthorized or fetch error');
      const json = (await res.json()) as AdminDashboardData;
      setData(json);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Fetch error';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchData();
    })();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this submission?')) return;
    try {
      const res = await fetch(`/api/jdfit/admin/delete?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.json();
        alert(`Delete failed: ${err.error || 'unknown'}`);
        return;
      }
      // Refresh data after deletion
      await fetchData();
    } catch (e: unknown) {
      alert('Network error during delete');
    }
  };

  if (loading) return <p className="p-4 text-white">Loading...</p>;
  if (error)
    return (
      <div className="p-4">
        <p className="text-red-400">{error}</p>
        <Link href="/jdfit/admin/login" className="text-indigo-300 underline">
          Login as admin
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">JD‑Fit Admin Dashboard</h1>

      {/* Counters */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Counters</h2>
        <table className="w-full table-auto bg-gray-800 rounded">
          <thead>
            <tr className="bg-gray-700">
              <th className="p-2 text-left">Key</th>
              <th className="p-2 text-left">Count</th>
            </tr>
          </thead>
          <tbody>
            {data?.counters.map((c) => (
              <tr key={c.counter_key} className="border-b border-gray-600">
                <td className="p-2">{c.counter_key}</td>
                <td className="p-2">{c.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Skill Aggregates */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Skill Aggregates</h2>
        <table className="w-full table-auto bg-gray-800 rounded">
          <thead>
            <tr className="bg-gray-700">
              <th className="p-2 text-left">Skill</th>
              <th className="p-2 text-left">Required</th>
              <th className="p-2 text-left">Preferred</th>
              <th className="p-2 text-left">Strong</th>
              <th className="p-2 text-left">Partial</th>
              <th className="p-2 text-left">Gap</th>
              <th className="p-2 text-left">Insufficient</th>
            </tr>
          </thead>
          <tbody>
            {data?.skillAggregates.map((s) => (
              <tr key={s.skill_key} className="border-b border-gray-600">
                <td className="p-2">{s.display_label}</td>
                <td className="p-2">{s.required_occurrences}</td>
                <td className="p-2">{s.preferred_occurrences}</td>
                <td className="p-2">{s.strong_matches}</td>
                <td className="p-2">{s.partial_matches}</td>
                <td className="p-2">{s.gaps}</td>
                <td className="p-2">{s.insufficient_evidence}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Submissions */}
      <section>
        <h2 className="text-2xl font-semibold mb-2">Saved Submissions</h2>
        {data?.submissions && data.submissions.length > 0 ? (
          <table className="w-full table-auto bg-gray-800 rounded">
            <thead>
              <tr className="bg-gray-700">
                <th className="p-2 text-left">Created</th>
                <th className="p-2 text-left">Job Title</th>
                <th className="p-2 text-left">Company</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.submissions.map((sub) => (
                <tr key={sub.id} className="border-b border-gray-600">
                  <td className="p-2">{new Date(sub.created_at).toLocaleString()}</td>
                  <td className="p-2">{sub.job_title ?? ''}</td>
                  <td className="p-2">{sub.company ?? ''}</td>
                  <td className="p-2">{sub.visitor_email ?? ''}</td>
                  <td className="p-2">
                    <button
                      onClick={() => handleDelete(sub.id)}
                      className="px-2 py-1 bg-red-600 hover:bg-red-500 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No saved submissions.</p>
        )}
      </section>
    </div>
  );
}
