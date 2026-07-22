import React, { Suspense } from 'react'
import LoginForm from './_components/Signup'

function page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Laden...</div>}>
      <LoginForm />
    </Suspense>
  )
}

export default page