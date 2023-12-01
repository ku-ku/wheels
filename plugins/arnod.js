import { watch, computed } from "vue";
import arnodApp from "app-ext";
import { profile, preauth } from "app-ext/composables/profile";
import { settings } from "app-ext/composables/settings";
import { geo } from "app-ext/composables/geo";

import { initializeApp as fb_initializeApp } from "firebase/app";
import { getMessaging as fb_getMessaging, getToken as fb_getToken} from "firebase/messaging";

export default defineNuxtPlugin(nuxtApp => {
    window["$jet"] = nuxtApp;
        
    arnodApp(nuxtApp);
    
    nuxtApp.subject = computed(()=>{
        return profile.subject;
    });
    
    nuxtApp.$settings = settings;
    
    nuxtApp.onsettings = async ()=>{
        if ( !settings.local ){
            return;
        }
        if ( !(profile.subject?.roles?.length > 0) ){
            try {
                let u = await preauth();
                navigateTo('/');
            } catch(e){
                console.log('ERR (preauth)', e);
            }
        }
    };  //onsettings
    
    geo.current();
        
    const {public: config} = useRuntimeConfig();
    
    if (
            !/^(local)+/.test(window.location.host)
          &&( config.YM_ID )
       ){
        nuxtApp.YM_ID = config.YM_ID;
        //Yandex.Metrika counter
        (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
        (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

        ym(config.YM_ID, "init", {
             clickmap:false,
             trackLinks:false,
             accurateTrackBounce:false
        });
        ym(config.YM_ID, 'notBounce');
         //Yandex.Metrika counter 
    };
    
    
    nuxtApp.requestNotify = async ()=>{
        await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        
        Notification.requestPermission().then( perms => {
            if (perms === 'granted') {
                navigator.serviceWorker.ready.then( reg =>{
                    const fbApp = fb_initializeApp(config.FCM);
                    const messaging = fb_getMessaging(fbApp);
                    fb_getToken(messaging, { vapidKey: 'BPQwzfUJXsG54xwEHH9NIAWDhc2R5l0pzLqCzXoy-mPyOSIwEHUL3CTLSf8u0e9YvtvQ5c6Qhxh8jpAwg2IXSvE' }).then( token => {
                        if ( token ) {
                            config.fb_token = token;
                        } else {
                            console.log('No registration token available');
                        }
                    }).catch( err => {
                        console.log('An error occurred while retrieving token. ', err);
                    });
                },
                err => {
                    console.error(`Service worker registration failed: ${err}`);
                }); 
            } else {
                $jet.msg({
                    text: "<i class='mdi mdi-bell-cancel-outline'></i>&nbsp;Для полноценной работы приложения необходимо разрешить получение уведомлений",
                    color: "warning"
                });
            }
        });
    };
    
    nuxtApp.requestNotify();
    
});