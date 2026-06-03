"use client";

import { useEffect, useState } from "react";
import api from "../../lib/api";
import Sidebar from "../../components/Sidebar";


export default function Candidates() {

  const [candidates, setCandidates] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [centers, setCenters] = useState<any[]>([]);

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<any>(null);

  const [photoFiles, setPhotoFiles] = useState<any>({});


  const [form, setForm] = useState({

    rollNumber: "",
    name: "",
    photoUrl: "",
    examId: "",
    shiftId: "",
    centerId: "",

  });




  const loadData = async () => {

    const [
      candidatesRes,
      examsRes,
      shiftsRes,
      centersRes,
    ] = await Promise.all([

      api.get(
        `/candidates?page=${page}&search=${search}`,
      ),

      api.get("/exams"),

      api.get("/shifts"),

      api.get("/centers"),

    ]);


    setCandidates(
      candidatesRes.data.data,
    );


    setPages(
      candidatesRes.data.pages,
    );


    setExams(examsRes.data);

    setShifts(shiftsRes.data);

    setCenters(centersRes.data);

  };





  useEffect(() => {

    loadData();

  }, [page]);







  const createCandidate = async () => {

    await api.post(
      "/candidates",
      form,
    );


    setForm({

      rollNumber: "",
      name: "",
      photoUrl: "",
      examId: "",
      shiftId: "",
      centerId: "",

    });


    await loadData();

  };







  const importCandidates = async () => {

    if (!file) return;


    const formData =
      new FormData();


    formData.append(
      "file",
      file,
    );


    const response =
      await api.post(
        "/candidates/import",
        formData,
      );


    setImportResult(
      response.data,
    );


    await loadData();

  };







  const uploadPhoto =
    async (candidateId: string) => {


      const photo =
        photoFiles[candidateId];


      if (!photo) return;


      const formData =
        new FormData();


      formData.append(
        "file",
        photo,
      );


      await api.post(

        `/candidates/${candidateId}/photo`,

        formData,

      );


      await loadData();

    };









  return (

    <div className="flex">

      <Sidebar />


      <main className="p-10 flex-1">


        <h1 className="text-3xl font-bold mb-8">

          Candidates

        </h1>






        <div className="mb-6">


          <input

            className="border p-2"

            placeholder="Search roll/name"

            value={search}

            onChange={
              e =>
                setSearch(
                  e.target.value,
                )
            }

          />



          <button

            className="border p-2 ml-2"

            onClick={() => {

              setPage(1);

              loadData();

            }}

          >

            Search

          </button>


        </div>








        <div className="border p-4 mb-8">


          <h2 className="font-bold mb-3">

            Excel Import

          </h2>


          <input

            className="border p-2"

            type="file"

            accept=".xlsx,.xls"

            onChange={
              e =>
                setFile(
                  e.target.files?.[0] || null,
                )
            }

          />



          <button

            className="border p-2 ml-4"

            onClick={importCandidates}

          >

            Import Excel

          </button>


          {
            importResult && (

              <p>

                Imported: {importResult.imported}

                {" | "}

                Skipped: {importResult.skipped}

              </p>

            )
          }


        </div>



<div className="grid grid-cols-7 gap-2 mb-8">


  <input

    className="border p-2"

    placeholder="Roll"

    value={form.rollNumber}

    onChange={
      e =>
        setForm({
          ...form,
          rollNumber:
            e.target.value,
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
          name:
            e.target.value,
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

    value={form.shiftId}

    onChange={
      e =>
        setForm({
          ...form,
          shiftId:
            e.target.value,
        })
    }

  >


    <option value="">

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

              candidates.map(c => (


                <tr key={c.id}>


                  <td className="border p-2">


                    {
                      c.photoUrl && (

                        <img

                          src={
                            "http://localhost:3000" +
                            c.photoUrl
                          }

                          className="w-16 h-16 object-cover"

                        />

                      )
                    }


                  </td>



                  <td className="border p-2">

                    {c.rollNumber}

                  </td>


                  <td className="border p-2">

                    {c.name}

                  </td>





                  <td className="border p-2">


                    <input

                      type="file"

                      accept="image/*"

                      onChange={
                        e =>
                          setPhotoFiles({

                            ...photoFiles,

                            [c.id]:
                              e.target.files?.[0],

                          })
                      }

                    />



                    <button

                      className="border p-1"

                      onClick={
                        () =>
                          uploadPhoto(c.id)
                      }

                    >

                      Upload

                    </button>


                  </td>





                  <td className="border p-2">

                    {
                      c.verified
                        ? "Verified"
                        : "Pending"
                    }

                  </td>


                </tr>

              ))

            }


          </tbody>


        </table>








        <div className="mt-5">


          <button

            className="border p-2"

            disabled={page === 1}

            onClick={
              () =>
                setPage(page - 1)
            }

          >

            Previous

          </button>




          <span className="mx-5">

            {page} / {pages}

          </span>





          <button

            className="border p-2"

            disabled={page === pages}

            onClick={
              () =>
                setPage(page + 1)
            }

          >

            Next

          </button>


        </div>


      </main>


    </div>

  );

}