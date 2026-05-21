import { useState } from 'react';
import { useProjects } from './hooks/useProjects';
import { useTasks } from './hooks/useTasks';
import ProjectList from './components/ProjectList';
import KanbanBoard from './components/KanbanBoard';
import './App.css';

export default function App() {
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const { projects, loading: projLoading, error: projError, createProject, deleteProject } = useProjects();
  const { tasksByStatus, loading: taskLoading, error: taskError, createTask, updateTask, deleteTask } = useTasks(selectedProjectId);

  function handleDeleteProject(id) {
    deleteProject(id);
    if (selectedProjectId === id) setSelectedProjectId(null);
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="container">
          <h1>Kanban Board</h1>
          <p>Project management with Cloudflare D1 and Pages Functions.</p>
        </div>
      </header>
      <div className="app-body container">
        <ProjectList
          projects={projects}
          loading={projLoading}
          error={projError}
          onCreate={createProject}
          onSelect={setSelectedProjectId}
          onDelete={handleDeleteProject}
          selectedId={selectedProjectId}
        />
        <main className="board-area">
          {!selectedProjectId ? (
            <div className="board-msg">Select or create a project to view its board.</div>
          ) : (
            <KanbanBoard
              tasksByStatus={tasksByStatus}
              loading={taskLoading}
              error={taskError}
              onCreateTask={createTask}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
            />
          )}
        </main>
      </div>
      <footer className="app-footer">
        <p>Codveda Web Development Internship - Level 3: Full-Stack CRUD</p>
      </footer>
    </div>
  );
}
