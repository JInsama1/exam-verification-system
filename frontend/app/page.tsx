"use client";


import { useState } from "react";

import axios from "axios";



export default function Home() {


  const [email, setEmail] =
    useState("");


  const [password, setPassword] =
    useState("");


  const [showPassword, setShowPassword] =
    useState(false);


  const [loading, setLoading] =
    useState(false);


  const [error, setError] =
    useState<string | null>(null);


  const login = async () => {


    setError(null);
    setLoading(true);


    try {

      const response =
        await axios.post(
          "http://localhost:3000/auth/login",
          {
            email,
            password,
          },
        );


      localStorage.setItem(
        "token",
        response.data.accessToken,
      );


      const payload =
        JSON.parse(
          atob(
            response.data.accessToken
              .split(".")[1],
          ),
        );


      if (payload.role === "operator") {

        window.location.href = "/attendance";

      } else {

        window.location.href = "/dashboard";

      }


    } catch {

      setError("Invalid email or password");

    } finally {

      setLoading(false);

    }


  };


  const handleKeyDown = (
    e: React.KeyboardEvent,
  ) => {

    if (e.key === "Enter") {
      login();
    }

  };


  return (

    <main className="min-h-screen flex items-center justify-center">


      <div className="border p-8 rounded-xl w-96">


        <h1 className="text-2xl font-bold mb-6">

          Exam Verification Login

        </h1>


        <input
          className="border p-2 w-full mb-3"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
        />


        <div className="relative mb-3">

          <input
            className="border p-2 w-full pr-16"
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500"
            onClick={() =>
              setShowPassword(prev => !prev)
            }
          >
            {showPassword ? "Hide" : "Show"}
          </button>

        </div>


        {
          error && (
            <p className="text-red-600 text-sm mb-3">
              {error}
            </p>
          )
        }


        <button
          className="border p-2 w-full disabled:opacity-40"
          onClick={login}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>


      </div>


    </main>

  );

}
