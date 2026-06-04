"use client";


import {
  useEffect,
  useState,
} from "react";


import api from "../../lib/api";


import Sidebar from "../../components/Sidebar";




export default function Imports() {


  const [projects, setProjects] =
    useState<any[]>([]);


  const [projectId, setProjectId] =
    useState("");


  const [file, setFile] =
    useState<File | null>(null);


  const [loading, setLoading] =
    useState(false);


  const [error, setError] =
    useState<string | null>(null);


  const [jobId, setJobId] =
    useState<string | null>(null);


  const [job, setJob] =
    useState<any | null>(null);




  useEffect(() => {

    api
      .get("/projects")
      .then(r => setProjects(r.data));

  }, []);




  useEffect(() => {

    if (!jobId) return;


    const poll = async () => {

      try {

        const r =
          await api.get(
            `/import-jobs/${jobId}`,
          );

        setJob(r.data);

        return r.data;

      } catch {

        return null;

      }

    };


    poll();


    const interval =
      setInterval(async () => {

        const data = await poll();

        if (
          data &&
          data.status !== "queued" &&
          data.status !== "processing"
        ) {
          clearInterval(interval);
        }

      }, 2000);


    return () => clearInterval(interval);


  }, [jobId]);




  const startImport = async () => {

    if (!projectId || !file) return;


    setError(null);
    setJob(null);
    setLoading(true);


    try {

      const body = new FormData();
      body.append("projectId", projectId);
      body.append("file", file);


      const r =
        await api.post(
          "/import-jobs",
          body,
        );


      setJobId(r.data.jobId);


    } catch (err: any) {

      setError(
        err.response?.data?.message ??
        "Upload failed. Check project and file.",
      );

    } finally {

      setLoading(false);

    }

  };




  const resetForm = () => {

    setJobId(null);
    setJob(null);
    setFile(null);
    setError(null);

  };




  const isRunning =
    job?.status === "queued" ||
    job?.status === "processing";


  const progress =
    job?.totalRows > 0
      ? Math.round(
          (job.processedRows / job.totalRows) * 100,
        )
      : 0;


  const statusLabel = (s: string) => {
    if (s === "completed")  return "Completed";
    if (s === "failed")     return "Failed";
    if (s === "processing") return "Processing...";
    return "Queued";
  };


  const statusClass = (s: string) => {
    if (s === "completed")  return "text-green-600";
    if (s === "failed")     return "text-red-600";
    if (s === "processing") return "text-blue-600";
    return "text-yellow-600";
  };




  return (

    <div className="flex">


      <Sidebar />


      <main className="p-10 flex-1">


        <h1 className="text-3xl font-bold mb-8">

          Import Candidates

        </h1>


        {/* ── Upload form ─────────────────── */}

        <div className="border p-6 mb-8 max-w-xl">


          <div className="flex flex-col gap-4">


            <select
              className="border p-2"
              value={projectId}
              onChange={
                e => setProjectId(e.target.value)
              }
            >

              <option value="">
                Select Project
              </option>

              {
                projects.map(p => (

                  <option key={p.id} value={p.id}>
                    {p.name} — {p.clientName}
                  </option>

                ))
              }

            </select>


            <input
              type="file"
              accept=".xlsx,.xls"
              className="border p-2"
              onChange={
                e =>
                  setFile(
                    e.target.files?.[0] ?? null,
                  )
              }
            />


            <div className="flex gap-2">


              <button
                className="border p-2 font-bold flex-1 disabled:opacity-40"
                disabled={
                  !projectId ||
                  !file      ||
                  loading    ||
                  isRunning
                }
                onClick={startImport}
              >

                {loading ? "Uploading..." : "Start Import"}

              </button>


              {
                job && !isRunning && (

                  <button
                    className="border p-2"
                    onClick={resetForm}
                  >

                    New Import

                  </button>

                )
              }


            </div>


          </div>


          {
            error && (

              <p className="mt-4 text-red-600">

                {error}

              </p>

            )
          }


        </div>


        {/* ── Job status ───────────────────── */}

        {
          job && (

            <div className="border p-6 max-w-xl">


              <h2 className="text-xl font-bold mb-4">

                Import Status

              </h2>


              <p
                className={
                  `font-bold mb-4 ${statusClass(job.status)}`
                }
              >

                {statusLabel(job.status)}

              </p>


              {
                job.totalRows > 0 && (

                  <div className="mb-6">

                    <div className="w-full border h-5 mb-1">

                      <div
                        className="h-5 bg-blue-500 transition-all"
                        style={{
                          width: `${progress}%`,
                        }}
                      />

                    </div>

                    <p className="text-sm">

                      {job.processedRows} / {job.totalRows} rows ({progress}%)

                    </p>

                  </div>

                )
              }


              <table className="w-full border mb-6">

                <tbody>


                  <tr>

                    <td className="border p-2">
                      Total Rows
                    </td>

                    <td className="border p-2 font-bold">
                      {job.totalRows ?? "—"}
                    </td>

                  </tr>


                  <tr>

                    <td className="border p-2">
                      Processed
                    </td>

                    <td className="border p-2 font-bold">
                      {job.processedRows}
                    </td>

                  </tr>


                  <tr>

                    <td className="border p-2 text-green-600">
                      Created
                    </td>

                    <td className="border p-2 font-bold text-green-600">
                      {job.createdCount}
                    </td>

                  </tr>


                  <tr>

                    <td className="border p-2 text-yellow-600">
                      Skipped
                    </td>

                    <td className="border p-2 font-bold text-yellow-600">
                      {job.skippedCount}
                    </td>

                  </tr>


                  <tr>

                    <td className="border p-2 text-red-600">
                      Failed
                    </td>

                    <td className="border p-2 font-bold text-red-600">
                      {job.failedCount}
                    </td>

                  </tr>


                </tbody>

              </table>


              {
                job.errors?.length > 0 && (

                  <div>

                    <h3 className="font-bold mb-2">

                      Errors

                    </h3>

                    <table className="w-full border">

                      <tbody>

                        {
                          job.errors.map(
                            (e: any, i: number) => (

                              <tr key={i}>

                                <td className="border p-2 text-sm text-red-600">
                                  {e.reason}
                                </td>

                              </tr>

                            )
                          )
                        }

                      </tbody>

                    </table>

                  </div>

                )
              }


            </div>

          )
        }


      </main>


    </div>

  );


}
