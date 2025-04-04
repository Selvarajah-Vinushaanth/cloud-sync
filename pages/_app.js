import CreateFolderModal from "../components/Folder/CreateFolderModal";
import SideNavBar from "../components/SideNavBar";
import Toast from "../components/Toast";
import "../styles/globals.css";
import { SessionProvider } from "next-auth/react";

import { useState } from "react";
import { ShowToastContext, ShowToastProvider } from "../context/ShowToastContext";
import { ParentFolderIdContext } from "../context/ParentFolderIdContext";
import Storage from "../components/Storage/Storage";
function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  const [parentFolderId,setParentFolderId]=useState();

  return (
    <SessionProvider session={session}>
      <ParentFolderIdContext.Provider value={{parentFolderId,setParentFolderId}}>
      <ShowToastProvider>
      <div className="flex">
        <SideNavBar />
        <div className="grid grid-cols-1
        md:grid-cols-3 w-full">
          <div className="col-span-2">
            <Component {...pageProps} />
          </div>
          <div className="bg-white p-5
         order-first md:order-last"
          >
            <Storage/>
          </div>
        </div>
      
      </div>
      <Toast />
      </ShowToastProvider>
      </ParentFolderIdContext.Provider>
      
    </SessionProvider>
  );
}

export default MyApp;
