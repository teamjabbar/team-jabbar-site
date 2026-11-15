// Cloudflare Pages Function: receives every form on the site and adds the
// person to MailerLite. Runs on Cloudflare, so the API key never reaches the browser.
//
// The only setup needed is one secret in Cloudflare:
//   Pages project > Settings > Variables and Secrets > MAILERLITE_API_KEY
//
// Groups and custom fields are created in MailerLite automatically the first
// time they are needed, using the names below.

const API = 'https://connect.mailerlite.com/api';

const GROUPS = {
  seller: 'Website: Home evaluation',
  buyer: 'Website: Buyers',
  preconstruction: 'Website: Pre-construction list',
  alerts: 'Website: Listing alerts',
  contact: 'Website: Contact form',
  market: 'Website: Market report',
};
// Only people who tick the consent box go here. Send campaigns to this group.
const NEWSLETTER_GROUP = 'Newsletter (consented)';

const CUSTOM_FIELDS = ['lead_type', 'property_address', 'timeline', 'area', 'budget', 'home_type', 'message'];

// Remembered between requests while this worker instance stays warm.
const groupIds = {};
let fieldsReady = false;

const clean = (v, max = 500) => String(v ?? '').trim().slice(0, max);
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

function ml(env, path, options = {}) {
  return fetch(API + path, {
    ...options,
    headers: {
      Authorization: `Bearer ${env.MAILERLITE_API_KEY}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });
}

async function groupId(env, name) {
  if (groupIds[name]) return groupIds[name];
  const found = await ml(env, `/groups?limit=100&filter[name]=${encodeURIComponent(name)}`);
  if (found.ok) {
    const match = ((await found.json()).data || []).find((g) => g.name === name);
    if (match) return (groupIds[name] = match.id);
  }
  const made = await ml(env, '/groups', { method: 'POST', body: JSON.stringify({ name }) });
  if (!made.ok) return null;
  return (groupIds[name] = (await made.json()).data.id);
}

async function ensureFields(env) {
  if (fieldsReady) return;
  const res = await ml(env, '/fields?limit=100');
  if (!res.ok) return;
  const existing = new Set(((await res.json()).data || []).map((f) => f.key));
  for (const name of CUSTOM_FIELDS) {
    if (!existing.has(name)) {
      await ml(env, '/fields', { method: 'POST', body: JSON.stringify({ name, type: 'text' }) });
    }
  }
  fieldsReady = true;
}

export async function onRequestPost({ request, env }) {
  let data;
  try {
    data = await request.json();
  } catch {
    return json({ error: 'Bad request' }, 400);
  }

  // Honeypot: real people never fill this field.
  if (clean(data.company)) return json({ ok: true });

  const email = clean(data.email, 200);
  const type = clean(data.type, 30);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !GROUPS[type]) {
    return json({ error: 'Invalid submission' }, 400);
  }
  if (!env.MAILERLITE_API_KEY) return json({ error: 'Not configured' }, 503);

  try {
    await ensureFields(env);
    const groups = [await groupId(env, GROUPS[type])];
    if (data.consent === 'yes') groups.push(await groupId(env, NEWSLETTER_GROUP));

    const basic = { name: clean(data.name, 100), phone: clean(data.phone, 40) };
    const details = {
      lead_type: type,
      property_address: clean(data.address),
      timeline: clean(data.timeline, 60),
      area: clean(data.area, 120),
      budget: clean(data.budget, 60),
      home_type: clean(data.home_type, 60),
      message: clean(data.message, 2000),
    };
    const save = (fields) =>
      ml(env, '/subscribers', {
        method: 'POST',
        body: JSON.stringify({ email, fields, groups: groups.filter(Boolean) }),
      });

    let res = await save({ ...basic, ...details });
    // If MailerLite rejects the custom fields, still capture the lead itself.
    if (res.status === 422) res = await save(basic);
    if (!res.ok) return json({ error: 'Could not save' }, 502);
    return json({ ok: true });
  } catch {
    return json({ error: 'Could not save' }, 502);
  }
}
