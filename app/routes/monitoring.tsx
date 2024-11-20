import type { ActionFunctionArgs } from "@remix-run/node";
import * as v from "valibot";
import { env } from "~/env/private.server";

const headerSchema = v.object({
  dsn: v.pipe(
    v.string(),
    v.url(),
    v.transform((value) => new URL(value)),
  ),
});

export async function action({ request }: ActionFunctionArgs) {
  try {
    const sentryHost = new URL(env.SENTRY_DNS).hostname;
    const envelopeBytes = await request.arrayBuffer();
    const envelope = new TextDecoder().decode(envelopeBytes);
    const [piece] = envelope.split("\n");
    if (piece == null) {
      throw new Error("Sentry project id not found");
    }

    const header = v.parse(headerSchema, JSON.parse(piece));
    if (header.dsn.hostname !== sentryHost) {
      throw new Error(`Invalid sentry hostname: ${header.dsn.hostname}`);
    }

    const projectId = header.dsn.pathname.replace("/", "");
    if (projectId !== env.SENTRY_PROJECT_ID) {
      throw new Error(`Invalid sentry project id: ${projectId}`);
    }

    const upstreamSentryUrl = `https://${sentryHost}/api/${projectId}/envelope/`;
    await fetch(upstreamSentryUrl, {
      method: "POST",
      body: envelopeBytes,
    });

    return Response.json({});
  } catch (e) {
    console.error("Error tunneling to sentry", e);
    return Response.json(
      { error: "Error tunneling to sentry" },
      { status: 500 },
    );
  }
}
