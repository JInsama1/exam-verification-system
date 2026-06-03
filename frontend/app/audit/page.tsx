"use client";


import {
  useEffect,
  useState,
} from "react";


import Sidebar from "../../components/Sidebar";


import api from "../../lib/api";




export default function AuditPage() {


  const [logs, setLogs] =
    useState<any[]>([]);




  useEffect(() => {


    const loadLogs =
      async () => {


        const response =
          await api.get(
            "/audit",
          );



        setLogs(
          response.data,
        );


      };



    loadLogs();


  }, []);







  return (

    <div className="flex">


      <Sidebar />



      <main className="p-10 flex-1">


        <h1 className="text-3xl font-bold mb-8">

          Audit Logs

        </h1>






        <table className="w-full border">


  <thead>

    <tr>

      <th className="border p-2">
        Action
      </th>

      <th className="border p-2">
        User
      </th>

      <th className="border p-2">
        Candidate
      </th>

      <th className="border p-2">
        Time
      </th>

    </tr>

  </thead>





  <tbody>


    {

      logs.map(

        log => (


          <tr key={log.id}>


            <td className="border p-2">

              {log.action}

            </td>





            <td className="border p-2">

              {log.userId}

            </td>






            <td className="border p-2">

              {

                log.details?.candidateName

              }

            </td>






            <td className="border p-2">

              {

                new Date(

                  log.createdAt,

                ).toLocaleString()

              }

            </td>



          </tr>


        )

      )

    }


  </tbody>


</table>



      </main>


    </div>

  );


}