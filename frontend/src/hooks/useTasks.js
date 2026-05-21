import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';

export function useTasks(projectId) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getTasks(projectId);
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const createTask = useCallback(async (body) => {
    const task = await api.createTask({ ...body, project_id: projectId });
    setTasks((prev) => [...prev, task]);
    return task;
  }, [projectId]);

  const updateTask = useCallback(async (id, updates) => {
    const task = await api.updateTask(id, updates);
    setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
    return task;
  }, []);

  const deleteTask = useCallback(async (id) => {
    await api.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const tasksByStatus = {
    todo: tasks.filter((t) => t.status === 'todo').sort((a, b) => a.position - b.position),
    in_progress: tasks.filter((t) => t.status === 'in_progress').sort((a, b) => a.position - b.position),
    done: tasks.filter((t) => t.status === 'done').sort((a, b) => a.position - b.position),
  };

  return { tasks, tasksByStatus, loading, error, createTask, updateTask, deleteTask, refetch: fetchTasks };
}
