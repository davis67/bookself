import { rest } from "msw";
import { match } from "node-match-path";
import * as usersDB from "../data/users";
let sleep;

if (process.env.CI) {
  sleep = () => Promise.resolve();
} else if (process.env.NODE_ENV === "test") {
  sleep = () => Promise.resolve();
} else {
  sleep = (
    t = Math.random() * ls("__bookshelf_variable_request_time__", 400) +
      ls("__bookshelf_min_request_time__", 400)
  ) => new Promise((resolve) => setTimeout(resolve, t));
}

function ls(key, defaultVal) {
  const lsVal = window.localStorage.getItem(key);

  let val;

  if (lsVal) {
    val = Number(lsVal);
  }

  return Number.isFinite(val) ? val : defaultVal;
}

const apiUrl = process.env.REACT_APP_API_URL;
const authUrl = process.env.REACT_APP_AUTH_URL;

const handlers = [
  rest.post(`${authUrl}/login`, async (req, res, ctx) => {
    const { username, password } = req.body;
    const user = await usersDB.authenticate({ username, password });
    return res(ctx.json({ user }));
  }),

  rest.post(`${authUrl}/register`, async (req, res, ctx) => {
    const { username, password } = req.body;
    const userFields = { username, password };
    await usersDB.create(userFields);
    let user;
    try {
      user = await usersDB.authenticate(userFields);
    } catch (error) {
      return res(
        ctx.status(400),
        ctx.json({ status: 400, message: error.message })
      );
    }
    return res(ctx.json({ user }));
  }),

  rest.get(`${apiUrl}/me`, async (req, res, ctx) => {
    const user = await getUser(req);
    const token = getToken(req);
    return res(ctx.json({ user: { ...user, token } }));
  }),
].map((handler) => {
  return {
    ...handler,
    async resolver(req, res, ctx) {
      try {
        if (shouldFail(req)) {
          throw new Error("Request failure (for testing purposes).");
        }
        const result = await handler.resolver(req, res, ctx);
        return result;
      } catch (error) {
        const status = error.status || 500;
        return res(
          ctx.status(status),
          ctx.json({ status, message: error.message || "Unknown Error" })
        );
      } finally {
        await sleep();
      }
    },
  };
});

function shouldFail(req) {
  if (JSON.stringify(req.body)?.includes("FAIL")) return true;
  if (req.url.searchParams.toString()?.includes("FAIL")) return true;
  if (process.env.NODE_ENV === "test") return false;
  const failureRate = Number(
    window.localStorage.getItem("__bookshelf_failure_rate__") || 0
  );
  if (Math.random() < failureRate) return true;
  if (requestMatchesFailConfig(req)) return true;

  return false;
}

function requestMatchesFailConfig(req) {
  function configMatches({ requestMethod, urlMatch }) {
    return (
      (requestMethod === "ALL" || req.method === requestMethod) &&
      match(urlMatch, req.url.pathname).matches
    );
  }
  try {
    const failConfig = JSON.parse(
      window.localStorage.getItem("__bookshelf_request_fail_config__") || "[]"
    );
    if (failConfig.some(configMatches)) return true;
  } catch (error) {
    window.localStorage.removeItem("__bookshelf_request_fail_config__");
  }
  return false;
}

const getToken = (req) =>
  req.headers.get("Authorization")?.replace("Bearer ", "");

async function getUser(req) {
  const token = getToken(req);
  if (!token) {
    const error = new Error("A token must be provided");
    error.status = 401;
    throw error;
  }
  let userId;
  try {
    userId = atob(token);
  } catch (e) {
    const error = new Error("Invalid token. Please login again.");
    error.status = 401;
    throw error;
  }
  const user = await usersDB.read(userId);
  return user;
}

export { handlers };
