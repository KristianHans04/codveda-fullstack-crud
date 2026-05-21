import { jsonResponse, errorResponse, generateId } from '../_helpers.js';

/**
 * GET /api/tasks?project_id=<id> — List tasks for a project
 * POST /api/tasks — Create a new task
 */
export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const projectId = url.searchParams.get('project_id');

  if (!projectId) return errorResponse('project_id query parameter is required');

  try {
    const { results } = await env.DB.prepare(
      'SELECT * FROM tasks WHERE project_id = ? ORDER BY status, position'
    ).bind(projectId).all();
    return jsonResponse(results);
  } catch (err) {
    return errorResponse('Failed to fetch tasks', 500);
  }
}

export async function onRequestPost(context) {
  const { env, request } = context;
  try {
    const body = await request.json();
    const title = (body.title || '').trim();
    const projectId = (body.project_id || '').trim();

    if (!title) return errorResponse('Task title is required');
    if (title.length > 200) return errorResponse('Task title too long (max 200)');
    if (!projectId) return errorResponse('project_id is required');

    // Verify project exists
    const project = await env.DB.prepare(
      'SELECT id FROM projects WHERE id = ?'
    ).bind(projectId).first();
    if (!project) return errorResponse('Project not found', 404);

    const description = (body.description || '').trim().slice(0, 1000);
    const status = body.status || 'todo';
    if (!['todo', 'in_progress', 'done'].includes(status)) {
      return errorResponse('Invalid status. Must be todo, in_progress, or done');
    }

    // Get next position for this status column
    const maxPos = await env.DB.prepare(
      'SELECT COALESCE(MAX(position), -1) as max_pos FROM tasks WHERE project_id = ? AND status = ?'
    ).bind(projectId, status).first();

    const id = generateId();
    const position = (maxPos?.max_pos ?? -1) + 1;
    const now = new Date().toISOString();

    await env.DB.prepare(
      'INSERT INTO tasks (id, project_id, title, description, status, position, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(id, projectId, title, description, status, position, now, now).run();

    return jsonResponse({ id, project_id: projectId, title, description, status, position, created_at: now, updated_at: now }, 201);
  } catch (err) {
    return errorResponse('Failed to create task', 500);
  }
}
