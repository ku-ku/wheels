<template>
    <v-app>
        <v-main v-bind:class="{'hy-auth': has('auth-page')}">
            <slot />
        </v-main>
    </v-app>
</template>
<script setup>
    const has = q => {
        switch(q){
            case "auth-page":
                return /(auth)+/.test(useRoute().name);
        }
        return false;
    };
</script>
<style lang="scss">
    .hy-auth {
        background-color: #ECEFF1; /*blue-grey-lighten-5 #fff8e1; /*amber-lighten-5*/
    }
</style>