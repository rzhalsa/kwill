/**
 * Pinia store to hold selected character data while creating a character. When a user is finished
 * creating a character, the final character JSON will be populated via this store.
 */

import { defineStore } from 'pinia'

export const useCharacterCreationStore = defineStore('character_creation', {
    state: () => ({
        character_name: '',
        player_name: '',
        class: '',
        race: '',
        alignment: '',
        background: '',
        str: null,
        dex: null,
        con: null,
        wis: null,
        int: null,
        cha: null
    }),
    getters: {
        getCharacterName() {
            return this.character_name
        },
        getPlayerName() {
            return this.player_name
        },
        getClass() {
            return this.class
        },
        getRace() {
            return this.race
        },
        getAlignment() {
            return this.alignment
        },
        getBackground() {
            return this.background
        },
        getStr() {
            return this.str
        },
        getDex() {
            return this.dex
        },
        getCon() {
            return this.con
        },
        getWis() {
            return this.wis
        },
        getInt() {
            return this.int
        },
        getCha() {
            return this.cha
        }
    },
    actions: {
        setCharacterName(name) {
            this.character_name = name
        },
        setPlayerName(name) {
            this.player_name = name
        },
        setClass(class_name) {
           this.class = class_name
        },
        setRace(race) {
            this.race = race
        },
        setAlignment(alignment) {
            this.alignment = alignment
        },
        setBackground(background) {
            this.background = background
        },
        setStr(str) {
            this.str = str
        },
        setDex(dex) {
            this.dex = dex
        },
        setCon(con) {
            this.con = con
        },
        setWis(wis) {
            this.wis = wis
        },
        setInt(int) {
            this.int = int
        },
        setCha(cha) {
            this.cha = cha
        },
        resetStore() {
            this.character_name = ''
            this.player_name = ''
            this.class = ''
            this.race = ''
            this.alignment = ''
            this.background = ''
            this.str = null
            this.dex = null
            this.con = null
            this.wis = null
            this.int = null
            this.cha = null
        }
    }
})