import { useRouter } from 'next/router'
import React, { useContext, useEffect, useState } from 'react'
import SearchBar from '../../components/SearchBar';
import { ParentFolderIdContext } from '../../context/ParentFolderIdContext';
import { collection, deleteDoc, doc, getDocs, getFirestore, query, where } from 'firebase/firestore';
import { app } from '../../Config/FirebaseConfig';
import { useSession } from 'next-auth/react';
import FolderList from '../../components/Folder/FolderList';
import { ShowToastContext } from '../../context/ShowToastContext';
import FileList from '../../components/File/FileList';
import FolderDeleteConfirmationModal from '../../components/Folder/FolderDeleteConfirmationModal';
import { deleteObject, ref, getStorage } from 'firebase/storage'; // Ensure storage is imported

function FolderDetails() {
    const router=useRouter();
    const {name,id}=router.query;
    const {data:session}=useSession();
     const {parentFolderId,setParentFolderId}
     =useContext(ParentFolderIdContext)

    const {showToastMsg,setShowToastMsg}=useContext(ShowToastContext);

    const [folderList,setFolderList]=useState([]);
    const [fileList,setFileList]=useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
     const db=getFirestore(app)
     useEffect(()=>{
        setParentFolderId(id);
        if(session||showToastMsg!=null)
        {
          setFolderList([]);
          setFileList([]);
            getFolderList();
            getFileList();
        }
     },[id,session,showToastMsg])

    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    };

    const deleteFolderAndContents = async (folderId) => {
        try {
            const storage = getStorage(app); // Ensure storage instance is initialized

            // Delete all child folders
            const folderQuery = query(
                collection(db, "Folders"),
                where("parentFolderId", "==", folderId)
            );
            const folderSnapshot = await getDocs(folderQuery);
            for (const folderDoc of folderSnapshot.docs) {
                await deleteFolderAndContents(folderDoc.id); // Recursive call
            }

            // Delete all files in the folder
            const fileQuery = query(
                collection(db, "files"),
                where("parentFolderId", "==", folderId)
            );
            const fileSnapshot = await getDocs(fileQuery);
            for (const fileDoc of fileSnapshot.docs) {
                const fileData = fileDoc.data();
                const fileRef = ref(storage, `file/${fileData.name}`);
                await deleteObject(fileRef); // Delete file from storage
                await deleteDoc(doc(db, "files", fileDoc.id)); // Delete file metadata
            }

            // Delete the folder itself
            await deleteDoc(doc(db, "Folders", folderId));
        } catch (error) {
            console.error("Error deleting folder and contents:", error);
            throw error;
        }
    };

    const deleteFolder = async () => {
        try {
            await deleteFolderAndContents(id); // Delete the folder and its contents
            setShowToastMsg("Folder and its contents deleted!");
            setShowDeleteModal(false);
            router.back();
        } catch (error) {
            console.error("Error deleting folder:", error);
            setShowToastMsg("Error deleting folder!");
        }
    };

     const getFolderList=async()=>{
        setFolderList([]);
        const q=query(collection(db,"Folders"),
        where("createBy",'==',session.user.email),
        where("parentFolderId","==",id));
        console.log("InFolderList")
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
        // console.log(doc.id, " => ", doc.data());
        setFolderList(folderList=>([...folderList,doc.data()]))
    }); 
      }

      const getFileList=async()=>{
        setFileList([]);
        const q=query(collection(db,"files"),
        where("parentFolderId",'==',id),
        where("createdBy",'==',session.user.email));
        console.log("fole")
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
        console.log(doc.id, " => ", doc.data());
        setFileList(fileList=>([...fileList,doc.data()]))
    }); 
      }
  return (  
    <div className='p-5'>
        {/* <SearchBar/> */}
        <h2 className='text-[20px] font-bold mt-5'>{name}
        <svg xmlns="http://www.w3.org/2000/svg" 
        onClick={handleDeleteClick}
          fill="none" viewBox="0 0 24 24" 
          strokeWidth={1.5} stroke="currentColor"
           className="w-5 h-5 float-right text-red-500
           hover:scale-110 transition-all cursor-pointer">
       <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
        </h2>
   
       {folderList.length>0? <FolderList 
        folderList={folderList}
        isBig={false}/>:
        <h2 className='text-gray-400
        text-[16px] mt-5'>No Folder Found</h2>}

        <FileList fileList={fileList} />

        <FolderDeleteConfirmationModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={deleteFolder}
            folderName={name}
        />
    </div>
  )
}

export default FolderDetails