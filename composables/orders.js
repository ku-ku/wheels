import { reactive, computed } from "vue";
import { getavailorders } from "~/services/orders";
import { settings, save as saveSettings } from "app-ext/composables/settings";

let _my = ref(false);

export const all = reactive({
    order: null,
    my:    computed({
        get: ()=>{
            return _my.value;
        },
        set: val => {
            _my.value = val;
            all._reset();
        }
    }),
    filter: {
        /* TODO: company: null,  */
        vehicle_type: null,
        cargo_type: null,
        near: false,
        distance: null,
        coords: null,
        isset: computed(()=>{
            let isset = false;
            Object.keys(all.filter).forEach( k => {
                let val = all.filter[k];
                if ( ("isset" !==k ) && (val) ){
                    if ( Array.isArray(val) && (val.length > 0) ){
                        isset = true;
                    } else {
                        isset = true;
                    }
                }
            });
            return isset;
        })
    },
    _reset: ()=>{
        //reset loaded
        all.orders.total = 0;
        all.orders.page  = 0;
        all.orders.items = [];
        refreshNuxtData('avl-orders');
    },
    setFilter: (filter, only = false) => {
        Object.keys(all.filter).forEach( k => {
            if ("isset" !==k ){
                all.filter[k] = filter ? filter[k] : null;
            }
        });
        if ( !only ){
            let _filter = {...all.filter};
            delete _filter.isset;
            delete _filter.coords;
            saveSettings({filter: JSON.stringify(_filter)});
        }
        all._reset();
    },
    orders: {
        total: 0,
        page:  0,
        complete: computed(()=>{
            return (all.orders.total > 0) && (all.orders.total <= all.orders.items.length);
        }),
        items: []
    },
    load: async ()=>{
        if ( all.orders.complete ){
            return 0;
        }
        all.orders.page++;
        let res = await getavailorders({
                perPage: 10,
                page: all.orders.page,
                filter: all.filter.isset ? all.filter : null,
                my: all.my
        });
        all.orders.total = res.total;
        all.orders.items = all.orders.items.concat(res.items);
        return res.items.length;
    }   //load
});