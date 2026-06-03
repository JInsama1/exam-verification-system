"use client";


import {
  useEffect,
  useState,
} from "react";


import axios from "axios";


import Sidebar from "../../components/Sidebar";



export default function Candidates() {


  const [candidates, setCandidates] =
    useState<any[]>([]);


  const [exams, setExams] =
    useState<any[]>([]);


  const [shifts, setShifts] =
    useState<any[]>([]);


  const [centers, setCenters] =
    useState<any[]>([]);




  const [form, setForm] =
    useState({

      rollNumber: "",

      name: "",

      photoUrl: "",

      examId: "",

      shiftId: "",

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



      const [
        candidatesRes,
        examsRes,
        shiftsRes,
        centersRes,
      ] = await Promise.all([


        axios.get(
          "http://localhost:3000/candidates",
          { headers },
        ),


        axios.get(
          "http://localhost:3000/exams",
          { headers },
        ),


        axios.get(
          "http://localhost:3000/shifts",
          { headers },
        ),


        axios.get(
          "http://localhost:3000/centers",
          { headers },
        ),


      ]);





      setCandidates(
        candidatesRes.data,
      );


      setExams(
        examsRes.data,
      );


      setShifts(
        shiftsRes.data,
      );


      setCenters(
        centersRes.data,
      );


    };







  useEffect(() => {


    loadData();


  }, []);








  const createCandidate =
    async () => {


      await axios.post(

        "http://localhost:3000/candidates",

        form,


        {

          headers: {

            Authorization:
              `Bearer ${token()}`,

          },

        },

      );





      setForm({

        rollNumber: "",

        name: "",

        photoUrl: "",

        examId: "",

        shiftId: "",

        centerId: "",

      });




      loadData();


    };








  return (

    <div className="flex">


      <Sidebar />



      <main className="p-10 flex-1">


        <h1 className="text-3xl font-bold mb-8">

          Candidates

        </h1>







        <div className="grid grid-cols-7 gap-2 mb-8">


          <input

            className="border p-2"

            placeholder="Roll"

            value={form.rollNumber}

            onChange={
              e =>
                setForm({
                  ...form,
                  rollNumber:e.target.value,
                })
            }

          />




          <input

            className="border p-2"

            placeholder="Name"

            value={form.name}

            onChange={
              e =>
                setForm({
                  ...form,
                  name:e.target.value,
                })
            }

          />





          <input

            className="border p-2"

            placeholder="Photo URL"

            value={form.photoUrl}

            onChange={
              e =>
                setForm({
                  ...form,
                  photoUrl:e.target.value,
                })
            }

          />








          <select

            className="border p-2"

            onChange={
              e =>
                setForm({
                  ...form,
                  examId:e.target.value,
                })
            }

          >


            <option>

              Exam

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








          <select

            className="border p-2"

            onChange={
              e =>
                setForm({
                  ...form,
                  shiftId:e.target.value,
                })
            }

          >


            <option>

              Shift

            </option>


            {
              shifts.map(
                shift => (

                  <option
                    key={shift.id}
                    value={shift.id}
                  >

                    {shift.name}

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
                  centerId:e.target.value,
                })
            }

          >


            <option>

              Center

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

            onClick={createCandidate}

          >

            Create

          </button>




        </div>








        <table className="w-full border">


          <tbody>


            {
              candidates.map(

                c => (


                  <tr key={c.id}>


                    <td className="border p-2">

                      {c.rollNumber}

                    </td>


                    <td className="border p-2">

                      {c.name}

                    </td>


                    <td className="border p-2">

                      {c.verified ? "Verified" : "Pending"}

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