import React, { useState } from "react";
import FolderItem from "./FolderItem";
import { useRouter } from "next/router";
import FolderItemSmall from "./FolderItemSmall";

function FolderList({ folderList ,isBig=true}) {
  const [activeFolder, setActiveFolder] = useState();
  const router = useRouter();

  const onFolderClick = (index, item) => {
    setActiveFolder(index);
    router.push({
      pathname: "/folder/" + item.id,
      query: {
        name: item.name,
        id: item.id,
      },
    });
  };
  return (
    <div
      className="p-5 mt-5 
    bg-white rounded-lg"
    >
    {isBig?  <h2
        className="text-17px] 
        font-bold 
        items-center"
      >
        Recent Folders
        <span
          className="float-right
        text-blue-400 font-normal
        text-[13px]"
        >
          {/* View All */}
        </span>
      </h2>:null}

      {folderList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8">
          <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900">No folders yet</h3>
          <p className="text-gray-500 text-center mt-1">
            Create a new folder to organize your files
          </p>
          <button
            onClick={() => window.my_modal_3.showModal()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Create Folder
          </button>
        </div>
      ) : (
        isBig?   <div
        className="grid grid-cols-2
        md:grid-cols-3
        lg:grid-cols-4
        xl:grid-cols-5 mt-3
        gap-4"
      >
        {folderList.map((item, index) => (
          <div key={index} onClick={() => onFolderClick(index, item)}>
        <FolderItem folder={item} />
          
          </div>
        ))}
      </div>
      :
      <div
      className=" 
      "
    >
      {folderList.map((item, index) => (
        <div key={index} onClick={() => onFolderClick(index, item)}>
      <FolderItemSmall folder={item} />
        
        </div>
      ))}
    </div>
      )}
    </div>
  );
}

export default FolderList;
