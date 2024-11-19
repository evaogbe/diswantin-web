import crypto from "node:crypto";
import { createRequestHandler } from "@remix-run/express";
import type { ServerBuild } from "@remix-run/node";
import closeWithGrace from "close-with-grace";
import compression from "compression";
import * as express from "express";
import type { Response } from "express";
import getPort, { portNumbers } from "get-port";
import helmet from "helmet";
import * as morgan from "morgan";

async function run() {
  const viteDevServer =
    process.env.NODE_ENV === "production"
      ? null
      : await import("vite").then((vite) =>
          vite.createServer({
            server: { middlewareMode: true },
          }),
        );

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
            (_req, res) => `'nonce-${(res as Response).locals.cspNonce}'`,
          ],
          fontSrc: ["'self'"],
          styleSrc: ["'self'"],
          connectSrc:
            process.env.NODE_ENV === "development"
              ? ["'self'", "ws:"]
              : ["'self'"],
          imgSrc: ["'self'"],
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
      skip: (req, res) => res.statusCode === 200 && req.url === "/health-check",
    }),
  );

  app.all(
    "*",
    createRequestHandler({
      build: viteDevServer
        ? () =>
            viteDevServer.ssrLoadModule(
              "virtual:remix/server-build",
            ) as Promise<ServerBuild>
        : ((await import("./build/server")) as unknown as ServerBuild),
      getLoadContext(_req, res) {
        return { cspNonce: res.locals.cspNonce };
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

  if (process.env.NODE_ENV !== "development" && port !== desiredPort) {
    console.error(`Port ${desiredPort} is not available.`);
    process.exit(1);
  }

  const server = app.listen(port, () => {
    console.log(`🚀 App listening on http://localhost:${port}`);
  });

  closeWithGrace(async ({ err, signal }) => {
    if (err) {
      console.error("Server closing with error", err);
    } else {
      console.log(`${signal} received, server closing`);
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
