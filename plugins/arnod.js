import { watch, computed } from "vue";
import arnodApp from "app-ext";
import { profile, preauth } from "app-ext/composables/profile";
import { settings } from "app-ext/composables/settings";
import { geo } from "app-ext/composables/geo";

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
            console.log('profile', profile);
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
    }
    
});