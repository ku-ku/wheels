<template>
    <teleport to="#ar-title" v-if="isMounted">
        <template v-if="getprofile('has-subject')">
            <v-icon>mdi-account-edit-outline</v-icon>&nbsp;Профиль
        </template>
        <template v-else>
            <v-icon>mdi-account-plus-outline</v-icon>&nbsp;Регистрация
        </template>    
    </teleport>
    <v-form ref="form"
            fast-fail
            v-on:submit.stop.prevent="save">
        <v-card class="wl-profile">
            <v-tabs v-model="tab"
                    density="compact">
                <v-tab value="0">Основные</v-tab>
                <v-tab value="1">Документы</v-tab>
            </v-tabs>
            <v-card-text>
                <v-window v-model="tab">
                    <v-window-item value="0" class="v-container">
                        <v-row dense>
                            <v-col cols="6" sm="4">
                                <jet-input-string label="ИНН"
                                                  v-model="user.inn"
                                                  type="text"
                                                  name="inn"
                                                  required
                                                  v-on:update:modelValue="changeInn">
                                </jet-input-string>
                            </v-col>
                            <v-col cols="12" sm="8">
                                <jet-input-string label="Организация/ИП"
                                                  v-model="user.org"
                                                  type="text"
                                                  name="org"
                                                  required>
                                </jet-input-string>
                            </v-col>
                        </v-row>
                        <v-row dense>
                            <v-col cols="12" sm="4">
                                <jet-input-string label="Телефон"
                                                  v-model="user.phone"
                                                  type="tel"
                                                  name="phone"
                                                  hint="номер 11 цифр"
                                                  required
                                                  counter>
                                </jet-input-string>
                            </v-col>
                            <v-col cols="12" sm="8">
                                <jet-input-string label="Имя"
                                                  v-model="user.name"
                                                  type="text"
                                                  name="name"
                                                  required>
                                </jet-input-string>
                            </v-col>
                        </v-row>
                        <v-row dense>
                            <v-col cols="12">
                                <v-autocomplete v-model="user.vehicle_types"
                                                :items="vehicle_types"
                                                chips
                                                closable-chips
                                                item-title="title"
                                                item-value="id"
                                                label="типы ТС"
                                                multiple>
                                    <template v-slot:chip="{ props, item }">
                                        <v-chip v-bind="props"
                                            :text="item.raw.name">
                                        </v-chip>
                                    </template>
                                </v-autocomplete>
                            </v-col>
                        </v-row>    
                        <v-row dense v-if="getprofile('has-subject')">
                            <v-col cols="6">
                                <jet-input-string label="код"
                                                  type="password"
                                                  name="c1"
                                                  v-model="user.c1">
                                </jet-input-string>
                            </v-col>
                            <v-col cols="6">
                                <jet-input-string label="код (повторно)"
                                                  type="password"
                                                  name="c2"
                                                  v-model="user.c2">
                                </jet-input-string>
                            </v-col>
                        </v-row>
                        <v-row dense>
                            <v-col cols="12">
                                <jet-input-string label="Комментарий"
                                                  v-model="user.comment"
                                                  type="text"
                                                  name="comment">
                                </jet-input-string>
                            </v-col>
                        </v-row>
                        <v-row dense>
                            <v-col cols="12">
                                <v-checkbox v-model="user.agree"
                                            hide-details>
                                    <template v-slot:label>
                                        <div class="wl-profile__agree">
                                            Отправляя данные, Вы соглашаетесь с 
                                            <a href="https://web.arnod.ru/privacy/" target="_blank">
                                                политикой конфиденциальности и правилами использования приложения
                                            </a>
                                        </div>    
                                    </template>
                                </v-checkbox>
                            </v-col>
                        </v-row>
                        <template v-if="!getprofile('has-subject')">
                            <v-alert v-if="!user.fb_token"
                                     icon="mdi-alert">
                                Вы не получите подтверждение регистрации, поскольку запрещены уведомления
                            </v-alert>
                        </template>
                    </v-window-item>
                    <v-window-item value="1" class="v-container">
                        <v-row>
                            <v-col cols="12">
                                <jet-input-blob label="Паспорт (стр.1-2)"
                                                type="file"
                                                name="pasp1"
                                                v-model="user.pasp1"></jet-input-blob>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12">
                                <jet-input-blob label="Паспорт (стр.5)"
                                                type="file"
                                                name="pasp5"
                                                v-model="user.pasp5"></jet-input-blob>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12">
                                <jet-input-blob label="водительское удостоверение"
                                                type="file"
                                                name="lic"
                                                v-model="user.lic"></jet-input-blob>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12">
                                <jet-input-blob label="СТС"
                                                type="file"
                                                name="sts"
                                                v-model="user.sts"></jet-input-blob>
                            </v-col>
                        </v-row>
                    </v-window-item>
                </v-window>
            </v-card-text>
            <v-card-actions class="justify-end">
                <v-btn size="small"
                       prepend-icon="mdi-chevron-left"
                       variant="tonal"
                       to="/">вернуться</v-btn>
                <v-btn type="submit"
                       size="small"
                       variant="elevated"
                       :loading="pending"
                       :color="getprofile('has-subject') ? 'primary' : 'orange'">сохранить</v-btn>
            </v-card-actions>
        </v-card>
    </v-form>    
</template>
<script setup>
    import { ref, onMounted } from "vue";
    import { empty } from "app-ext/utils";
    import JetInputString from "app-ext/components/editors/JetInputString";
    import JetInputBlob from "app-ext/components/editors/JetInputBlob";
    import { profile, get as getprofile } from "app-ext/composables/profile";
    import { refs as getrefs } from "~/services/refs";
    import { all } from "~/composables/orders";
    
    const form= ref(null),
          tab = ref(0),
          isMounted = ref(false),
          pending   = ref(false),
          vehicle_types = ref([]);
  

    const user = ref({
        id:   0,
        org:  null,
        name: null,
        phone:  null,
        inn:    null,
        vehicle_types: [],
        c1:    null,
        c2:    null,
        agree: false,
        pasp1: null,
        pasp5: null,
        lic:   null,
        sts:   null,
        fb_token: computed(()=>{
            const {public: config} = useRuntimeConfig();
            return config.fb_token;
        })
    });
    
    if ( getprofile("has-subject") ){
        user.value.id   = profile.subject.id;
        user.value.org  = profile.subject.tenant?.title;
        user.value.name = profile.subject.name;
        user.value.phone= profile.subject.phone;
        user.value.c1   = "stub";
        user.value.c2   = "stub";
        user.value.agree = true;
    }
    
    onMounted(()=>{ 
        isMounted.value = true; 
        $("input[name=inn]").focus();
    });
    
    try {
        vehicle_types.value = await getrefs("vehicle_types");
    } catch(e) {
        console.log('ERR (vehicle_types)', e);
    }
    
    function changeInn(val){
        if ( 
                empty(val)
            || (val.length < 9)
            || !empty(user.value.org)
           ){
           return;
        }
        
        const token = '552b15ee51ba61b10624d3009bf6bac764842df2'; //TODO: to conf
        $.ajax({
                url: `https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party?query=${ val }`,
                crossDomain: true,
                headers: {
                    Accept: 'application/json',
                    Authorization: 'Token ' + token
                }
        }).then(res => {
            let suggestion = null;
            if (res.suggestions?.length){
                suggestion = res.suggestions.filter(s => {
                    if (s.data?.state?.status){
                        return ('ACTIVE'===s.data.state.status);
                    }
                    return true;
                }).at(0);
            }
            if ( suggestion ){
                user.value.org = suggestion.value;
            }
        });
    };  //changeInn
    
    async function save(){
        let ok = await form.value.validate();
        if (!ok){
            return false;
        }
        if (!/^\+?\d{11}/.test(user.value.phone)){
            $("input[name=phone]").focus();
            $jet.msg({text:`Неверный формат телефона ${user.value.phone || ''}`, color: "warning"});
            return false;
        }
        if (
                getprofile("has-subject")
             && (user.value.c1 !== user.value.c2)
            ){
            $("input[name=c1]").focus();
            $jet.msg({text:"Не совпадают коды авторизации", color: "warning"});
            return false;
        }
        if ( !user.value.agree ){
            $jet.msg({text:"Пожалуйста, подтвердите свое согласие на условия использования приложения", color: "warning"});
            return false;
        }
        
        pending.value = true;
        try {
            let body = new FormData();
            body.append("phone", user.value.phone);
            body.append("tin", user.value.inn);
            
            body.append("attrs", JSON.stringify({
                org:  user.value.org,
                name: user.value.name,
                pw:   user.value.c1,
                vehicle_types: user.value.vehicle_types
            }));
            if ( !empty(user.value.fb_token) ){
                body.append("firebase_token", user.value.fb_token);
            }
            
            if ( !empty(user.value.comment) ){
                body.append("comment", user.value.comment);
            }
            if ( user.value.pasp1 && (user.value.pasp1 instanceof File)){
                body.append("passport-1", user.value.pasp1);
            }    
            if ( user.value.pasp5 && (user.value.pasp5 instanceof File)){
                body.append("passport-5", user.value.pasp5);
            }
            if ( user.value.lic && (user.value.lic instanceof File)){
                body.append("license", user.value.lic);
            }
            if ( user.value.sts && (user.value.sts instanceof File)){
                body.append("vehicle", user.value.sts);
            }
                
            let res = await $jet.api({
                url: '/public/register',
                method: 'POST',
                body
            });
            if ( res.success ){
                user.value.id = res.result.id;
                if ( getprofile("has-subject") ){
                    
                } else {
                    $jet.msg({
                                text: 'Заявка на регистрацию успешно отправлена. В ближайшее время мы созвонимся с Вами по указанному номеру.', 
                                color: "primary",
                                timeout: 20000
                            });
                }
            }
            all.setFilter({
                vehicle_type: user.value.vehicle_types
            });
            
            console.log('register', res);
            if (    
                    getprofile("has-subject")
               &&  ('stub' !== user.value.c1)
            ) {
                res = await $jet.api({
                    url: '/auth/code/reset/self',
                    method: 'POST',
                    body: {
                        new_code: user.value.c1
                    }
                });
                console.log('set code', res);
                if (res.success){
                    $jet.msg({
                                text: 'Новый код авторизации установлен успешно!', 
                                color: "primary",
                                timeout: 20000
                            });
                }
            }
            ok = true;
        } catch(e){
            console.log('ERR (save)', e)
            ok = false;
            $jet.msg({
                        text: `Ошибка сохранения изменений.<br /><small>Информация для техподдержки: ${ e.message } ${$jet.api.$errm}`, 
                        color: "warning",
                        timeout: 20000
                    });
        } finally {
            pending.value = false;
            if ( ok ){
                navigateTo("/");
            }
        }
        
        return false;
    };   //save
</script>
<style lang="scss">
    .wl-profile{
        &__agree{
            font-size: 0.9rem;
            line-height: 1.125;
            a {color: unset};
        }
        & .v-row:has(.wl-profile__agree){
            border-top: 1px solid #eee;
        }
    }
</style>