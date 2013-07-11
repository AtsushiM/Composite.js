// vars
var TRUE = true,
    FALSE = false,
    class_initializing = FALSE,
    class_fnTest = /0/.test(function() {
        0;
    }) ? /\b_super\b/ : /.*/,
    Class = function() {};

// util
function is(key, vars) {
    return Object.prototype.toString.call(vars) == '[object ' + key + ']' ?
               TRUE : FALSE;
}
// function isObject(vars) {
//     return is('Object', vars);
// }
// function isNumber(vars) {
//     return is('Number', vars);
// }
function isString(vars) {
    return is('String', vars);
}
function isFunction(vars) {
    return is('Function', vars);
}
// function isBoolean(vars) {
//     return is('Boolean', vars);
// }
// function isArray(vars) {
//     return is('Array', vars);
// }
// function isDefined(vars) {
//     return vars === void 0 ? FALSE : TRUE;
// }

function deleteArrayKey(ary, no) {
    ary.splice(no, 1);
}
function toArray(obj/* varless */, ary) {
    /* var ary = []; */
    ary = [];

    ary.push.apply(ary, obj);

    return ary;
}

// Class
Class['extend'] = function(props/* varless */, SuperClass, i) {
    // var SuperClass = this,
    //     i;
    SuperClass = this;

    function Class() {
        if (!class_initializing && this['init']) {
            this['init'].apply(this, arguments);
        }
    }

    class_initializing = TRUE;
    Class.prototype = new SuperClass();
    class_initializing = FALSE;

    Class.prototype['constructor'] = Class;

    for (i in props) {
        if (props.hasOwnProperty(i)) {
            addMethod(i);
        }
    }

    function addMethod(key) {
        var prop = props[key],
            _super = SuperClass.prototype[key],
            isMethodOverride = (
                isFunction(prop) &&
                isFunction(_super) &&
                class_fnTest.test(prop)
            );

        if (isMethodOverride) {
            Class.prototype[key] = function() {
                var that = this,
                    ret,
                    tmp = that['_super'];

                that['_super'] = _super;

                ret = prop.apply(that, arguments);

                that['_super'] = tmp;

                return ret;
            };
        }
        else {
            Class.prototype[key] = prop;
        }
    }

    Class['extend'] = SuperClass['extend'];

    return Class;
};

function Observer_removeChildExe(childs, i) {
    delete childs[i]._parentObserver;
    deleteArrayKey(childs, i);
}
function Observer_bubble() {
    var that = this,
        args = arguments,
        temp = that['only'].apply(that, args);

    if (FALSE !== temp && !(temp || {})._flgStopPropagation) {
        /* that._parentFire.apply(that, args); */
        temp = this._parentObserver;

        if (temp) {
            temp['bubble'].apply(temp, args);
        }
    }
}
function Observer_preventDefault() {
    this._flgPreventDefault = TRUE;
}
function Observer_stopPropagation() {
    this._flgStopPropagation = TRUE;
}
function Observer_event(that, args /* varless */, e) {
    e = args[0];

    if (isString(e)) {
        e = {
            'type': e,
            'arguments': args,
            _flgPreventDefault: FALSE,
            _flgStopPropagation: FALSE,
            'preventDefault': Observer_preventDefault,
            'stopPropagation': Observer_stopPropagation
        };
    }

    e['before'] = e['target'];
    e['target'] = that;

    return e;
}

// Composite
Composite = Class['extend']({
    'dispose': function(/* varless */ that, i, temp) {
        that = this;

        that['removeChild']();

        for (i in that) {
            temp = that[i];

            if (temp && temp['dispose']) {
                temp['dispose']();
            }
        }

        that['__proto__'] = null;

        for (i in that) {
            that[i] = null;
            delete that[i];
        }
    },
    'init': function() {
        this._observed = {};
        this._childs = [];
    },
    'on': function(key, func /* varless */, that, observed) {
        that = this;
        observed = that._observed;

        if (!observed[key]) {
            observed[key] = [];
        }

        observed[key].push(func);
    },
    'one': function(key, func /* varless */, that, wrap) {
        /* var that = this; */
        that = this;
        wrap = function(vars) {
            func.apply(that, vars);
            that['off'](key, wrap);
        };

        wrap.original = func;

        that['on'](key, wrap);
    },
    'off': function(key, func /* varless */, that, observed, target, i) {
        // var observed = that._observed,
        //     target = observed[key],
        //     i;
        that = this;
        observed = that._observed;

        if (func) {
            target = observed[key];

            if (target) {
                for (i = target.length; i--;) {
                    if (func == target[i] || func == target[i].original) {
                        deleteArrayKey(target, i);

                        if (target.length == 0) {
                            delete observed[key];
                        }

                        return TRUE;
                    }
                }
            }

            return FALSE;
        }

        return delete observed[key];
    },
    'fire': Observer_bubble,
    'bubble': Observer_bubble,
    'capture': function() {
        var that = this,
            args = arguments,
            childs = that._childs,
            i = childs.length,
            temp;

        if (FALSE !== that['only'].apply(that, args)) {
            for (; i--;) {
                temp = childs[i];
                temp['capture'].apply(temp, args);
            }
        }
    },
    'only': function() {
        var args = toArray(arguments),
            e = Observer_event(this, args),
            target = this._observed[e['type']] || [],
            temp,
            i = target.length;

        deleteArrayKey(args, 0);
        args[args.length] = e;

        for (; i--;) {
            temp = target[i];
            if (temp) {
                temp = temp.apply(this, args);

                if (temp === FALSE || e._flgPreventDefault) {
                    return temp;
                }
            }
        }

        return e;
    },
    'addChild': function(instance) {
        if (instance._parentObserver) {
            instance._parentObserver['removeChild'](instance);
        }

        instance._parentObserver = this;
        this._childs.push(instance);
    },
    'removeChild': function(instance) {
        var childs = this._childs,
            i = childs.length;

        if (instance) {
            for (; i--; ) {
                if (childs[i] === instance) {
                    Observer_removeChildExe(childs, i);

                    return;
                }
            }
        }
        else {
            for (; i--; ) {
                Observer_removeChildExe(childs, i);
            }
        }
    }
});
