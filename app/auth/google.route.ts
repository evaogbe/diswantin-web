import { decodeIdToken } from "arctic";
import type { OAuth2Tokens } from "arctic";
import * as v from "valibot";
import type { Route } from "./+types/google.route";
import { google, stateCookie, codeVerifierCookie } from "./google.server";
import { credentialsSchema } from "./model";
import {
  authenticate,
  createUser,
  getAccountByGoogleId,
} from "./services.server";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieHeader = request.headers.get("Cookie");
  const storedState: unknown = await stateCookie.parse(cookieHeader);
  const codeVerifier: unknown = await codeVerifierCookie.parse(cookieHeader);

  if (code == null || typeof codeVerifier !== "string") {
    console.error("Invalid auth code");
    throw new Response(null, { status: 400 });
  }

  if (state == null || storedState == null || state !== storedState) {
    console.error("Invalid auth state");
    throw new Response(null, { status: 400 });
  }

  let tokens: OAuth2Tokens;
  try {
    tokens = await google.validateAuthorizationCode(code, codeVerifier);
  } catch {
    console.error("Invalid auth code");
    throw new Response(null, { status: 400 });
  }

  const parseResult = v.safeParse(
    credentialsSchema,
    decodeIdToken(tokens.idToken()),
  );
  if (!parseResult.success) {
    console.error("Invalid credentials", parseResult.issues);
    throw new Response(null, { status: 400 });
  }

  let account = await getAccountByGoogleId(parseResult.output.sub);
  if (account == null) {
    const clientId = await createUser(parseResult.output);
    account = { clientId, timeZone: null };
  }

  return authenticate(request, account);
}
