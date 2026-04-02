import axios from 'axios'
import api from '../services/api'

/**
 * Saves all data passed into the data param into the character creation pinia store
 * @param {'*'} data the data to save to the pinia store
 */
export function savePageData(data) {
    for(item of data) {
        store.setCharacterState()
    }
}

/**
 * Fetch relevant API data using the provided path
 * @param path the path for specifying which data to fetch from the api
 */
export async function fetchApiData(path) {
    try {
        const response = await axios.get(`http://localhost:5262/${path}`)
        return response.data
    } catch (error) {
        console.error("Failed to fetch API data: ", error)
    }
}

/**
 * Populates arr with the fetched data from the api
 * @param arr the v-model array to populate
 * @param data the fetched data
 */
export function setCharCreateArrayData(arr, data) {
    for(let i = 0; i < data.length; i++) {
        if(!arr.value.includes(data[i].name)) { // prevent duplicates
            arr.value.push(data[i].name)
        }
    }
}

export async function updateCharacter(characterId, characterData, userId){
    try {
        const payload = {characterData, user_id: userId}
        const response = await axios.put(`/api/character/${characterId}`, payload);
        console.log("created character successfully: ",response.data );
        return response.data;
    } catch (error) {
        console.error("Failed to post API data: ", error)
    }
}

export async function createNewCharacter(characterData, userId, characterId){
    try {
        const payload = {...characterData, user_id: userId, character_id: characterId};
        console.log(payload)
        console.log(typeof payload)
        for(const key in payload) {
            console.log(key, typeof payload[key])
        }
        const response = await api.post("/api/character", payload);
        console.log("created character successfully: ",response.data );
        return response.data;
    } catch (error) {
        console.error("Failed to post API data: ", error)
    }
}