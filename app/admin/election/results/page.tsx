"use client"

import { useEffect, useState } from "react"

export default function AdminElectionResultsPage() {
  const [results, setResults] = useState<Record<string, { candidateId: number; name: string; unitName: string; count: number }[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/admin/election/results')
        const data = await res.json()
        if (!res.ok || !data.success) throw new Error(data.message || 'Failed to load results')
        setResults(data.results)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load results')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-light text-maroon mb-4">Election Results</h1>
      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-sm mb-4">{error}</div>}
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-8">
          {Object.keys(results).length === 0 ? (
            <div>No votes yet</div>
          ) : (
            Object.entries(results).map(([position, candidates]) => (
              <div key={position} className="bg-white border border-primary/10 rounded p-4">
                <h2 className="text-lg font-light text-maroon mb-3">{position}</h2>
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left">Candidate</th>
                      <th className="px-4 py-2 text-left">Unit</th>
                      <th className="px-4 py-2 text-left">Votes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.sort((a, b) => b.count - a.count).map(c => (
                      <tr key={c.candidateId} className="border-t">
                        <td className="px-4 py-2">{c.name}</td>
                        <td className="px-4 py-2">{c.unitName}</td>
                        <td className="px-4 py-2 font-medium">{c.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

