import { defineStore } from 'pinia'

export const useNavbarStore = defineStore('navbar', {
    state: () => ({useNavbar: true}),
    getters: {
        getUseNavBar() {
            return this.useNavbar
        },
    },
    actions: {
        toggleNavbar() {
            this.useNavbar = !this.useNavbar
        },
    },
})