import React, { useState } from 'react';
import { 
  FaFileAlt, FaFilePdf, FaFileImage, FaFileWord, 
  FaFileExcel, FaFilePowerpoint, FaTrash, FaStar,
  FaTrashRestore
} from 'react-icons/fa';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import FilePreviewModal from './FilePreviewModal';

const FileItem = ({ file, onDelete, onRestore, onToggleFavorite, activeSection, isIconView }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Function to return the appropriate file icon
  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'pdf': return <FaFilePdf className="text-red-500 text-2xl" />;
      case 'xls':
      case 'xlsx': return <FaFileExcel className="text-green-500 text-2xl" />;
      case 'doc':
      case 'docx': return <FaFileWord className="text-blue-500 text-2xl" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return <FaFileImage className="text-yellow-500 text-2xl" />;
      default: return <FaFileAlt className="text-gray-500 text-2xl" />;
    }
  };

  const fileType = file.name.split('.').pop().toLowerCase();

  return (
    <>
      <div className={`
        ${isIconView ? 'flex flex-col items-center justify-center w-32' : 'grid grid-cols-12 items-center'}
        py-3 px-2 hover:bg-gray-50 rounded-lg transition-colors`}>
        <div className={`${isIconView ? 'text-4xl mb-2' : 'col-span-5 flex items-center gap-3'}`}>
          <div className="text-2xl cursor-pointer" onClick={() => setShowPreviewModal(true)}>
            {getFileIcon(fileType)}
          </div>
          {!isIconView && (
            <span className="truncate cursor-pointer" 
                  onClick={() => setShowPreviewModal(true)} 
                  title={file.name}>
              {file.name}
            </span>
          )}
          {activeSection !== 'trash' && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(file);
                file.isFavorite = !file.isFavorite; // Update UI immediately
              }}
              className={`p-1 rounded-full ${file.isFavorite ? 'text-yellow-400' : 'text-gray-400'} hover:text-yellow-500`}
            >
              <FaStar />
            </button>
          )}
        </div>
        
        {isIconView && (
          <span className="text-sm text-gray-500 truncate w-full text-center" title={file.name}>
            {file.name}
          </span>
        )}

        {!isIconView && (
          <>
            <div className="col-span-3 text-gray-500">
              {file.formattedDate}
            </div>
            
            <div className="col-span-2 text-gray-500">
              {file.formattedSize}
            </div>
            
            <div className="col-span-2 flex justify-end gap-2">
              {activeSection === 'trash' ? (
                <>
                  <button
                    onClick={() => onRestore(file)}
                    className="p-2 hover:bg-green-100 rounded-full transition-colors"
                    title="Restore file"
                  >
                    <FaTrashRestore className="text-gray-400 hover:text-green-500" />
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="p-2 hover:bg-red-100 rounded-full transition-colors"
                    title="Delete permanently"
                  >
                    <FaTrash className="text-gray-400 hover:text-red-500" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="p-2 hover:bg-red-100 rounded-full transition-colors"
                  title="Move to trash"
                >
                  <FaTrash className="text-gray-400 hover:text-red-500" />
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          onDelete(file);
          setShowDeleteModal(false);
        }}
        fileName={file.name}
        isPermanent={activeSection === 'trash'}
      />

      <FilePreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        file={file}
      />
    </>
  );
};

export default FileItem;
