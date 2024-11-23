import { useForm } from "@conform-to/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react";
import type { MetaFunction } from "@remix-run/react";
import { getValibotConstraint, parseWithValibot } from "conform-to-valibot";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { accountDeletionSchema } from "./model";
import {
  deleteUser,
  getAuthenticatedUser,
  invalidateSession,
} from "./services.server";
import { formAction } from "~/form/action.server";
import { getTitle } from "~/head/meta";

export async function loader({ request }: LoaderFunctionArgs) {
  const { email } = await getAuthenticatedUser(request);
  return { email };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  switch (formData.get("intent")) {
    case "sign-out": {
      return await invalidateSession("Signed out");
    }
    case "delete-account": {
      const user = await getAuthenticatedUser(request);
      const result = await formAction({
        formData,
        requestHeaders: request.headers,
        schema: accountDeletionSchema,
        mutation: async (values) => {
          if (values.email !== user.email) {
            return "Incorrect email";
          }

          await deleteUser(user.id);
          return null;
        },
        humanName: "delete your account",
      });
      if (result != null) {
        return result;
      }

      return await invalidateSession("Account deleted");
    }
    default: {
      throw new Response(null, { status: 400 });
    }
  }
}

export const meta: MetaFunction = ({ error }) => {
  return [{ title: getTitle({ page: "Account settings", error }) }];
};

export default function LogoutRoute() {
  const [searchParams] = useSearchParams();
  const { email } = useLoaderData<typeof loader>();
  const lastResult = useActionData<typeof action>();
  const [accountDeletionForm, accountDeletionFields] = useForm({
    lastResult,
    constraint: getValibotConstraint(accountDeletionSchema),
    shouldRevalidate: "onInput",
    onValidate({ formData }) {
      return parseWithValibot(formData, { schema: accountDeletionSchema });
    },
  });
  const withSearchParam = (name: string, value = "") => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set(name, value);
    return `?${newSearchParams}`;
  };
  const withoutSearchParam = (name: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete(name);
    return `?${newSearchParams}`;
  };

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
                  <Link
                    to={withoutSearchParam("email")}
                    replace
                    preventScrollReset
                  >
                    Hide email
                  </Link>
                </p>
              </>
            ) : (
              <p>
                <Link to={withSearchParam("email")} replace preventScrollReset>
                  Show email
                </Link>
              </p>
            )}
          </dd>
        </dl>
      </section>
      <Form method="post">
        <p>
          <button name="intent" value="sign-out">
            Sign out
          </button>
        </p>
      </Form>
      {searchParams.has("delete-account") ? (
        <Form
          method="post"
          id={accountDeletionForm.id}
          aria-labelledby={`${accountDeletionForm.id}-title`}
          aria-describedby={
            accountDeletionForm.errors != null
              ? accountDeletionForm.errorId
              : undefined
          }
          onSubmit={accountDeletionForm.onSubmit}
        >
          <header>
            <h3 id={`${accountDeletionForm.id}-title`}>Danger Zone</h3>
            <Link
              to={withoutSearchParam("delete-account")}
              replace
              preventScrollReset
            >
              Close
            </Link>
          </header>
          <p>
            <strong>Warning: Deleting your account cannot be undone</strong>
          </p>
          <p>
            Enter the email associated with your account to permanently delete
            your account
          </p>
          {accountDeletionForm.errors != null && (
            <section
              id={accountDeletionForm.errorId}
              role="alert"
              aria-labelledby={`${accountDeletionForm.errorId}-heading`}
            >
              <h4 id={`${accountDeletionForm.errorId}-heading`}>
                Error deleting account
              </h4>
              <p>{accountDeletionForm.errors[0]}</p>
            </section>
          )}
          <div hidden>
            <AuthenticityTokenInput />
          </div>
          <p>
            <label htmlFor={accountDeletionFields.email.id}>Email</label>
            <input
              type="email"
              autoComplete="email"
              id={accountDeletionFields.email.id}
              name={accountDeletionFields.email.name}
              defaultValue={accountDeletionFields.email.initialValue}
              aria-invalid={accountDeletionFields.email.errors != null}
              aria-errormessage={
                accountDeletionFields.email.errors != null
                  ? accountDeletionFields.email.errorId
                  : undefined
              }
              required={accountDeletionFields.email.required}
            />
            {accountDeletionFields.email.errors != null && (
              <strong id={accountDeletionFields.email.errorId} role="alert">
                {accountDeletionFields.email.errors[0]}
              </strong>
            )}
          </p>
          <p>
            <button name="intent" value="delete-account">
              Delete account
            </button>
          </p>
        </Form>
      ) : (
        <section aria-labelledby="danger-zone-heading">
          <h3 id="danger-zone-heading">Danger Zone</h3>
          <p>
            <Link
              to={withSearchParam("delete-account")}
              replace
              preventScrollReset
            >
              Delete account
            </Link>
          </p>
        </section>
      )}
    </article>
  );
}
