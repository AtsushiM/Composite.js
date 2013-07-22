TRUE = true
FALSE = false
class_initializing = FALSE
class_fnTest = if /0/.test(-> 0; return;) then /\b_super\b/ else /.*/
Class = ->

_is = (key, vars) ->
    if Object.prototype.toString.call vars == '[object ' + key + ']' then TRUE else FALSE

isString = (vars) ->
    _is 'String', vars

isFunction = (vars) ->
    _is 'Function', vars

deleteArrayKey = (array, key) ->
    array.splice key, 1
    return

toArray = (obj) ->
    array = []

    array.push.apply(array, obj)

    return array

Class['extend'] = (props) ->
    SuperClass = @

    Class = ->
        if !class_initializing && @['init']
            @['init'].apply @, arguments

        return

    addMethod = (key) ->
        prop = props[key]
        _super = SuperClass.prototype[key]
        isMethodOverride = (
            isFunction(prop) &&
            isFunction(_super) &&
            class_fnTest.test(prop)
        )

        if isMethodOverride
            Class.prototype[key] = ->
                temp = @['_super']

                @['_super'] = _super

                ret = prop.apply @, arguments

                @['_super'] = temp

                return ret
        else
            Class.prototype[key] = prop

            return

    class_initializing = TRUE
    Class.prototype = new SuperClass
    class_initializing = FALSE

    Class.prototype['constructor'] = Class

    for own i of props
        addMethod i

    Class['extend'] = SuperClass['extend']

    return Class

Observer_removeChildExe = (childs, i) ->
    delete childs[i]._parentObserver
    deleteArrayKey childs, i

    return

Observer_bubble = ->
    args = toArray arguments || []
    temp = @['only'].apply @, args

    if FALSE != temp && !(temp || {})._flgStopPropagation
        temp = @_parentObserver

        if temp then temp['bubble'].apply temp, args

    return

Observer_preventDefault = ->
    @._flgPreventDefault = TRUE
Observer_stopPropagation = ->
    @._flgStopPropagation = TRUE

Observer_event = (that, args) ->
    e = args[0]

    if isString e
        e =
            'type': e
            'arguments': args
            _flgPreventDefault: FALSE
            _flgStopPropagation: FALSE
            'preventDefault': Observer_preventDefault
            'stopPropagation': Observer_stopPropagation

    e['before'] = e['target']
    e['target'] = that

    return e

window['Composite'] = Class['extend']
    'init': ->
        @_observed = {}
        @_childs = []

    'dispose': ->
        @['removeChild']

        for i of @
            temp = @[i]

            if temp && temp['dispose']
                temp['dispose']


        @['__proto__'] = null

        for i of @
            @[i] = null
            delete @[i]

        return

    'on': (key, func) ->
        observed = @_observed

        if (!observed[key])
            observed[key] = []

        observed[key].push func

        return

    'one': (key, func) ->
        that = @
        wrap = ->
            func.apply that, arguments
            that['off'] key, wrap
            return

        wrap.original = func

        that['on'] key, wrap
        return

    'off': (key, func) ->
        observed = @_observed

        if func
            target = observed[key]

            if target
                i = target.length

                while i--
                    if func == target[i] || func == target[i].original
                        deleteArrayKey target, i

                        if target.length == 0
                            delete observed[key]

                        return TRUE

            return FALSE

        return delete observed[key]

    'fire': Observer_bubble
    'bubble': Observer_bubble
    'capture': ->
        args = arguments
        childs = @_childs
        i = childs.length

        if FALSE !=  @['only'].apply @, args
            while i--
                temp = childs[i]
                temp['capture'].apply temp, args

        return
    'only': ->
        args = toArray arguments
        e = Observer_event @, args
        target = @_observed[e['type']] || []
        i = target.length

        deleteArrayKey args, 0
        args[args.length] = e

        while i--
            temp = target[i]

            if temp
                temp = temp.apply @, args

                if temp == FALSE || e._flgPreventDefault
                    return temp

        return e

    'addChild': (instance) ->
        if instance._parentObserver
            instance._parentObserver['removeChild'] instance

        instance._parentObserver = @
        @_childs.push instance

        return
    'removeChild': (instance) ->
        childs = @_childs
        i = childs.length

        if instance
            while i--
                if childs[i] == instance
                    Observer_removeChildExe childs, i

                    return

        else
            while i--
                Observer_removeChildExe childs, i

            return
