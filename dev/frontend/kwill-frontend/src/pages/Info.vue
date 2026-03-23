<template>

</template>
<script setup>
    import {ref, onMounted} from "vue";
    import api from '../services/api';

    const srdData = ref([]);
    const loading = ref(true);
    const error =ref(null);

    const fetchSrdData = async () =>{
        try{
            const response =  await api.get("/api/srd/all");
            srdData.value = response.data;
            console.log(srdData.value);
        }catch(err)
        {
            console.error("error fetching srd data:", err);
            error.value ="Failed to load SRD data"
        }
    }

    onMounted(() =>
    {
        fetchSrdData();
    })
</script>