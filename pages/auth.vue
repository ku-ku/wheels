<template>
    <app-auth-form can-registry
                   v-on:auth="success" 
                   v-on:back="gohome" 
                   v-on:registry="registry"
                   />
</template>
<script>
import AppAuthForm from "app-ext/components/AppAuthForm";
import { settings } from "app-ext/composables/settings";
import { profile, preauth } from "app-ext/composables/profile";

export default {
    components: {
        AppAuthForm
    },
    setup(){
        definePageMeta({
            name: 'auth-page',
            layout: 'empty'            
        });
        useHead({
            title: `Авторизация`
        });
        
        preauth().then( resp => {
            if (resp.id > 0){
                navigateTo('/');
            }
        });
    },
    computed: {
        names(){
            return settings.names;
        }
    },
    methods: {
        success(){
            setTimeout(()=>{
                navigateTo('/');
            }, 666);
        },
        gohome(){
            navigateTo('/');
        },
        registry(){
            navigateTo('/profile');
        }
    }
}
</script>
