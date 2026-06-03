"use client";


import {
  useEffect,
  useState,
} from "react";


import axios from "axios";


import Sidebar from "../../components/Sidebar";



export default function Devices() {


  const [devices, setDevices] =
    useState<any[]>([]);


  const [centers, setCenters] =
    useState<any[]>([]);



  const [form, setForm] =
    useState({

      deviceCode: "",

      serialNumber: "",

      centerId: "",

    });





  const token = () =>

    localStorage.getItem(
      "token",
    );






  const loadData =
    async () => {


      const headers = {

        Authorization:
          `Bearer ${token()}`,

      };



      const deviceResponse =
        await axios.get(

          "http://localhost:3000/devices",

          {
            headers,
          },

        );



      const centerResponse =
        await axios.get(

          "http://localhost:3000/centers",

          {
            headers,
          },

        );




      setDevices(
        deviceResponse.data,
      );


      setCenters(
        centerResponse.data,
      );


    };






  useEffect(() => {


    loadData();


  }, []);







  const createDevice =
    async () => {


      await axios.post(

        "http://localhost:3000/devices",

        form,


        {

          headers: {

            Authorization:
              `Bearer ${token()}`,

          },

        },

      );




      setForm({

        deviceCode: "",

        serialNumber: "",

        centerId: "",

      });




      loadData();


    };








  return (

    <div className="flex">


      <Sidebar />



      <main className="p-10 flex-1">


        <h1 className="text-3xl font-bold mb-8">

          Devices

        </h1>





        <div className="grid grid-cols-4 gap-2 mb-8">


          <input

            className="border p-2"

            placeholder="Device Code"

            value={form.deviceCode}

            onChange={
              e =>
                setForm({

                  ...form,

                  deviceCode:
                    e.target.value,

                })
            }

          />




          <input

            className="border p-2"

            placeholder="Serial Number"

            value={form.serialNumber}

            onChange={
              e =>
                setForm({

                  ...form,

                  serialNumber:
                    e.target.value,

                })
            }

          />







          <select

            className="border p-2"

            value={form.centerId}

            onChange={
              e =>
                setForm({

                  ...form,

                  centerId:
                    e.target.value,

                })
            }

          >


            <option value="">

              Select Center

            </option>



            {
              centers.map(
                center => (

                  <option

                    key={center.id}

                    value={center.id}

                  >

                    {center.name}

                  </option>

                )
              )
            }


          </select>







          <button

            className="border p-2 font-bold"

            onClick={createDevice}

          >

            Create

          </button>



        </div>









        <table className="w-full border">


          <tbody>


            {
              devices.map(

                device => (


                  <tr key={device.id}>


                    <td className="border p-2">

                      {device.deviceCode}

                    </td>



                    <td className="border p-2">

                      {device.serialNumber}

                    </td>



                    <td className="border p-2">

                      {device.center?.name}

                    </td>




                    <td className="border p-2">

                      {
                        device.locked

                          ? "Locked"

                          : "Available"
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