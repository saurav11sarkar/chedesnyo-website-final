import React from 'react'
import LanguageSwitcher from '@/components/language-switcher'
// import { Toaster } from 'sonner'

function layout({children}: {children: React.ReactNode}) {
  return (
    <div className=''>
      
      
        {children}
        <div className="py-4 flex justify-center">
          <LanguageSwitcher variant="full" />
        </div>
    </div>
  )
}

export default layout
