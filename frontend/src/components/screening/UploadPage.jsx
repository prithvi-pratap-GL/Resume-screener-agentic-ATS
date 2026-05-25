import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { getRoles, screenResume } from "../../lib/api";
import { useEffect } from "react";
import { Upload, CheckCircle, XCircle, Loader, FileText } from "lucide-react";
import "./UploadPage.css";

function FileItem({ name, status, error }) {
  return (
    <div className="file-item">
      <FileText size={14} />
      <span className="file-name">{name}</span>
      <span className="file-status">
        {status === "pending" && (
          <span className="status-pending">Waiting…</span>
        )}
        {status === "processing" && <Loader size={13} className="spin" />}
        {status === "done" && <CheckCircle size={14} color="#1D9E75" />}
        {status === "error" && (
          <span className="status-error" title={error}>
            <XCircle size={14} color="#E24B4A" />
          </span>
        )}
      </span>
    </div>
  );
}

export default function UploadPage() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [roleId, setRoleId] = useState("");
  const [files, setFiles] = useState([]); // [{file, status, error}]
  const [running, setRunning] = useState(false);

  useEffect(() => {
    getRoles().then((r) => {
      setRoles(r);
      if (r.length) setRoleId(r[0].id);
    });
  }, []);

  const onDrop = useCallback((accepted) => {
    setFiles((prev) => [
      ...prev,
      ...accepted.map((f) => ({ file: f, status: "pending", error: null })),
    ]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
    },
  });

  const handleScreen = async () => {
    if (!roleId || files.length === 0) return;
    setRunning(true);
    for (let i = 0; i < files.length; i++) {
      setFiles((prev) =>
        prev.map((f, idx) => (idx === i ? { ...f, status: "processing" } : f)),
      );
      try {
        await screenResume(files[i].file, roleId);
        setFiles((prev) =>
          prev.map((f, idx) => (idx === i ? { ...f, status: "done" } : f)),
        );
      } catch (e) {
        const msg = e.response?.data?.error || e.message;
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: "error", error: msg } : f,
          ),
        );
      }
    }
    setRunning(false);
  };

  const allDone =
    files.length > 0 &&
    files.every((f) => f.status === "done" || f.status === "error");
  const doneCount = files.filter((f) => f.status === "done").length;

  return (
    <div className="page">
      <div className="topbar">
        <div className="page-title">Upload resumes</div>
      </div>
      <div className="content" style={{ maxWidth: 640 }}>
        <div className="upload-card">
          <div className="field-row">
            <label className="field-label">Screen against role</label>
            <select
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              className="field-select"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
              {roles.length === 0 && (
                <option disabled>No roles yet — create one first</option>
              )}
            </select>
          </div>

          <div
            {...getRootProps()}
            className={`dropzone${isDragActive ? " active" : ""}`}
          >
            <input {...getInputProps()} />
            <Upload size={28} color="#aaa" />
            <div className="drop-title">
              {isDragActive ? "Drop files here…" : "Drag & drop resumes"}
            </div>
            <div className="drop-sub">
              PDF, DOCX, or TXT · multiple files supported
            </div>
            <button type="button" className="btn" style={{ marginTop: 10 }}>
              Browse files
            </button>
          </div>

          {files.length > 0 && (
            <div className="file-list">
              {files.map((f, i) => (
                <FileItem
                  key={i}
                  name={f.file.name}
                  status={f.status}
                  error={f.error}
                />
              ))}
            </div>
          )}

          <div className="upload-actions">
            {allDone ? (
              <button className="btn btn-primary" onClick={() => navigate("/")}>
                <CheckCircle size={14} /> View results ({doneCount} screened)
              </button>
            ) : (
              <button
                className="btn btn-primary"
                disabled={!roleId || files.length === 0 || running}
                onClick={handleScreen}
              >
                {running ? (
                  <>
                    <Loader size={14} className="spin" /> Screening…
                  </>
                ) : (
                  <>
                    <Upload size={14} /> Screen{" "}
                    {files.length > 0
                      ? `${files.length} resume${files.length > 1 ? "s" : ""}`
                      : "resumes"}
                  </>
                )}
              </button>
            )}
            {files.length > 0 && !running && (
              <button className="btn" onClick={() => setFiles([])}>
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
