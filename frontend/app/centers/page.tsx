"use client";


import {
  useEffect,
  useState,
} from "react";


import api from "../../lib/api";


import Sidebar from "../../components/Sidebar";




export default function Centers() {


  const [centers, setCenters] =
    useState<any[]>([]);




  const [form, setForm] =
    useState({

      centerCode: "",

      name: "",

      address: "",

      city: "",

      state: "",

    });






  const loadCenters =
    async () => {


      const response =
        await api.get(
          "/centers",
        );



      setCenters(
        response.data,
      );


    };







  useEffect(() => {


    loadCenters();


  }, []);








  const createCenter =
    async () => {


      await api.post(

        "/centers",

        form,

      );






      setForm({

        centerCode: "",

        name: "",

        address: "",

        city: "",

        state: "",

      });





      loadCenters();


    };










  return (

    <div className="flex">


      <Sidebar />




      <main className="p-10 flex-1">


        <h1 className="text-3xl font-bold mb-8">

          Centers

        </h1>








        <div className="grid grid-cols-6 gap-2 mb-8">


          {

            Object.keys(form)
              .map(

                (key) => (


                  <input

                    key={key}


                    className="border p-2"


                    placeholder={key}


                    value={

                      form[

                        key as keyof typeof form

                      ]

                    }



                    onChange={(e) =>


                      setForm({


                        ...form,


                        [key]:

                          e.target.value,


                      })


                    }


                  />


                )

              )

          }








          <button

            className="border p-2 font-bold"


            onClick={createCenter}

          >


            Create


          </button>



        </div>










        <table className="w-full border">


          <thead>


            <tr>


              <th className="border p-2">

                Code

              </th>



              <th className="border p-2">

                Name

              </th>



              <th className="border p-2">

                City

              </th>



              <th className="border p-2">

                State

              </th>



              <th className="border p-2">

                Status

              </th>


            </tr>


          </thead>








          <tbody>


            {

              centers.map(

                (center) => (


                  <tr key={center.id}>


                    <td className="border p-2">

                      {center.centerCode}

                    </td>



                    <td className="border p-2">

                      {center.name}

                    </td>



                    <td className="border p-2">

                      {center.city}

                    </td>



                    <td className="border p-2">

                      {center.state}

                    </td>



                    <td className="border p-2">


                      {

                        center.active

                          ? "Active"

                          : "Inactive"

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