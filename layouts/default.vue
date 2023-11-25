<template>
    <v-app>
        <NuxtLoadingIndicator />
        <v-app-bar elevation="1"
                   density="compact"
                   :color="has('subject') ? 'white' : 'orange-lighten-4'">
            <template v-slot:prepend>
                <v-btn v-if="has('back')"
                       icon="mdi-chevron-left"
                       v-on:click='$router.go(-1)'>
                </v-btn>    
                <v-app-bar-nav-icon v-else
                                    v-on:click.stop="drawer = !drawer">
                </v-app-bar-nav-icon>
                <div class="ar-title" id="ar-title" v-html="title"></div>
            </template>
            <div id="ar-tb__prepend"></div>
            <template v-if="has('subject')">
            </template>
            <div id="ar-tb__append"></div>
            <v-menu>
                <template v-slot:activator="{props}">
                    <v-btn v-show="has('page-index')"
                           flat
                           :icon="has('filter') ? 'mdi-filter-menu' : 'mdi-filter-menu-outline'"
                           size="small"
                           v-bind="props"
                           :color="has('filter') ? 'warning' : 'grey'">
                    </v-btn>
                </template>
                <v-list density="compact" nav>
                    <v-list-item v-show="has('my-requests')"
                                 title="Новые заявки"
                                 prepend-icon="mdi-bookmark-outline"
                                 v-on:click="set('my', false)"></v-list-item>
                    <v-list-item title="Мои заявки"
                                 v-show="!has('my-requests')"
                                 prepend-icon="mdi-bookmark"
                                 v-on:click="set('my', true)"></v-list-item>
                    <v-divider />
                    <v-list-item title="Фильтр..." 
                                 :prepend-icon="has('filter') ? 'mdi-filter-settings' : 'mdi-filter-settings-outline'"
                                 v-on:click="$refs.filter.open()"></v-list-item>
                </v-list>
            </v-menu>    
        </v-app-bar>
        <v-main>
            <v-container :fluid="has('fluid')">
                <NuxtPage />
            </v-container>
            <app-msg />
            <wl-filter ref="filter" />
        </v-main>
        <v-footer app
                  border>
            <div class="jet-hint"></div>
            <v-spacer />
            <v-btn size="x-small"
                   variant="text"
                   icon="mdi-information-variant-circle-outline"
                   href="https://web.arnod.ru/privacy/" 
                   target="_blank"
                   style="margin: -8px 0;">
                       
            </v-btn>
        </v-footer>
        <v-navigation-drawer v-model="drawer"
                             :color="has('subject') ? 'white' : 'orange-lighten-4'"
                             temporary
                             width="25rem">
            <v-list color="primary">
                <template v-if="has('subject')">
                    <v-list-item class="ar-title">
                        <h1>{{ tenant.title }}</h1>
                        <h3>{{ subject.name }}</h3>
                    </v-list-item>
                    <v-list-item prepend-icon="mdi-account-outline"
                                 to="/profile"
                                 title="профиль" />
                </template>
                <template v-else>
                    <v-list-item prepend-icon="mdi-login"
                                 to="/auth"
                                 title="авторизоваться" />
                    <v-list-item prepend-icon="mdi-account-plus-outline"
                                 to="/profile"
                                 title="зарегистрироваться" />
                </template>    
                <v-list-item prepend-icon="mdi-shield-account-outline"
                             title="обработка персональных данных"
                             href="https://web.arnod.ru/privacy/" target="_blank" />
                <v-list-item v-if="has('subject')"
                             prepend-icon="mdi-logout"
                             title="выйти" 
                             v-on:click="logout" />
            </v-list>
      </v-navigation-drawer>
    </v-app>
</template>
<script>
import { default as AppMsg } from "app-ext/components/AppMsg";
import { profile, logout, get as getProfile } from "app-ext/composables/profile";
import { all } from "~/composables/orders";

export default {
    name: 'DefLayout',
    components: {
        AppMsg
    },
    data(){
        return {
            drawer: false
        };
    },
    computed: {
        subject(){
            return profile.subject;
        },
        tenant(){
            return profile.tenant;
        },
        title(){
            return profile.tenant?.title;
        }
    },
    methods: {
        has(q){
            let page = useRoute().name;
            switch(q){
                case "filter":
                    return all.filter.isset;
                case "my-requests":
                    return all.my;
                case "fluid":
                    return false;
                case "page-index":
                    return ("index"===page);
                case "back":
                    return !(/^(index)+/.test(page));
                case "subject":
                    return getProfile("has-subject");
                case "driver":
                    return profile.hasrole("водитель");
            }
            return false;
        },
        set(q, val){
            switch(q){
                case "my":
                    all.my = val;
                    break;
            }
        },
        reload(){
            $jet.isHydrating = false;   //TODO: (?)
        },
        logout(){
            logout();
            reloadNuxtApp();
        }
    }
}
</script>
<style lang="scss">
    .v-footer {
        font-size: 0.75rem;
    }
    .v-toolbar {
        & .ar-title{
            line-height: 1.125;
        }
    }
    .v-navigation-drawer {
        & .v-list{
            padding-top: 0;
            & .ar-title{
                background: rgb(var(--v-theme-primary));
                & h1, & h3{
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    text-align: left;
                    font-size: 1rem;
                    font-weight: 400;
                    color: #fff;
                }
                & h3{
                    font-size: 0.85rem;
                    margin-top: 3rem;
                }
            }
        }
    }
</style>