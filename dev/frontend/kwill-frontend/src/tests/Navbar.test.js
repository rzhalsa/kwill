import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Navbar from '../layouts/Navbar.vue'

/**
 * Navbar.test.js
 * 
 * CI test for the frontend which tests that the Navbar layout is rendering correctly
 */

describe('Navbar', () => {
    it('renders properly', () => {
        const wrapper = mount(Navbar)
        expect(wrapper.text()).toContain('Menu')
    })
})