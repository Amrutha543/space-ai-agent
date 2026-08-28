import React, { useEffect, useRef, useState } from 'react';
import { sendChatMessage, fetchApod, fetchNeo, fetchDonki } from '../api/api.js';

const SUGGESTIONS = [
  'How did the space race begin',
  "ISRO's journey from the 1960s to now",
  'Study path to become an ISRO scientist',
  'Recent NASA Artemis updates'
];

export default function ChatWindow() {
  const [messages, setMessages] = useState([
    { role: 'assistant', kind: 'text', content: "Hi, I'm Orbit. Ask me about space research from the very beginning right up to today — early rocketry, the space race, ISRO, DRDO, NASA, their scientists and current projects, or how to learn and build a career in space science." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, loading]);

  async function handleSend(text) {
    const trimmed = (text ?? input).trim();
    if (!trimmed || loading) return;
    setShowSuggestions(false);
    const history = messages
      .filter(m => m.kind === 'text')
      .map(m => ({ role: m.role, content: m.content }));

    setMessages(prev => [...prev, { role: 'user', kind: 'text', content: trimmed }]);
    setInput('');
    setLoading(true);
    try {
      const reply = await sendChatMessage(trimmed, history);
      setMessages(prev => [...prev, { role: 'assistant', kind: 'text', content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', kind: 'text', content: "Signal lost for a moment — mind trying that again?" }]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleNasaAction(action) {
    setShowSuggestions(false);
    setLoading(true);
    try {
      if (action === 'apod') {
        const d = await fetchApod();
        setMessages(prev => [...prev, { role: 'assistant', kind: 'apod', content: d }]);
      } else if (action === 'neo') {
        const d = await fetchNeo();
        setMessages(prev => [...prev, { role: 'assistant', kind: 'neo', content: d }]);
      } else if (action === 'donki') {
        const d = await fetchDonki(7);
        setMessages(prev => [...prev, { role: 'assistant', kind: 'donki', content: d }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', kind: 'text', content: "Couldn't reach that NASA data feed just now — try again in a moment." }]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div id="messages" ref={scrollRef}>
        {messages.map((m, i) => <MessageBubble key={i} message={m} />)}
        {loading && <TypingIndicator />}
      </div>

      {showSuggestions && (
        <div id="suggestions">
          {SUGGESTIONS.map(s => (
            <div key={s} className="chip" onClick={() => handleSend(s)}>{s}</div>
          ))}
        </div>
      )}

      <div id="nasa-data-row">
        <span className="data-label">Live NASA data</span>
        <div className="data-btn" onClick={() => handleNasaAction('apod')}><i>◐</i> Picture of the day</div>
        <div className="data-btn" onClick={() => handleNasaAction('neo')}><i>☄</i> Near-Earth objects</div>
        <div className="data-btn" onClick={() => handleNasaAction('donki')}><i>☀</i> Space weather</div>
      </div>

      <div id="inputbar">
        <input
          type="text"
          value={input}
          placeholder="Ask about ISRO, DRDO, or NASA research and projects..."
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
        />
        <button aria-label="Send" onClick={() => handleSend()} disabled={loading}>
          <svg viewBox="0 0 24 24" fill="none" width="18" height="18" style={{ transform: 'rotate(45deg)' }}>
            <path d="M12 2c2.5 2.2 4 5.6 4 9.5 0 2-.5 3.8-1.2 5.2H9.2C8.5 15.3 8 13.5 8 11.5 8 7.6 9.5 4.2 12 2z" fill="#0B1408"/>
            <circle cx="12" cy="9.5" r="1.6" fill="var(--accent)"/>
            <path d="M8 13l-3 2.5V19l3-1.5V13z" fill="#0B1408"/>
            <path d="M16 13l3 2.5V19l-3-1.5V13z" fill="#0B1408"/>
            <path d="M10.3 16.7h3.4l-1.2 3.6c-.2.6-1 .6-1.2 0l-1-3.6z" fill="#0B1408"/>
          </svg>
        </button>
      </div>
    </>
  );
}

function MessageBubble({ message }) {
  if (message.kind === 'text') {
    return (
      <div className={`msg ${message.role}`}>
        {message.role === 'assistant' && <span className="label">orbit</span>}
        {message.content}
      </div>
    );
  }
  if (message.kind === 'apod') {
    const d = message.content;
    return (
      <div className="msg assistant">
        <span className="label">orbit</span>
        <span className="data-title">NASA · Astronomy picture of the day</span>
        <b>{d.title}</b> <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>({d.date})</span>
        {d.media_type === 'image' && <img src={d.url} alt={d.title} />}
        <p style={{ margin: '10px 0 0', fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.55 }}>{d.explanation}</p>
      </div>
    );
  }
  if (message.kind === 'neo') {
    const d = message.content;
    const today = Object.keys(d.near_earth_objects || {})[0];
    const list = (d.near_earth_objects && d.near_earth_objects[today]) || [];
    return (
      <div className="msg assistant">
        <span className="label">orbit</span>
        <span className="data-title">NASA · Near-Earth objects tracked today</span>
        {list.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>No close-approach objects logged for today.</span>}
        {list.slice(0, 6).map(obj => {
          const approach = obj.close_approach_data[0];
          const distKm = approach ? Number(approach.miss_distance.kilometers).toLocaleString(undefined, { maximumFractionDigits: 0 }) : 'n/a';
          const speed = approach ? Number(approach.relative_velocity.kilometers_per_hour).toLocaleString(undefined, { maximumFractionDigits: 0 }) : 'n/a';
          const diamMin = obj.estimated_diameter.meters.estimated_diameter_min.toFixed(0);
          const diamMax = obj.estimated_diameter.meters.estimated_diameter_max.toFixed(0);
          return (
            <div className="data-item" key={obj.id}>
              <b>{obj.name}</b>{obj.is_potentially_hazardous_asteroid && <span style={{ color: 'var(--accent)' }}> · flagged hazardous</span>}
              <br /><span>{diamMin}–{diamMax} m diameter · {distKm} km miss distance · {speed} km/h</span>
            </div>
          );
        })}
      </div>
    );
  }
  if (message.kind === 'donki') {
    const list = Array.isArray(message.content) ? message.content : [];
    return (
      <div className="msg assistant">
        <span className="label">orbit</span>
        <span className="data-title">NASA DONKI · Space weather, last 7 days</span>
        {list.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>No significant space weather notifications this week.</span>}
        {list.slice(0, 5).map((item, idx) => (
          <div className="data-item" key={idx}>
            <b>{item.messageType || 'Notice'}</b> <span>· {(item.messageIssueTime || '').slice(0, 10)}</span>
            <br /><span>{(item.messageURL || '').replace('https://', '')}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

function TypingIndicator() {
  return (
    <div className="typing">
      <span></span><span></span><span></span>
    </div>
  );
}
