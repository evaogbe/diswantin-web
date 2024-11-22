import type { ActionFunctionArgs } from "@remix-run/node";
import { Form } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/react";
import { invalidateSession } from "./services.server";
import { getTitle } from "~/utils/meta";

export function action({ request }: ActionFunctionArgs) {
  return invalidateSession(request);
}

export const meta: MetaFunction = ({ error }) => {
  return [{ title: getTitle({ page: "Account settings", error }) }];
};

export default function LogoutRoute() {
  return (
    <article aria-labelledby="account-settings-heading">
      <h2 id="account-settings-heading">Account settings</h2>
      <Form method="post">
        <p>
          <button>Logout</button>
        </p>
      </Form>
    </article>
  );
}
