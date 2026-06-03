"use client";


import {
  useEffect,
  useState,
} from "react";


import api from "../../lib/api";


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


const selectedCandidate =
  candidates.find(

    c =>
      c.id === form.candidateId,

  );




  const loadData =
    async () => {


      const [

        attendanceRes,

        candidateRes,

        operatorRes,

        deviceRes,

      ] = await Promise.all([


        api.get(
          "/attendance",
        ),



        api.get(
          "/candidates",
        ),



        api.get(
          "/operators",
        ),



        api.get(
          "/devices",
        ),


      ]);





      setAttendance(
        attendanceRes.data,
      );


      setCandidates(
  candidateRes.data.data,
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


      await api.post(

        "/attendance/verify",

        form,

      );




      setForm({

        candidateId: "",

        operatorId: "",

        deviceId: "",

        remarks: "",

      });




      await loadData();


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

            value={form.candidateId}

            onChange={
              e =>
                setForm({

                  ...form,

                  candidateId:
                    e.target.value,

                })
            }

          >


            <option value="">

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


{

  selectedCandidate && (

    <div className="border p-4 mb-8">


      {

        selectedCandidate.photoUrl && (

          <img

            src={
              "http://localhost:3000" +
              selectedCandidate.photoUrl
            }

            className="w-40 h-40 object-cover mb-4"

          />

        )

      }



      <p>

        Name:

        {selectedCandidate.name}

      </p>



      <p>

        Roll:

        {selectedCandidate.rollNumber}

      </p>



      <p>

        Exam:

        {selectedCandidate.exam?.name}

      </p>



      <p>

        Center:

        {selectedCandidate.center?.name}

      </p>


    </div>

  )

}






          <select

            className="border p-2"

            value={form.operatorId}

            onChange={
              e =>
                setForm({

                  ...form,

                  operatorId:
                    e.target.value,

                })
            }

          >


            <option value="">

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

            value={form.deviceId}

            onChange={
              e =>
                setForm({

                  ...form,

                  deviceId:
                    e.target.value,

                })
            }

          >


            <option value="">

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

                  remarks:
                    e.target.value,

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