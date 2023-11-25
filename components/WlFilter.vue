<template>
    <v-dialog v-model="show"
              max-width="720">
        <v-toolbar color="primary"
                   density="compact">
            <v-toolbar-title>фильтр заявок</v-toolbar-title>
            <v-spacer />
            <v-btn size="small" icon="mdi-close"
                   flat
                   v-on:click="show = false">
            </v-btn>    
        </v-toolbar>
        <v-card rounded="0"
                :loading="pending">
            <v-card-text>
                <!-- TODO: v-row>
                    <v-col cols="12">
                        <v-autocomplete label="Контрагент"
                                        v-model="filter.company"
                                        clearable
                                        density="compact"
                                        item-title="title"
                                        item-value="id"
                                        :items="refs.contractors">
                        </v-autocomplete>
                    </v-col>
                </v-row-->
                <v-row>
                    <v-col cols="12" sm="6">
                        <v-autocomplete label="Тип ТС"
                                        v-model="filter.vehicle_type"
                                        hide-details
                                        clearable
                                        density="compact"
                                        item-title="title"
                                        item-value="id"
                                        :items="refs.vehicle_types">
                        </v-autocomplete>
                    </v-col>
                    <v-col cols="12" sm="6">
                        <v-autocomplete label="Тип груза"
                                        v-model="filter.cargo_type"
                                        hide-details
                                        clearable
                                        density="compact"
                                        item-title="title"
                                        item-value="id"
                                        :items="refs.cargo_types">
                        </v-autocomplete>
                    </v-col>
                </v-row>
                <v-row align="center">
                    <v-col cols="auto">
                        <v-checkbox label="ближайшие"
                                    hide-details
                                    v-model="filter.near"
                                    v-on:update:modelValue="set('near', $event)"></v-checkbox>
                    </v-col>
                    <v-col>
                        <v-text-field :disabled="!filter.near"
                                      v-model="filter.distance"
                                      label="радиус, км" 
                                      style="width:5rem;">
                        </v-text-field>
                    </v-col>
                    <v-col cols="12" class="text-muted pt-0">
                        <v-alert color="amber-lighten-5"
                                 density="compact"
                                 icon="mdi-map-marker-radius-outline">
                            {{ filter.addr }}
                        </v-alert>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions class="justify-end">
                <v-btn size="small" 
                       prepend-icon="mdi-close"
                       variant="tonal"
                       v-on:click="setFilter(false)">сбросить</v-btn>
                <v-btn size="small" 
                       variant="elevated"
                       color="primary"
                       v-on:click="setFilter(true)">установить</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script setup>
    import { useDisplay } from 'vuetify';    
    import { all } from "~/composables/orders";
    import { refs as getrefs } from "~/services/refs";
    import { geo } from "app-ext/composables/geo";
    
    const show = ref(false);
    
    const filter = ref({...all.filter});
    filter.value.addr = null;
    
    const refs = ref({
        /*contractors: [],*/
        cargo_types: [],
        vehicle_types: []
    });
    
    function has(q){
        switch(q){
            case "mobile":
                return useDisplay().mobile;
        }
        return false;
    };
    
    function set(q, val){
        switch(q){
            case "near":
                if ( val ){
                    if (!filter.value.distance){
                        filter.value.distance = 15;
                    }
                } else {
                    filter.value.distance = null;
                }
                break;
        }
    }
    
    useAsyncData('address',  ()=>{
        if (!show.value){
            return;
        }
        
        geo.current().then( res => {
            filter.value.addr = `ш/д: ${ Number(res.latitude).toFixed(4) } / ${ Number(res.longitude).toFixed(4) }`;
            geo.addr(res).then( a => {
                filter.value.addr = (res.fine) ? a.display_name : `${ a.address.state||'' }, ${ a.address.city||'' }`;
            }).catch( e => {
                console.log('ERR (addr)', e);
            });
        });
        
    }, {
        watch: [show]
    });
    
    const {data, pending, error} = useAsyncData('references',  ()=>{
        Object.keys(refs.value).forEach( async k => {
            try {
                if ( !(refs.value[k].length > 0) ){
                    refs.value[k] = await getrefs(k);
                }
                console.log(`${ k }:`, refs.value[k]);
            } catch(e){
                console.log(`ERR (refs: ${ k })`, e);
            }
        });
        return true;
    });
    
    function setFilter(isset){
        
        let _filter = unref(filter);
        
        if ( isset ){
            if (_filter.near){
                _filter.coords = geo.coords;
            }
        } else {
            _filter = null;
        }
        all.setFilter( _filter );
        show.value = false;
        console.log('filter', all.filter);
    };

    defineExpose({
        open: ()=>{
            show.value = true;
        }
    });
    
</script>    