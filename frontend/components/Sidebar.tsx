"use client";


import Link from "next/link";


import {
  jwtDecode,
} from "jwt-decode";


import {
  useEffect,
  useState,
} from "react";


import LogoutButton from "./LogoutButton";





export default function Sidebar() {


  const [role, setRole] =
    useState("");





  useEffect(() => {


    const token =
      localStorage.getItem(
        "token",
      );



    if (token) {


      const decoded: any =
        jwtDecode(
          token,
        );



      setRole(
        decoded.role,
      );


    }


  }, []);








  const isAdmin =

    role === "master_admin"

    ||

    role === "admin";








  return (

    <aside className="w-64 min-h-screen border-r p-5 flex flex-col justify-between">


      <div>


        <h2 className="font-bold text-xl mb-8">

          Exam System

        </h2>





        <nav className="flex flex-col gap-4">



          {

            isAdmin && (

              <>


                <Link href="/dashboard">

                  Dashboard

                </Link>



                <Link href="/centers">

                  Centers

                </Link>



                <Link href="/operators">

                  Operators

                </Link>



                <Link href="/devices">

                  Devices

                </Link>



                <Link href="/exams">

                  Exams

                </Link>



                <Link href="/shifts">

                  Shifts

                </Link>



                <Link href="/candidates">

                  Candidates

                </Link>



                <Link href="/imports">

                  Imports

                </Link>



                <Link href="/audit">

                  Audit Logs

                </Link>


              </>

            )

          }






          <Link href="/attendance">

            Attendance

          </Link>



        </nav>


      </div>





      <LogoutButton />



    </aside>

  );


}