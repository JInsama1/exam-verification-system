"use client";


import {
  useEffect,
  useState,
} from "react";


import axios from "axios";


import Sidebar from "../../components/Sidebar";



export default function Attendance() {


  const [attendance, setAttendance] =
    useState<any[]>([]);


  const [candidates, setCandidates] =
    useState<any[]>([]);


  const [operators, setOperators] =
    useState<any[]>([]);


  const [devices, setDevices] =
    useState<any[]>([]);




  const [form, setForm] =
    useState({

      candidateId: "",

      operatorId: "",

      deviceId: "",

      remarks: "",

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



      const [
        attendanceRes,
        candidateRes,
        operatorRes,
        deviceRes,
      ] = await Promise.all([


        axios.get(
          "http://localhost:3000/attendance",
          { headers },
        ),


        axios.get(
          "http://localhost:3000/candidates",
          { headers },
        ),


        axios.get(
          "http://localhost:3000/operators",
          { headers },
        ),


        axios.get(
          "http://localhost:3000/devices",
          { headers },
        ),


      ]);





      setAttendance(
        attendanceRes.data,
      );


      setCandidates(
        candidateRes.data,
      );


      setOperators(
        operatorRes.data,
      );


      setDevices(
        deviceRes.data,
      );


    };








  useEffect(() => {


    loadData();


  }, []);








  const verify =
    async () => {


      await axios.post(

        "http://localhost:3000/attendance/verify",

        form,


        {

          headers: {

            Authorization:
              `Bearer ${token()}`,

          },

        },

      );




      setForm({

        candidateId: "",

        operatorId: "",

        deviceId: "",

        remarks: "",

      });




      loadData();


    };








  return (

    <div className="flex">


      <Sidebar />



      <main className="p-10 flex-1">


        <h1 className="text-3xl font-bold mb-8">

          Attendance Verification

        </h1>






        <div className="grid grid-cols-5 gap-2 mb-8">





          <select

            className="border p-2"

            onChange={
              e =>
                setForm({
                  ...form,
                  candidateId:e.target.value,
                })
            }

          >


            <option>
              Candidate
            </option>


            {
              candidates.map(
                c => (

                  <option
                    key={c.id}
                    value={c.id}
                  >

                    {c.rollNumber} - {c.name}

                  </option>

                )
              )
            }


          </select>








          <select

            className="border p-2"

            onChange={
              e =>
                setForm({
                  ...form,
                  operatorId:e.target.value,
                })
            }

          >


            <option>
              Operator
            </option>


            {
              operators.map(
                o => (

                  <option
                    key={o.id}
                    value={o.id}
                  >

                    {o.employeeCode}

                  </option>

                )
              )
            }


          </select>









          <select

            className="border p-2"

            onChange={
              e =>
                setForm({
                  ...form,
                  deviceId:e.target.value,
                })
            }

          >


            <option>
              Device
            </option>


            {
              devices.map(
                d => (

                  <option
                    key={d.id}
                    value={d.id}
                  >

                    {d.deviceCode}

                  </option>

                )
              )
            }


          </select>







          <input

            className="border p-2"

            placeholder="Remarks"

            value={form.remarks}

            onChange={
              e =>
                setForm({
                  ...form,
                  remarks:e.target.value,
                })
            }

          />






          <button

            className="border p-2 font-bold"

            onClick={verify}

          >

            Verify

          </button>




        </div>









        <table className="w-full border">


          <tbody>


            {
              attendance.map(

                a => (


                  <tr key={a.id}>


                    <td className="border p-2">

                      {a.candidate?.name}

                    </td>



                    <td className="border p-2">

                      {a.operator?.employeeCode}

                    </td>




                    <td className="border p-2">

                      {a.device?.deviceCode}

                    </td>




                    <td className="border p-2">

                      Verified

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