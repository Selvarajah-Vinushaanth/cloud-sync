import React, { useState } from 'react';
import { FaDownload, FaTimes, FaSpinner } from 'react-icons/fa';

const FilePreviewModal = ({ isOpen, onClose, file }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const isPreviewable = (type) => {
    return ["pdf", "png", "jpg", "jpeg", "mp4", "mp3", "docx", "xlsx", "pptx", "txt", "csv"].includes(type?.toLowerCase());
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const response = await fetch(file.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name; // Use the original file name
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-xl font-semibold text-gray-900">{file.name}</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className={`p-2 rounded-full transition-colors ${
                  isDownloading 
                    ? 'bg-gray-100 text-gray-400' 
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
                title="Download file"
              >
                {isDownloading ? (
                  <FaSpinner className="animate-spin" size={20} />
                ) : (
                  <FaDownload size={20} />
                )}
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-600 hover:text-red-600 rounded-full hover:bg-red-50"
              >
                <FaTimes size={20} />
              </button>
            </div>
          </div>
          <div className="p-6">
            {isPreviewable(file.type) ? (
              (() => {
                const fileType = file.type?.toLowerCase();
                switch (fileType) {
                  case 'pdf':
                    return <iframe src={`${file.imageUrl}#view=fit`} className="w-full h-[80vh]" title={file.name} />;
                  case 'png':
                  case 'jpg':
                  case 'jpeg':
                    return <img src={file.imageUrl} alt={file.name} className="max-w-full max-h-[80vh] mx-auto" />;
                  case 'mp4':
                    return <video controls className="w-full max-h-[80vh] mx-auto" src={file.imageUrl} title={file.name} />;
                  case 'mp3':
                    return <audio controls className="w-full" src={file.imageUrl} title={file.name} />;
                  case 'docx':
                  case 'xlsx':
                  case 'pptx':
                  case 'csv':
                    return (
                      <iframe
                        src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file.imageUrl)}`}
                        className="w-full h-[80vh]"
                        title={file.name}
                      />
                    );
                  case 'txt':
                    return (
                      <iframe
                        src={file.imageUrl}
                        className="w-full h-[80vh]"
                        title={file.name}
                      />
                    );
                  default:
                    return (
                      <div className="text-center py-10">
                        <p>Preview not available for this file type.</p>
                        <button
                          onClick={handleDownload}
                          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Download File
                        </button>
                      </div>
                    );
                }
              })()
            ) : (
              <div className="text-center py-10">
                <p>Preview not available for this file type.</p>
                <button
                  onClick={handleDownload}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Download File
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;
