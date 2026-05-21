import { useState, useRef } from 'react';

const STATUS_LABELS = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' };
const STATUS_CYCLE = { todo: 'in_progress', in_progress: 'done', done: 'todo' };

export default function KanbanBoard({ tasksByStatus, loading, error, onCreateTask, onUpdateTask, onDeleteTask }) {
  const [newTitle, setNewTitle] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  async function handleAddTask(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      await onCreateTask({ title: newTitle.trim(), status: 'todo' });
      setNewTitle('');
    } catch (err) { console.error(err); }
  }

  function handleDragStart(e, taskId) {
    setDraggedId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOverCol(e, status) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(status);
  }

  function handleDragLeaveCol() { setDragOverCol(null); }

  async function handleDrop(e, targetStatus) {
    e.preventDefault();
    setDragOverCol(null);
    if (draggedId) {
      await onUpdateTask(draggedId, { status: targetStatus });
      setDraggedId(null);
    }
  }

  function openDetail(task) { setEditingTask({ ...task }); }

  async function saveDetail() {
    if (!editingTask) return;
    const { id, title, description, status } = editingTask;
    await onUpdateTask(id, { title, description: description || '', status });
    setEditingTask(null);
  }

  async function deleteFromModal() {
    if (!editingTask) return;
    await onDeleteTask(editingTask.id);
    setEditingTask(null);
  }

  if (loading) {
    return (
      <div className="columns">
        {['todo', 'in_progress', 'done'].map(s => (
          <div key={s} className={`column column-${s}`}>
            <div className="column-header"><h3>{STATUS_LABELS[s]}</h3></div>
            <div className="column-body">
              <div className="skeleton-card"></div>
              <div className="skeleton-card"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) return <div className="board-msg error-text">{error}</div>;

  return (
    <div className="kanban-board">
      <form onSubmit={handleAddTask} className="add-task-form">
        <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Add a new task..." maxLength={200} required />
        <button type="submit">Add</button>
      </form>

      <div className="columns">
        {Object.entries(tasksByStatus).map(([status, tasks]) => (
          <div
            key={status}
            className={`column column-${status} ${dragOverCol === status ? 'drag-over' : ''}`}
            onDragOver={(e) => handleDragOverCol(e, status)}
            onDragLeave={handleDragLeaveCol}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div className="column-header">
              <h3>{STATUS_LABELS[status]}</h3>
              <span className="count">{tasks.length}</span>
            </div>
            <div className="column-body">
              {tasks.map(task => (
                <div
                  key={task.id}
                  className={`task-card ${draggedId === task.id ? 'dragging' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onDragEnd={() => setDraggedId(null)}
                  onClick={() => openDetail(task)}
                >
                  <p className="task-title">{task.title}</p>
                  {task.description && <p className="task-desc">{task.description}</p>}
                  <div className="task-actions" onClick={e => e.stopPropagation()}>
                    <button className="move-btn" onClick={() => onUpdateTask(task.id, { status: STATUS_CYCLE[status] })}>
                      {status === 'done' ? 'Reopen' : 'Move'}
                    </button>
                    <button className="del-btn" onClick={() => onDeleteTask(task.id)}>Delete</button>
                  </div>
                </div>
              ))}
              {tasks.length === 0 && <p className="column-empty">Drop tasks here</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Task Detail Modal */}
      {editingTask && (
        <div className="modal-overlay" onClick={() => setEditingTask(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Task Details</h2>
            <label>Title</label>
            <input value={editingTask.title} onChange={e => setEditingTask(p => ({...p, title: e.target.value}))} />
            <label>Description</label>
            <textarea value={editingTask.description || ''} onChange={e => setEditingTask(p => ({...p, description: e.target.value}))} placeholder="Add description..." />
            <label>Status</label>
            <select value={editingTask.status} onChange={e => setEditingTask(p => ({...p, status: e.target.value}))}>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <div className="modal-actions">
              <button className="danger-btn" onClick={deleteFromModal}>Delete</button>
              <button className="cancel-btn" onClick={() => setEditingTask(null)}>Cancel</button>
              <button className="save-btn" onClick={saveDetail}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
