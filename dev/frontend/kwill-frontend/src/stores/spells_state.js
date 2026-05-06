import { defineStore } from 'pinia'

export const useSpellDialogStore = defineStore('spellDialog', {
  state: () => ({
    spells: [],  // selected/imported spells
    showImport: false, // dialog visibility
    level: null, // which level we're working with
    showFeatImport: false,
    features: [],
  })
})