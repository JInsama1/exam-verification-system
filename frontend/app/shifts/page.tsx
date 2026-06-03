"use client";


import {
  useEffect,
  useState,
} from "react";


import api from "../../lib/api";


import Sidebar from "../../components/Sidebar";



export default function Shifts() {


  const [shifts, setShifts] =
    useState<any[]>([]);


  const [exams, setExams] =
    useState<any[]>([]);



  const [form, setForm] =
    useState({

      name: "",

      startTime: "",

      endTime: "",

      examId: "",

    });




  const loadData =
    async () => {


      const shiftsResponse =
        await api.get(
          "/shifts",
        );



      const examsResponse =
        await api.get(
          "/exams",
        );




      setShifts(
        shiftsResponse.data,
      );


      setExams(
        examsResponse.data,
      );


    };






  useEffect(() => {


    loadData();


  }, []);







  const createShift =
    async () => {


      await api.post(

        "/shifts",

        form,

      );




      setForm({

        name: "",

        startTime: "",

        endTime: "",

        examId: "",

      });




      loadData();


    };








  return (

    <div className="flex">


      <Sidebar />



      <main className="p-10 flex-1">


        <h1 className="text-3xl font-bold mb-8">

          Shifts

        </h1>






        <div className="grid grid-cols-5 gap-2 mb-8">


          <input

            className="border p-2"

            placeholder="Shift Name"

            value={form.name}

            onChange={
              e =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
            }

          />




          <input

            className="border p-2"

            placeholder="09:00"

            value={form.startTime}

            onChange={
              e =>
                setForm({
                  ...form,
                  startTime: e.target.value,
                })
            }

          />




          <input

            className="border p-2"

            placeholder="12:00"

            value={form.endTime}

            onChange={
              e =>
                setForm({
                  ...form,
                  endTime: e.target.value,
                })
            }

          />







          <select

            className="border p-2"

            value={form.examId}

            onChange={
              e =>
                setForm({

                  ...form,

                  examId:
                    e.target.value,

                })
            }

          >


            <option value="">

              Select Exam

            </option>



            {
              exams.map(
                exam => (

                  <option

                    key={exam.id}

                    value={exam.id}

                  >

                    {exam.name}

                  </option>

                )
              )
            }


          </select>







          <button

            className="border p-2 font-bold"

            onClick={createShift}

          >

            Create

          </button>



        </div>







        <table className="w-full border">


          <tbody>


            {
              shifts.map(

                shift => (


                  <tr key={shift.id}>


                    <td className="border p-2">

                      {shift.name}

                    </td>


                    <td className="border p-2">

                      {shift.startTime}

                    </td>


                    <td className="border p-2">

                      {shift.endTime}

                    </td>


                    <td className="border p-2">

                      {shift.exam?.name}

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