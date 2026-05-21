import { useState } from 'react';

export default function ProjectList({ projects, loading, error, onCreate, onSelect, onDelete, selectedId }) {
  const [name, setName] = useState('');

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const p = await onCreate({ name: name.trim() });
      setName('');
      onSelect(p.id);
    } catch (err) { console.error(err); }
  }

  return (
    <aside className="project-sidebar">
      <div className="sidebar-heading">Projects</div>
      {loading && <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Loading...</p>}
      {error && <p style={{ fontSize: '0.8rem', color: 'var(--color-danger)' }}>{error}</p>}
      {projects.map(p => (
        <div key={p.id} className={`project-item ${selectedId === p.id ? 'active' : ''}`} onClick={() => onSelect(p.id)}>
          <span className="project-dot"></span>
          <span className="project-name">{p.name}</span>
          <button className="project-del" onClick={(e) => { e.stopPropagation(); onDelete(p.id); }} aria-label={`Delete ${p.name}`}>&times;</button>
        </div>
      ))}
      <form className="new-project-form" onSubmit={handleCreate}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="New project..." maxLength={50} required />
        <button type="submit">+</button>
      </form>
    </aside>
  );
}
