"use client";


import {
  useEffect,
  useState,
} from "react";


import {
  useRouter,
} from "next/navigation";




export default function ProtectedRoute({

  children,

}: {

  children: React.ReactNode;

}) {


  const router =
    useRouter();



  const [allowed, setAllowed] =
    useState(false);




  useEffect(() => {


    const token =
      localStorage.getItem(
        "token",
      );



    if (!token) {


      router.push(
        "/",
      );


    } else {


      setAllowed(
        true,
      );


    }


  }, [router]);





  if (!allowed) {


    return (

      <div>

        Checking login...

      </div>

    );


  }




  return children;


}