function diff(currents, mutations) {
    return Object.keys(mutations).map(k => {
        const newItem = mutations[k];
        const oldItem = currents[k];

        if (!avalible(newItem)) {
            console.warn(`You should not set undefined, null or function into data. key name:${k}`);
            return
        }

        if (!avalible(oldItem)) {
            return {
                path: k,
                type: 'cover',
                value: newItem,
            }
        }

        if (type(newItem) === type(oldItem)) {
            let ret = {};
            switch (type(newItem)) {
                case 'object':
                    ret = objectDiffs(oldItem, newItem, k);
                    return {
                        path: k,
                        type: ret.op,
                        value: ret.data,
                    }
                case 'array':
                    ret = arrayDiffs(oldItem, newItem, k);
                    return {
                        path: k,
                        type: ret.op,
                        value: ret.data,
                    }
                default:
                    if (newItem !== oldItem) {
                        return {
                            path: k,
                            type: 'cover',
                            value: newItem,
                        }
                    }
            }
        }
        else {
            console.warn(`You'd better not to change the type of data. key name:${k}, previous data type:${type(oldItem)}, current data type:${type(newItem)}`);
            return {
                path: k,
                type: 'cover',
                value: newItem,
            }
        }
    })
        .filter(o => o !== undefined)
        .reduce((total, info) => {
            if(info.type === 'cover') {
                total[info.path] = info.value
            } else if(info.type === 'update') {
                Object.assign(total, info.value)
            }
            return total
        }, {})
}

function arrayDiffs(pre, cur, path = '') {
    const diffs = {};
    if (pre.length > cur.length) {
        return {
            op: 'cover',
            data: cur
        }
    }
    for (let i = cur.length - 1; i >= 0; i--) {
        const newItem = cur[i];
        const oldItem = pre[i];

        if (!avalible(newItem)) {
            console.warn(`You should not set undefined, null or function into data. key name:${i}`);
            continue
        }

        if (!avalible(oldItem)) {
            diffs[`${path}[${i}]`] = newItem
        }

        if (type(oldItem) === type(newItem)) {
            let ret = {};
            switch (type(oldItem)) {
                case 'object':
                    ret = objectDiffs(oldItem, newItem, `${path}[${i}]`);
                    if (ret.op === 'cover') {
                        diffs[`${path}[${i}]`] = ret.data;
                    }
                    else if (ret.op === 'update') {
                        Object.assign(diffs, ret.data)
                    }
                    break;
                case 'array':
                    ret = arrayDiffs(oldItem, newItem, `${path}[${i}]`);
                    if (ret.op === 'cover') {
                        diffs[`${path}[${i}]`] = ret.data;
                    }
                    else if (ret.op === 'update') {
                        Object.assign(diffs, ret.data)
                    }
                    break;
                default:
                    if (oldItem !== newItem) {
                        diffs[`${path}[${i}]`] = newItem
                    }
            }
        }
        else {
            diffs[`${path}[${i}]`] = newItem
        }
    }

    return {
        op: 'update',
        data: diffs
    }
}

function objectDiffs(pre, cur, path = '') {
    const diffs = {};

    const preKeys = Object.keys(pre);
    const curKeys = Object.keys(cur);
    let someKeysCounter = 0;

    for (let i = 0, l = preKeys.length; i < l; i++) {
        const key = preKeys[i];

        if (!cur.hasOwnProperty(key)) {
            //删除旧对象的 key ,直接返回新对象
            return {
                op: 'cover',
                data: cur
            }
        }
        else {
            someKeysCounter ++;
            const newItem = cur[key];
            const oldItem = pre[key];
            if (!avalible(newItem)) {
                //不合法，跳过
                console.warn(`You should not set undefined, null or function into data. key name:${key}`);
                continue;
            }
            if(!avalible(oldItem)) {
                diffs[`${path}.${key}`] = newItem;
                continue
            }

            if(type(newItem) === type(oldItem)) {
                let ret = {};
                switch(type(newItem)) {
                    case 'array':
                        ret = arrayDiffs(oldItem, newItem, `${path}.${key}`);
                        if(ret.op === 'cover') {
                            diffs[`${path}.${key}`] = ret.data;
                        } else if(ret.op === 'update') {
                            Object.assign(diffs, ret.data)
                        }
                        break;
                    case 'object': 
                        ret = objectDiffs(oldItem, newItem, `${path}.${key}`);
                        if(ret.op === 'cover') {
                            diffs[`${path}.${key}`] = ret.data;
                        } else if(ret.op === 'update') {
                            Object.assign(diffs, ret.data)
                        }
                        break;
                    default: 
                        if(newItem !== oldItem) {
                            diffs[`${path}.${key}`] = newItem;
                        }
                }
            }
            else {
                diffs[`${path}.${key}`] = newItem;
            }
        }
    }

    if(someKeysCounter < curKeys.length) {
        for(let i = 0; i < curKeys.length; i++) {
            const key = curKeys[i];
            const val = cur[key];
            if(!pre.hasOwnProperty(key)) {
                if(avalible(val)) {
                    diffs[`${path}.${key}`] = val
                } else {
                    console.warn(`You should not set undefined, null or function into data. key name:${path}.${key}`);
                }
            }
        }
    }

    return {
        op: 'update',
        data: diffs
    }
}

function type(val) {
    if (typeof val === 'object') {
        if (val === null) {
            return 'null';
        } else if (Array.isArray(val)) {
            return 'array';
        } else {
            return 'object';
        }
    } else {
        return typeof val;
    }
}

function avalible(val) {
    return val !== undefined && val !== null && typeof val !== 'function'
}


export default diff