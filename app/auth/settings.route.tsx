import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, useLoaderData, useSearchParams } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/react";
import { getAuthenticatedUser, invalidateSession } from "./services.server";
import { getTitle } from "~/utils/meta";

export async function loader({ request }: LoaderFunctionArgs) {
  const { email } = await getAuthenticatedUser(request);
  return { email };
}

export function action({ request }: ActionFunctionArgs) {
  return invalidateSession(request);
}

export const meta: MetaFunction = ({ error }) => {
  return [{ title: getTitle({ page: "Account settings", error }) }];
};

export default function LogoutRoute() {
  const { email } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  return (
    <article aria-labelledby="account-settings-heading">
      <h2 id="account-settings-heading">Account settings</h2>
      <section aria-labelledby="account-info-heading">
        <h3 id="account-info-heading">Account Info</h3>
        <dl>
          <dt>Sign-in method</dt>
          <dd>
            <p>Google</p>
            {searchParams.has("email") ? (
              <>
                <p>{email}</p>
                <p>
                  <Link to="?" replace>
                    Hide email
                  </Link>
                </p>
              </>
            ) : (
              <p>
                <Link to="?email" replace>
                  Show email
                </Link>
              </p>
            )}
          </dd>
        </dl>
      </section>
      <Form method="post">
        <p>
          <button>Logout</button>
        </p>
      </Form>
    </article>
  );
}
