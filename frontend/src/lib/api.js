import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:5000" });

// Roles
export const getRoles = () => api.get("/api/roles").then((r) => r.data);

export const getRole = (id) => api.get(`/api/roles/${id}`).then((r) => r.data);

export const createRole = (data) => api.post("/api/roles", data).then((r) => r.data);

export const updateRole = (id, data) => api.put(`/api/roles/${id}`, data).then((r) => r.data);

export const deleteRole = (id) => api.delete(`/api/roles/${id}`).then((r) => r.data);

export const suggestSkills = (roleId, jobTitle) =>
  api
    .post(`/api/roles/${roleId}/suggest-skills`, { job_title: jobTitle })
    .then((r) => r.data);

// Screening
export const screenResume = (file, jobRoleId) => {
  const fd = new FormData();
  fd.append("resume", file);
  fd.append("job_role_id", jobRoleId);
  return api
    .post("/api/screen", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);
};

export const getCandidates = (roleId) =>
  api
    .get("/api/candidates", { params: roleId ? { role_id: roleId } : {} })
    .then((r) => r.data);

export const getCandidate = (id) => api.get(`/api/candidates/${id}`).then((r) => r.data);

export const getStats = () => api.get("/api/stats").then((r) => r.data);

export default api;
