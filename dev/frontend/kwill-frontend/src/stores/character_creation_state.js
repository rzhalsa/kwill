/**
 * Pinia store to hold selected character data while creating a character. When a user is finished
 * creating a character, the final character JSON will be populated via this store.
 */

import { defineStore } from 'pinia'

export const useCharacterCreationStore = defineStore('character_creation', {
    state: () => ({
        // Map which holds the state of the currently created character in key-value pairs
        character_state: new Map([
            ['name', null],
            ['player', null],
            ['class', null],
            ['race', null],
            ['alignment', null],
            ['background', null],
            ['ability.strength.modifier.score', null],
            ['ability.dexterity.modifier.score', null],
            ['ability.constitution.modifier.score', null],
            ['ability.wisdom.modifier.score', null],
            ['ability.intelligence.modifier.score', null],
            ['ability.charisma.modifier.score', null],
            ['age', null],
            ['height', null],
            ['weight', null],
            ['eyes', null],
            ['hair', null],
            ['skin', null]
        ])
        
    }),
    getters: {
        /**
         * Returns the current character state map
         * @returns the current character state map
         */
        getCharacterState() {
            return this.character_state
        }
    },
    actions: {
        /**
         * Sets the value at key
         * @param key the key to set the value at
         * @param value the value to set
         */
        setCharacterState(key, value) {
            this.character_state.set(key, value)
        },
        /**
         * Resets all values in the character state map
         */
        resetStore() {
            for(key in this.character_state) {
                this.character_state.set(key, null)
            }
        }
    }
})