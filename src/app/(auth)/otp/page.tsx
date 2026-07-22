import React, { Suspense } from 'react'
import VerifyOTPForm from './_components/OtpForm'

function page() {
  return (
    <Suspense fallback={<div>Laden...</div>}>
        <VerifyOTPForm />
    </Suspense>
  )
}

export default page