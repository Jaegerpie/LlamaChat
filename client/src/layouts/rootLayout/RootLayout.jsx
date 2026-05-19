import React from 'react'
import { Link, Outlet } from 'react-router-dom'
import './rootLayout.css'
import { ClerkProvider, Show, SignInButton, SignUpButton, UserButton } from '@clerk/react'
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";



const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}


const queryClient = new QueryClient();      //reactQuery



function RootLayout() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <QueryClientProvider client={queryClient}>
        <div className="rootLayout">
          <header>
            <Link to="/" className="logo">
              <img src="/logo.png" alt="logo" />
              <span>LAMA AI</span>
            </Link>
            <div className="user">
              <Show when="signed-out">
                <SignInButton className="signIn" />
                <SignUpButton className="signUp" />
              </Show>
              <Show when="signed-in">
                <UserButton />
              </Show>
            </div>
          </header>
          <main>
            <Outlet />
          </main>
        </div>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default RootLayout
