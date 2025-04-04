import Image from "next/image";
import React, { useContext, useState, useEffect } from "react";
import CreateFolderModal from "./Folder/CreateFolderModal";
import UploadFileModal from "./File/UploadFileModal";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { ShowToastContext } from "../context/ShowToastContext";
import Script from "next/script";

function SideNavBar() {
  const { showFavorites, setShowFavorites } = useContext(ShowToastContext);
  const router = useRouter();
  const { data: session } = useSession();

  const handleFavoritesClick = () => {
    if (typeof setShowFavorites === 'function') {
      setShowFavorites(!showFavorites);
    }
  };

  // Add Daily Quote functionality
  const [quote, setQuote] = useState('');
  const quotes = [
    "The only limit to our realization of tomorrow is our doubts of today.",
    "Life is 10% what happens to us and 90% how we react to it.",
    "Be yourself; everyone else is already taken.",
    "Dream big and dare to fail.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "Believe you can and you're halfway there.",
    "Do what you can, with what you have, where you are.",
    "Happiness depends upon ourselves.",
    "It does not matter how slowly you go as long as you do not stop.",
    "Act as if what you do makes a difference. It does.",
    "Everything you’ve ever wanted is on the other side of fear.",
    "Opportunities don't happen, you create them.",
    "Difficulties in life are intended to make us better, not bitter.",
    "Your time is limited, so don’t waste it living someone else’s life."
  ];
  
  const refreshQuote = () => {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
  };
  useEffect(() => {
    refreshQuote();
  }, []);

  // New: Real-time Clock functionality
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "//code.tidio.co/ergtor1otpx1v1j0qnzbfom0wdu71apl.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return session && (
    <div
      className="w-[500px] flex flex-col bg-white h-screen sticky top-0 z-10 shadow-blue-200 shadow-md p-5"
    >
      <div className="flex justify-center">
        <Image
          src="/logo.png"
          alt="logo"
          className="cursor-pointer"
          width={150}
          height={60}
          onClick={() => router.push('/')}
        />
      </div>
      
      {/* Dashboard Button */}
      <button
        onClick={() => router.push('/')}
        className="flex gap-2 items-center text-[13px]
        bg-green-500 p-2 text-white rounded-md px-3
        hover:scale-105 transition-all mt-5 w-full justify-center"
      >
        Dashboard
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
          />
        </svg>
      </button>

      <button
        onClick={() => window.upload_file.showModal()}
        className="flex gap-2 items-center text-[13px]
        bg-blue-500 p-2 text-white rounded-md px-3
        hover:scale-105 transition-all mt-5 w-full justify-center"
      >
        Add New File
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>
      <button
        className="flex gap-2 items-center text-[13px]
        bg-sky-400 w-full p-2 justify-center text-white rounded-md px-3
        hover:scale-105 transition-all mt-1"
        onClick={() => window.my_modal_3.showModal()}
      >
        Create Folder
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      <div className="mt-4">
        <button
          className={`flex gap-2 items-center text-[13px]
          ${showFavorites ? 'bg-yellow-500' : 'bg-yellow-400'} w-full p-2 justify-center text-white rounded-md px-3
          hover:scale-105 transition-all mt-1`}
          onClick={handleFavoritesClick}
        >
          Favorites
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill={showFavorites ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
          </svg>
        </button>
      </div>

      <div className="mt-4">
        {/* After Favorites button */}
        <button
          className="flex gap-2 items-center text-[13px]
          bg-red-400 w-full p-2 justify-center text-white rounded-md px-3
          hover:scale-105 transition-all mt-1"
          onClick={() => router.push('/trash')}
        >
          Trash
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
            />
          </svg>
        </button>
      </div>

      <dialog id="my_modal_3" className="modal">
        <CreateFolderModal />
      </dialog>
      <dialog id="upload_file" className="modal">
        <UploadFileModal closeModal={() => window.upload_file.close()} />
      </dialog>
      
      {/* New Daily Quote Section */}
      <div className="mt-auto pt-4 border-t border-gray-200">
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-purple-800 mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Daily Quote
            </h3>
            <p className="text-sm text-gray-700 italic font-medium leading-relaxed">
              "{quote}"
            </p>
            <button
              onClick={refreshQuote}
              className="mt-3 px-4 py-1.5 bg-purple-500 text-white rounded-full text-sm hover:bg-purple-600 transition-colors duration-200 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              New Quote
            </button>
          </div>

          {/* Current Time Section */}
          <div className="border-t border-purple-200 pt-3">
            <h3 className="text-lg font-semibold text-purple-800 mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Current Time
            </h3>
            <p className="text-2xl font-bold text-gray-700 tracking-wide">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-sm text-gray-600">
              {currentTime.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SideNavBar;
