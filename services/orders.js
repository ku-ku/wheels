import { phpdate2m } from "app-ext/utils";
import { get as getProfile } from "app-ext/composables/profile";
export async function getavailorders(opts){
    const params = {...opts} || {
        page: 1,
        perPage: 30
    };
    delete params.filter;
    
    params.include = [
          'move_direction',
          'user',
          'contractor',
          'cargo_type',
          'cargo_unit',
          'orders_payments_type',
          'vehicle_types',
          'vehicles_loading_types',
          'vehicles_unloading_types'
        ].join(',');

    if ( !params.my ) {
        params.geo_filter = '';
        params.sort = '-loading_start_date';
        params.filters = {type: 'eq', field: 'status', values: ['OPENED_BIDS']};
        if ( opts?.filter ){
            params.filters = {
                type: 'and',
                values: [
                    {type: 'eq', field: 'status', values: ['OPENED_BIDS']}
                ]
            };
            if (opts.filter.vehicle_type){
                params.filters.values.push({
                    type: 'inside',
                    field: 'vehicle_types',
                    values: [{
                        type: 'eq',
                        field: 'id',
                        values: [opts.filter.vehicle_type]
                    }]
                });
            }
            if (opts.filter.cargo_type){
                params.filters.values.push({
                    type: 'inside',
                    field: 'cargo_type',
                    values: [{
                        type: 'eq',
                        field: 'id',
                        values: [opts.filter.cargo_type]
                    }]
                });
            }

            if (
                    (opts.filter.near)
                 && (Number(opts.filter.distance) > 0)
               ){
                params.geo_filter = `lat:${ opts.filter.coords.latitude },lon:${ opts.filter.coords.longitude },radius:${ opts.filter.distance },unit:km`;
            }
        }   //if ( opts?.filter )...
    }
    
    let url = (!!params.my) ? '/organizations_order/own'
                            : getProfile("has-subject") ? '/orders/own/filtered' : '/public/orders/filtered';
    
    const res = await $jet.api({
        url,
        method: !!params.my ? 'GET' : 'POST',
        body:   !!params.my ? undefined : params,
        params: !!params.my ? {
                                    page: params.page,
                                    perPage: params.perPage
                              }
                            : undefined
    });
    if (res.success){
        res.result.items.forEach( i => {
            i.start = phpdate2m(i.loading_start_date);
            i.end   = phpdate2m(i.unloading_end_date);
            i.period= `${ i.start.format('DD.MM') } - ${ i.end.format('DD.MM') }`;
        });
        return res.result;
    } else {
        throw res.error;
    }
};  //getavailorders