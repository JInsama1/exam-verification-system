"use client";


import {
  useRouter,
} from "next/navigation";



export default function LogoutButton() {


  const router =
    useRouter();



  const logout = () => {


    localStorage.removeItem(
      "token",
    );


    router.replace(
  "/",
);


  };





  return (

    <button

      onClick={logout}

      className="border px-4 py-2 rounded"

    >

      Logout

    </button>

  );


}