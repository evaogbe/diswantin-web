import crypto from "node:crypto";
import { createRequestHandler } from "@react-router/express";
import * as Sentry from "@sentry/node";
import closeWithGrace from "close-with-grace";
import compression from "compression";
import * as express from "express";
import type { Response } from "express";
import { rateLimit } from "express-rate-limit";
import type { Options as RateLimitOptions } from "express-rate-limit";
import getPort, { portNumbers } from "get-port";
import helmet from "helmet";
import * as morgan from "morgan";
import type { ServerBuild } from "react-router";

async function run() {
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
          connectSrc:
            env === "development"
              ? ["'self'", "ws:", "localhost:*"]
              : ["'self'"],
          imgSrc: [
            "'self'",
            "data:",
            "https://www.websitepolicies.com",
            "https://cdnapp.websitepolicies.com",
          ],
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

  const rateLimitDefaults: Partial<RateLimitOptions> = {
    standardHeaders: "draft-8",
    legacyHeaders: false,
    keyGenerator(req) {
      return req.get("x-envoy-external-address") ?? req.ip ?? "";
    },
    handler(req, res, _next, options) {
      console.error("Rate limit exceeded", {
        ip: req.get("x-envoy-external-address") ?? req.ip,
      });
      res.status(options.statusCode).send(options.message);
    },
  };
  const generalRateLimit = rateLimit({
    ...rateLimitDefaults,
    limit: 1000,
  });
  const strongRateLimit = rateLimit({
    ...rateLimitDefaults,
    limit: 100,
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
              "virtual:react-router/server-build",
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
