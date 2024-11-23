import type { LoaderFunctionArgs } from "@remix-run/node";
import { decodeIdToken } from "arctic";
import type { OAuth2Tokens } from "arctic";
import * as v from "valibot";
import { google, stateCookie, codeVerifierCookie } from "./google.server";
import {
  authenticate,
  createUser,
  getClientIdByGoogleId,
} from "./services.server";

const claimsSchema = v.object({
  sub: v.string(),
  email: v.pipe(v.string(), v.email()),
});

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieHeader = request.headers.get("Cookie");
  const storedState: unknown = await stateCookie.parse(cookieHeader);
  const codeVerifier: unknown = await codeVerifierCookie.parse(cookieHeader);

  if (
    code == null ||
    state == null ||
    storedState == null ||
    typeof codeVerifier !== "string" ||
    state !== storedState
  ) {
    throw new Response(null, { status: 400 });
  }

  let tokens: OAuth2Tokens;
  try {
    tokens = await google.validateAuthorizationCode(code, codeVerifier);
  } catch {
    throw new Response(null, { status: 400 });
  }

  const parseResult = v.safeParse(
    claimsSchema,
    decodeIdToken(tokens.idToken()),
  );
  if (!parseResult.success) {
    throw new Response(null, { status: 400 });
  }

  let clientId = await getClientIdByGoogleId(parseResult.output.sub);
  if (clientId == null) {
    clientId = await createUser({
      googleId: parseResult.output.sub,
      email: parseResult.output.email,
    });
  }

  return authenticate(request, clientId);
}
