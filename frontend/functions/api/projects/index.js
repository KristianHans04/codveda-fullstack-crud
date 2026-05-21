import { jsonResponse, errorResponse, generateId } from './_helpers.js';

/**
 * GET /api/projects — List all projects
 * POST /api/projects — Create a new project
 */
export async function onRequestGet(context) {
  const { env } = context;
  try {
    const { results } = await env.DB.prepare(
      'SELECT * FROM projects ORDER BY created_at DESC'
    ).all();
    return jsonResponse(results);
  } catch (err) {
    return errorResponse('Failed to fetch projects', 500);
  }
}

export async function onRequestPost(context) {
  const { env, request } = context;
  try {
    const body = await request.json();
    const name = (body.name || '').trim();
    if (!name) return errorResponse('Project name is required');
    if (name.length > 100) return errorResponse('Project name too long (max 100)');

    const description = (body.description || '').trim().slice(0, 500);
    const id = generateId();
    const now = new Date().toISOString();

    await env.DB.prepare(
      'INSERT INTO projects (id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(id, name, description, now, now).run();

    return jsonResponse({ id, name, description, created_at: now, updated_at: now }, 201);
  } catch (err) {
    return errorResponse('Failed to create project', 500);
  }
}
