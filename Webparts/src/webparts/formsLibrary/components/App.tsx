
import * as React from "react";
import FormsLibrary from "./FormsLibrary";
import SearchDocuments from "./SearchDocument";
import styles from "./App.module.scss"; 

export interface IAppProps {
  context: any;
  libraryTitle: string;
}

const App: React.FC<IAppProps> = ({ context, libraryTitle }) => {
  const [searchText, setSearchText] = React.useState("");
  return (
    <div className={styles.appRoot}>
      <div className={styles.topRightBar}>
        <SearchDocuments value={searchText} onChange={setSearchText} />
      </div>
      <FormsLibrary
        context={context}
        libraryTitle={libraryTitle}
        searchText={searchText}
      />
    </div>
  );
};

export default App;