import crypto from "node:crypto";
import { createRequestHandler } from "@remix-run/express";
import type { ServerBuild } from "@remix-run/node";
import Sentry from "@sentry/remix";
import closeWithGrace from "close-with-grace";
import compression from "compression";
import * as express from "express";
import type { Response } from "express";
import { rateLimit } from "express-rate-limit";
import getPort, { portNumbers } from "get-port";
import helmet from "helmet";
import * as morgan from "morgan";

async function run() {
  // NODE_ENV can be undefined
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const env = process.env.NODE_ENV ?? "development";
  const viteDevServer =
    env === "development"
      ? await import("vite").then((vite) =>
          vite.createServer({
            server: { middlewareMode: true },
          }),
        )
      : null;

  const app = express.default();

  app.use(compression());

  app.disable("x-powered-by");

  app.use((_, res, next) => {
    res.locals.cspNonce = crypto.randomBytes(16).toString("hex");
    next();
  });

  app.use(
    helmet({
      xPoweredBy: false,
      contentSecurityPolicy: {
        directives: {
          scriptSrc: [
            "'self'",
            "'strict-dynamic'",
            (_req, res) => `'nonce-${(res as Response).locals.cspNonce}'`,
          ],
          fontSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          connectSrc: ["'self'", env === "development" ? "ws:" : null].filter(
            (dir) => dir != null,
          ),
          imgSrc: ["'self'"],
          formAction: ["'self'", "https://accounts.google.com"],
          baseUri: ["'none'"],
          "upgrade-insecure-requests": null,
        },
      },
    }),
  );

  app.use(
    viteDevServer ? viteDevServer.middlewares : express.static("build/client"),
  );

  app.use(
    morgan.default("tiny", {
      skip: (req, res) => res.statusCode === 200 && req.url === "/_health",
    }),
  );

  const generalRateLimit = rateLimit({
    limit: 1000,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    keyGenerator(req) {
      return req.get("x-envoy-external-address") ?? req.ip ?? "";
    },
  });
  const strongRateLimit = rateLimit({
    limit: 100,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    keyGenerator(req) {
      return req.get("x-envoy-external-address") ?? req.ip ?? "";
    },
  });

  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      return strongRateLimit(req, res, next);
    }

    return generalRateLimit(req, res, next);
  });

  app.all(
    "*",
    createRequestHandler({
      build: viteDevServer
        ? () =>
            viteDevServer.ssrLoadModule(
              "virtual:remix/server-build",
            ) as Promise<ServerBuild>
        : // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore: Build file is generated
          // eslint-disable-next-line import-x/no-unresolved
          ((await import("../build/server")) as unknown as ServerBuild),
      getLoadContext(_req, res) {
        return {
          cspNonce: (res as Response<unknown, { cspNonce: string }>).locals
            .cspNonce,
        };
      },
    }),
  );

  function getDesiredPort() {
    if (!process.env.PORT) {
      return 3000;
    }
    const port = parseInt(process.env.PORT, 10);
    if (!Number.isNaN(port)) {
      return port;
    }
    return 3000;
  }

  const desiredPort = getDesiredPort();
  const port = await getPort({
    port: portNumbers(desiredPort, desiredPort + 100),
  });

  if (env !== "development" && port !== desiredPort) {
    console.error(`Port ${desiredPort} is not available.`);
    process.exit(1);
  }

  const server = app.listen(port, () => {
    console.log(`🚀 App listening on http://localhost:${port}`);
  });

  closeWithGrace(async ({ err }) => {
    if (err) {
      console.error("Server closing with error", err);
      Sentry.captureException(err);
      await Sentry.flush(500);
    }

    await new Promise((resolve, reject) => {
      server.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve(null);
        }
      });
    });
  });
}

void run();
