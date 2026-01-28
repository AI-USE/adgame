var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-SXlgkl/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// .wrangler/tmp/bundle-SXlgkl/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader.apply(null, argArray)
    ]);
  }
});

// .wrangler/tmp/pages-0GKW08/functionsWorker-0.9522172824723305.mjs
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
var urls2 = /* @__PURE__ */ new Set();
function checkURL2(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls2.has(url.toString())) {
      urls2.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL2, "checkURL");
__name2(checkURL2, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL2(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});
function stripCfConnectingIPHeader2(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader2, "stripCfConnectingIPHeader");
__name2(stripCfConnectingIPHeader2, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader2.apply(null, argArray)
    ]);
  }
});
var EMOJIS = ["\u{1F436}", "\u{1F431}", "\u{1F42D}", "\u{1F439}", "\u{1F430}", "\u{1F98A}", "\u{1F43B}", "\u{1F43C}", "\u{1F43B}\u200D\u2744\uFE0F", "\u{1F428}", "\u{1F42F}", "\u{1F981}", "\u{1F42E}", "\u{1F437}", "\u{1F438}", "\u{1F435}", "\u{1F414}", "\u{1F427}", "\u{1F426}", "\u{1F424}", "\u{1F423}", "\u{1F425}", "\u{1F986}", "\u{1F985}", "\u{1F989}", "\u{1F987}", "\u{1F43A}", "\u{1F417}", "\u{1F434}", "\u{1F984}", "\u{1F41D}", "\u{1FAB1}", "\u{1F41B}", "\u{1F98B}", "\u{1F40C}", "\u{1F41E}", "\u{1F41C}", "\u{1FAB0}", "\u{1FAB2}", "\u{1FAB3}", "\u{1F99F}", "\u{1F997}", "\u{1F577}", "\u{1F578}", "\u{1F982}", "\u{1F422}", "\u{1F40D}", "\u{1F98E}", "\u{1F996}", "\u{1F995}", "\u{1F419}", "\u{1F991}", "\u{1F990}", "\u{1F99E}", "\u{1F980}", "\u{1F421}", "\u{1F420}", "\u{1F41F}", "\u{1F42C}", "\u{1F433}", "\u{1F40B}", "\u{1F988}", "\u{1F40A}", "\u{1F405}", "\u{1F406}", "\u{1F993}", "\u{1F98D}", "\u{1F9A7}", "\u{1F9A3}", "\u{1F418}", "\u{1F99B}", "\u{1F98F}", "\u{1F42A}", "\u{1F42B}", "\u{1F992}", "\u{1F998}", "\u{1F9AC}", "\u{1F403}", "\u{1F402}", "\u{1F404}", "\u{1F40E}", "\u{1F416}", "\u{1F411}", "\u{1F410}", "\u{1F98C}", "\u{1F429}", "\u{1F415}", "\u{1F408}", "\u{1F408}\u200D\u2B1B", "\u{1F413}", "\u{1F983}", "\u{1F9A4}", "\u{1F99A}", "\u{1F99C}", "\u{1F9A2}", "\u{1F9A9}", "\u{1F54A}", "\u{1F407}", "\u{1F99D}", "\u{1F9A8}", "\u{1F9A1}", "\u{1F9A6}", "\u{1F9AB}", "\u{1F9A5}", "\u{1F401}", "\u{1F400}", "\u{1F43F}", "\u{1F994}"];
function getRandomEmojis(count) {
  const shuffled = [...EMOJIS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
__name(getRandomEmojis, "getRandomEmojis");
__name2(getRandomEmojis, "getRandomEmojis");
function generateDifficulty(winCount = 0, bonusMissRate = null, winProb = 100) {
  const totalCount = 100;
  let correctCount;
  if (bonusMissRate !== null) {
    correctCount = Math.round(totalCount * (1 - bonusMissRate));
    correctCount = Math.max(1, Math.min(99, correctCount));
  } else {
    correctCount = Math.round(winProb);
    correctCount = Math.max(1, Math.min(99, correctCount));
  }
  const emojis = getRandomEmojis(totalCount);
  const indices = Array.from({ length: totalCount }, (_, i) => i);
  const correctIndices = indices.sort(() => 0.5 - Math.random()).slice(0, correctCount);
  return { totalCount, correctCount, emojis, correctIndices };
}
__name(generateDifficulty, "generateDifficulty");
__name2(generateDifficulty, "generateDifficulty");
async function getStorage(env) {
  if (!env.KV) {
    throw new Error('KV namespace "KV" is not bound. Please check your wrangler.toml and Cloudflare dashboard settings.');
  }
  const data = await env.KV.get("game_data", "json") || {};
  return {
    rankings: data.rankings || [],
    history: data.history || [],
    emails: data.emails || [],
    playerMetadata: data.playerMetadata || {},
    stats: data.stats || { totalPlays: 0, totalCorrect: 0, totalIncorrect: 0 },
    config: data.config || { sponsorUrl: "https://otieu.com/4/10530383" }
  };
}
__name(getStorage, "getStorage");
__name2(getStorage, "getStorage");
async function saveStorage(env, data) {
  if (!env.KV)
    return;
  await env.KV.put("game_data", JSON.stringify(data));
}
__name(saveStorage, "saveStorage");
__name2(saveStorage, "saveStorage");
async function getSession(env, sessionId) {
  if (!env.KV)
    return null;
  return await env.KV.get(`session:${sessionId}`, "json");
}
__name(getSession, "getSession");
__name2(getSession, "getSession");
async function saveSession(env, sessionId, sessionData) {
  if (!env.KV)
    return;
  await env.KV.put(`session:${sessionId}`, JSON.stringify(sessionData), { expirationTtl: 3600 });
}
__name(saveSession, "saveSession");
__name2(saveSession, "saveSession");
async function deleteSession(env, sessionId) {
  if (!env.KV)
    return;
  await env.KV.delete(`session:${sessionId}`);
}
__name(deleteSession, "deleteSession");
__name2(deleteSession, "deleteSession");
async function onRequestPost(context) {
  const { request, env } = context;
  const password = request.headers.get("x-admin-password");
  const adminPassword = env.ADMIN_PASSWORD || "admin";
  if (password !== adminPassword) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
  }
  const { score, nickname } = await request.json();
  const storage = await getStorage(env);
  const rankingEntry = {
    score: parseInt(score),
    date: (/* @__PURE__ */ new Date()).toISOString(),
    id: "DUMMY-" + Math.floor(Math.random() * 1e3),
    nickname: nickname || "DummyPlayer"
  };
  storage.rankings.push(rankingEntry);
  storage.rankings.sort((a, b) => b.score - a.score || new Date(a.date) - new Date(b.date));
  if (storage.rankings.length > 100)
    storage.rankings.pop();
  await saveStorage(env, storage);
  return new Response(JSON.stringify({ success: true }));
}
__name(onRequestPost, "onRequestPost");
__name2(onRequestPost, "onRequestPost");
async function onRequestPost2(context) {
  const { request, env } = context;
  const password = request.headers.get("x-admin-password");
  const adminPassword = env.ADMIN_PASSWORD || "admin";
  if (password !== adminPassword) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
  }
  const { sponsorUrl } = await request.json();
  if (sponsorUrl) {
    const storage = await getStorage(env);
    storage.config.sponsorUrl = sponsorUrl;
    await saveStorage(env, storage);
    return new Response(JSON.stringify({ success: true, config: storage.config }));
  } else {
    return new Response(JSON.stringify({ error: "Missing sponsorUrl" }), { status: 400 });
  }
}
__name(onRequestPost2, "onRequestPost2");
__name2(onRequestPost2, "onRequestPost");
async function onRequestGet(context) {
  const { request, env } = context;
  const password = request.headers.get("x-admin-password");
  const adminPassword = env.ADMIN_PASSWORD || "admin";
  if (password !== adminPassword) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
  }
  const storage = await getStorage(env);
  const rankingsWithEmails = storage.rankings.map((r) => {
    const emailEntry = storage.emails.find((e) => e.nickname === r.nickname);
    return {
      ...r,
      email: emailEntry ? emailEntry.email : null
    };
  });
  return new Response(JSON.stringify({
    stats: storage.stats,
    rankings: rankingsWithEmails,
    history: storage.history,
    config: storage.config,
    activeSessions: 0
    // KV doesn't easily list sessions without list()
  }), {
    headers: { "Content-Type": "application/json; charset=UTF-8" }
  });
}
__name(onRequestGet, "onRequestGet");
__name2(onRequestGet, "onRequestGet");
async function onRequestPost3(context) {
  const { request, env } = context;
  const password = request.headers.get("x-admin-password");
  const adminPassword = env.ADMIN_PASSWORD || "admin";
  if (password !== adminPassword) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
  }
  const { id } = await request.json();
  const storage = await getStorage(env);
  const index = storage.rankings.findIndex((r) => r.id === id);
  if (index !== -1) {
    storage.rankings.splice(index, 1);
    await saveStorage(env, storage);
    return new Response(JSON.stringify({ success: true }));
  } else {
    return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
  }
}
__name(onRequestPost3, "onRequestPost3");
__name2(onRequestPost3, "onRequestPost");
async function onRequestGet2(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("sessionId");
  const choice = parseInt(url.searchParams.get("choice"));
  const noRedirect = url.searchParams.get("noRedirect");
  const session = await getSession(env, sessionId);
  if (!session) {
    return new Response(JSON.stringify({ error: "Invalid session" }), { status: 400 });
  }
  const isCorrect = session.correctIndices.includes(choice);
  const storage = await getStorage(env);
  if (isCorrect) {
    session.winCount += 1;
    storage.stats.totalCorrect += 1;
    if (!session.isBonus) {
      if (Math.random() >= 0.05) {
        const decrease = Math.floor(Math.random() * 5) + 1;
        session.winProb = Math.max(15, session.winProb - decrease);
      }
    }
    const currentWinCount = session.winCount;
    const currentWinProb = session.winProb;
    const nextDiff = generateDifficulty(currentWinCount, null, currentWinProb);
    session.emojis = nextDiff.emojis;
    session.correctIndices = nextDiff.correctIndices;
    session.correctCount = nextDiff.correctCount;
    session.lastSeen = Date.now();
    await saveSession(env, sessionId, session);
    await saveStorage(env, storage);
    return new Response(`
            <!DOCTYPE html>
            <html lang="ja">
            <head><meta charset="UTF-8"></head>
            <body>
                <script>
                    const data = {
                        type: 'quiz-result',
                        correct: true,
                        winCount: ${currentWinCount},
                        winProb: ${currentWinProb},
                        bonusChance: ${session.bonusChance},
                        choices: ${JSON.stringify(nextDiff.emojis)},
                        correctCount: ${nextDiff.correctCount},
                        isBonus: ${session.isBonus}
                    };
                    if (window.opener) {
                        window.opener.postMessage(data, '*');
                        window.close();
                    } else {
                        const params = new URLSearchParams({
                            correct: 'true',
                            winCount: currentWinCount,
                            winProb: currentWinProb,
                            bonusChance: session.bonusChance,
                            choices: JSON.stringify(data.choices),
                            correctCount: data.correctCount,
                            isBonus: data.isBonus
                        });
                        window.location.href = '/?' + params.toString();
                    }
                <\/script>
                <p>\u6B63\u89E3\uFF01\u753B\u9762\u3092\u623B\u308A\u307E\u3059...</p>
            </body>
            </html>
        `, { headers: { "Content-Type": "text/html; charset=UTF-8" } });
  } else {
    const finalScore = session.winCount;
    storage.stats.totalIncorrect += 1;
    let topToken = null;
    const historyEntry = {
      id: crypto.randomUUID().slice(0, 8),
      score: finalScore,
      date: (/* @__PURE__ */ new Date()).toISOString()
    };
    storage.history.unshift(historyEntry);
    if (storage.history.length > 100)
      storage.history.pop();
    if (finalScore > 0) {
      const nickname = session.nickname;
      const existingIndex = storage.rankings.findIndex((r) => r.nickname === nickname);
      if (existingIndex === -1 || storage.rankings[existingIndex].score < finalScore) {
        if (existingIndex !== -1)
          storage.rankings.splice(existingIndex, 1);
        const rankingEntry = { ...historyEntry, nickname };
        storage.rankings.push(rankingEntry);
        storage.rankings.sort((a, b) => b.score - a.score || new Date(a.date) - new Date(b.date));
        if (storage.rankings.length > 100)
          storage.rankings.pop();
        const newRank = storage.rankings.findIndex((r) => r.id === rankingEntry.id);
        if (newRank < 5) {
          topToken = `TOP-${rankingEntry.id}-${finalScore}`;
        }
      }
    }
    await saveStorage(env, storage);
    await deleteSession(env, sessionId);
    return new Response(`
            <!DOCTYPE html>
            <html lang="ja">
            <head><meta charset="UTF-8"></head>
            <body>
                <script>
                    if (window.opener) {
                        window.opener.postMessage({
                            type: 'quiz-result',
                            correct: false,
                            score: ${finalScore},
                            token: ${topToken ? `'${topToken}'` : "null"},
                            limitReached: ${noRedirect === "1"}
                        }, '*');
                    }
                    if ('${noRedirect}' === '1') {
                        if (window.opener) {
                           window.close();
                        } else {
                           window.location.href = '/?failed=1&score=${finalScore}';
                        }
                    } else {
                        window.location.href = '${storage.config.sponsorUrl}';
                    }
                <\/script>
                <p>\u4E0D\u6B63\u89E3\uFF01${noRedirect === "1" ? "\u753B\u9762\u3092\u623B\u308A\u307E\u3059..." : "\u5E83\u544A\u306B\u79FB\u52D5\u3057\u307E\u3059..."}</p>
            </body>
            </html>
        `, { headers: { "Content-Type": "text/html; charset=UTF-8" } });
  }
}
__name(onRequestGet2, "onRequestGet2");
__name2(onRequestGet2, "onRequestGet");
async function onRequestGet3(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const nickname = url.searchParams.get("nickname");
  if (!nickname)
    return new Response(JSON.stringify({ error: "Nickname required" }), { status: 400 });
  const storage = await getStorage(env);
  const rank = storage.rankings.findIndex((r) => r.nickname === nickname);
  const headers = { "Content-Type": "application/json; charset=UTF-8" };
  if (rank === -1) {
    return new Response(JSON.stringify({ inTop5: false, message: "\u30E9\u30F3\u30AD\u30F3\u30B0\u570F\u5916\u3067\u3059" }), { headers });
  } else if (rank < 5) {
    return new Response(JSON.stringify({ inTop5: true, rank: rank + 1, message: `\u73FE\u5728${rank + 1}\u4F4D\u3067\u3059\uFF01` }), { headers });
  } else {
    return new Response(JSON.stringify({ inTop5: false, rank: rank + 1, message: `\u73FE\u5728${rank + 1}\u4F4D\u3067\u3059\uFF08TOP5\u570F\u5916\uFF09` }), { headers });
  }
}
__name(onRequestGet3, "onRequestGet3");
__name2(onRequestGet3, "onRequestGet");
async function onRequestGet4(context) {
  const storage = await getStorage(context.env);
  return new Response(JSON.stringify(storage.rankings.slice(0, 5)), {
    headers: { "Content-Type": "application/json; charset=UTF-8" }
  });
}
__name(onRequestGet4, "onRequestGet4");
__name2(onRequestGet4, "onRequestGet");
async function onRequestPost4(context) {
  const { request, env } = context;
  const deadline = /* @__PURE__ */ new Date("2026-02-05T00:00:00Z");
  if (/* @__PURE__ */ new Date() > deadline) {
    return new Response(JSON.stringify({ error: "\u30A4\u30D9\u30F3\u30C8\u306F\u7D42\u4E86\u3057\u307E\u3057\u305F" }), { status: 403 });
  }
  const { nickname, email } = await request.json();
  const storage = await getStorage(env);
  storage.emails.push({ nickname, email, date: (/* @__PURE__ */ new Date()).toISOString() });
  await saveStorage(env, storage);
  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json; charset=UTF-8" }
  });
}
__name(onRequestPost4, "onRequestPost4");
__name2(onRequestPost4, "onRequestPost");
async function onRequestPost5(context) {
  const { request, env } = context;
  const { nickname } = await request.json();
  const storage = await getStorage(env);
  let winProb = 100;
  let isBonus = false;
  let bonusChance = 0.01;
  if (nickname) {
    if (!storage.playerMetadata[nickname])
      storage.playerMetadata[nickname] = { cumulativeBonusChance: 0.01 };
    const meta = storage.playerMetadata[nickname];
    meta.cumulativeBonusChance = (meta.cumulativeBonusChance || 0.01) + 0.02;
    bonusChance = meta.cumulativeBonusChance;
    const canHaveBonus = !meta.lastBonusDate || new Date(meta.lastBonusDate).toDateString() !== (/* @__PURE__ */ new Date()).toDateString();
    if (canHaveBonus && Math.random() < meta.cumulativeBonusChance) {
      isBonus = true;
      winProb = Math.floor(Math.random() * (95 - 70 + 1)) + 70;
      meta.cumulativeBonusChance = 0.01;
      meta.lastBonusDate = (/* @__PURE__ */ new Date()).toISOString();
    }
  }
  const diff = generateDifficulty(0, null, winProb);
  const sessionId = crypto.randomUUID();
  const sessionData = {
    nickname: nickname || "\u30B2\u30B9\u30C8",
    winCount: 0,
    winProb,
    isBonus,
    ...diff,
    bonusChance,
    lastSeen: Date.now()
  };
  await saveSession(env, sessionId, sessionData);
  storage.stats.totalPlays += 1;
  await saveStorage(env, storage);
  return new Response(JSON.stringify({
    sessionId,
    winCount: 0,
    winProb,
    bonusChance,
    choices: diff.emojis,
    correctCount: diff.correctCount,
    isBonus
  }), {
    headers: { "Content-Type": "application/json; charset=UTF-8" }
  });
}
__name(onRequestPost5, "onRequestPost5");
__name2(onRequestPost5, "onRequestPost");
var routes = [
  {
    routePath: "/api/admin/add-dummy",
    mountPath: "/api/admin",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/admin/config",
    mountPath: "/api/admin",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/api/admin/data",
    mountPath: "/api/admin",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/admin/delete-ranking",
    mountPath: "/api/admin",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost3]
  },
  {
    routePath: "/api/check",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet2]
  },
  {
    routePath: "/api/my-rank",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet3]
  },
  {
    routePath: "/api/rankings",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet4]
  },
  {
    routePath: "/api/register-email",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost4]
  },
  {
    routePath: "/api/start",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost5]
  }
];
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
__name2(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name2(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name2(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name2(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name2(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name2(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
__name2(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
__name2(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name2(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
__name2(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
__name2(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
__name2(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
__name2(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
__name2(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
__name2(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
__name2(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");
__name2(pathToRegexp, "pathToRegexp");
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
__name2(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name2(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: () => {
            isFailOpen = true;
          }
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name2((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
var drainBody = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
__name2(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
__name2(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
__name2(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");
__name2(__facade_invoke__, "__facade_invoke__");
var __Facade_ScheduledController__ = /* @__PURE__ */ __name(class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
}, "__Facade_ScheduledController__");
__name2(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name2(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name2(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
__name2(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
__name2(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default2 = drainBody2;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError2(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError2(e.cause)
  };
}
__name(reduceError2, "reduceError");
var jsonError2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError2(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default2 = jsonError2;

// .wrangler/tmp/bundle-SXlgkl/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__2 = [
  middleware_ensure_req_body_drained_default2,
  middleware_miniflare3_json_error_default2
];
var middleware_insertion_facade_default2 = middleware_loader_entry_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__2 = [];
function __facade_register__2(...args) {
  __facade_middleware__2.push(...args.flat());
}
__name(__facade_register__2, "__facade_register__");
function __facade_invokeChain__2(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__2(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__2, "__facade_invokeChain__");
function __facade_invoke__2(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__2(request, env, ctx, dispatch, [
    ...__facade_middleware__2,
    finalMiddleware
  ]);
}
__name(__facade_invoke__2, "__facade_invoke__");

// .wrangler/tmp/bundle-SXlgkl/middleware-loader.entry.ts
var __Facade_ScheduledController__2 = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__2)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__2, "__Facade_ScheduledController__");
function wrapExportedHandler2(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__2(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__2(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler2, "wrapExportedHandler");
function wrapWorkerEntrypoint2(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__2(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__2(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint2, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY2;
if (typeof middleware_insertion_facade_default2 === "object") {
  WRAPPED_ENTRY2 = wrapExportedHandler2(middleware_insertion_facade_default2);
} else if (typeof middleware_insertion_facade_default2 === "function") {
  WRAPPED_ENTRY2 = wrapWorkerEntrypoint2(middleware_insertion_facade_default2);
}
var middleware_loader_entry_default2 = WRAPPED_ENTRY2;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__2 as __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default2 as default
};
//# sourceMappingURL=functionsWorker-0.9522172824723305.js.map
