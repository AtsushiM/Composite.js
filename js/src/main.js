// Generated by CoffeeScript 1.6.3
var Class, FALSE, Observer_bubble, Observer_event, Observer_preventDefault, Observer_removeChildExe, Observer_stopPropagation, TRUE, class_fnTest, class_initializing, deleteArrayKey, isFunction, isString, ns, toArray, _is,
  __hasProp = {}.hasOwnProperty;

ns = (function() {
  if (typeof module === 'undefined') {
    return window;
  }
  return module['exports'];
})();

TRUE = true;

FALSE = false;

class_initializing = FALSE;

class_fnTest = /0/.test(function() {
  0;
}) ? /\b_super\b/ : /.*/;

Class = function() {};

_is = function(key, vars) {
  if (Object.prototype.toString.call(vars) === '[object ' + key + ']') {
    return TRUE;
  } else {
    return FALSE;
  }
};

isString = function(vars) {
  return _is('String', vars);
};

isFunction = function(vars) {
  return _is('Function', vars);
};

deleteArrayKey = function(array, key) {
  array.splice(key, 1);
};

toArray = function(obj) {
  var array;
  array = [];
  array.push.apply(array, obj);
  return array;
};

Class['extend'] = function(props) {
  var SuperClass, addMethod, i;
  SuperClass = this;
  Class = function() {
    if (!class_initializing && this['init']) {
      this['init'].apply(this, arguments);
    }
  };
  addMethod = function(key) {
    var isMethodOverride, prop, _super;
    prop = props[key];
    _super = SuperClass.prototype[key];
    isMethodOverride = isFunction(prop) && isFunction(_super) && class_fnTest.test(prop);
    if (isMethodOverride) {
      return Class.prototype[key] = function() {
        var ret, temp;
        temp = this['_super'];
        this['_super'] = _super;
        ret = prop.apply(this, arguments);
        this['_super'] = temp;
        return ret;
      };
    } else {
      Class.prototype[key] = prop;
    }
  };
  class_initializing = TRUE;
  Class.prototype = new SuperClass;
  class_initializing = FALSE;
  Class.prototype['constructor'] = Class;
  for (i in props) {
    if (!__hasProp.call(props, i)) continue;
    addMethod(i);
  }
  Class['extend'] = SuperClass['extend'];
  return Class;
};

Observer_removeChildExe = function(childs, i) {
  delete childs[i]._parentObserver;
  deleteArrayKey(childs, i);
};

Observer_bubble = function() {
  var args, temp;
  args = toArray(arguments || []);
  temp = this['only'].apply(this, args);
  if (FALSE !== temp && !(temp || {})._flgStopPropagation) {
    temp = this._parentObserver;
    if (temp) {
      temp['bubble'].apply(temp, args);
    }
  }
};

Observer_preventDefault = function() {
  return this._flgPreventDefault = TRUE;
};

Observer_stopPropagation = function() {
  return this._flgStopPropagation = TRUE;
};

Observer_event = function(that, args) {
  var e;
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
};

ns['Composite'] = Class['extend']({
  'init': function() {
    this._observed = {};
    return this._childs = [];
  },
  'dispose': function() {
    var i, temp;
    this['removeChild'];
    for (i in this) {
      temp = this[i];
      if (temp && temp['dispose']) {
        temp['dispose'];
      }
    }
    this['__proto__'] = null;
    for (i in this) {
      this[i] = null;
      delete this[i];
    }
  },
  'on': function(key, func) {
    var observed;
    observed = this._observed;
    if (!observed[key]) {
      observed[key] = [];
    }
    observed[key].push(func);
  },
  'one': function(key, func) {
    var that, wrap;
    that = this;
    wrap = function() {
      func.apply(that, arguments);
      that['off'](key, wrap);
    };
    wrap.original = func;
    that['on'](key, wrap);
  },
  'off': function(key, func) {
    var i, observed, target, val, _i;
    observed = this._observed;
    if (func) {
      target = observed[key];
      if (target) {
        for (i = _i = target.length - 1; _i >= 0; i = _i += -1) {
          val = target[i];
          if (func === val || func === val.original) {
            deleteArrayKey(target, i);
            if (target.length === 0) {
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
  'emit': Observer_bubble,
  'bubble': Observer_bubble,
  'capture': function() {
    var args, childs, val, _i;
    args = arguments;
    childs = this._childs;
    if (FALSE !== this['only'].apply(this, args)) {
      for (_i = childs.length - 1; _i >= 0; _i += -1) {
        val = childs[_i];
        val['capture'].apply(val, args);
      }
    }
  },
  'only': function() {
    var args, e, target, val, _i;
    args = toArray(arguments);
    e = Observer_event(this, args);
    target = this._observed[e['type']] || [];
    deleteArrayKey(args, 0);
    args[args.length] = e;
    for (_i = target.length - 1; _i >= 0; _i += -1) {
      val = target[_i];
      if (val) {
        val = val.apply(this, args);
        if (val === FALSE || e._flgPreventDefault) {
          return val;
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
    var childs, i, val, _i, _j;
    childs = this._childs;
    if (instance) {
      for (i = _i = childs.length - 1; _i >= 0; i = _i += -1) {
        val = childs[i];
        if (childs[i] === instance) {
          Observer_removeChildExe(childs, i);
          return;
        }
      }
    } else {
      for (i = _j = childs.length - 1; _j >= 0; i = _j += -1) {
        val = childs[i];
        Observer_removeChildExe(childs, i);
      }
    }
  }
});
