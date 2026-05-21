import { jsonResponse, errorResponse } from '../_helpers.js';

/**
 * PUT /api/tasks/:id — Update a task (title, description, status, position)
 * DELETE /api/tasks/:id — Delete a task
 */
export async function onRequestPut(context) {
  const { env, params, request } = context;
  const taskId = params.id;
  try {
    const body = await request.json();

    // Fetch existing task
    const existing = await env.DB.prepare(
      'SELECT * FROM tasks WHERE id = ?'
    ).bind(taskId).first();
    if (!existing) return errorResponse('Task not found', 404);

    const title = (body.title !== undefined ? body.title : existing.title).trim();
    if (!title) return errorResponse('Task title is required');
    if (title.length > 200) return errorResponse('Task title too long (max 200)');

    const description = body.description !== undefined
      ? body.description.trim().slice(0, 1000)
      : existing.description;

    const status = body.status !== undefined ? body.status : existing.status;
    if (!['todo', 'in_progress', 'done'].includes(status)) {
      return errorResponse('Invalid status. Must be todo, in_progress, or done');
    }

    const position = body.position !== undefined ? parseInt(body.position, 10) : existing.position;
    const now = new Date().toISOString();

    await env.DB.prepare(
      'UPDATE tasks SET title = ?, description = ?, status = ?, position = ?, updated_at = ? WHERE id = ?'
    ).bind(title, description, status, position, now, taskId).run();

    return jsonResponse({
      id: taskId,
      project_id: existing.project_id,
      title,
      description,
      status,
      position,
      created_at: existing.created_at,
      updated_at: now,
    });
  } catch (err) {
    return errorResponse('Failed to update task', 500);
  }
}

export async function onRequestDelete(context) {
  const { env, params } = context;
  const taskId = params.id;
  try {
    const result = await env.DB.prepare(
      'DELETE FROM tasks WHERE id = ?'
    ).bind(taskId).run();

    if (result.changes === 0) return errorResponse('Task not found', 404);
    return jsonResponse({ deleted: true });
  } catch (err) {
    return errorResponse('Failed to delete task', 500);
  }
}
