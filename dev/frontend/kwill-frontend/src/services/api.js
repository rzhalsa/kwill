import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5262"
});

export default api;