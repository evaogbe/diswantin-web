import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/react";
import { LogOut } from "lucide-react";
import { AccountDeletionForm } from "./account-deletion-form";
import { accountDeletionSchema } from "./model";
import {
  deleteUser,
  getAuthenticatedUser,
  invalidateSession,
} from "./services.server";
import { formAction } from "~/form/action.server";
import { getTitle } from "~/layout/meta";
import { Page, PageHeading } from "~/layout/page";
import { Button } from "~/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/ui/card";
import { useSearchParams } from "~/url/use-search-params";

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
  const { searchParams, withSearchParam, withoutSearchParam } =
    useSearchParams();
  const { email } = useLoaderData<typeof loader>();
  const lastResult = useActionData<typeof action>();

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
            <LogOut aria-hidden="true" />
            Sign out
          </Button>
        </p>
      </Form>
      <AccountDeletionForm lastResult={lastResult} />
    </Page>
  );
}
