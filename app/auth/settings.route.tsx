import { redirect } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/react";
import { Eye, EyeOff, LogOut, Pencil } from "lucide-react";
import { DeleteUserForm } from "./delete-user-form";
import { EditTimeZoneForm } from "./edit-time-zone-form";
import { deleteUserSchema, editTimeZoneSchema } from "./model";
import {
  deleteUser,
  getAuthenticatedUser,
  invalidateSession,
  updateTimeZone,
} from "./services.server";
import { formAction } from "~/form/action.server";
import { getTitle } from "~/layout/meta";
import { Page, PageHeading } from "~/layout/page";
import { Button } from "~/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/ui/card";
import { useSearchParams } from "~/url/use-search-params";

export async function loader({ request }: LoaderFunctionArgs) {
  const { email, timeZone } = await getAuthenticatedUser(request);
  return {
    account: { email, timeZone },
    timeZones: Intl.supportedValuesOf("timeZone"),
  };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  switch (formData.get("intent")) {
    case "update-time-zone": {
      const user = await getAuthenticatedUser(request);
      const result = await formAction({
        formData,
        requestHeaders: request.headers,
        schema: editTimeZoneSchema,
        mutation: async ({ timeZone }) => {
          if (!Intl.supportedValuesOf("timeZone").includes(timeZone)) {
            throw new Response(`Time zone not supported: ${timeZone}`, {
              status: 400,
            });
          }

          await updateTimeZone(user.id, timeZone);
          return null;
        },
        humanName: "edit the time zone",
      });
      if (result != null) {
        return result;
      }

      const url = new URL(request.url);
      url.searchParams.delete("update-time-zone");
      return redirect(`/settings?${url.searchParams}`, 303);
    }
    case "sign-out": {
      return await invalidateSession("Signed out");
    }
    case "delete-account": {
      const user = await getAuthenticatedUser(request);
      const result = await formAction({
        formData,
        requestHeaders: request.headers,
        schema: deleteUserSchema,
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
  const { account, timeZones } = useLoaderData<typeof loader>();
  const lastResult = useActionData<typeof action>();
  const { searchParams, withSearchParam, withoutSearchParam } =
    useSearchParams();

  return (
    <Page aria-labelledby="account-settings-heading">
      <PageHeading id="account-settings-heading">Account settings</PageHeading>
      {searchParams.has("update-time-zone") ? (
        <EditTimeZoneForm
          lastResult={
            lastResult?.initialValue?.intent === "update-time-zone"
              ? lastResult
              : null
          }
          timeZones={timeZones}
          initialTimeZone={account.timeZone}
        />
      ) : (
        <Card aria-labelledby="account-info-heading">
          <CardHeader className="pb-2xs">
            <CardTitle id="account-info-heading">Account Info</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="text-sm">
              <dt className="text-muted-foreground">Sign-in method</dt>
              <dd>
                <p>Google</p>
                {searchParams.has("email") ? (
                  <>
                    <p>{account.email}</p>
                    <p className="mt-3xs">
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          to={withoutSearchParam("email")}
                          replace
                          preventScrollReset
                        >
                          <EyeOff aria-hidden="true" /> Hide email
                        </Link>
                      </Button>
                    </p>
                  </>
                ) : (
                  <p className="mt-3xs">
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        to={withSearchParam("email")}
                        replace
                        preventScrollReset
                      >
                        <Eye aria-hidden="true" /> Show email
                      </Link>
                    </Button>
                  </p>
                )}
              </dd>
              <dt className="mt-2xs text-muted-foreground">Time zone</dt>
              <dd>
                <p>{account.timeZone}</p>
                <p className="mt-3xs">
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      to={withSearchParam("update-time-zone")}
                      replace
                      preventScrollReset
                    >
                      <Pencil aria-hidden="true" /> Edit
                    </Link>
                  </Button>
                </p>
              </dd>
            </dl>
          </CardContent>
        </Card>
      )}
      <Form method="post" className="mt-sm">
        <p>
          <Button name="intent" value="sign-out" variant="secondary">
            <LogOut aria-hidden="true" /> Sign out
          </Button>
        </p>
      </Form>
      <DeleteUserForm
        lastResult={
          lastResult?.initialValue?.intent === "delete-account"
            ? lastResult
            : null
        }
      />
    </Page>
  );
}
