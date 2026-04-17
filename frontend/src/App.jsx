import { useState, useRef } from 'react'
import { Mic, Upload, FileText, CheckSquare, Zap, AlertCircle, Download, RotateCcw, ChevronRight, Loader, Cloud } from 'lucide-react'
import { transcribeAudio, generateNotes, processFull } from './services/api'
import './App.css'

export default function App() {
  const [step, setStep]           = useState('upload')
  const [mode, setMode]           = useState('audio')
  const [file, setFile]           = useState(null)
  const [title, setTitle]         = useState('')
  const [transcript, setTranscript] = useState('')
  const [notes, setNotes]         = useState(null)
  const [loading, setLoading]     = useState(false)
  const [loadMsg, setLoadMsg]     = useState('')
  const [error, setError]         = useState('')
  const [drag, setDrag]           = useState(false)
  const fileRef = useRef()

  const reset = () => {
    setStep('upload'); setFile(null); setTranscript(''); setNotes(null); setError(''); setTitle('')
  }

  const handleFile = (f) => { if (f) { setFile(f); setError('') } }

  const runTranscribe = async () => {
    if (!file) return setError('Please select an audio file.')
    setError(''); setLoading(true); setLoadMsg('Sending to Azure Speech Service…')
    try {
      const res = await transcribeAudio(file)
      setTranscript(res.transcript)
      setStep('transcript')
    } catch (e) {
      setError(e.response?.data?.detail || 'Transcription failed. Check backend is running.')
    } finally { setLoading(false) }
  }

  const runGenerateNotes = async () => {
    if (!transcript.trim()) return setError('Transcript is empty.')
    setError(''); setLoading(true); setLoadMsg('Azure OpenAI GPT-4o generating notes…')
    try {
      const res = await generateNotes(transcript, title || 'Meeting')
      setNotes(res.notes); setStep('notes')
    } catch (e) {
      setError(e.response?.data?.detail || 'Notes generation failed.')
    } finally { setLoading(false) }
  }

  const runFull = async () => {
    if (!file) return setError('Please select an audio file.')
    setError(''); setLoading(true); setLoadMsg('Azure Speech → GPT-4o pipeline running…')
    try {
      const res = await processFull(file, title || 'Meeting')
      setTranscript(res.transcript); setNotes(res.notes); setStep('notes')
    } catch (e) {
      setError(e.response?.data?.detail || 'Processing failed.')
    } finally { setLoading(false) }
  }

  const downloadMd = () => {
    if (!notes) return
    const md = buildMd(notes, title, transcript)
    const a  = Object.assign(document.createElement('a'), {
      href:     URL.createObjectURL(new Blob([md], { type: 'text/markdown' })),
      download: `${title || 'meeting'}-notes.md`
    })
    a.click()
  }

  const steps = ['upload', 'transcript', 'notes']

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <Cloud size={18} className="logo-icon" />
            <span>NoteAI <span className="logo-azure">Azure</span></span>
          </div>
          <nav className="breadcrumb">
            {steps.map((s, i) => (
              <span key={s} className={`crumb ${step === s ? 'active' : ''} ${steps.indexOf(step) > i ? 'done' : ''}`}>
                {i > 0 && <ChevronRight size={13} />}
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </span>
            ))}
          </nav>
          {step !== 'upload' && (
            <button className="btn-ghost" onClick={reset}><RotateCcw size={14} /> New</button>
          )}
        </div>
      </header>

      <main className="main">
        {/* ── Hero ── */}
        {step === 'upload' && (
          <div className="hero">
            <div className="azure-badges">
              <span className="badge-az">Azure Speech</span>
              <span className="badge-az">OpenAI GPT-4o</span>
              <span className="badge-az">Blob Storage</span>
            </div>
            <h1 className="hero-title">AI Meeting Notes<br /><em>Generator</em></h1>
            <p className="hero-sub">Powered entirely by Azure cloud services — Speech-to-Text transcription + GPT-4o structured notes.</p>
          </div>
        )}

        <div className="card-container">
          {/* ── STEP 1: UPLOAD ── */}
          {step === 'upload' && (
            <div className="card">
              <div className="card-head"><h2>Start new meeting</h2></div>

              <div className="field">
                <label>Meeting title <span className="opt">(optional)</span></label>
                <input className="text-input" placeholder="e.g. Q2 Planning — 14 Apr 2026"
                  value={title} onChange={e => setTitle(e.target.value)} />
              </div>

              <div className="tabs">
                <button className={`tab ${mode === 'audio' ? 'active' : ''}`} onClick={() => setMode('audio')}>
                  <Mic size={15} /> Audio file
                </button>
                <button className={`tab ${mode === 'text' ? 'active' : ''}`} onClick={() => setMode('text')}>
                  <FileText size={15} /> Paste transcript
                </button>
              </div>

              {mode === 'audio' ? (
                <>
                  <div
                    className={`dropzone ${drag ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
                    onClick={() => fileRef.current.click()}
                    onDragOver={e => { e.preventDefault(); setDrag(true) }}
                    onDragLeave={() => setDrag(false)}
                    onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]) }}
                  >
                    <input ref={fileRef} type="file" accept="audio/*" hidden
                      onChange={e => handleFile(e.target.files[0])} />
                    {file ? (
                      <div className="file-info">
                        <span className="file-emoji">🎙</span>
                        <div>
                          <p className="file-name">{file.name}</p>
                          <p className="file-meta">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload size={28} className="drop-icon" />
                        <p className="drop-label">Drop audio or click to browse</p>
                        <p className="drop-hint">WAV · MP3 · M4A · MP4 · WEBM — max 100 MB</p>
                      </>
                    )}
                  </div>

                  <div className="service-note">
                    <Cloud size={13} /> Audio → <strong>Azure Speech Service</strong> → Transcript → <strong>OpenAI GPT-4o</strong> → Notes
                  </div>

                  <div className="btn-row">
                    <button className="btn-secondary" onClick={runTranscribe} disabled={!file || loading}>
                      {loading ? <><Loader size={15} className="spin" /> {loadMsg}</> : <><Mic size={15} /> Transcribe only</>}
                    </button>
                    <button className="btn-primary" onClick={runFull} disabled={!file || loading}>
                      {loading ? <Loader size={15} className="spin" /> : <><Zap size={15} /> Full pipeline</>}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <textarea className="textarea" rows={10}
                    placeholder="Paste your meeting transcript here…"
                    value={transcript} onChange={e => setTranscript(e.target.value)} />
                  <button className="btn-primary full" onClick={runGenerateNotes} disabled={!transcript.trim() || loading}>
                    {loading ? <><Loader size={15} className="spin" /> {loadMsg}</> : <><Zap size={15} /> Generate notes with GPT-4o</>}
                  </button>
                </>
              )}

              {error && <div className="error"><AlertCircle size={14} /> {error}</div>}
            </div>
          )}

          {/* ── STEP 2: TRANSCRIPT ── */}
          {step === 'transcript' && (
            <div className="card">
              <div className="card-head">
                <h2>Review transcript</h2>
                <span className="pill green">Azure Speech ✓</span>
              </div>
              <p className="card-sub">Edit if needed before generating notes.</p>
              <textarea className="textarea" rows={14} value={transcript}
                onChange={e => setTranscript(e.target.value)} />
              <button className="btn-primary full" onClick={runGenerateNotes} disabled={loading}>
                {loading ? <><Loader size={15} className="spin" /> {loadMsg}</> : <><Zap size={15} /> Generate notes with GPT-4o</>}
              </button>
              {error && <div className="error"><AlertCircle size={14} /> {error}</div>}
            </div>
          )}

          {/* ── STEP 3: NOTES ── */}
          {step === 'notes' && notes && (
            <div className="notes-layout">
              <div className="notes-header">
                <div>
                  <h2 className="notes-title">{title || 'Meeting'}</h2>
                  <div className="notes-meta">
                    <span className={`sentiment s-${notes.sentiment}`}>{notes.sentiment}</span>
                    {notes.duration_estimate && <span className="dur">· {notes.duration_estimate}</span>}
                    <span className="pill blue">GPT-4o ✓</span>
                  </div>
                </div>
                <button className="btn-dl" onClick={downloadMd}><Download size={14} /> Download .md</button>
              </div>

              <div className="note-card">
                <h3><FileText size={15} /> Summary</h3>
                <p>{notes.summary}</p>
              </div>

              <div className="notes-grid">
                <div className="note-card">
                  <h3><Zap size={15} /> Key points</h3>
                  <ul>{notes.key_points?.map((p, i) => <li key={i}>{p}</li>)}</ul>
                </div>
                <div className="note-card">
                  <h3><CheckSquare size={15} /> Decisions</h3>
                  {notes.decisions?.length
                    ? <ul>{notes.decisions.map((d, i) => <li key={i}>{d}</li>)}</ul>
                    : <p className="empty">No decisions recorded.</p>}
                </div>
              </div>

              <div className="note-card">
                <h3><CheckSquare size={15} /> Action items</h3>
                {notes.action_items?.length ? (
                  <table className="action-table">
                    <thead><tr><th>Task</th><th>Owner</th><th>Due</th></tr></thead>
                    <tbody>
                      {notes.action_items.map((a, i) => (
                        <tr key={i}>
                          <td>{a.task}</td>
                          <td><span className="owner">{a.owner || 'TBD'}</span></td>
                          <td><span className="due">{a.due || 'TBD'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <p className="empty">No action items found.</p>}
              </div>

              <div className="note-card">
                <h3>🗺 Next steps</h3>
                <ol>{notes.next_steps?.map((s, i) => <li key={i}>{s}</li>)}</ol>
              </div>

              {transcript && (
                <details className="transcript-accordion">
                  <summary>View full transcript</summary>
                  <p className="transcript-text">{transcript}</p>
                </details>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <p>Azure Speech Service · OpenAI GPT-4o · Azure Blob Storage · Azure App Service</p>
      </footer>
    </div>
  )
}

function buildMd(notes, title, transcript) {
  return `# ${title || 'Meeting'} — Notes
*Generated by AI Meeting Notes (Azure)*

## Summary
${notes.summary}

## Key Points
${notes.key_points?.map(p => `- ${p}`).join('\n')}

## Decisions
${notes.decisions?.map(d => `- ${d}`).join('\n') || '_None recorded_'}

## Action Items
| Task | Owner | Due |
|------|-------|-----|
${notes.action_items?.map(a => `| ${a.task} | ${a.owner || 'TBD'} | ${a.due || 'TBD'} |`).join('\n')}

## Next Steps
${notes.next_steps?.map((s, i) => `${i + 1}. ${s}`).join('\n')}

---
*Sentiment: ${notes.sentiment} · ${notes.duration_estimate || ''}*

## Full Transcript
${transcript}
`
}
