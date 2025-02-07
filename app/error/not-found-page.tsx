import { Page, PageHeading } from "~/layout/page";
import { Link } from "~/ui/link";

export function NotFoundPage({ homePath }: { homePath: string }) {
  return (
    <Page aria-labelledby="page-not-found-heading" className="space-y-fl-sm">
      <PageHeading id="page-not-found-heading">Page not found</PageHeading>
      <p className="leading-7 break-words">
        The page you were looking for could not be found. Perhaps you typed in
        the URL wrong or the page has been removed.
      </p>
      <p className="leading-7 break-words">
        <Link to={homePath}>Return home</Link>
      </p>
    </Page>
  );
}
