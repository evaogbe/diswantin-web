import { FormProvider, useForm } from "@conform-to/react";
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
import { AlertCircle, LogOut, X } from "lucide-react";
import { useId, useState } from "react";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { uid } from "uid";
import { accountDeletionSchema } from "./model";
import {
  deleteUser,
  getAuthenticatedUser,
  invalidateSession,
} from "./services.server";
import { formAction } from "~/form/action.server";
import { FormField, FormItem, FormLabel, FormMessage } from "~/form/field";
import { Input } from "~/form/input";
import { getTitle } from "~/layout/meta";
import { Page, PageHeading } from "~/layout/page";
import { Alert, AlertTitle, AlertDescription } from "~/ui/alert";
import { Button } from "~/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/ui/card";

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

export default function SettingsRoute() {
  const [searchParams] = useSearchParams();
  const { email } = useLoaderData<typeof loader>();
  const lastResult = useActionData<typeof action>();
  const initialAccountDeletionFormId = useId();
  const [accountDeletionFormId, setAccountDeletionFormId] = useState(
    `form-${initialAccountDeletionFormId}`,
  );
  const [accountDeletionForm, accountDeletionFields] = useForm({
    id: accountDeletionFormId,
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
    <Page aria-labelledby="account-settings-heading">
      <PageHeading id="account-settings-heading">Account settings</PageHeading>
      <Card aria-labelledby="account-info-heading">
        <CardHeader className="pb-2xs">
          <CardTitle id="account-info-heading">Account Info</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="text-sm">
            <dt className="text-muted-foreground">Sign-in method</dt>
            <dd className="mt-4xs">
              <p>Google</p>
              {searchParams.has("email") ? (
                <>
                  <p>{email}</p>
                  <p className="mt-4xs">
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        to={withoutSearchParam("email")}
                        replace
                        preventScrollReset
                      >
                        Hide email
                      </Link>
                    </Button>
                  </p>
                </>
              ) : (
                <p className="mt-4xs">
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      to={withSearchParam("email")}
                      replace
                      preventScrollReset
                    >
                      Show email
                    </Link>
                  </Button>
                </p>
              )}
            </dd>
          </dl>
        </CardContent>
      </Card>
      <Form method="post" className="mt-sm">
        <p>
          <Button name="intent" value="sign-out" variant="secondary">
            <LogOut />
            Sign out
          </Button>
        </p>
      </Form>
      {searchParams.has("delete-account") ? (
        <FormProvider context={accountDeletionForm.context}>
          <Form
            key={accountDeletionForm.key}
            method="post"
            id={accountDeletionForm.id}
            aria-labelledby={`${accountDeletionForm.id}-title`}
            aria-describedby={
              accountDeletionForm.errors != null
                ? accountDeletionForm.errorId
                : undefined
            }
            onSubmit={accountDeletionForm.onSubmit}
            className="mt-sm space-y-xs rounded-xl border bg-card p-sm text-card-foreground shadow"
          >
            <header className="flex items-center justify-between">
              <CardTitle id={`${accountDeletionForm.id}-title`}>
                Danger Zone
              </CardTitle>
              <Button variant="ghost" size="icon" asChild>
                <Link
                  to={withoutSearchParam("delete-account")}
                  replace
                  preventScrollReset
                  aria-label="Close"
                  onClick={() => {
                    setAccountDeletionFormId(`form-${uid()}`);
                  }}
                >
                  <X />
                </Link>
              </Button>
            </header>
            <p>
              <strong>Warning: Deleting your account cannot be undone</strong>
            </p>
            <p>
              Enter the email associated with your account to permanently delete
              your account
            </p>
            {accountDeletionForm.errors != null && (
              <Alert
                variant="destructive"
                id={accountDeletionForm.errorId}
                aria-labelledby={`${accountDeletionForm.errorId}-heading`}
              >
                <AlertCircle className="size-xs" />
                <AlertTitle
                  level={4}
                  id={`${accountDeletionForm.errorId}-heading`}
                >
                  Error deleting account
                </AlertTitle>
                <AlertDescription>
                  {accountDeletionForm.errors[0]}
                </AlertDescription>
              </Alert>
            )}
            <div hidden>
              <AuthenticityTokenInput />
            </div>
            <FormField
              name={accountDeletionFields.email.name}
              render={({ field, data }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <Input
                    {...field}
                    type="email"
                    autoComplete="email"
                    defaultValue={data.initialValue}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <p>
              <Button name="intent" value="delete-account" variant="secondary">
                Delete account
              </Button>
            </p>
          </Form>
        </FormProvider>
      ) : (
        <Card aria-labelledby="danger-zone-heading" className="mt-sm">
          <CardHeader>
            <CardTitle
              id="danger-zone-heading"
              className="flex h-lg items-center"
            >
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <Button variant="destructive" asChild>
                <Link
                  to={withSearchParam("delete-account")}
                  replace
                  preventScrollReset
                >
                  Delete account
                </Link>
              </Button>
            </p>
          </CardContent>
        </Card>
      )}
    </Page>
  );
}
