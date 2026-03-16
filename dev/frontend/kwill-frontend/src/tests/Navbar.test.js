import { describe, it, expect } from 'vitest'
import { createVuetify } from 'vuetify'
import { mount } from '@vue/test-utils'
import Navbar from '../layouts/Navbar.vue'

const vuetify = createVuetify()

/**
 * Navbar.test.js
 * 
 * CI test for the frontend which tests that the Navbar layout is rendering correctly
 */

describe('Navbar', () => {
    it('renders properly', () => {
        const wrapper = mount(Navbar, {
            global: {
                plugins: [vuetify]
            }
        })
        expect(wrapper.text()).toContain('Menu')
    })
})