<template>
    <v-list class="ar-rqss"
            :selected="selected"
            select-strategy="single-independent"
            v-on:update:selected="onsel">
        <template v-for="(o, n) in orders"
                  :key="'o-' + o.id">
            <v-list-item :data-item-id="o.id"
                         class="ar-rq v-container"
                         :value="o.id"
                         v-on:click="click">
                <v-row  align="center">
                    <v-col class="ar-rq__contractor">
                        {{ o.contractor?.title }}
                    </v-col>
                    <v-col cols="auto">
                        <div class="ar-rq__dates">
                            {{ o.number }}
                        </div>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <v-timeline class="ar-rq__trip"
                                    side="end"
                                    align="start"
                                    truncate-line="start"
                                    line-color="secondary">
                            <v-timeline-item size="small"
                                             icon="mdi-truck-fast-outline"
                                             dot-color="secondary">
                                <div class="ar-rq__dt">
                                    <v-icon size="small" color="grey">mdi-download-multiple</v-icon>&nbsp;<b>{{ o.start.format('DD.MM.YYYY') }}</b>
                                </div>
                                <div class="ar-rq__point">
                                    {{ o.move_direction?.loading_point?.title || '' }}
                                    <v-chip v-if="o.loading_distance"
                                            :color="(o.loading_distance > 100) ? 'orange-darken-3' : 'secondary'"
                                            size="small"
                                            label>
                                        ~{{ o.loading_distance }}&nbsp;km
                                    </v-chip>
                                </div>
                            </v-timeline-item>
                            <v-timeline-item dot-color="transparent"
                                             class="ar-rq__value">
                                <template v-slot:icon>
                                    <div class="ar-rq__km">
                                        {{ o.move_direction?.distance }}&nbsp;km
                                    </div>
                                </template>
                                <div class="ar-rq__price" v-if="!!o.is_request_price">
                                    запрос цены
                                </div>
                                <div v-else-if="o.price" class="ar-rq__price">
                                    <v-icon size="x-small">mdi-currency-rub</v-icon>{{ o.price }}
                                    <span v-if="!!o.price_vat">
                                        / {{ o.price_vat }} (с НДС)
                                    </span>
                                    <div class="text-muted">
                                        {{ 0 == o.price_type ? 'за единицу груза' : 'за машину'}}
                                    </div>
                                </div>
                            </v-timeline-item>
                            <v-timeline-item size="small"
                                             icon="mdi-map-marker-outline"
                                             dot-color="primary">
                                <div class="ar-rq__point">
                                    {{ o.move_direction?.unloading_point?.title || '' }}
                                </div>
                                <v-chip label
                                        prepend-icon="mdi-corn"
                                        size="small">
                                    {{ o.cargo_name.title }}
                                </v-chip>    
                                <v-chip label
                                        prepend-icon="mdi-package-variant-closed"
                                        size="small">
                                    {{ o.cargo_type.title }}
                                </v-chip>    
                                <v-chip label
                                        size="small"
                                        v-if="o.cargo_units_count_left > 0">
                                    {{ o.cargo_units_count_left }} ({{ o.cargo_unit.title }})
                                </v-chip>    
                                <v-chip label
                                        size="small"
                                        v-if="o.vehicle_types?.length > 0">
                                    {{ o.vehicle_types.map( t => t.title ).join(" | ") }}
                                </v-chip>    
                                <v-chip label
                                        size="small"
                                        v-if="o.method_of_loading">
                                    {{ o.method_of_loading.title }}
                                </v-chip>    
                                <v-chip label
                                        prepend-icon="mdi-download-multiple"
                                        size="small"
                                        v-if="o.vehicles_loading_types?.length > 0">
                                    {{ o.vehicles_loading_types.map( t => t.title ).join(" | ") }}
                                </v-chip>    
                                <v-chip label
                                        size="small"
                                        prepend-icon="mdi-upload-multiple"
                                        v-if="o.vehicles_unloading_types?.length > 0">
                                    {{ o.vehicles_unloading_types.map( t => t.title ).join(" | ") }}
                                </v-chip>
                                <div class="ar-rq__dt">
                                    <v-icon size="small" color="grey">mdi-upload-multiple</v-icon>&nbsp;<b>{{ o.end.format('DD.MM.YYYY') }}</b>
                                </div>
                            </v-timeline-item>
                        </v-timeline>
                    </v-col>
                </v-row>
                <v-slide-y-transition v-if="o.move_direction?.route">
                    <div class="ar-rq__mapconte" v-if="selected.findIndex( s => s==o.id ) > -1">
                        <ar-map :route="o.move_direction.route" 
                                v-on:distance="ondistance(o, $event)" />
                        <div class="ar-rq__responde">
                            <v-btn color="orange"
                                   variant="elevated"
                                   rounded="0"
                                   v-on:click.stop.prevent="telme(o.user?.phone)">
                                <v-icon>mdi-phone-dial</v-icon>
                            </v-btn>
                            <v-btn variant="elevated"
                                   rounded="0"
                                   color="orange"
                                   append-icon="mdi-hand-wave-outline"
                                   :loading="o.loading"
                                   v-on:click.stop.prevent="respose(o)">откликнуться</v-btn>
                        </div>    
                    </div>
                </v-slide-y-transition>
            </v-list-item>
            <template v-if="(n === orders.length - 1)&&has('needs')">
                <v-skeleton-loader type="list-item-two-line" 
                                   v-intersect="onIntersect" />
            </template>
        </template>
        <template v-if="(0 == orders.length) && !pending">
            <v-alert icon="mdi-alert-outline"
                     class="mt-5"
                     elevation="1"
                     border-color="grey"
                     border="start">По Вашим условиям записей не найдено</v-alert>
        </template>
    </v-list>
</template>
<script setup>
    import { ref, nextTick, onMounted } from "vue";
    import { settings } from "app-ext/composables/settings";
    import { profile, get as getProfile } from "app-ext/composables/profile";
    import { all } from "~/composables/orders";
    import ArMap from "~/components/ArMap";
    import { geo } from "app-ext/composables/geo";

    definePageMeta({
        key: 'index',
        keepalive: true
    });
    
    const selected=ref([]);
 
    const orders = computed(()=> all.orders.items);
    
    function has(q){
        switch(q){
            case 'needs':
                return !all.orders.complete;
        }
    }   //has
    
    watch(selected, ()=>{
        let id = selected.value.at(0)||-1;
        let rq = orders.value.findIndex( o => o.id === id);
        rq = rq > -1 ? orders.value[rq] : null;

        console.log('current', id, rq);
        if (
                (typeof window["ym"] !== "undefined")
             && (rq)
           ){
                ym($jet.YM_ID, 'hit', window.location.href, {title: rq.move_direction?.title});
        }
                
        useSeoMeta({
            title: rq?.move_direction?.title || 'Заявки' 
        });
    });
    useSeoMeta({title: 'Заявки'});
    
    
    const {data, pending, error} = useAsyncData('avl-orders',  async ()=>{
        console.log('loading...');
        let ok = false;
        try {
            await all.load();
            $jet.hint(`${ orders.value.length } из ${ all.orders.total } записей`);
            ok = true;
        } catch(e){
            console.log('ERR (orders)', e);
        }
        return ok;
    });
    
    
    function onIntersect(isIntersecting){
        if (isIntersecting){
            refreshNuxtData('avl-orders');
        }
    };
    
    function _check_user(){
        const ok = getProfile("has-subject");
        if ( !ok ){
            $jet.msg({
                        text: "ВНИМАНИЕ: для отправки откликов на заявки необходимо авторизоваться!",
                        color: "warning",
                        click: ok => {
                            if ( ok ){
                                navigateTo("/auth");
                            }
                        },
                        click_title: "<i class='mdi mdi-login mr-2'></i>авторизоваться"
            });
        }
        return ok;
    }
    
    onMounted(()=>{
        setTimeout(_check_user, 10000);
        if ( !!settings.local?.filter ){
            //TODO: ?
            try {
                let filter = settings.local.filter;
                if (
                        (typeof filter === 'string' || filter instanceof String)
                     && (filter.length > 0)
                   ) {
                    eval(`filter=${filter}`);
                }
                all.setFilter(filter);
            }catch(e){
                console.log('ERR (filter)', e);
            }
        }
    });
    
    function click(e){
        if ( /^(canvas)+/i.test(e.target.nodeName) ){
            e.stopPropagation();
            e.preventDefault();
            return false;
        }
    };
    
    function onsel(val){
        selected.value = [];
        if (val?.length > 0){
            let rq = orders.value.findIndex( o => o.id === val[0]);
            rq = ( rq < 0 ) ? null : orders.value[rq];
            setTimeout(()=>{
                const el = $(`.v-list-item[data-item-id=${ val[0] }]`);
                $([document.documentElement, document.body]).animate({
                    scrollTop: el.offset().top - 64
                }, {
                    duration: 500,
                    done: ()=>{
                        selected.value = val;
                    }
                });
            }, 430);
        }
    };  //onsel
    
    
    function ondistance(rq, distance){
        rq.loading_distance = distance;
        if (rq.loading_distance > 100){
            $jet.msg({text: `ВНИМАНИЕ: расстояние до места погрузки <b>${rq.move_direction.loading_point.title}</b> 
                      <div class="text-center text-h6">~${rq.loading_distance} км.</div>`,
                      timeout: 10000,
                      color: 'yellow-lighten-5'
                  });
        }
    };  //ondistance
    
    async function respose(rq){
        let ok = _check_user();
        if ( !ok ){
            return false;
        }
        
        rq.loading = true;
        try {
            let res = await $jet.api({
                method: 'POST',
                url: '/order_bids',
                body: {
                    orders_id: rq.id,
                    chats_id: null,
                    status: 'AVAILABLE',
                    comment: null,
                }
            });
            if (res.success){
                $jet.msg({
                            text: `<i class="mdi mdi-check-circle-outline"></i>&nbsp;Отклик на заявку №${ rq.number } отправлен успешно!`,
                            color: "primary",
                            timeout: 20000
                        });
            }
        } catch(e){
            console.log('ERR (respose)', e);
            $jet.msg({
                        text: `Не удается отправить отклик на заявку<br /><small>Информация для техподдержки: ${ e.message}  ${$jet.api.$errm}`,
                        color: "warning",
                        timeout: 20000
                    });
        } finally {
            rq.loading = false;
        }

    }   //respose
    
    
    function telme(phone){
        if (phone){
            let ref = document.createElement('a');
            ref.href= `tel:${ phone }`;
            ref.style="display:none";
            document.body.appendChild(ref);
            ref.click();
        } else {
            $jet.msg({
                        text: 'Нет информации о контактных данных по выбранной заявке',
                        color: "warning",
                        timeout: 10000
                    });
        }
    }
</script>
<style lang="scss" >
    .ar-rqss{
        &.v-list{
            background: transparent;
            & .v-list-item{
                font-size: 0.9rem;
                background: #fff;
                margin-bottom: 1rem;
                border: 1px solid #e0e0e0 !important;
                border-radius: 6px;
                line-height: 1.125;
                & .v-row:first-child{
                    padding-top: 1rem;
                    border-bottom: 1px solid #e0e0e0;
                }
                &__overlay{
                    background: #FFF59D !important;
                }
                &--active{
                    & .ar-rq__dates{
                        margin-right: 4px;
                        background-color: #FF9800; /* orange */
                        border-color: #FB8C00;
                        box-shadow: 2px 2px 3px rgba(250,140,0,0.33);
                        color: #fff;
                    }
                }
            }
        }
    }
    
    .v-timeline.ar-rq__trip {
        justify-content: flex-start !important;
        margin-left: -24px;
        &.v-timeline--vertical{
            row-gap: 8px;
        }

        & .v-timeline-item {
            &:first-child{
                & .v-timeline-item__body{
                    min-height: 48px;
                }
            }
            &:last-child{
                & .v-timeline-divider{
                    height: 48px;
                    padding-block-end: 4px;
                }
                
            }
            & .v-timeline-divider__dot:has(.bg-transparent){
                background: transparent !important;
            }
            & .v-chip{
                margin: 0 0.25rem 0.25rem 0;
                & .v-icon{
                    font-size: 0.8rem;
                    color: grey;
                }
            }
        }
    }
    
    
    .ar-rq{
        &__dates, &__km{
            width: fit-content;
            font-size: 0.75rem;
            padding: 0.25rem;
            background: #f2f2f2;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
        }
        &__value {
            width: 100%;
            & .v-timeline-item__body{
                text-align: right;
                padding-inline-end: unset;
                padding-inline-start: unset;
                padding-right: 1rem;
                justify-self: flex-end !important;
            }
        }
        
        & .ar-rq__km{
            transform: rotate(-90deg) translateX(8px);
            border-color: rgba(var(--v-theme-secondary)) !important;
            background: #fff;
        }
        &__contractor{
        }
        &__point{
            whitespace: normal;
        }
        &__meta{
            margin: 0.5rem 0;
            & .v-chip{
                margin-right: 0.25rem;
            }
        }
        &__price{
            text-align: right;
            font-size: 1.25rem;
        }
        &__mapconte{
            height: 320px;
            margin-bottom: 1rem;
            padding-bottom: 16px;
            & .ar-rq__responde {
                display: flex;
                flex-wrap: nowrap;
                align-items: center;
                color: #fff !important;
                margin-top: -8px;
                justify-content: space-evenly;
                & .v-btn {
                    color: #fff !important;
                    &:first-child{
                        width: 48px;
                        margin-right: -2px;
                    }
                    &:last-child{
                        width: calc(100% - 64px);
                        border-left: 0 none !important;
                    }
                }
            }
        }
    }
</style>