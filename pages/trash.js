import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { deleteObject, ref, getStorage } from 'firebase/storage';
import { app } from '../Config/FirebaseConfig';
import { useContext } from 'react';
import { ShowToastContext } from '../context/ShowToastContext';
import DeleteConfirmationModal from '../components/File/DeleteConfirmationModal';
import RestoreConfirmationModal from '../components/File/RestoreConfirmationModal';

function TrashPage() {
  const [trashedFiles, setTrashedFiles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const { showToastMsg, setShowToastMsg } = useContext(ShowToastContext);
  const db = getFirestore(app);
  const storage = getStorage(app);
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false);
  const [isRestoreAllModalOpen, setIsRestoreAllModalOpen] = useState(false);

  useEffect(() => {
    loadTrashedFiles();
  }, []);

  const loadTrashedFiles = async () => {
    const q = query(collection(db, 'files'), where('isInTrash', '==', true));
    const querySnapshot = await getDocs(q);
    const files = [];
    querySnapshot.forEach((doc) => {
      files.push({ ...doc.data(), id: doc.id });
    });
    setTrashedFiles(files);
  };

  const restoreFile = async (file) => {
    try {
      const fileRef = doc(db, 'files', file.id.toString());
      await updateDoc(fileRef, {
        isInTrash: false,
        trashedAt: null
      });
      setShowToastMsg('File restored successfully');
      loadTrashedFiles();
    } catch (error) {
      setShowToastMsg('Error restoring file');
    }
  };

  const deletePermanently = async () => {
    if (!fileToDelete) return;

    try {
      const fileRef = ref(storage, `file/${fileToDelete.name}`);
      await deleteObject(fileRef); // Delete file from Firebase Storage
      await deleteDoc(doc(db, 'files', fileToDelete.id.toString())); // Delete file metadata from Firestore

      // Update the state to remove the deleted file
      setTrashedFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileToDelete.id));

      setShowToastMsg('File deleted permanently');
      closeDeleteModal();
    } catch (error) {
      console.error('Error deleting file:', error);
      setShowToastMsg('Error deleting file');
    }
  };

  const deleteAllPermanently = async () => {
    openDeleteAllModal();
  };

  const confirmDeleteAllPermanently = async () => {
    try {
      await Promise.all(
        trashedFiles.map(async (file) => {
          const fileRef = ref(storage, `file/${file.name}`);
          await deleteObject(fileRef);
          await deleteDoc(doc(db, 'files', file.id.toString()));
        })
      );
      setShowToastMsg('All files deleted permanently');
      loadTrashedFiles();
    } catch (error) {
      setShowToastMsg('Error deleting all files');
    } finally {
      closeDeleteAllModal();
    }
  };

  const restoreAllFiles = async () => {
    openRestoreAllModal();
  };

  const confirmRestoreAllFiles = async () => {
    try {
      await Promise.all(
        trashedFiles.map(async (file) => {
          const fileRef = doc(db, 'files', file.id.toString());
          await updateDoc(fileRef, {
            isInTrash: false,
            trashedAt: null
          });
        })
      );
      setShowToastMsg('All files restored successfully');
      loadTrashedFiles();
    } catch (error) {
      setShowToastMsg('Error restoring all files');
    } finally {
      closeRestoreAllModal();
    }
  };

  const openDeleteModal = (file) => {
    setFileToDelete(file);
    setIsModalOpen(true);
  };

  const closeDeleteModal = () => {
    setFileToDelete(null);
    setIsModalOpen(false);
  };

  const openDeleteAllModal = () => {
    setIsDeleteAllModalOpen(true);
  };

  const closeDeleteAllModal = () => {
    setIsDeleteAllModalOpen(false);
  };

  const openRestoreAllModal = () => {
    setIsRestoreAllModalOpen(true);
  };

  const closeRestoreAllModal = () => {
    setIsRestoreAllModalOpen(false);
  };

  return (
    <div className="p-5 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Trash</h1>

      <div className="flex justify-end gap-4 mb-6">
        <button
          onClick={openRestoreAllModal}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
        >
          Restore All
        </button>
        <button
          onClick={openDeleteAllModal}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
        >
          Delete All
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex items-center gap-4">
              <div className="bg-red-100 p-3 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Delete File</h3>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Are you sure you want to permanently delete <span className="font-bold">"{fileToDelete?.name}"</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={deletePermanently}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteAllModalOpen && (
        <DeleteConfirmationModal
          isOpen={isDeleteAllModalOpen}
          onClose={closeDeleteAllModal}
          onConfirm={confirmDeleteAllPermanently}
          fileName="all files"
        >
          <p className="text-sm text-red-600">
            Are you sure you want to permanently delete all files? This action cannot be undone.
          </p>
        </DeleteConfirmationModal>
      )}

      {isRestoreAllModalOpen && (
        <RestoreConfirmationModal
          isOpen={isRestoreAllModalOpen}
          onClose={closeRestoreAllModal}
          onConfirm={confirmRestoreAllFiles}
          fileName="all files"
        >
          <p className="text-sm text-green-600">
            Are you sure you want to restore all files? This action will move all files back to their original location.
          </p>
        </RestoreConfirmationModal>
      )}

      {trashedFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20">
          <svg
            className="w-16 h-16 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-700">Trash is empty</h3>
          <p className="text-gray-500 mt-1">Deleted files will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trashedFiles.map((file) => (
            <div
              key={file.id}
              className="flex flex-col justify-between bg-white p-4 rounded-lg shadow hover:shadow-md transition"
            >
              <div>
                <h3 className="font-semibold text-gray-800">{file.name}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Moved to trash: {new Date(file.trashedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => restoreFile(file)}
                  className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
                >
                  Restore
                </button>
                <button
                  onClick={() => openDeleteModal(file)}
                  className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TrashPage;
