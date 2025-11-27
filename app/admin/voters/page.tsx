"use client"

import { useEffect, useState } from "react"

export default function AdminVotersPage() {
  const [voters, setVoters] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", designation: "", unitName: "", mobileNo: "" })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setIsLoading(true)
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

  useEffect(() => { load() }, [])

  const createVoter = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/voters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to create voter")
      setForm({ name: "", designation: "", unitName: "", mobileNo: "" })
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create voter")
    } finally {
      setSaving(false)
    }
  }

  const updateVoter = async (id: number, updates: any) => {
    setError(null)
    try {
      const res = await fetch("/api/admin/voters", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to update voter")
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update voter")
    }
  }

  const deleteVoter = async (id: number) => {
    setError(null)
    try {
      const res = await fetch(`/api/admin/voters?id=${id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to delete voter")
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete voter")
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-light text-maroon mb-4">Registered Voters</h1>
      {error && <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-sm mb-4">{error}</div>}

      <div className="bg-white border border-primary/10 rounded p-4 mb-6">
        <h2 className="text-lg font-light text-maroon mb-3">Add Voter</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <input className="border px-2 py-2 text-sm" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="border px-2 py-2 text-sm" placeholder="Designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
          <input className="border px-2 py-2 text-sm" placeholder="Unit" value={form.unitName} onChange={(e) => setForm({ ...form, unitName: e.target.value })} />
          <input className="border px-2 py-2 text-sm" placeholder="Mobile" value={form.mobileNo} onChange={(e) => setForm({ ...form, mobileNo: e.target.value })} />
        </div>
        <div className="mt-3">
          <button onClick={createVoter} disabled={saving} className="px-4 py-2 bg-maroon text-white">
            {saving ? "Saving..." : "Add Voter"}
          </button>
        </div>
      </div>

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
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
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
                    <td className="px-4 py-3">
                      <input className="border px-2 py-1" defaultValue={v.name} onBlur={(e) => updateVoter(v.id, { name: e.target.value })} />
                    </td>
                    <td className="px-4 py-3">
                      <input className="border px-2 py-1" defaultValue={v.designation} onBlur={(e) => updateVoter(v.id, { designation: e.target.value })} />
                    </td>
                    <td className="px-4 py-3">
                      <input className="border px-2 py-1" defaultValue={v.unitName} onBlur={(e) => updateVoter(v.id, { unitName: e.target.value })} />
                    </td>
                    <td className="px-4 py-3">
                      <input className="border px-2 py-1" defaultValue={v.mobileNo} onBlur={(e) => updateVoter(v.id, { mobileNo: e.target.value })} />
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded ${v.status === 'approved' ? 'bg-green-100 text-green-700' : v.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{v.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => updateVoter(v.id, { status: 'approved' })} className="px-3 py-1 bg-green-600 text-white">Approve</button>
                        <button onClick={() => updateVoter(v.id, { status: 'pending' })} className="px-3 py-1 bg-gray-600 text-white">Pending</button>
                        <button onClick={() => updateVoter(v.id, { status: 'rejected' })} className="px-3 py-1 bg-orange-600 text-white">Reject</button>
                        <button onClick={() => deleteVoter(v.id)} className="px-3 py-1 bg-red-600 text-white">Delete</button>
                      </div>
                    </td>
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
