import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Login from '../pages/Login.vue'

/**
 * Login.test.js
 * 
 * CI test for the frontend which tests that the Login page is rendering correctly.
 */

describe('Login', () => {
    it('renders properly', () => {
        const app = createApp(Login)
        const pinia = createPinia()
        app.use(pinia)

        const wrapper = mount(Login, {
            global: {
                plugins: [pinia]
            }
        })
        expect(wrapper.text()).toContain('Sign in')
    })
})