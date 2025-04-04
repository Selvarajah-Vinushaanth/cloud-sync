import { doc, getFirestore, setDoc } from "firebase/firestore";
import React, { useContext, useState } from "react";
import { app } from "../../Config/FirebaseConfig";
import { useSession } from "next-auth/react";
import { ParentFolderIdContext } from "../../context/ParentFolderIdContext";
import { ShowToastContext } from "../../context/ShowToastContext";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";

function UploadFileModal({ closeModal }) {
  const { data: session } = useSession();
  const { parentFolderId } = useContext(ParentFolderIdContext);
  const { setShowToastMsg } = useContext(ShowToastContext);
  
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const docId = Date.now();
  const db = getFirestore(app);
  const storage = getStorage(app);

  const onFileUpload = async (file) => {
    if (!file) return;
    if (file.size > 1000000) {
      setShowToastMsg("File is too large");
      return;
    }
    
    const fileRef = ref(storage, `file/${file.name}`);
    setIsUploading(true);
    
    const uploadTask = uploadBytesResumable(fileRef, file);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Error uploading file:", error);
        setShowToastMsg("Error uploading file");
        setIsUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(fileRef);
        await setDoc(doc(db, "files", docId.toString()), {
          name: file.name,
          type: file.name.split(".")[1],
          size: file.size,
          modifiedAt: file.lastModified,
          createdBy: session.user.email,
          parentFolderId: parentFolderId,
          imageUrl: downloadURL,
          id: docId,
          isTrash: false,
          createdAt: new Date().getTime(),
        });
        setShowToastMsg("File Uploaded Successfully!");
        setIsUploading(false);
        setUploadProgress(0);
        closeModal(true);
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <form method="dialog" className="modal-box p-8 bg-white rounded-xl shadow-2xl w-[460px] relative">
        <button onClick={() => closeModal(false)} className="btn btn-sm btn-circle absolute right-4 top-4 bg-gray-100 hover:bg-gray-200 border-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="w-full flex flex-col items-center justify-center gap-6">
          <h3 className="text-2xl font-bold text-gray-800">Upload File</h3>
          
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-72 border-2 border-blue-200 border-dashed rounded-xl cursor-pointer bg-blue-50 hover:bg-blue-100 transition-all duration-200">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-12 h-12 mb-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mb-2 text-lg text-gray-700">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-sm text-gray-500">SVG, PNG, JPG, GIF, PDF (Max: 1MB)</p>
              </div>
              <input id="dropzone-file" type="file" className="hidden" onChange={(e) => onFileUpload(e.target.files[0])} />
            </label>
          </div>

          {isUploading && (
            <div className="w-full mt-2">
              <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-blue-500 h-full rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm font-medium text-gray-600">Uploading file...</p>
                <p className="text-sm font-bold text-blue-600">{Math.round(uploadProgress)}%</p>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

export default UploadFileModal;
