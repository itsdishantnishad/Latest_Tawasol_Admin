import * as React from "react";
import NavSegment from "../Navigation/NavSegment";
import LetsMeetGallery from "../LetsMeetGallery/LetsMeetGallery";
import EventGalleryHome from "../EventGalleryHome/EventGalleryhome";
import type { WebPartContext } from "@microsoft/sp-webpart-base";

type TopTab = "Image Gallery" | "Inside Scoop" | "Let's Meet";
// const TABS: readonly TopTab[] = ["Image Gallery", "Inside Scoop", "Let's Meet"] as const;
const TABS: readonly TopTab[] = ["Image Gallery", "Let's Meet"] as const;

export interface IAppProps {
  context: WebPartContext;
  eventItems: any[];
  sitePagesListTitle: string;
  contentTypeName: string;
  maxItems: number;
  letsMeetDescription: string;
}

const App: React.FC<IAppProps> = (props) => {
  const [tab, setTab] = React.useState<TopTab>("Image Gallery");

  const title =
    tab === "Let's Meet" ? "Let's Meet" :
      tab === "Inside Scoop" ? "Inside Scoop" :
        "Image Gallery";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <NavSegment
          labels={TABS}
          value={tab}
          onChange={(v) => setTab(v)}
          ariaLabel="Gallery tabs"
        />
      </div>

      <div style={{ marginTop: 18 }}>
        {tab === "Image Gallery" && (
          <EventGalleryHome context={props.context} Allevent={props.eventItems || []} />
        )}

        {tab === "Let's Meet" && (
          <LetsMeetGallery
            context={props.context}
            sitePagesListTitle={props.sitePagesListTitle}
            contentTypeName={props.contentTypeName}
            maxItems={props.maxItems}
            letsMeetDescription={props.letsMeetDescription}
          />
        )}

        {tab === "Inside Scoop" && (
          <div style={{ padding: 16 }}>Inside Scoop (coming soon)</div>
        )}
      </div>
    </div>
  );
};

export default App;