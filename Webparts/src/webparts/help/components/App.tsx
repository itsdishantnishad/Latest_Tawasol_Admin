
// import * as React from "react";
// import type { IHelpProps } from "./IHelpProps";

// import ImportantNumber from "./ImportantNumberComponent/ImportantNumber";
// import NavSegment, { Option } from "./NavigationComponent/NavSegment";
// import Faqs from "./FAQsComponent/Faqs";

// interface IAppState {
//   active: Option;
// }

// export default class App extends React.Component<IHelpProps, IAppState> {
//   public constructor(props: IHelpProps) {
//     super(props);
//     this.state = {
//       active: "Important Numbers"
//     };
//   }

//   private handleNavChange = (val: Option): void => {
//     this.setState({ active: val });
//   };

//   public render(): React.ReactElement<IHelpProps> {
//     const { context } = this.props;
//     const { active } = this.state;

//     return (
//       <>
//         <div style={{ width: "100%", display: "flex", justifyContent: "center", margin: "32px 0 24px" }} >
//           <NavSegment value={active} onChange={this.handleNavChange} />
//         </div>
//         {active === "Important Numbers" && (
//           <ImportantNumber
//             context={context}
//             listTitle="Help Center"
//           />
//         )}
//         {active === "FAQs" && (
//           <Faqs
//             context={context}
//             chatBotDeepLink={this.props.chatBotDeepLink}
//             showChatBot={this.props.showChatBot}
//           />
//         )}
//       </>
//     );
//   }
// }






















import * as React from "react";
import type { IHelpProps } from "./IHelpProps";

import ImportantNumber from "./ImportantNumberComponent/ImportantNumber";
import NavSegment, { Option } from "./NavigationComponent/NavSegment";
import Faqs from "./FAQsComponent/Faqs";

interface IAppState {
  active: Option;
}

export default class App extends React.Component<IHelpProps, IAppState> {
  public constructor(props: IHelpProps) {
    super(props);
    this.state = {
      active: "Important Numbers"
    };
  }

  private handleNavChange = (val: Option): void => {
    this.setState({ active: val });
  };

  public render(): React.ReactElement<IHelpProps> {
    const { context } = this.props;
    const { active } = this.state;

    return (
      <>
        <div style={{ width: "100%", display: "flex", justifyContent: "center", margin: "32px 0 24px" }}>
          <NavSegment value={active} onChange={this.handleNavChange} />
        </div>

        {active === "Important Numbers" && (
          <ImportantNumber
            context={context}
            listTitle="Help Center"
          />
        )}

        {active === "FAQs" && (
          <Faqs
            context={context}
            chatBotDeepLink={this.props.chatBotDeepLink}
            showChatBot={this.props.showChatBot}
            metapodsChatbotId={this.props.metapodsChatbotId}
            metapodsClientId={this.props.metapodsClientId}
            showMetapodsWidget={this.props.showMetapodsWidget}
          />
        )}
      </>
    );
  }
}