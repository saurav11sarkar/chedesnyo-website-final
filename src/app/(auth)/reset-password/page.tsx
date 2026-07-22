import React, { Suspense } from 'react'
import ResetPassword from './_components/ResetPassword'

function page() {
  return (
    <Suspense fallback={<div>Laden...</div>}>
      <ResetPassword />
    </Suspense>
  )
}

export default page