// hooks/useAuth.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from "../database/firebase";
import { User } from 'firebase/auth';

const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
        router.push('/login'); // Redirect to the login page
      }
    });

    return () => unsubscribe();
  }, [router]);

  return user;
};

export default useAuth;
