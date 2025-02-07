import type { Route } from "./+types/terms.route";
import { MainLayout } from "~/layout/main-layout";
import { getTitle } from "~/layout/meta";
import { Page, PageHeading } from "~/layout/page";
import { Link } from "~/ui/link";

export function meta({ error }: Route.MetaArgs) {
  return [{ title: getTitle({ page: "Terms of Service", error }) }];
}

export default function TermsRoute() {
  return (
    <MainLayout isAuthenticated={false}>
      <Page
        aria-labelledby="terms-of-service"
        className="[&_>*+*]:mt-fl-sm [&_>h2+*]:mt-fl-2xs"
      >
        <PageHeading id="terms-of-service">Terms of Service</PageHeading>
        <p className="leading-7 break-words">Last updated: February 2, 2025</p>
        <section
          aria-labelledby="acceptance-of-terms"
          className="[&_>*+*]:mt-fl-sm [&_>h3+*]:mt-fl-2xs"
        >
          <h3
            id="acceptance-of-terms"
            className="text-2xl font-semibold tracking-tight text-balance"
          >
            Acceptance of Terms
          </h3>
          <p className="leading-7 break-words">
            By accessing or using the Diswantin website and mobile application,
            you agree to comply with and be bound by these Terms of Service. If
            you do not agree to these terms, please do not use our services.
          </p>
        </section>
        <section
          aria-labelledby="changes-to-terms"
          className="[&_>*+*]:mt-fl-sm [&_>h3+*]:mt-fl-2xs"
        >
          <h3
            id="changes-to-terms"
            className="text-2xl font-semibold tracking-tight text-balance"
          >
            Changes to Terms
          </h3>
          <p className="leading-7 break-words">
            We reserve the right to modify these Terms of Service at any time.
            Any changes will be effective immediately upon posting on this page.
            Your continued use of the service after any changes constitutes your
            acceptance of the new terms.
          </p>
        </section>
        <section
          aria-labelledby="user-responsibilities"
          className="[&_>*+*]:mt-fl-sm [&_>h3+*]:mt-fl-2xs"
        >
          <h3
            id="user-responsibilities"
            className="text-2xl font-semibold tracking-tight text-balance"
          >
            User Responsibilities
          </h3>
          <p className="leading-7 break-words">
            You are responsible for your use of the Diswantin services and for
            any consequences thereof. You agree to use the services only for
            lawful purposes and in accordance with these Terms.
          </p>
        </section>
        <section
          aria-labelledby="no-medical-advice"
          className="[&_>*+*]:mt-fl-sm [&_>h3+*]:mt-fl-2xs"
        >
          <h3
            id="no-medical-advice"
            className="text-2xl font-semibold tracking-tight text-balance"
          >
            No Medical Advice
          </h3>
          <p className="leading-7 break-words">
            The information provided by Diswantin is for informational purposes
            only and is not intended as medical advice. You should not rely on
            any information provided by Diswantin as a substitute for
            professional medical advice, diagnosis, or treatment. Always seek
            the advice of your physician or other qualified health provider with
            any questions you may have regarding a medical condition.
          </p>
        </section>
        <section
          aria-labelledby="limitations-of-liability"
          className="[&_>*+*]:mt-fl-sm [&_>h3+*]:mt-fl-2xs"
        >
          <h3
            id="limitations-of-liability"
            className="text-2xl font-semibold tracking-tight text-balance"
          >
            Limitation of Liability
          </h3>
          <p className="leading-7 break-words">
            In no event shall Diswantin, its affiliates, or its licensors be
            liable for any indirect, incidental, special, consequential, or
            punitive damages, including without limitation, loss of profits,
            data, use, goodwill, or other intangible losses, resulting from (i)
            your access to or use of, or inability to access or use, the
            service; (ii) any conduct or content of any third party on the
            service; (iii) any content obtained from the service; and (iv)
            unauthorized access, use, or alteration of your transmissions or
            content.
          </p>
        </section>
        <section
          aria-labelledby="governing-law"
          className="[&_>*+*]:mt-fl-sm [&_>h3+*]:mt-fl-2xs"
        >
          <h3
            id="governing-law"
            className="text-2xl font-semibold tracking-tight text-balance"
          >
            Governing Law
          </h3>
          <p className="leading-7 break-words">
            These Terms of Service shall be governed by and construed in
            accordance with the laws of Pennsylvania, United States, without
            regard to its conflict of law provisions.
          </p>
        </section>
        <section
          aria-labelledby="contact-us"
          className="[&_>*+*]:mt-fl-sm [&_>h3+*]:mt-fl-2xs"
        >
          <h3
            id="contact-us"
            className="text-2xl font-semibold tracking-tight text-balance"
          >
            Contact Us
          </h3>
          <p className="leading-7 break-words">
            If you have any questions about these Terms of Service, please
            contact us at{" "}
            <Link to="&#109;&#097;&#105;&#108;&#116;&#111;&#058;&#100;&#105;&#115;&#119;anti&#110;a&#112;p&#64;&#103;&#109;&#97;i&#108;.co&#109;">
              &#100;is&#119;&#97;&#110;ti&#110;&#97;pp&#64;g&#109;&#97;&#105;l&#46;&#99;o&#109;
            </Link>
            .
          </p>
          <p className="leading-7 break-words">
            By using Diswantin, you acknowledge that you have read, understood,
            and agree to be bound by these Terms of Service.
          </p>
        </section>
      </Page>
    </MainLayout>
  );
}
