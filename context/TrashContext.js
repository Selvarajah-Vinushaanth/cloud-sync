import { createContext, useState } from 'react';

export const TrashContext = createContext();

export function TrashContextProvider({children}) {
    const [showTrash, setShowTrash] = useState(false);
    
    return (
        <TrashContext.Provider value={{
            showTrash,
            setShowTrash
        }}>
            {children}
        </TrashContext.Provider>
    );
}
