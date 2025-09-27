import React from 'react'

export default function Question({ q, onAnswer, index }) {
  const [value, setValue] = React.useState(q.questionType === 'multiple-choice' ? [] : null)

  const handleToggleCheckbox = (optionId) => {
    setValue(prev => {
      let next
      if (Array.isArray(prev)) {
        next = prev.includes(optionId) ? prev.filter(id => id !== optionId) : [...prev, optionId]
      } else {
        next = [optionId]
      }
      onAnswer?.(q._id, next)
      return next
    })
  }

  const handleSelectRadio = (optionId) => {
    setValue(optionId)
    onAnswer?.(q._id, optionId)
  }

  const handleText = (text) => {
    setValue(text)
    onAnswer?.(q._id, text)
  }

  return (
    <div className="card p-4">
      <div className="font-medium mb-2">
        {typeof index === 'number' && <span className="text-gray-500 mr-2">Q{index + 1}.</span>}
        {q.questionText}
      </div>
      {q.questionType === 'fill-in-blank' ? (
        <input className="input" placeholder="Your answer" onChange={(e)=>handleText(e.target.value)} />
      ) : q.questionType === 'multiple-choice' ? (
        <div className="space-y-2">
          {q.options?.map(opt => (
            <label key={opt._id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={Array.isArray(value) ? value.includes(opt._id) : false}
                onChange={() => handleToggleCheckbox(opt._id)}
              />
              <span>{opt.text}</span>
            </label>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {q.options?.map(opt => (
            <label key={opt._id} className="flex items-center gap-2">
              <input type="radio" name={q._id} value={opt._id} onChange={() => handleSelectRadio(opt._id)} />
              <span>{opt.text}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
