import { useState } from 'react';

const STATUS_LABELS = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

const STATUS_NEXT = {
  todo: 'in_progress',
  in_progress: 'done',
  done: 'todo',
};

export default function KanbanBoard({ tasksByStatus, loading, error, onCreateTask, onUpdateTask, onDeleteTask }) {
  const [newTitle, setNewTitle] = useState('');

  async function handleAddTask(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      await onCreateTask({ title: newTitle.trim(), status: 'todo' });
      setNewTitle('');
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <div className="board-msg">Loading tasks...</div>;
  if (error) return <div className="board-msg error-text">{error}</div>;

  return (
    <div className="kanban-board">
      <form onSubmit={handleAddTask} className="add-task-form">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a new task..."
          maxLength={200}
          required
        />
        <button type="submit">Add</button>
      </form>

      <div className="columns">
        {Object.entries(tasksByStatus).map(([status, tasks]) => (
          <div key={status} className={`column column-${status}`}>
            <div className="column-header">
              <h3>{STATUS_LABELS[status]}</h3>
              <span className="count">{tasks.length}</span>
            </div>
            <div className="column-body">
              {tasks.map((task) => (
                <div key={task.id} className="task-card">
                  <p className="task-title">{task.title}</p>
                  {task.description && <p className="task-desc">{task.description}</p>}
                  <div className="task-actions">
                    <button
                      className="move-btn"
                      onClick={() => onUpdateTask(task.id, { status: STATUS_NEXT[status] })}
                      aria-label={`Move to ${STATUS_LABELS[STATUS_NEXT[status]]}`}
                    >
                      {status === 'done' ? 'Reopen' : 'Move'}
                    </button>
                    <button
                      className="del-btn"
                      onClick={() => onDeleteTask(task.id)}
                      aria-label={`Delete ${task.title}`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {tasks.length === 0 && <p className="column-empty">No tasks</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
