import React from 'react'
import LanguageSwitcher from '@/components/language-switcher'
// import { Toaster } from 'sonner'

function layout({children}: {children: React.ReactNode}) {
  return (
    <div className=''>
      
      
        {children}
        <LanguageSwitcher />
    </div>
  )
}

export default layout
