const _REFS = {
    contractors: {
        url: '/public/refs/contractors',
        columns: 'id,title'
    },
    cargo_types: {
        url: '/public/refs/cargo_type',
        columns: 'id,title'
    },
    vehicle_types: {
        url: '/public/refs/vehicle_type',
        columns: 'id,title'
    }
};

export async function refs(q, params = null){
    const r = _REFS[q];
    if ( r ) {
        var params = Object.assign({perPage: -1, columns: r.columns}, params || {});
        const res = await $jet.api({
            url: r.url,
            key: q,
            params
        });
        if (res.success){
            return res.result.items;
        } else {
            throw {message: res.error};
        }
    }
    return null;
};   //refs
