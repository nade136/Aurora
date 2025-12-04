import { Suspense } from 'react';
import SignInCard from "@/components/auth/SignInCard";

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInCard />
    </Suspense>
  );
}
