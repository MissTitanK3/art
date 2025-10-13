import React, { ReactNode } from "react";
import PodCard from "@workspace/ui/components/server/pods/PodCard";

export type PodsListLayoutPod = {
  id?: string | number;
  slug: string;
  name: string;
  channel?: string;
  area?: string;
  channelLink?: string;
  [key: string]: unknown;
};

export type PodsListLayoutProps<TPod extends PodsListLayoutPod> = {
  pods: TPod[];
  title?: ReactNode;
  renderPod?: (args: { pod: TPod; DefaultCard: ReactNode }) => ReactNode;
  emptyState?: ReactNode;
  gridClassName?: string;
};

export function PodsListLayout<TPod extends PodsListLayoutPod>({
  pods,
  title = "Pods Directory",
  renderPod,
  emptyState,
  gridClassName = "grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4",
}: PodsListLayoutProps<TPod>) {
  const heading =
    typeof title === "string" ? (
      <h1 className="text-2xl font-bold">{title}</h1>
    ) : (
      title
    );

  const empty =
    emptyState ?? (
      <p className="text-sm text-muted-foreground">No pods available.</p>
    );

  return (
    <section>
      {heading}
      {pods.length === 0 ? (
        <div className="mt-4">{empty}</div>
      ) : (
        <div className={gridClassName}>
          {pods.map((pod) => {
            const key =
              "id" in pod && pod.id !== undefined && pod.id !== null
                ? String(pod.id)
                : pod.slug;
            const defaultCard = <PodCard pod={pod} />;
            const rendered = renderPod
              ? renderPod({ pod, DefaultCard: defaultCard })
              : defaultCard;

            if (React.isValidElement(rendered)) {
              return React.cloneElement(rendered, { key });
            }

            return (
              <React.Fragment key={key}>{rendered}</React.Fragment>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default PodsListLayout;
