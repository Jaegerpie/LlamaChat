import React from 'react'
import { SignUp } from '@clerk/react'
import './signUpPage.css' 
function SignupPage() {
  return (
    <div className='signUpPage'>
      <SignUp path="/sign-up" signInUrl='/sign-in'/>
    </div>
  )
}

export default SignupPage
