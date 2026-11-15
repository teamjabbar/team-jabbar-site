// Cloudflare Pages Function: receives every form on the site and adds the
// person to MailerLite. Runs on Cloudflare, so the API key never reaches the browser.
//
// Set these in Cloudflare > Pages project > Settings > Variables and Secrets:
//   MAILERLITE_API_KEY        (secret)   MailerLite > Integrations > API
//   ML_GROUP_SELLER           group ID for home evaluation requests
//   ML_GROUP_BUYER            group ID for buyers
//   ML_GROUP_PRECONSTRUCTION  group ID for the pre-construction list
//   ML_GROUP_ALERTS           group ID for listing alerts
//   ML_GROUP_CONTACT          group ID for general enquiries
//   ML_GROUP_MARKET           group ID for market report requests
//   ML_GROUP_NEWSLETTER       group ID for people who ticked the consent box
//
// Custom fields to create once in MailerLite (Subscribers > Fields), all text:
//   lead_type, property_address, timeline, area, budget, home_type, message

const GROUP_VARS = {
  seller: 'ML_GROUP_SELLER',
  buyer: 'ML_GROUP_BUYER',
  preconstruction: 'ML_GROUP_PRECONSTRUCTION',
  alerts: 'ML_GROUP_ALERTS',
  contact: 'ML_GROUP_CONTACT',
  market: 'ML_GROUP_MARKET',
};

const clean = (v, max = 500) => String(v ?? '').trim().slice(0, max);
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

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
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !GROUP_VARS[type]) {
    return json({ error: 'Invalid submission' }, 400);
  }
  if (!env.MAILERLITE_API_KEY) return json({ error: 'Not configured' }, 503);

  const groups = [env[GROUP_VARS[type]]];
  if (data.consent === 'yes') groups.push(env.ML_GROUP_NEWSLETTER);

  const res = await fetch('https://connect.mailerlite.com/api/subscribers', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.MAILERLITE_API_KEY}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      email,
      fields: {
        name: clean(data.name, 100),
        phone: clean(data.phone, 40),
        lead_type: type,
        property_address: clean(data.address),
        timeline: clean(data.timeline, 60),
        area: clean(data.area, 120),
        budget: clean(data.budget, 60),
        home_type: clean(data.home_type, 60),
        message: clean(data.message, 2000),
      },
      groups: groups.filter(Boolean),
    }),
  });

  if (!res.ok) return json({ error: 'Could not save' }, 502);
  return json({ ok: true });
}
