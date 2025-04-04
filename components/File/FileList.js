import React, { useState, useContext, createContext } from 'react';
import { FaStar, FaList, FaTh, FaShare, FaTrash, FaCheckSquare } from 'react-icons/fa';
import FileItem from './FileItem';
import { deleteDoc, doc, getFirestore, updateDoc } from 'firebase/firestore';
import { app } from '../../Config/FirebaseConfig';
import { ShowToastContext } from '../../context/ShowToastContext';
import { BsSortDown, BsSortUpAlt } from 'react-icons/bs';
import { deleteObject, ref, getStorage } from 'firebase/storage';
import SearchBar from '../SearchBar';
import StorageGraph from '../Storage/StorageGraph';
import DeleteConfirmationModal from './DeleteConfirmationModal';

export const StarredFilesContext = createContext([]);

function FileList({ fileList = [] }) {
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const { showToastMsg, setShowToastMsg, showFavorites, setShowFavorites } = useContext(ShowToastContext);
  const [searchQuery, setSearchQuery] = useState('');
  const storage = getStorage(app);
  const db = getFirestore(app);
  const [isIconView, setIsIconView] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [starredFiles, setStarredFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [isBatchDeleteModalOpen, setIsBatchDeleteModalOpen] = useState(false);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp) => {
    return timestamp
      ? new Date(timestamp).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : 'Unknown';
  };

  const sortFiles = (files) => {
    return [...files].sort((a, b) => {
      let compareVal = 0;
      switch (sortBy) {
        case 'name':
          compareVal = a.name.localeCompare(b.name);
          break;
        case 'size':
          compareVal = a.size - b.size;
          break;
        case 'modified':
          compareVal = (a.modifiedAt || 0) - (b.modifiedAt || 0);
          break;
        default:
          compareVal = 0;
      }
      return sortOrder === 'asc' ? compareVal : -compareVal;
    });
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const moveToTrash = async (file) => {
    try {
      const fileRef = doc(db, 'files', file.id.toString());
      await updateDoc(fileRef, {
        isInTrash: true,
        trashedAt: new Date().getTime()
      });
      setShowToastMsg('File moved to trash');
    } catch (error) {
      console.error('Error moving file to trash:', error);
      setShowToastMsg('Error moving file to trash');
    }
  };

  const deleteFile = async (file) => {
    // Replace the old delete function with moveToTrash
    moveToTrash(file);
  };

  const deleteFileWithConfirmation = (file) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${file.name}"?`);
    if (confirmed) {
      deleteFile(file);
    }
  };

  const toggleFavorite = async (file) => {
    try {
      const fileRef = doc(db, 'files', file.id.toString());
      const newFavoriteStatus = !file.isFavorite;
      await updateDoc(fileRef, {
        isFavorite: newFavoriteStatus
      });
      
      // Update file in the list immediately
      file.isFavorite = newFavoriteStatus;
      
      setShowToastMsg(newFavoriteStatus ? 'Added to favorites' : 'Removed from favorites');
    } catch (error) {
      console.error('Error updating favorite:', error);
      setShowToastMsg('Error updating favorite status');
    }
  };

  const filteredFiles = fileList.filter(
    (file) =>
      !file.isInTrash && // Add this condition
      (showFavorites ? file.isFavorite : true) &&
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleView = () => {
    setIsIconView(!isIconView);
  };

  const openDeleteModal = (file) => {
    setFileToDelete(file);
    setIsModalOpen(true);
  };

  const closeDeleteModal = () => {
    setFileToDelete(null);
    setIsModalOpen(false);
  };

  const confirmDeleteFile = async () => {
    if (fileToDelete) {
      await deleteFile(fileToDelete);
      closeDeleteModal();
    }
  };

  const toggleShowFavorites = () => {
    if (typeof setShowFavorites === 'function') {
      setShowFavorites(!showFavorites);
    }
  };

  const toggleFileSelection = (fileId) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === filteredFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(filteredFiles.map(file => file.id));
    }
  };

  const openBatchDeleteModal = () => {
    setIsBatchDeleteModalOpen(true);
  };

  const closeBatchDeleteModal = () => {
    setIsBatchDeleteModalOpen(false);
  };

  const confirmBatchDeleteFiles = async () => {
    try {
      await Promise.all(selectedFiles.map(fileId => {
        const file = filteredFiles.find(f => f.id === fileId);
        return moveToTrash(file);
      }));
      setSelectedFiles([]);
      setShowToastMsg(`${selectedFiles.length} files moved to trash`);
    } catch (error) {
      console.error('Error deleting files:', error);
      setShowToastMsg('Error deleting files');
    } finally {
      closeBatchDeleteModal();
    }
  };

  const shareFiles = () => {
    const selectedFilesList = filteredFiles.filter(file => selectedFiles.includes(file.id));
    const shareLinks = selectedFilesList.map(file => file.imageUrl).join('\n');
    setShareUrl(shareLinks);
    setIsShareModalOpen(true);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setShowToastMsg('Share link copied to clipboard!');
  };

  return (
    <StarredFilesContext.Provider value={starredFiles}>
      <div className='space-y-6'>
        {/* Add Batch Actions Toolbar */}
        {selectedFiles.length > 0 && (
          <div className="fixed bottom-5 right-5 bg-white rounded-lg shadow-lg p-4 z-50 flex gap-4">
            <span className="text-gray-600">{selectedFiles.length} selected</span>
            <button
              onClick={shareFiles}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              <FaShare /> Share
            </button>
            <button
              onClick={openBatchDeleteModal}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              <FaTrash /> Delete
            </button>
          </div>
        )}

        {/* Add Share Modal */}
        {isShareModalOpen && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-96">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Share Files</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 p-2 border rounded-md"
                />
                <button
                  onClick={copyShareLink}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Copy
                </button>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="mt-4 px-4 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 w-full"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-96">
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
                Are you sure you want to delete "{fileToDelete?.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteFile}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {isBatchDeleteModalOpen && (
          <DeleteConfirmationModal
            isOpen={isBatchDeleteModalOpen}
            onClose={closeBatchDeleteModal}
            onConfirm={confirmBatchDeleteFiles}
            fileName={`${selectedFiles.length} selected files`}
          />
        )}

        <div className='bg-white p-5 rounded-lg shadow-md'>
          <SearchBar onSearch={(query) => setSearchQuery(query)} />

          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-xl font-bold text-gray-700'>
              {showFavorites ? 'Starred Files' : 'Recent Files'}
            </h2>
            <div className='flex gap-4 items-center'>
              <button
                onClick={toggleShowFavorites}
                className={`flex items-center gap-2 px-3 py-1 rounded-md transition-colors ${
                  showFavorites
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FaStar className={showFavorites ? 'text-yellow-400' : ''} />
                {showFavorites ? 'Show All' : 'Show Starred'}
              </button>
              <button
                onClick={toggleView}
                className='flex items-center gap-2 px-3 py-1 rounded-md transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200'
              >
                {isIconView ? <FaList /> : <FaTh />}
                {isIconView ? 'Detailed View' : 'Icon View'}
              </button>
              <span className='text-sm text-gray-500'>{filteredFiles.length} files</span>
            </div>
          </div>

          {filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              {showFavorites ? (
                <>
                  <svg
                    className="w-16 h-16 text-yellow-400 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-700">
                    No Favorites Yet
                  </h3>
                  <p className="text-gray-500 text-center mt-1">
                    Mark files as favorites to see them here.
                  </p>
                </>
              ) : (
                <>
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
                  <h3 className="text-lg font-medium text-gray-700">
                    No Files Uploaded
                  </h3>
                  <p className="text-gray-500 text-center mt-1">
                    Upload files to get started.
                  </p>
                </>
              )}
            </div>
          ) : (
            isIconView ? (
              <><div className='col-span-1 flex items-center justify-center gap-x-2'>
              <span>Select All Files</span>
              <input
                type="checkbox"
                checked={selectedFiles.length === filteredFiles.length}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            
              <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4'>
                {filteredFiles.length > 0 ? (
                  sortFiles(filteredFiles).map((item) => (
                    <div key={item.id} className='relative flex flex-col items-center p-4 rounded-md shadow-sm hover:shadow-md transition-shadow'>
                      <div className="absolute top-2 left-2 z-10">
                        <input
                          type="checkbox"
                          checked={selectedFiles.includes(item.id)}
                          onChange={() => toggleFileSelection(item.id)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </div>
                      <FileItem
                        file={{
                          ...item,
                          formattedSize: formatFileSize(item.size),
                          formattedDate: formatDate(item.modifiedAt)
                        }}
                        onDelete={() => deleteFile(item)}
                        onToggleFavorite={() => toggleFavorite(item)}
                        isIconView={isIconView}
                      />
                      {item.isFavorite && (
                        <FaStar className="absolute top-2 right-2 text-yellow-400 text-[10px]" />

                      )}
                    </div>
                  ))
                ) : (
                  <p className='text-center text-gray-500'>No files found.</p>
                )}
              </div></>
            ) : (
              <>
               <div className='col-span-1 flex items-center justify-center gap-x-2'>
  <span>Select All Files</span>
  <input
    type="checkbox"
    checked={selectedFiles.length === filteredFiles.length}
    onChange={handleSelectAll}
    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
  />
</div>

                  <br></br>
                  <div className="grid grid-cols-12 text-sm font-semibold border-b pb-2 mb-3 bg-gray-100">
  <div className="col-span-2 flex items-center justify-center">actions</div>
  <div
    className="col-span-5 flex items-center gap-1 justify-center cursor-pointer"
    onClick={() => handleSort("name")}
  >
    name {sortBy === "name" && (sortOrder === "asc" ? <BsSortUpAlt /> : <BsSortDown />)}
  </div>
  <div
    className="col-span-3 flex items-center gap-1 justify-center cursor-pointer"
    onClick={() => handleSort("modified")}
  >
    modified {sortBy === "modified" && (sortOrder === "asc" ? <BsSortUpAlt /> : <BsSortDown />)}
  </div>
  <div
    className="col-span-2 flex items-center gap-1 justify-center cursor-pointer"
    onClick={() => handleSort("size")}
  >
    size {sortBy === "size" && (sortOrder === "asc" ? <BsSortUpAlt /> : <BsSortDown />)}
  </div>
</div>

<div className="space-y-2">
  {filteredFiles.length > 0 ? (
    sortFiles(filteredFiles).map((item) => (
      <div key={item.id} className="grid grid-cols-12 items-center hover:bg-gray-50 rounded-lg p-2">
        <div className="col-span-2 flex items-center justify-center">
          <input
            type="checkbox"
            checked={selectedFiles.includes(item.id)}
            onChange={() => toggleFileSelection(item.id)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>
        <div className="col-span-5">
          <FileItem
            key={item.id}
            file={{
              ...item,
              formattedSize: formatFileSize(item.size),
              formattedDate: formatDate(item.modifiedAt),
            }}
            onDelete={() => deleteFile(item)}
            onToggleFavorite={() => toggleFavorite(item)}
            isIconView={isIconView}
          />
        </div>
        <div className="col-span-3 text-center">{formatDate(item.modifiedAt)}</div>
        <div className="col-span-2 text-center">{formatFileSize(item.size)}</div>
      </div>
    ))
  ) : (
    <p className="text-center text-gray-500">no files found.</p>
  )}
</div>

              </>
            )
          )}
        </div>

        <div className='bg-white p-5 rounded-lg shadow-md'>
          <StorageGraph />
        </div>
      </div>
    </StarredFilesContext.Provider>
  );
}

export default FileList;
