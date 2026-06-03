"use client";


import {
  useEffect,
  useState,
} from "react";


import axios from "axios";


import Sidebar from "../../components/Sidebar";



export default function Exams() {


  const [exams, setExams] =
    useState<any[]>([]);



  const [form, setForm] =
    useState({

      examCode: "",

      name: "",

      startDate: "",

      endDate: "",

    });




  const token = () =>

    localStorage.getItem(
      "token",
    );




  const loadExams =
    async () => {


      const response =
        await axios.get(

          "http://localhost:3000/exams",


          {
            headers: {

              Authorization:
                `Bearer ${token()}`,

            },
          },

        );



      setExams(
        response.data,
      );


    };





  useEffect(() => {


    loadExams();


  }, []);






  const createExam =
    async () => {


      await axios.post(

        "http://localhost:3000/exams",

        form,


        {
          headers: {

            Authorization:
              `Bearer ${token()}`,

          },
        },

      );




      setForm({

        examCode: "",

        name: "",

        startDate: "",

        endDate: "",

      });




      loadExams();


    };








  return (

    <div className="flex">


      <Sidebar />



      <main className="p-10 flex-1">


        <h1 className="text-3xl font-bold mb-8">

          Exams

        </h1>






        <div className="grid grid-cols-5 gap-2 mb-8">



          {
            Object.keys(form)
              .map(
                key => (


                  <input

                    key={key}

                    className="border p-2"

                    placeholder={key}

                    value={
                      form[
                        key as keyof typeof form
                      ]
                    }


                    onChange={
                      e =>
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

            onClick={createExam}

          >

            Create

          </button>



        </div>








        <table className="w-full border">


          <tbody>


            {
              exams.map(

                exam => (


                  <tr key={exam.id}>


                    <td className="border p-2">

                      {exam.examCode}

                    </td>



                    <td className="border p-2">

                      {exam.name}

                    </td>



                    <td className="border p-2">

                      {exam.startDate}

                    </td>



                    <td className="border p-2">

                      {exam.endDate}

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