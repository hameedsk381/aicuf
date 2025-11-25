"use client"

import { useEffect, useState } from "react"

export default function AdminVotersPage() {
  const [voters, setVoters] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchVoters = async () => {
      try {
        const res = await fetch("/api/admin/voters")
        const result = await res.json()
        if (!res.ok) throw new Error(result.message || "Failed to fetch voters")
        setVoters(result.data)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load voters")
      } finally {
        setIsLoading(false)
      }
    }
    fetchVoters()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-light text-maroon mb-4">Registered Voters</h1>
      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-sm mb-4">{error}</div>}
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto border border-gray-200">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Voter ID</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Designation</th>
                <th className="px-4 py-2 text-left">Unit</th>
                <th className="px-4 py-2 text-left">Mobile</th>
                <th className="px-4 py-2 text-left">Registered</th>
              </tr>
            </thead>
            <tbody>
              {voters.length === 0 ? (
                <tr>
                  <td className="px-4 py-3" colSpan={6}>No voters found</td>
                </tr>
              ) : (
                voters.map((v) => (
                  <tr key={v.id} className="border-t">
                    <td className="px-4 py-3 font-medium">{v.voterId}</td>
                    <td className="px-4 py-3">{v.name}</td>
                    <td className="px-4 py-3">{v.designation}</td>
                    <td className="px-4 py-3">{v.unitName}</td>
                    <td className="px-4 py-3">{v.mobileNo}</td>
                    <td className="px-4 py-3">{new Date(v.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

