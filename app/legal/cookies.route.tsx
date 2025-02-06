import type { Route } from "./+types/cookies.route";
import { MainLayout } from "~/layout/main-layout";
import { getTitle } from "~/layout/meta";
import { Page, PageHeading } from "~/layout/page";
import { Link } from "~/ui/link";

export function meta({ error }: Route.MetaArgs) {
  return [{ title: getTitle({ page: "Cookie Policy", error }) }];
}

export default function CookiesRoute() {
  return (
    <MainLayout isAuthenticated={false}>
      <Page
        aria-labelledby="cookie-policy"
        className="[&_>*+*]:mt-fl-sm [&_>h2+*]:mt-fl-2xs"
      >
        <PageHeading id="cookie-policy">Cookie policy</PageHeading>
        <p className="leading-7 break-words">
          This cookie policy (“Policy”) describes what cookies are and how
          they&apos;re being used by the{" "}
          <Link to="https://www.diswantin.com">diswantin.com</Link> website
          (“Website” or “Service”) and any of its related products and services
          (collectively, “Services”). This Policy is a legally binding agreement
          between you (“User”, “you” or “your”) and this Website operator
          (“Operator”, “we”, “us” or “our”). If you are entering into this
          Policy on behalf of a business or other legal entity, you represent
          that you have the authority to bind such entity to this Policy, in
          which case the terms “User”, “you” or “your” shall refer to such
          entity. If you do not have such authority, or if you do not agree with
          the terms of this Policy, you must not accept this Policy and may not
          access and use the Website and Services. You should read this Policy
          so you can understand the types of cookies we use, the information we
          collect using cookies and how that information is used. It also
          describes the choices available to you regarding accepting or
          declining the use of cookies.
        </p>
        <section aria-labelledby="toc">
          <h3
            id="toc"
            className="text-2xl font-semibold tracking-tight text-balance"
          >
            Table of contents
          </h3>
          <ol className="my-fl-sm ms-fl-sm space-y-fl-2xs list-decimal">
            <li>
              <Link to="#what-are-cookies">What are cookies?</Link>
            </li>
            <li>
              <Link to="#what-type-of-cookies-do-we-use">
                What type of cookies do we use?
              </Link>
            </li>
            <li>
              <Link to="#what-are-your-cookie-options">
                What are your cookie options?
              </Link>
            </li>
            <li>
              <Link to="#changes-and-amendments">Changes and amendments</Link>
            </li>
            <li>
              <Link to="#acceptance-of-this-policy">
                Acceptance of this policy
              </Link>
            </li>
            <li>
              <Link to="#contacting-us">Contacting us</Link>
            </li>
          </ol>
        </section>
        <section
          aria-labelledby="what-are-cookies"
          className="[&_>*+*]:mt-fl-sm [&_>h3+*]:mt-fl-2xs [&_>h4+*]:mt-fl-2xs"
        >
          <h3
            id="what-are-cookies"
            className="scroll-my-[5ex] text-2xl font-semibold tracking-tight text-balance"
          >
            What are cookies?
          </h3>
          <p className="leading-7 break-words">
            Cookies are small pieces of data stored in text files that are saved
            on your computer or other devices when websites are loaded in a
            browser. They are widely used to remember you and your preferences,
            either for a single visit (through a “session cookie”) or for
            multiple repeat visits (using a “persistent cookie”).
          </p>
          <p className="leading-7 break-words">
            Session cookies are temporary cookies that are used during the
            course of your visit to the Website, and they expire when you close
            the web browser.
          </p>
          <p className="leading-7 break-words">
            Persistent cookies are used to remember your preferences within our
            Website and remain on your desktop or mobile device even after you
            close your browser or restart your computer. They ensure a
            consistent and efficient experience for you while visiting the
            Website and Services.
          </p>
          <p className="leading-7 break-words">
            Cookies may be set by the Website (“first-party cookies”), or by
            third parties, such as those who serve content or provide
            advertising or analytics services on the Website (“third party
            cookies”). These third parties can recognize you when you visit our
            website and also when you visit certain other websites.
          </p>
        </section>
        <section
          aria-labelledby="what-type-of-cookies-do-we-use"
          className="[&_>*+*]:mt-fl-sm [&_>h3+*]:mt-fl-2xs [&_>h4+*]:mt-fl-2xs"
        >
          <h3
            id="what-type-of-cookies-do-we-use"
            className="scroll-my-[5ex] text-2xl font-semibold tracking-tight text-balance"
          >
            What type of cookies do we use?
          </h3>
          <h4 className="text-xl font-semibold tracking-tight text-balance">
            Necessary cookies
          </h4>
          <p className="leading-7 break-words">
            Necessary cookies allow us to offer you the best possible experience
            when accessing and navigating through our Website and using its
            features. For example, these cookies let us recognize that you have
            created an account and have logged into that account to access the
            content.
          </p>
          <h4 className="text-xl font-semibold tracking-tight text-balance">
            Functionality cookies
          </h4>
          <p className="leading-7 break-words">
            Functionality cookies let us operate the Website and Services in
            accordance with the choices you make. For example, we will recognize
            your color theme and remember how you customized the Website and
            Services during future visits.
          </p>
        </section>
        <section
          aria-labelledby="what-are-your-cookie-options"
          className="[&_>*+*]:mt-fl-sm [&_>h3+*]:mt-fl-2xs [&_>h4+*]:mt-fl-2xs"
        >
          <h3
            id="what-are-your-cookie-options"
            className="scroll-my-[5ex] text-2xl font-semibold tracking-tight text-balance"
          >
            What are your cookie options?
          </h3>
          <p className="leading-7 break-words">
            If you don&apos;t like the idea of cookies or certain types of
            cookies, you can change your browser&apos;s settings to delete
            cookies that have already been set and to not accept new cookies.
            Visit{" "}
            <Link
              to="https://www.internetcookies.com"
              target="_blank"
              rel="nofollow noreferrer external"
            >
              internetcookies.com
            </Link>{" "}
            to learn more about how to do this.
          </p>
          <p className="leading-7 break-words">
            Please note, however, that if you delete cookies or do not accept
            them, you might not be able to use all of the features the Website
            and Services offer.
          </p>
        </section>
        <section
          aria-labelledby="changes-and-amendments"
          className="[&_>*+*]:mt-fl-sm [&_>h3+*]:mt-fl-2xs [&_>h4+*]:mt-fl-2xs"
        >
          <h3
            id="changes-and-amendments"
            className="scroll-my-[5ex] text-2xl font-semibold tracking-tight text-balance"
          >
            Changes and amendments
          </h3>
          <p className="leading-7 break-words">
            We reserve the right to modify this Policy or its terms related to
            the Website and Services at any time at our discretion. When we do,
            we will revise the updated date at the bottom of this page, post a
            notification on the main page of the Website, send you an email to
            notify you. We may also provide notice to you in other ways at our
            discretion, such as through the contact information you have
            provided.
          </p>
          <p className="leading-7 break-words">
            An updated version of this Policy will be effective immediately upon
            the posting of the revised Policy unless otherwise specified. Your
            continued use of the Website and Services after the effective date
            of the revised Policy (or such other act specified at that time)
            will constitute your consent to those changes.
          </p>
        </section>
        <section
          aria-labelledby="acceptance-of-this-policy"
          className="[&_>*+*]:mt-fl-sm [&_>h3+*]:mt-fl-2xs [&_>h4+*]:mt-fl-2xs"
        >
          <h3
            id="acceptance-of-this-policy"
            className="scroll-my-[5ex] text-2xl font-semibold tracking-tight text-balance"
          >
            Acceptance of this policy
          </h3>
          <p className="leading-7 break-words">
            You acknowledge that you have read this Policy and agree to all its
            terms and conditions. By accessing and using the Website and
            Services you agree to be bound by this Policy. If you do not agree
            to abide by the terms of this Policy, you are not authorized to
            access or use the Website and Services. This policy has been created
            with the help of the{" "}
            <Link
              to="https://www.websitepolicies.com/cookie-policy-generator"
              target="_blank"
              rel="noreferrer"
            >
              cookie policy generator
            </Link>
            .
          </p>
        </section>
        <section
          aria-labelledby="contacting-us"
          className="[&_>*+*]:mt-fl-sm [&_>h3+*]:mt-fl-2xs [&_>h4+*]:mt-fl-2xs"
        >
          <h3
            id="contacting-us"
            className="scroll-my-[5ex] text-2xl font-semibold tracking-tight text-balance"
          >
            Contacting us
          </h3>
          <p className="leading-7 break-words">
            If you have any questions, concerns, or complaints regarding this
            Policy or the use of cookies, we encourage you to contact us using
            the details below:
          </p>
          <p className="leading-7 break-words">
            <Link to="&#109;&#097;&#105;&#108;&#116;&#111;&#058;&#100;&#105;&#115;&#119;anti&#110;a&#112;p&#64;&#103;&#109;&#97;i&#108;.co&#109;">
              &#100;is&#119;&#97;&#110;ti&#110;&#97;pp&#64;g&#109;&#97;&#105;l&#46;&#99;o&#109;
            </Link>
          </p>
          <p className="leading-7 break-words">
            This document was last updated on January 31, 2025
          </p>
          <p className="leading-7 break-words">
            <Link
              to="https://www.websitepolicies.com/cookie-policy-generator?via=madewithbadge"
              target="_blank"
              rel="noreferrer"
            >
              <img
                width="200"
                height="25"
                alt="Made with WebsitePolicies cookie policy generator"
                src="https://cdnapp.websitepolicies.com/widgets/policies/badge.png"
                srcSet="https://cdnapp.websitepolicies.com/widgets/policies/badge_2x.png 2x"
              />
            </Link>
          </p>
        </section>
      </Page>
    </MainLayout>
  );
}
