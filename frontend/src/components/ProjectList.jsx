import { useState } from 'react';

export default function ProjectList({ projects, loading, error, onCreate, onSelect, onDelete, selectedId }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const project = await onCreate({ name: name.trim(), description: desc.trim() });
      setName('');
      setDesc('');
      onSelect(project.id);
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <aside className="project-sidebar">
      <h2>Projects</h2>
      <form onSubmit={handleSubmit} className="project-form">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New project name"
          maxLength={100}
          required
        />
        <button type="submit">Create</button>
      </form>
      {loading && <p className="sidebar-msg">Loading...</p>}
      {error && <p className="sidebar-msg error-text">{error}</p>}
      <ul className="project-list">
        {projects.map((p) => (
          <li key={p.id} className={p.id === selectedId ? 'active' : ''}>
            <button className="project-btn" onClick={() => onSelect(p.id)}>
              {p.name}
            </button>
            <button
              className="project-delete"
              onClick={() => { if (confirm('Delete this project and all its tasks?')) onDelete(p.id); }}
              aria-label={`Delete ${p.name}`}
            >
              &times;
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
