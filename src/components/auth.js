import { auth, googleProvider } from "../config/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { useState } from "react";

export const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Sign up successful!");
    } catch (err) {
      console.error(err);
      alert("Error signing up: " + err.message);
    }
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      alert("Sign in with Google successful!");
    } catch (err) {
      console.error(err);
      alert("Error signing in with Google: " + err.message);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      alert("Logout successful!");
    } catch (err) {
      console.error(err);
      alert("Error logging out: " + err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-xs p-6 bg-white rounded-md shadow-md">
        <h1 className="mb-4 text-xl font-semibold text-center">Auth</h1>
        <input
          className="w-full px-3 py-2 mb-4 text-sm border rounded shadow-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Email..."
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full px-3 py-2 mb-4 text-sm border rounded shadow-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Password..."
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="w-full px-4 py-2 mb-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={signUp}
        >
          Sign Up
        </button>
        <button
          className="w-full px-4 py-2 mb-2 text-white bg-red-500 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          onClick={signInWithGoogle}
        >
          Sign In With Google
        </button>
        <button
          className="w-full px-4 py-2 text-white bg-gray-500 rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          onClick={logout}
        >
          Logout
        </button>
      </div>
    </div>
  );
};
