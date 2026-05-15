import React from 'react'
import { SignIn } from '@clerk/react'
import './signInPage.css'

function SigninPage() {
  return (
    <div className="signInPage">
      <SignIn path="/sign-in" signUpUrl="/sign-up" forceRedirectUrl="/dashboard"/>
    </div>
  );
}

export default SigninPage
