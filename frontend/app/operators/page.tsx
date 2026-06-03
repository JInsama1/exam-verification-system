"use client";

import { useEffect, useState } from "react";

import api from "../../lib/api";

import Sidebar from "../../components/Sidebar";


export default function Operators() {


  const [operators, setOperators] =
    useState<any[]>([]);


  const [centers, setCenters] =
    useState<any[]>([]);


  const [form, setForm] =
    useState({

      name: "",

      email: "",

      password: "",

      employeeCode: "",

      centerId: "",

    });



  const loadData = async () => {


    const operatorsResponse =
      await api.get(
        "/operators",
      );


    const centersResponse =
      await api.get(
        "/centers",
      );


    setOperators(
      operatorsResponse.data,
    );


    setCenters(
      centersResponse.data,
    );


  };



  useEffect(() => {


    loadData();


  }, []);




  const createOperator = async () => {


    await api.post(

      "/operators",

      form,

    );



    setForm({

      name: "",

      email: "",

      password: "",

      employeeCode: "",

      centerId: "",

    });



    loadData();


  };




  return (

    <div className="flex">


      <Sidebar />


      <main className="p-10 flex-1">


        <h1 className="text-3xl font-bold mb-8">

          Operators

        </h1>



        <div className="grid grid-cols-6 gap-2 mb-8">


          <input
            className="border p-2"
            placeholder="Name"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
          />



          <input
            className="border p-2"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
          />



          <input
            className="border p-2"
            placeholder="Password"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
          />



          <input
            className="border p-2"
            placeholder="Employee Code"
            value={form.employeeCode}
            onChange={(e) =>
              setForm({
                ...form,
                employeeCode: e.target.value,
              })
            }
          />



          <select

            className="border p-2"

            value={form.centerId}

            onChange={(e) =>

              setForm({

                ...form,

                centerId: e.target.value,

              })

            }

          >


            <option value="">

              Select Center

            </option>


            {centers.map((center) => (

              <option

                key={center.id}

                value={center.id}

              >

                {center.name}

              </option>

            ))}


          </select>




          <button

            className="border p-2 font-bold"

            onClick={createOperator}

          >

            Create

          </button>


        </div>




        <table className="w-full border">


          <tbody>


            {operators.map((operator) => (

              <tr key={operator.id}>


                <td className="border p-2">

                  {operator.employeeCode}

                </td>


                <td className="border p-2">

                  {operator.user?.name}

                </td>


                <td className="border p-2">

                  {operator.center?.name}

                </td>


              </tr>

            ))}


          </tbody>


        </table>


      </main>


    </div>

  );


}