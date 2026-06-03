"use client";


import { useState } from "react";

import axios from "axios";



export default function Home() {


  const [email, setEmail] =
    useState("");


  const [password, setPassword] =
    useState("");


  const login = async () => {


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


    alert(
      "Login successful",
    );


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

          onChange={
            e => setEmail(e.target.value)
          }

        />



        <input

          className="border p-2 w-full mb-3"

          placeholder="Password"

          type="password"

          value={password}

          onChange={
            e => setPassword(e.target.value)
          }

        />



        <button

          className="border p-2 w-full"

          onClick={login}

        >

          Login

        </button>


      </div>


    </main>

  );

}