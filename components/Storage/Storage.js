import React from 'react'
import UserInfo from './UserInfo'
import StorageInfo from './StorageInfo'
import { useSession } from 'next-auth/react'

function Storage() {
    const {data:session}=useSession();
  return session&&(
    <div>
        <UserInfo/>
        <StorageInfo/>
    </div>
  )
}

export default Storage;