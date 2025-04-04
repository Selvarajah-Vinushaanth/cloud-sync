import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { collection, query, where, getDocs, getFirestore } from 'firebase/firestore';
import { app } from '../../Config/FirebaseConfig';

function StorageInfo() {
  const { data: session } = useSession();
  const [storageStats, setStorageStats] = useState({
    total: 0,
    byType: {
      pdf: { count: 0, size: 0 },
      image: { count: 0, size: 0 },
      video: { count: 0, size: 0 },
      document: { count: 0, size: 0 },
      other: { count: 0, size: 0 }
    },
    folderCount: 0
  });

  useEffect(() => {
    if (session) {
      fetchStorageStats();
    }
  }, [session]);

  const fetchStorageStats = async () => {
    const db = getFirestore(app);
    const filesQuery = query(
      collection(db, "files"),
      where("createdBy", "==", session.user.email)
    );
    
    const filesSnapshot = await getDocs(filesQuery);
    const stats = {
      total: 0,
      byType: {
        pdf: { count: 0, size: 0 },
        image: { count: 0, size: 0 },
        video: { count: 0, size: 0 },
        document: { count: 0, size: 0 },
        other: { count: 0, size: 0 }
      },
      folderCount: 0
    };

    filesSnapshot.forEach((doc) => {
      const file = doc.data();
      const fileType = getFileType(file.type);
      stats.byType[fileType].count++;
      stats.byType[fileType].size += file.size || 0;
      stats.total += file.size || 0;
    });

    const foldersQuery = query(
      collection(db, "Folders"),
      where("createBy", "==", session.user.email)
    );
    const foldersSnapshot = await getDocs(foldersQuery);
    stats.folderCount = foldersSnapshot.size;

    setStorageStats(stats);
  };

  const getFileType = (extension) => {
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'svg'];
    const documentTypes = ['doc', 'docx', 'txt', 'rtf'];
    const videoTypes = ['mp4', 'mov', 'avi', 'mkv'];
    
    if (extension === 'pdf') return 'pdf';
    if (imageTypes.includes(extension)) return 'image';
    if (documentTypes.includes(extension)) return 'document';
    if (videoTypes.includes(extension)) return 'video';
    return 'other';
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const totalStorage = 15 * 1024 * 1024 * 1024;
  const usagePercentage = (storageStats.total / totalStorage) * 100;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mt-5 w-full max-w-lg mx-auto">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Storage Overview</h2>
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{formatSize(storageStats.total)} used of {formatSize(totalStorage)}</span>
          <span className="font-semibold text-gray-700">{usagePercentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-300 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${usagePercentage > 90 ? 'bg-red-500' : 'bg-blue-500'}`}
            style={{ width: `${usagePercentage}%` }}
          ></div>
        </div>
      </div>
      <div className="space-y-3">
        {Object.entries(storageStats.byType).map(([key, value]) => (
          <div key={key} className="flex justify-between text-sm border-b pb-2 last:border-none last:pb-0">
            <span className="text-gray-600 capitalize">{key} Files ({value.count})</span>
            <span className="font-medium text-gray-700">{formatSize(value.size)}</span>
          </div>
        ))}
        <div className="flex justify-between text-sm font-medium text-gray-700 mt-3">
          <span>Total Folders</span>
          <span>{storageStats.folderCount}</span>
        </div>
      </div>
    </div>
  );
}

export default StorageInfo;
