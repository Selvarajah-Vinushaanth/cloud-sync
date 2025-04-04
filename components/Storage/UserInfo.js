import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, getFirestore } from 'firebase/firestore';
import { app } from '../../Config/FirebaseConfig';

function UserInfo() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalFolders: 0,
  });
  

  useEffect(() => {
    if (session) {
      fetchUserStats();
    }
  }, [session]);

  const fetchUserStats = async () => {
    try {
      const db = getFirestore(app);

      // Fetch files count
      const filesQuery = query(
        collection(db, 'files'),
        where('createdBy', '==', session.user.email)
      );
      const filesSnapshot = await getDocs(filesQuery);

      // Fetch folders count
      const foldersQuery = query(
        collection(db, 'Folders'), // Ensure the collection name matches your Firebase structure
        where('createBy', '==', session.user.email) // Correct field name for creator
      );
      const foldersSnapshot = await getDocs(foldersQuery);

      setStats({
        totalFiles: filesSnapshot.size,
        totalFolders: foldersSnapshot.size, // Correctly set the folder count
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {session ? (
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-4">
            <Image
              src={session.user.image}
              alt="user-image"
              width={60}
              height={60}
              className="rounded-full border-2 border-blue-500"
            />
            <div>
              <h2 className="text-lg font-bold text-gray-800">{session.user.name}</h2>
              <h2 className="text-sm text-gray-500">{session.user.email}</h2>
            </div>
            <button
              onClick={() => signOut()}
              className="bg-blue-100 p-2 rounded-lg cursor-pointer hover:bg-blue-200 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-blue-500 hover:animate-pulse"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 w-full">
            <div className="text-center p-4 bg-blue-50 rounded-lg shadow-sm">
              <h3 className="text-2xl font-bold text-blue-600">{stats.totalFiles}</h3>
              <p className="text-sm text-gray-500">Total Files</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg shadow-sm">
              <h3 className="text-2xl font-bold text-green-600">{stats.totalFolders}</h3> {/* Corrected variable */}
              <p className="text-sm text-gray-500">Total Folders</p>
            </div>
          </div>
          <div className="mt-6">
        <h3 className="font-medium mb-2">Quick Actions</h3>
        <div className="space-y-2">
          <button 
            onClick={() => window.upload_file.showModal()}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload New File
          </button>
          <button 
            onClick={() => window.my_modal_3.showModal()}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            Create New Folder
          </button>
        </div>
      </div>
        </div>
        
      ) : (
        <p className="text-center text-gray-500">Please sign in to view your information.</p>
      )}
    </div>
  );
}

export default UserInfo;

