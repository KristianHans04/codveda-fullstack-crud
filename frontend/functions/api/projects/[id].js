import { jsonResponse, errorResponse } from '../_helpers.js';

/**
 * GET /api/projects/:id — Get a single project with its tasks
 * PUT /api/projects/:id — Update a project
 * DELETE /api/projects/:id — Delete a project and its tasks (CASCADE)
 */
export async function onRequestGet(context) {
  const { env, params } = context;
  const projectId = params.id;
  try {
    const project = await env.DB.prepare(
      'SELECT * FROM projects WHERE id = ?'
    ).bind(projectId).first();

    if (!project) return errorResponse('Project not found', 404);

    const { results: tasks } = await env.DB.prepare(
      'SELECT * FROM tasks WHERE project_id = ? ORDER BY status, position'
    ).bind(projectId).all();

    return jsonResponse({ ...project, tasks });
  } catch (err) {
    return errorResponse('Failed to fetch project', 500);
  }
}

export async function onRequestPut(context) {
  const { env, params, request } = context;
  const projectId = params.id;
  try {
    const body = await request.json();
    const name = (body.name || '').trim();
    if (!name) return errorResponse('Project name is required');
    if (name.length > 100) return errorResponse('Project name too long (max 100)');

    const description = (body.description || '').trim().slice(0, 500);
    const now = new Date().toISOString();

    const result = await env.DB.prepare(
      'UPDATE projects SET name = ?, description = ?, updated_at = ? WHERE id = ?'
    ).bind(name, description, now, projectId).run();

    if (result.changes === 0) return errorResponse('Project not found', 404);

    return jsonResponse({ id: projectId, name, description, updated_at: now });
  } catch (err) {
    return errorResponse('Failed to update project', 500);
  }
}

export async function onRequestDelete(context) {
  const { env, params } = context;
  const projectId = params.id;
  try {
    // Delete tasks first (D1 may not support CASCADE in all versions)
    await env.DB.prepare('DELETE FROM tasks WHERE project_id = ?').bind(projectId).run();
    const result = await env.DB.prepare('DELETE FROM projects WHERE id = ?').bind(projectId).run();

    if (result.changes === 0) return errorResponse('Project not found', 404);
    return jsonResponse({ deleted: true });
  } catch (err) {
    return errorResponse('Failed to delete project', 500);
  }
}
