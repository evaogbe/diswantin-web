import type { LoaderFunctionArgs } from "@remix-run/node";
import { decodeIdToken } from "arctic";
import type { OAuth2Tokens } from "arctic";
import { google, stateCookie, codeVerifierCookie } from "./google.server";
import { authenticate, getOrCreateAccountByGoogleId } from "./services.server";

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

  const claims = decodeIdToken(tokens.idToken());
  if (!("sub" in claims) || typeof claims.sub !== "string") {
    throw new Response(null, { status: 400 });
  }

  const account = await getOrCreateAccountByGoogleId(claims.sub);
  return authenticate(request, account);
}
