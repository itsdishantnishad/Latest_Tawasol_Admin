// App.tsx
import * as React from "react";
import NavSegment from "../NavSegment/NavSegment";
import LetsMeetGallery from "../LetsMeetGallery";
import type { WebPartContext } from "@microsoft/sp-webpart-base";
import { CardTitlegallery } from "../../../eventGallery/components/cardTitle/cardTitle";

type TopTab = "Image Gallery" | "Inside Scoop" | "Let's Meet";
const TABS: readonly TopTab[] = ["Image Gallery", "Inside Scoop", "Let's Meet"] as const;

export interface IAppProps {
  context: WebPartContext;
  sitePagesListTitle: string;
  contentTypeName: string;
  maxItems: number;
  letsMeetDescription: string;
}

const App: React.FC<IAppProps> = (props) => {
  const [tab, setTab] = React.useState<TopTab>("Let's Meet");

  return (
    <div>
     
      {React.createElement(CardTitlegallery as any, { title: "Let's Meet" })}

     
      <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
        <NavSegment
          labels={TABS as any}
          value={tab as any}
          onChange={(v: any) => setTab(v as TopTab)}
        />
      </div>

      <div style={{ marginTop: 18 }}>
        {tab === "Let's Meet" ? (
          <LetsMeetGallery
            context={props.context}
            sitePagesListTitle={props.sitePagesListTitle}
            contentTypeName={props.contentTypeName}
            maxItems={props.maxItems}
            letsMeetDescription={props.letsMeetDescription}
          />
        ) : (
          <div />
        )}
      </div>
    </div>
  );
};

export default App;
