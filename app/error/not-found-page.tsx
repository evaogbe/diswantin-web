import { Page, PageHeading } from "~/layout/page";
import { Link } from "~/ui/link";

export function NotFoundPage({ homePath }: { homePath: string }) {
  return (
    <Page aria-labelledby="page-not-found-heading" className="space-y-sm">
      <PageHeading id="page-not-found-heading">Page not found</PageHeading>
      <p className="break-words leading-7">
        The page you were looking for could not be found. Perhaps you typed in
        the URL wrong or the page has been removed.
      </p>
      <p className="break-words leading-7">
        <Link to={homePath}>Return home</Link>
      </p>
    </Page>
  );
}
