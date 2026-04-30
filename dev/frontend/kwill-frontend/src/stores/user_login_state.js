import { defineStore } from 'pinia'
import api from '../services/api'

export const useAuthStore = defineStore('auth', {
    state:() =>({
        token: null,
        user: null,
        showLogin:false
    }),
    getters:{
        isAuthenticated: (state) => !!state.token
    },
    actions: {
        async initializeAuth() {
            const token = localStorage.getItem("token");
            if (!token) return;
            this.token = token;
            try {
                const res = await api.get("/api/auth/me");
                this.user = res.data;
            } catch (err) {
                console.log("Invalid token");
                this.logout();
            }
        },
        setToken(token){
            this.token = token;
        },
        setUser(user){
            this.user = user;
        },
        logout(){
            this.token = null,
            this.user = null,
            localStorage.removeItem("token");
            delete api.defaults.headers.common["Authorization"];
            this.showLogin=true;
        }
    }
});