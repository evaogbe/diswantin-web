import type { Route } from "./+types/privacy.route";
import { MainLayout } from "~/layout/main-layout";
import { getTitle } from "~/layout/meta";
import { Page, PageHeading } from "~/layout/page";
import { Link } from "~/ui/link";

export function meta({ error }: Route.MetaArgs) {
  return [{ title: getTitle({ page: "Privacy Policy", error }) }];
}

export default function PrivacyRoute() {
  return (
    <MainLayout isAuthenticated={false}>
      <Page
        aria-labelledby="privacy-policy"
        className="[&_>*+*]:mt-fl-sm [&_>h2+*]:mt-fl-2xs"
      >
        <PageHeading id="privacy-policy">Privacy Policy</PageHeading>
        <p className="break-words leading-7">Last updated: February 2, 2025</p>
        <p className="break-words leading-7">
          This Privacy Policy describes Our policies and procedures on the
          collection, use and disclosure of Your information when You use the
          Service and tells You about Your privacy rights and how the law
          protects You.
        </p>
        <p className="break-words leading-7">
          We use Your Personal data to provide and improve the Service. By using
          the Service, You agree to the collection and use of information in
          accordance with this Privacy Policy. This Privacy Policy has been
          created with the help of the{" "}
          <Link
            to="https://www.termsfeed.com/privacy-policy-generator/"
            target="_blank"
            rel="noreferrer"
          >
            Privacy Policy Generator
          </Link>
          .
        </p>
        <section
          aria-labelledby="interpretation-and-definitions"
          className="[&_>*+*]:mt-fl-sm [&_>h3+*]:mt-fl-2xs"
        >
          <h3
            id="interpretation-and-definitions"
            className="text-balance text-2xl font-semibold tracking-tight"
          >
            Interpretation and Definitions
          </h3>
          <section
            aria-labelledby="interpretations"
            className="[&_>*+*]:mt-fl-sm [&_>h4+*]:mt-fl-2xs"
          >
            <h4
              id="interpretations"
              className="text-balance text-xl font-semibold tracking-tight"
            >
              Interpretation
            </h4>
            <p className="break-words leading-7">
              The words of which the initial letter is capitalized have meanings
              defined under the following conditions. The following definitions
              shall have the same meaning regardless of whether they appear in
              singular or in plural.
            </p>
          </section>
          <section
            aria-labelledby="definitions"
            className="[&_>*+*]:mt-fl-sm [&_>h4+*]:mt-fl-2xs"
          >
            <h4
              id="definitions"
              className="text-balance text-xl font-semibold tracking-tight"
            >
              Definitions
            </h4>
            <p className="break-words leading-7">
              For the purposes of this Privacy Policy:
            </p>
            <ul className="my-fl-sm ms-fl-sm list-disc space-y-fl-2xs">
              <li>
                <p className="break-words leading-7">
                  <dfn>Account</dfn> means a unique account created for You to
                  access our Service or parts of our Service.
                </p>
              </li>
              <li>
                <p className="break-words leading-7">
                  <dfn>Affiliate</dfn> means an entity that controls, is
                  controlled by or is under common control with a party, where
                  &quot;control&quot; means ownership of 50% or more of the
                  shares, equity interest or other securities entitled to vote
                  for election of directors or other managing authority.
                </p>
              </li>
              <li>
                <p className="break-words leading-7">
                  <dfn>Application</dfn> refers to Diswantin, the software
                  program provided by the Company.
                </p>
              </li>
              <li>
                <p className="break-words leading-7">
                  <dfn>Company</dfn> (referred to as either &quot;the
                  Company&quot;, &quot;We&quot;, &quot;Us&quot; or
                  &quot;Our&quot; in this Agreement) refers to Diswantin.
                </p>
              </li>
              <li>
                <p className="break-words leading-7">
                  <dfn>Cookies</dfn> are small files that are placed on Your
                  computer, mobile device or any other device by a website,
                  containing the details of Your browsing history on that
                  website among its many uses.
                </p>
              </li>
              <li>
                <p className="break-words leading-7">
                  <dfn>Country</dfn> refers to: Pennsylvania, United States
                </p>
              </li>
              <li>
                <p className="break-words leading-7">
                  <dfn>Device</dfn> means any device that can access the Service
                  such as a computer, a cellphone or a digital tablet.
                </p>
              </li>
              <li>
                <p className="break-words leading-7">
                  <dfn>Personal Data</dfn> is any information that relates to an
                  identified or identifiable individual.
                </p>
              </li>
              <li>
                <p className="break-words leading-7">
                  <dfn>Service</dfn> refers to the Application or the Website or
                  both.
                </p>
              </li>
              <li>
                <p className="break-words leading-7">
                  <dfn>Service Provider</dfn> means any natural or legal person
                  who processes the data on behalf of the Company. It refers to
                  third-party companies or individuals employed by the Company
                  to facilitate the Service, to provide the Service on behalf of
                  the Company, to perform services related to the Service or to
                  assist the Company in analyzing how the Service is used.
                </p>
              </li>
              <li>
                <p className="break-words leading-7">
                  <dfn>Third-party Social Media Service</dfn> refers to any
                  website or any social network website through which a User can
                  log in or create an account to use the Service.
                </p>
              </li>
              <li>
                <p className="break-words leading-7">
                  <dfn>Usage Data</dfn> refers to data collected automatically,
                  either generated by the use of the Service or from the Service
                  infrastructure itself (for example, the duration of a page
                  visit).
                </p>
              </li>
              <li>
                <p className="break-words leading-7">
                  <dfn>Website</dfn> refers to Diswantin, accessible from{" "}
                  <Link to="https://www.diswantin.com">
                    https://www.diswantin.com
                  </Link>
                </p>
              </li>
              <li>
                <p className="break-words leading-7">
                  <dfn>You</dfn> means the individual accessing or using the
                  Service, or the company, or other legal entity on behalf of
                  which such individual is accessing or using the Service, as
                  applicable.
                </p>
              </li>
            </ul>
          </section>
        </section>
        <section
          aria-labelledby="collecting-and-using-your-personal-data"
          className="[&_>*+*]:mt-fl-sm [&_>h3+*]:mt-fl-2xs"
        >
          <h3
            id="collecting-and-using-your-personal-data"
            className="text-balance text-2xl font-semibold tracking-tight"
          >
            Collecting and Using Your Personal Data
          </h3>
          <section
            aria-labelledby="types-of-data-collected"
            className="[&_>*+*]:mt-fl-sm [&_>h4+*]:mt-fl-2xs"
          >
            <h4
              id="types-of-data-collected"
              className="text-balance text-xl font-semibold tracking-tight"
            >
              Types of Data Collected
            </h4>
            <section
              aria-labelledby="personal-data"
              className="[&_>*+*]:mt-fl-sm [&_>h5+*]:mt-fl-2xs"
            >
              <h5
                id="personal-data"
                className="text-balance text-lg font-semibold tracking-tight"
              >
                Personal Data
              </h5>
              <p className="break-words leading-7">
                While using Our Service, We may ask You to provide Us with
                certain personally identifiable information that can be used to
                contact or identify You. Personally identifiable information may
                include, but is not limited to:
              </p>
              <ul className="my-fl-sm ms-fl-sm list-disc space-y-fl-2xs">
                <li>Email address</li>
                <li>Usage Data</li>
              </ul>
            </section>
            <section
              aria-labelledby="usage-data"
              className="[&_>*+*]:mt-fl-sm [&_>h5+*]:mt-fl-2xs"
            >
              <h5
                id="usage-data"
                className="text-balance text-lg font-semibold tracking-tight"
              >
                Usage Data
              </h5>
              <p className="break-words leading-7">
                Usage Data is collected automatically when using the Service.
              </p>
              <p className="break-words leading-7">
                Usage Data may include information such as Your Device&apos;s
                Internet Protocol address (e.g. IP address), browser type,
                browser version, the pages of our Service that You visit, the
                time and date of Your visit, the time spent on those pages,
                unique device identifiers and other diagnostic data.
              </p>
              <p className="break-words leading-7">
                When You access the Service by or through a mobile device, We
                may collect certain information automatically, including, but
                not limited to, the type of mobile device You use, Your mobile
                device unique ID, the IP address of Your mobile device, Your
                mobile operating system, the type of mobile Internet browser You
                use, unique device identifiers and other diagnostic data.
              </p>
              <p className="break-words leading-7">
                We may also collect information that Your browser sends whenever
                You visit our Service or when You access the Service by or
                through a mobile device.
              </p>
            </section>
            <section
              aria-labelledby="information-from-third-party-social-media-services"
              className="[&_>*+*]:mt-fl-sm [&_>h5+*]:mt-fl-2xs"
            >
              <h5
                id="information-from-third-party-social-media-services"
                className="text-balance text-lg font-semibold tracking-tight"
              >
                Information from Third-Party Social Media Services
              </h5>
              <p className="break-words leading-7">
                The Company allows You to create an account and log in to use
                the Service through the following Third-party Social Media
                Services:
              </p>
              <ul className="my-fl-sm ms-fl-sm list-disc space-y-fl-2xs">
                <li>Google</li>
              </ul>
              <p className="break-words leading-7">
                If You decide to register through or otherwise grant us access
                to a Third-Party Social Media Service, We may collect Personal
                data that is already associated with Your Third-Party Social
                Media Service&apos;s account, such as Your name or Your email
                address.
              </p>
              <p className="break-words leading-7">
                You may also have the option of sharing additional information
                with the Company through Your Third-Party Social Media
                Service&apos;s account. If You choose to provide such
                information and Personal Data, during registration or otherwise,
                You are giving the Company permission to use, share, and store
                it in a manner consistent with this Privacy Policy.
              </p>
            </section>
            <section
              aria-labelledby="tracking-technologies-and-cookies"
              className="[&_>*+*]:mt-fl-sm [&_>h5+*]:mt-fl-2xs"
            >
              <h5
                id="tracking-technologies-and-cookies"
                className="text-balance text-lg font-semibold tracking-tight"
              >
                Tracking Technologies and Cookies
              </h5>
              <p className="break-words leading-7">
                We use Cookies to track the activity on Our Service and store
                certain information. A cookie is a small file placed on Your
                Device. You can instruct Your browser to refuse all Cookies or
                to indicate when a Cookie is being sent. However, if You do not
                accept Cookies, You may not be able to use some parts of our
                Service. Unless you have adjusted Your browser setting so that
                it will refuse Cookies, our Service may use Cookies.
              </p>
              <p className="break-words leading-7">
                Cookies can be &quot;Persistent&quot; or &quot;Session&quot;
                Cookies. Persistent Cookies remain on Your personal computer or
                mobile device when You go offline, while Session Cookies are
                deleted as soon as You close Your web browser. You can learn
                more about cookies on{" "}
                <Link
                  to="https://www.internetcookies.com"
                  target="_blank"
                  rel="nofollow noreferrer external"
                >
                  internetcookies.com
                </Link>
                .
              </p>
              <p className="break-words leading-7">
                We use both Session and Persistent Cookies for the purposes set
                out below:
              </p>
              <ul className="my-fl-sm ms-fl-sm list-disc space-y-fl-2xs">
                <li>
                  <p className="break-words leading-7">
                    <strong>Necessary / Essential Cookies</strong>
                  </p>
                  <p className="break-words leading-7">Type: Session Cookies</p>
                  <p className="break-words leading-7">Administered by: Us</p>
                  <p className="break-words leading-7">
                    Purpose: These Cookies are essential to provide You with
                    services available through the Website and to enable You to
                    use some of its features. They help to authenticate users
                    and prevent fraudulent use of user accounts. Without these
                    Cookies, the services that You have asked for cannot be
                    provided, and We only use these Cookies to provide You with
                    those services.
                  </p>
                </li>
                <li>
                  <p className="break-words leading-7">
                    <strong>Cookies Policy / Notice Acceptance Cookies</strong>
                  </p>
                  <p className="break-words leading-7">
                    Type: Persistent Cookies
                  </p>
                  <p className="break-words leading-7">Administered by: Us</p>
                  <p className="break-words leading-7">
                    Purpose: These Cookies identify if users have accepted the
                    use of cookies on the Website.
                  </p>
                </li>
                <li>
                  <p className="break-words leading-7">
                    <strong>Functionality Cookies</strong>
                  </p>
                  <p className="break-words leading-7">
                    Type: Persistent Cookies
                  </p>
                  <p className="break-words leading-7">Administered by: Us</p>
                  <p className="break-words leading-7">
                    Purpose: These Cookies allow us to remember choices You make
                    when You use the Website, such as remembering your login
                    details or language preference. The purpose of these Cookies
                    is to provide You with a more personal experience and to
                    avoid You having to re-enter your preferences every time You
                    use the Website.
                  </p>
                </li>
              </ul>
              <p className="break-words leading-7">
                For more information about the cookies we use and your choices
                regarding cookies, please visit our{" "}
                <Link to="/cookies">Cookie Policy</Link>.
              </p>
            </section>
          </section>
          <section
            aria-labelledby="use-of-your-personal-data"
            className="[&_>*+*]:mt-fl-sm [&_>h4+*]:mt-fl-2xs"
          >
            <h4
              id="use-of-your-personal-data"
              className="text-balance text-xl font-semibold tracking-tight"
            >
              Use of Your Personal Data
            </h4>
            <p className="break-words leading-7">
              The Company may use Personal Data for the following purposes:
            </p>
            <ul className="my-fl-sm ms-fl-sm list-disc space-y-fl-2xs">
              <li>
                <p className="break-words leading-7">
                  <strong>To provide and maintain our Service</strong>,
                  including to monitor the usage of our Service.
                </p>
              </li>
              <li>
                <p className="break-words leading-7">
                  <strong>To manage Your Account:</strong> to manage Your
                  registration as a user of the Service. The Personal Data You
                  provide can give You access to different functionalities of
                  the Service that are available to You as a registered user.
                </p>
              </li>
              <li>
                <p className="break-words leading-7">
                  <strong>For the performance of a contract:</strong> the
                  development, compliance and undertaking of the purchase
                  contract for the products, items or services You have
                  purchased or of any other contract with Us through the
                  Service.
                </p>
              </li>
              <li>
                <p className="break-words leading-7">
                  <strong>To contact You:</strong> To contact You by email or
                  other equivalent forms of electronic communication, such as a
                  mobile application&apos;s push notifications regarding updates
                  or informative communications related to the functionalities,
                  products or contracted services, including the security
                  updates, when necessary or reasonable for their
                  implementation.
                </p>
              </li>
              <li>
                <p className="break-words leading-7">
                  <strong>To provide You</strong> with news, special offers and
                  general information about other goods, services and events
                  which we offer that are similar to those that you have already
                  purchased or enquired about unless You have opted not to
                  receive such information.
                </p>
              </li>
              <li>
                <p className="break-words leading-7">
                  <strong>To manage Your requests:</strong> To attend and manage
                  Your requests to Us.
                </p>
              </li>
              <li>
                <p className="break-words leading-7">
                  <strong>For business transfers:</strong> We may use Your
                  information to evaluate or conduct a merger, divestiture,
                  restructuring, reorganization, dissolution, or other sale or
                  transfer of some or all of Our assets, whether as a going
                  concern or as part of bankruptcy, liquidation, or similar
                  proceeding, in which Personal Data held by Us about our
                  Service users is among the assets transferred.
                </p>
              </li>
              <li>
                <p className="break-words leading-7">
                  <strong>For other purposes</strong>: We may use Your
                  information for other purposes, such as data analysis,
                  identifying usage trends, determining the effectiveness of our
                  promotional campaigns and to evaluate and improve our Service,
                  products, services, marketing and your experience.
                </p>
              </li>
            </ul>
            <p className="break-words leading-7">
              We may share Your personal information in the following
              situations:
            </p>
            <ul className="my-fl-sm ms-fl-sm list-disc space-y-fl-2xs">
              <li>
                <p className="break-words leading-7">
                  <strong>With Service Providers:</strong> We may share Your
                  personal information with Service Providers to monitor and
                  analyze the use of our Service, to contact You.
                </p>
              </li>
              <li>
                <p className="break-words leading-7">
                  <strong>For business transfers:</strong> We may share or
                  transfer Your personal information in connection with, or
                  during negotiations of, any merger, sale of Company assets,
                  financing, or acquisition of all or a portion of Our business
                  to another company.
                </p>
              </li>
              <li>
                <p className="break-words leading-7">
                  <strong>With business partners:</strong> We may share Your
                  information with Our business partners to offer You certain
                  products, services or promotions.
                </p>
              </li>
              <li>
                <p className="break-words leading-7">
                  <strong>With Your consent</strong>: We may disclose Your
                  personal information for any other purpose with Your consent.
                </p>
              </li>
            </ul>
          </section>
          <section
            aria-labelledby="retention-of-your-personal-data"
            className="[&_>*+*]:mt-fl-sm [&_>h4+*]:mt-fl-2xs"
          >
            <h4
              id="retention-of-your-personal-data"
              className="text-balance text-xl font-semibold tracking-tight"
            >
              Retention of Your Personal Data
            </h4>
            <p className="break-words leading-7">
              The Company will retain Your Personal Data only for as long as is
              necessary for the purposes set out in this Privacy Policy. We will
              retain and use Your Personal Data to the extent necessary to
              comply with our legal obligations (for example, if we are required
              to retain your data to comply with applicable laws), resolve
              disputes, and enforce our legal agreements and policies.
            </p>
            <p className="break-words leading-7">
              The Company will also retain Usage Data for internal analysis
              purposes. Usage Data is generally retained for a shorter period of
              time, except when this data is used to strengthen the security or
              to improve the functionality of Our Service, or We are legally
              obligated to retain this data for longer time periods.
            </p>
          </section>
          <section
            aria-labelledby="transfer-of-your-personal-data"
            className="[&_>*+*]:mt-fl-sm [&_>h4+*]:mt-fl-2xs"
          >
            <h4
              id="transfer-of-your-personal-data"
              className="text-balance text-xl font-semibold tracking-tight"
            >
              Transfer of Your Personal Data
            </h4>
            <p className="break-words leading-7">
              Your information, including Personal Data, is processed at the
              Company&apos;s operating offices and in any other places where the
              parties involved in the processing are located. It means that this
              information may be transferred to — and maintained on — computers
              located outside of Your state, province, country or other
              governmental jurisdiction where the data protection laws may
              differ than those from Your jurisdiction.
            </p>
            <p className="break-words leading-7">
              Your consent to this Privacy Policy followed by Your submission of
              such information represents Your agreement to that transfer.
            </p>
            <p className="break-words leading-7">
              The Company will take all steps reasonably necessary to ensure
              that Your data is treated securely and in accordance with this
              Privacy Policy and no transfer of Your Personal Data will take
              place to an organization or a country unless there are adequate
              controls in place including the security of Your data and other
              personal information.
            </p>
          </section>
          <section
            aria-labelledby="delete-your-personal-data"
            className="[&_>*+*]:mt-fl-sm [&_>h4+*]:mt-fl-2xs"
          >
            <h4
              id="delete-your-personal-data"
              className="text-balance text-xl font-semibold tracking-tight"
            >
              Delete Your Personal Data
            </h4>
            <p className="break-words leading-7">
              You have the right to delete or request that We assist in deleting
              the Personal Data that We have collected about You.
            </p>
            <p className="break-words leading-7">
              Our Service may give You the ability to delete certain information
              about You from within the Service.
            </p>
            <p className="break-words leading-7">
              You may update, amend, or delete Your information at any time by
              signing in to Your Account, if you have one, and visiting the
              account settings section that allows you to manage Your personal
              information. You may also contact Us to request access to,
              correct, or delete any personal information that You have provided
              to Us.
            </p>
            <p className="break-words leading-7">
              Please note, however, that We may need to retain certain
              information when we have a legal obligation or lawful basis to do
              so.
            </p>
          </section>
          <section
            aria-labelledby="disclosure-of-your-personal-data"
            className="[&_>*+*]:mt-fl-sm [&_>h4+*]:mt-fl-2xs"
          >
            <h4
              id="disclosure-of-your-personal-data"
              className="text-balance text-xl font-semibold tracking-tight"
            >
              Disclosure of Your Personal Data
            </h4>
            <section
              aria-labelledby="business-transactions"
              className="[&_>*+*]:mt-fl-sm [&_>h5+*]:mt-fl-2xs"
            >
              <h5
                id="business-transactions"
                className="text-balance text-lg font-semibold tracking-tight"
              >
                Business Transactions
              </h5>
              <p className="break-words leading-7">
                If the Company is involved in a merger, acquisition or asset
                sale, Your Personal Data may be transferred. We will provide
                notice before Your Personal Data is transferred and becomes
                subject to a different Privacy Policy.
              </p>
            </section>
            <section
              aria-labelledby="law-enforcement"
              className="[&_>*+*]:mt-fl-sm [&_>h5+*]:mt-fl-2xs"
            >
              <h5
                id="law-enforcement"
                className="text-balance text-lg font-semibold tracking-tight"
              >
                Law enforcement
              </h5>
              <p className="break-words leading-7">
                Under certain circumstances, the Company may be required to
                disclose Your Personal Data if required to do so by law or in
                response to valid requests by public authorities (e.g. a court
                or a government agency).
              </p>
            </section>
            <section
              aria-labelledby="other-legal-requirements"
              className="[&_>*+*]:mt-fl-sm [&_>h5+*]:mt-fl-2xs"
            >
              <h5
                id="other-legal-requirements"
                className="text-balance text-lg font-semibold tracking-tight"
              >
                Other legal requirements
              </h5>
              <p className="break-words leading-7">
                The Company may disclose Your Personal Data in the good faith
                belief that such action is necessary to:
              </p>
              <ul className="my-fl-sm ms-fl-sm list-disc space-y-fl-2xs">
                <li>Comply with a legal obligation</li>
                <li>
                  Protect and defend the rights or property of the Company
                </li>
                <li>
                  Prevent or investigate possible wrongdoing in connection with
                  the Service
                </li>
                <li>
                  Protect the personal safety of Users of the Service or the
                  public
                </li>
                <li>Protect against legal liability</li>
              </ul>
            </section>
          </section>
          <section
            aria-labelledby="security-of-your-personal-data"
            className="[&_>*+*]:mt-fl-sm [&_>h4+*]:mt-fl-2xs"
          >
            <h4
              id="security-of-your-personal-data"
              className="text-balance text-xl font-semibold tracking-tight"
            >
              Security of Your Personal Data
            </h4>
            <p className="break-words leading-7">
              The security of Your Personal Data is important to Us, but
              remember that no method of transmission over the Internet, or
              method of electronic storage is 100% secure. While We strive to
              use commercially acceptable means to protect Your Personal Data,
              We cannot guarantee its absolute security.
            </p>
          </section>
        </section>
        <section
          aria-labelledby="children-s-privacy"
          className="[&_>*+*]:mt-fl-sm [&_>h3+*]:mt-fl-2xs"
        >
          <h3
            id="children-s-privacy"
            className="text-balance text-2xl font-semibold tracking-tight"
          >
            Children&apos;s Privacy
          </h3>
          <p className="break-words leading-7">
            Our Service does not address anyone under the age of 13. We do not
            knowingly collect personally identifiable information from anyone
            under the age of 13. If You are a parent or guardian and You are
            aware that Your child has provided Us with Personal Data, please
            contact Us. If We become aware that We have collected Personal Data
            from anyone under the age of 13 without verification of parental
            consent, We take steps to remove that information from Our servers.
          </p>
          <p className="break-words leading-7">
            If We need to rely on consent as a legal basis for processing Your
            information and Your country requires consent from a parent, We may
            require Your parent&apos;s consent before We collect and use that
            information.
          </p>
        </section>
        <section
          aria-labelledby="links-to-other-websites"
          className="[&_>*+*]:mt-fl-sm [&_>h3+*]:mt-fl-2xs"
        >
          <h3
            id="links-to-other-websites"
            className="text-balance text-2xl font-semibold tracking-tight"
          >
            Links to Other Websites
          </h3>
          <p className="break-words leading-7">
            Our Service may contain links to other websites that are not
            operated by Us. If You click on a third party link, You will be
            directed to that third party&apos;s site. We strongly advise You to
            review the Privacy Policy of every site You visit.
          </p>
          <p className="break-words leading-7">
            We have no control over and assume no responsibility for the
            content, privacy policies or practices of any third party sites or
            services.
          </p>
        </section>
        <section
          aria-labelledby="changes-to-this-privacy-policy"
          className="[&_>*+*]:mt-fl-sm [&_>h3+*]:mt-fl-2xs"
        >
          <h3
            id="changes-to-this-privacy-policy"
            className="text-balance text-2xl font-semibold tracking-tight"
          >
            Changes to this Privacy Policy
          </h3>
          <p className="break-words leading-7">
            We may update Our Privacy Policy from time to time. We will notify
            You of any changes by posting the new Privacy Policy on this page.
          </p>
          <p className="break-words leading-7">
            We will let You know via email and/or a prominent notice on Our
            Service, prior to the change becoming effective and update the
            &quot;Last updated&quot; date at the top of this Privacy Policy.
          </p>
          <p className="break-words leading-7">
            You are advised to review this Privacy Policy periodically for any
            changes. Changes to this Privacy Policy are effective when they are
            posted on this page.
          </p>
        </section>
        <section
          aria-labelledby="contact-us"
          className="[&_>*+*]:mt-fl-sm [&_>h3+*]:mt-fl-2xs"
        >
          <h3
            id="contact-us"
            className="text-balance text-2xl font-semibold tracking-tight"
          >
            Contact Us
          </h3>
          <p className="break-words leading-7">
            If you have any questions about this Privacy Policy, You can contact
            us by email{" "}
            <Link to="&#109;&#097;&#105;&#108;&#116;&#111;&#058;&#100;&#105;&#115;&#119;anti&#110;a&#112;p&#64;&#103;&#109;&#97;i&#108;.co&#109;">
              &#100;is&#119;&#97;&#110;ti&#110;&#97;pp&#64;g&#109;&#97;&#105;l&#46;&#99;o&#109;
            </Link>
            .
          </p>
        </section>
      </Page>
    </MainLayout>
  );
}
