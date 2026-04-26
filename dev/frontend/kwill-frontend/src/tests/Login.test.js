import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import { createRouter, createWebHistory } from 'vue-router'
import Login from '../pages/Login.vue'

const pinia = createPinia()
const vuetify = createVuetify()
const router = createRouter({
    history: createWebHistory(),
    routes: []
})

/**
 * Login.test.js
 * 
 * CI test for the frontend which tests that the Login page is rendering correctly.
 */

describe('Login', () => {
    it('renders properly', () => {
        const app = createApp(Login)
        app.use(pinia)
        app.use(vuetify)
        app.use(router)

        const wrapper = mount(Login, {
            global: {
                plugins: [pinia, vuetify, router]
            }
        })
        expect(wrapper.text()).toContain('Sign in')
    })
})