import { describe, it, expect } from 'vitest'
import { createVuetify } from 'vuetify'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { mount } from '@vue/test-utils'
import Navbar from '../layouts/Navbar.vue'

const vuetify = createVuetify()
const pinia = createPinia()
const router = createRouter({
    history: createWebHistory(),
    routes: []
})

/**
 * Navbar.test.js
 * 
 * CI test for the frontend which tests that the Navbar layout is rendering correctly
 */

describe('Navbar', () => {
    it('renders properly', () => {
        const wrapper = mount(Navbar, {
            global: {
                plugins: [vuetify, pinia, router]
            }
        })
        expect(wrapper.text()).toContain('Menu')
    })
})