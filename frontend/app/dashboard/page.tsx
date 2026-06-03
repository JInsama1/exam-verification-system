"use client";


import {
  useEffect,
  useState,
} from "react";


import api from "../../lib/api";


import Sidebar from "../../components/Sidebar";



export default function Dashboard() {


  const [data, setData] =
    useState<any>(null);





  useEffect(() => {


    const loadDashboard =
      async () => {


        const response =
          await api.get(

            "/reports/dashboard",

          );



        setData(
          response.data,
        );


      };



    loadDashboard();


  }, []);





  if (!data) {


    return (

      <div>

        Loading...

      </div>

    );


  }






  return (

    <div className="flex">


      <Sidebar />



      <main className="p-10 flex-1">


        <h1 className="text-3xl font-bold mb-8">

          Admin Dashboard

        </h1>




        <div className="grid grid-cols-3 gap-5">


          {

            Object.entries(data)
              .map(

                ([key, value]) => (


                  <div

                    key={key}

                    className="border rounded-xl p-5"

                  >


                    <p>

                      {key}

                    </p>



                    <h2 className="text-3xl font-bold">

                      {String(value)}

                    </h2>


                  </div>


                )

              )

          }


        </div>



      </main>


    </div>

  );


}