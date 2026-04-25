import axios from 'axios'
import api from '../services/api'

/**
 * Saves all data passed into the data param into the character creation pinia store
 * @param {'*'} data the data to save to the pinia store
 */
export function savePageData(data) {
    for(const [key, value] of data) {
        store.setCharacterState(key, value)
    }
}

/**
 * Fetch relevant API data using the provided path
 * @param path the path for specifying which data to fetch from the api
 */
export async function fetchApiData(path) {
    try {
        const response = await api.get(`${path}`)
        return response.data
    } catch (error) {
        console.error("Failed to fetch API data: ", error)
    }
}

/**
 * Populates arr with the fetched data from the api
 * @param arr the v-model array to populate
 * @param data the fetched data
 * @param only_name bool flag on whether to just copy the name or entire json data
 */
export function setCharCreateArrayData(arr, data, only_name) {
    for(let i = 0; i < data.length; i++) {
        if(!arr.value.includes(data[i].name)) { // prevent duplicates
            if(only_name) {
                arr.value.push(data[i].name)
            } else {
                arr.value.push(data[i])
            }
        }
    }
}

export async function updateCharacter(characterId, characterData, userId){
    try {
        const payload = {characterData, userid: userId}
        const response = await axios.put(`/api/character/${characterId}`, payload);
        console.log("created character successfully: ",response.data );
        return response.data;
    } catch (error) {
        console.error("Failed to post API data: ", error)
    }
}

export async function createNewCharacter(characterData, userId, characterId){
    try {
        const payload = {...characterData, userid: userId, characterid: characterId};
        console.log(payload)
        const response = await api.post("/api/character", payload);
        console.log("created character successfully: ", response.data );
        return response.data;
    } catch (error) {
        console.error("Failed to post API data: ", error)
    }
}