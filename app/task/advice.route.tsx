import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { getAuthenticatedUser } from "~/auth/services.server";
import { getTitle } from "~/layout/meta";
import { Page, PageHeading } from "~/layout/page";

export async function loader({ request }: LoaderFunctionArgs) {
  await getAuthenticatedUser(request);
  return null;
}

export const meta: MetaFunction = ({ error }) => {
  return [{ title: getTitle({ page: "Advice", error }) }];
};

export default function AdviceRoute() {
  return (
    <Page aria-labelledby="advice-heading">
      <PageHeading id="advice-heading">Advice</PageHeading>
      <ul className="my-sm ml-sm list-disc space-y-2xs">
        <li>
          <strong>STOP</strong>. Take a deep breath. Observe your distress
          level, body sensations, thoughts, and feelings. Proceed honoring your
          emotions and thoughts
        </li>
        <li>
          <strong>Meditate</strong> for 1 minute. Focus on your surroundings,
          breathing, urges, body sensations, feelings, worries, or thoughts
        </li>
        <li>
          Be <strong>flexible</strong> about how much of the task needs to be
          completed. Do just the first <strong>2 minutes</strong>
        </li>
        <li>
          <strong>Check the Facts</strong>
          <ol className="my-2xs ml-sm list-decimal space-y-2xs">
            <li>Name the emotion and rate the intensity</li>
            <li>Describe the prompting event</li>
            <li>List the possible interpretations</li>
            <li>
              Assess the probability of a threat. List other possible outcomes
            </li>
            <li>Imagine yourself coping with the worst case scenario</li>
            <li>
              If your emotions and their intensity fit the facts, then
              problem-solve. Otherwise, act opposite to the emotion
            </li>
          </ol>
        </li>
        <li>
          Write in a <strong>journal</strong>
        </li>
        <li>
          <strong>Move</strong> your body
          <ul className="my-2xs ml-sm list-disc space-y-2xs">
            <li>wiggle</li>
            <li>stretch</li>
            <li>dance</li>
            <li>walk around your home</li>
            <li>walk around the block</li>
            <li>go out to the backyard</li>
            <li>go to the library</li>
          </ul>
        </li>
        <li>
          Hungry? Grab a <strong>snack</strong>
        </li>
        <li>
          Call/text/video chat/visit a <strong>friend</strong>. Try to brighten
          their day or ask them if you can vent
        </li>
        <li>
          Talk to your doctor about a <strong>medication</strong> adjustment
        </li>
        <li>
          Plan a <strong>day off</strong>
        </li>
      </ul>
    </Page>
  );
}
