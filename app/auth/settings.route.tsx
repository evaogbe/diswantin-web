import { Eye, EyeOff, LogOut, Pencil } from "lucide-react";
import { data, Form, Link, useNavigation } from "react-router";
import { twJoin } from "tailwind-merge";
import type { Route } from "./+types/settings.route";
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
import { useIntents } from "~/form/intents";
import { getTitle } from "~/layout/meta";
import { Page, PageHeading } from "~/layout/page";
import { Button } from "~/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/ui/card";
import { PendingButton } from "~/ui/pending-button";
import { useSearchParams } from "~/url/search-params";

export async function loader({ request }: Route.LoaderArgs) {
  const { email, timeZone } = await getAuthenticatedUser(request);
  return {
    account: { email, timeZone },
    timeZones: Intl.supportedValuesOf("timeZone"),
  };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  switch (formData.get("intent")) {
    case "update-time-zone": {
      const user = await getAuthenticatedUser(request);
      return formAction({
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

          const url = new URL(request.url);
          url.searchParams.delete("update-time-zone");
          return { status: "success", path: `/settings?${url.searchParams}` };
        },
        humanName: "edit the time zone",
      });
    }
    case "sign-out": {
      console.log("Sign out requested");
      return await invalidateSession("Signed out");
    }
    case "delete-account": {
      console.log("Delete user requested", {
        formData: Object.fromEntries(formData),
      });
      const user = await getAuthenticatedUser(request);
      const result = await formAction({
        formData,
        requestHeaders: request.headers,
        schema: deleteUserSchema,
        mutation: async (values) => {
          if (values.email !== user.email) {
            return { status: "error", message: "Incorrect email" };
          }

          await deleteUser(user.id);
          return { status: "success" };
        },
        humanName: "delete your account",
      });
      if (result != null) {
        return result;
      }

      return await invalidateSession("Account deleted");
    }
    default: {
      throw data(null, { status: 400 });
    }
  }
}

export function meta({ error }: Route.MetaArgs) {
  return [{ title: getTitle({ page: "Account settings", error }) }];
}

export default function SettingsRoute({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { account, timeZones } = loaderData;
  const { searchParams, withSearchParam, withoutSearchParam } =
    useSearchParams();
  const navigation = useNavigation();
  const lastIntent = useIntents();

  return (
    <Page aria-labelledby="account-settings-heading" className="space-y-fl-sm">
      <PageHeading id="account-settings-heading">Account settings</PageHeading>
      {searchParams.has("update-time-zone") ? (
        <EditTimeZoneForm
          timeZones={timeZones}
          initialTimeZone={account.timeZone}
          lastResult={actionData}
          lastIntent={lastIntent}
        />
      ) : (
        <Card aria-labelledby="account-info-heading">
          <CardHeader className="pb-fl-xs">
            <CardTitle id="account-info-heading">Account Info</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="text-sm">
              <dt className="text-muted-foreground">Sign-in method</dt>
              <dd>
                <p className="mt-fl-4xs">Google</p>
                {searchParams.has("email") ? (
                  <>
                    <p className="mt-fl-4xs">{account.email}</p>
                    <p className="mt-fl-2xs">
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
                  <p className="mt-fl-2xs">
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
              <dt className="mt-fl-xs text-muted-foreground">Time zone</dt>
              <dd>
                <p className="mt-fl-4xs">{account.timeZone}</p>
                <p className="mt-fl-2xs">
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
      <Form
        method="post"
        className={twJoin(
          navigation.state === "submitting" && "[&_*]:cursor-wait",
        )}
      >
        <p>
          <PendingButton
            pending={
              lastIntent === "sign-out" && navigation.state === "submitting"
            }
            pendingText="Signing out…"
            name="intent"
            value="sign-out"
            variant="secondary"
          >
            <LogOut aria-hidden="true" /> Sign out
          </PendingButton>
        </p>
      </Form>
      <DeleteUserForm lastResult={actionData} lastIntent={lastIntent} />
    </Page>
  );
}
