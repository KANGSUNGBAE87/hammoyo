import { execFileSync } from "node:child_process";
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";

const adminEnvPath =
  process.env.SUPABASE_ADMIN_ENV || "/Users/kangsungbae/.config/sungbae/shared-env/supabase-admin.env.local";
const publicEnvPath =
  process.env.SUPABASE_PUBLIC_ENV || "/Users/kangsungbae/.config/sungbae/shared-env/supabase-public.env.local";

function readEnv(path) {
  const values = {};
  for (const rawLine of readFileSync(path, "utf8").split(/\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    values[match[1]] = match[2].replace(/^['"]|['"]$/g, "").trim();
  }
  return values;
}

function csvRows(csv) {
  const lines = csv.trim().split(/\r?\n/).filter(Boolean);
  const headers = lines.shift()?.split(",") || [];
  return lines.map((line) => Object.fromEntries(line.split(",").map((value, index) => [headers[index], value])));
}

function sqlText(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function signSession(coreUserId, secret) {
  const payload = Buffer.from(
    JSON.stringify({
      coreUserId,
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
    }),
  ).toString("base64url");
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

const adminEnv = readEnv(adminEnvPath);
const publicEnv = readEnv(publicEnvPath);
const required = [
  ["admin", "SUPABASE_ACCESS_TOKEN", adminEnv.SUPABASE_ACCESS_TOKEN],
  ["admin", "HAMMOYEO_SESSION_SECRET", adminEnv.HAMMOYEO_SESSION_SECRET],
  ["public", "VITE_SUPABASE_URL", publicEnv.VITE_SUPABASE_URL],
];
const missing = required.filter(([, , value]) => !value);
if (missing.length) {
  throw new Error(`Missing smoke env: ${missing.map(([scope, name]) => `${scope}.${name}`).join(", ")}`);
}

const childEnv = {
  ...process.env,
  SUPABASE_ACCESS_TOKEN: adminEnv.SUPABASE_ACCESS_TOKEN,
  SUPABASE_DB_PASSWORD: adminEnv.SUPABASE_DB_PASSWORD || process.env.SUPABASE_DB_PASSWORD,
  SUPABASE_PROJECT_ID: adminEnv.SUPABASE_PROJECT_ID || process.env.SUPABASE_PROJECT_ID,
};

function queryCsv(sql) {
  return execFileSync("supabase", ["db", "query", "--linked", "--output", "csv", sql], {
    cwd: process.cwd(),
    env: childEnv,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function executeSql(sql) {
  execFileSync("supabase", ["db", "query", "--linked", sql], {
    cwd: process.cwd(),
    env: childEnv,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

const inserted = csvRows(
  queryCsv("with inserted as (insert into public.core_users(default_locale) values ('ko') returning id) select id::text as id from inserted;"),
);
const userId = inserted[0]?.id;
if (!userId) throw new Error("Failed to create smoke user.");

let roomId = "";

async function callFunction(name, payload, token) {
  const endpointBase = `${publicEnv.VITE_SUPABASE_URL.replace(/\/+$/, "")}/functions/v1`;
  const response = await fetch(`${endpointBase}/${name}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => ({}));
  return { status: response.status, body };
}

try {
  const token = signSession(userId, adminEnv.HAMMOYEO_SESSION_SECRET);

  const create = await callFunction(
    "create-room",
    {
      title: "Smoke test room",
      expectedCount: 3,
      candidates: [
        { label: "candidate a", startsAt: new Date(Date.now() + 86_400_000).toISOString() },
        { label: "candidate b", startsAt: new Date(Date.now() + 172_800_000).toISOString() },
      ],
    },
    token,
  );
  if (create.status !== 200 || !create.body.ok) {
    throw new Error(`create-room failed: ${create.status} ${JSON.stringify(create.body)}`);
  }
  roomId = create.body.room.id;

  const slots = csvRows(
    queryCsv(`select id::text as id, sort_order from public.hammoyo_candidate_slots where room_id = ${sqlText(roomId)} order by sort_order;`),
  );
  const preferences = Object.fromEntries(slots.map((slot, index) => [slot.id, index === 0 ? "prefer" : "available"]));

  const submit = await callFunction("submit-response", { roomId, responseRound: 1, preferences }, token);
  if (submit.status !== 200 || !submit.body.ok) {
    throw new Error(`submit-response failed: ${submit.status} ${JSON.stringify(submit.body)}`);
  }

  const recompute = await callFunction("recompute-recommendation", { roomId, locale: "ko" }, token);
  if (recompute.status !== 200 || !recompute.body.ok) {
    throw new Error(`recompute-recommendation failed: ${recompute.status} ${JSON.stringify(recompute.body)}`);
  }
  if (recompute.body.coordination?.method !== "deterministic") {
    throw new Error(`Expected low-count deterministic coordination, got ${JSON.stringify(recompute.body.coordination)}`);
  }

  const deletion = await callFunction("request-data-deletion", { reasonCode: "smoke_test" }, token);
  if (deletion.status !== 200 || !deletion.body.ok) {
    throw new Error(`request-data-deletion failed: ${deletion.status} ${JSON.stringify(deletion.body)}`);
  }

  const afterDelete = await callFunction(
    "create-room",
    { title: "Should fail", candidates: [{ label: "a" }, { label: "b" }] },
    token,
  );
  if (afterDelete.status !== 401 || afterDelete.body.code !== "SESSION_REVOKED") {
    throw new Error(`Deleted session was not revoked: ${afterDelete.status} ${JSON.stringify(afterDelete.body)}`);
  }

  console.log("remote smoke passed: create-room submit-response recompute deterministic deletion-revokes-session");
} finally {
  if (roomId) {
    executeSql(`delete from public.hammoyo_rooms where id = ${sqlText(roomId)};`);
  }
  executeSql(`delete from public.core_users where id = ${sqlText(userId)};`);
}
