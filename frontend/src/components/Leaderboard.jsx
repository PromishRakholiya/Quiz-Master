import React from 'react'

export default function Leaderboard({ items }) {
  if (!items?.length) return <div className="text-sm text-gray-600">No entries yet.</div>
  return (
    <div className="card p-4">
      <h3 className="font-semibold mb-3">Leaderboard</h3>
      <ol className="space-y-1">
        {items.map((it, idx) => (
          <li key={idx} className="flex justify-between text-sm">
            <span>{idx+1}. {it.userId?.firstName} {it.userId?.lastName}</span>
            <span className="font-medium">{it.score} ({it.percentage || '-'}%)</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
