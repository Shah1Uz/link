/**
 * Design screenshot helper (dev-only, not part of the app bundle).
 *
 * Usage:
 *   node scripts/design-shot.mjs <url> <out.png> [theme=light|dark] [width=1440] [height=1400] [fullPage=true|false]
 *
 * Requires a running dev server (default http://127.0.0.1:3210) and Google Chrome.
 * Uses the Chrome DevTools Protocol through Node's built-in WebSocket client,
 * so no extra npm dependency is needed.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const CHROME =
  process.env.CHROME_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9333;

const [, , url, outPathRaw, theme = "light", width = "1440", height = "1400", fullPage = "true"] =
  process.argv;

if (!url || !outPathRaw) {
  console.error("usage: node scripts/design-shot.mjs <url> <out.png> [theme] [width] [height] [fullPage]");
  process.exit(1);
}

const outPath = path.resolve(outPathRaw);
const profileDir = path.join(os.tmpdir(), `dsh-shot-${Date.now()}`);
fs.mkdirSync(path.dirname(outPath), { recursive: true });

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    "--disable-sync",
    "--disable-crash-reporter",
    "--disable-breakpad",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    `--user-data-dir=${profileDir}`,
    `--remote-debugging-port=${PORT}`,
    "about:blank",
  ],
  { stdio: "ignore" }
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForDevtools() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      if (res.ok) return await res.json();
    } catch {
      /* not ready yet */
    }
    await sleep(250);
  }
  throw new Error("Chrome DevTools endpoint did not start");
}

function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let seq = 0;
  const pending = new Map();
  const events = [];
  ws.addEventListener("message", (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    } else if (msg.method) {
      events.push(msg);
    }
  });
  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const id = ++seq;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  const opened = new Promise((resolve) => ws.addEventListener("open", resolve));
  return { ws, send, opened, events };
}

try {
  const targets = await waitForDevtools();
  const page = targets.find((t) => t.type === "page") || targets[0];
  if (!page) throw new Error("No page target found");

  const { ws, send, opened } = connect(page.webSocketDebuggerUrl);
  await opened;
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Network.enable");
  await send("Emulation.setDeviceMetricsOverride", {
    width: Number(width),
    height: Number(height),
    deviceScaleFactor: 1,
    mobile: false,
  });

  // Optional session cookie, e.g. DSH_COOKIE="biospace_session=<userId>"
  const rawCookie = process.env.DSH_COOKIE || "";
  const cookieName = process.env.DSH_COOKIE_NAME || "";
  const cookieValue = process.env.DSH_COOKIE_VALUE || rawCookie.split("=").slice(1).join("=");
  const cookieKey = cookieName || rawCookie.split("=")[0];
  if (cookieKey && cookieValue) {
    await send("Network.setCookie", {
      name: cookieKey,
      value: cookieValue,
      domain: "127.0.0.1",
      path: "/",
      httpOnly: true,
    });
  }

  await send("Page.navigate", { url });
  await sleep(4500); // allow dev compilation + client hydration

  if (theme === "dark") {
    await send("Runtime.evaluate", {
      expression: "document.documentElement.classList.add('dark')",
    });
    await sleep(900);
  }

  const metrics = await send("Page.getLayoutMetrics");
  const content = metrics.result?.cssContentSize || metrics.result?.contentSize;
  const clip =
    fullPage === "true" && content
      ? { x: 0, y: 0, width: Number(width), height: Math.min(content.height, 12000), scale: 1 }
      : undefined;

  const shot = await send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: fullPage === "true",
    ...(clip ? { clip } : {}),
  });

  if (!shot.result?.data) throw new Error("Empty screenshot payload");
  fs.writeFileSync(outPath, Buffer.from(shot.result.data, "base64"));
  console.log(`saved ${outPath} (${fs.statSync(outPath).size} bytes, theme=${theme})`);
  ws.close();
} finally {
  try {
    chrome.kill();
    await sleep(400);
  } catch {
    /* ignore */
  }
  try {
    fs.rmSync(profileDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
  } catch {
    /* Chrome may still hold profile files on Windows — harmless */
  }
}
