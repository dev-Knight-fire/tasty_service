// src/contexts/AuthContext.jsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/auth";
import { doc, getDoc, query, where, collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firestore"; // Adjust path as needed

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const initUser = {
    email: null,
    displayName: null,
    photoURL: null,
    role: "",
    setList: false, // default value for setList
    status: "", // default status
    isAdmin: false
  }
  const [user, setUser] = useState(initUser); // stores Firebase user + custom data
  const [loading, setLoading] = useState(true); // loading state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userEmail = firebaseUser.email.toLowerCase();
        const userDocRef = doc(db, "users", userEmail);
        const userSnap = await getDoc(userDocRef);

        const listQuery = query(collection(db, "lists"), where("email", "==", userEmail));
        const listSnapshot = await getDocs(listQuery);
        const listSnap = listSnapshot.docs[0];

        const userData = userSnap.exists() ? userSnap.data() : {};
        setUser({
          ...firebaseUser,
          setList: listSnap?.data().email ? true : false, // default to false if not set
          role: userData.role || "", // default to empty string if not set
          status: userData.status || "", // default status
          avatar: listSnap ? listSnap.data().photos[listSnap.data().avatar]: "", // default avatar if not set
          isAdmin: userData.isAdministrator || false // default isAdmin
        });
      } else {
        setUser(initUser);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const switchList = (newSetList) => {
    setUser((prevUser) => ({
      ...prevUser,
      setList: newSetList,
    }));
  };

  const switchRole = (newRole) => {
    setUser((prevUser) => ({
      ...prevUser,
      role: newRole,
    }));
  };

  const switchAvatar = (newAvatar) => {
    setUser((prevUser) => ({
      ...prevUser,
      avatar: newAvatar,
    }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, switchList, switchRole, switchAvatar }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);