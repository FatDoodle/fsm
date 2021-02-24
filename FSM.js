function FSM(obj) {
    var FSMState = {state: null};

    let fsmTable = {};
    let stateEnum = {};
    let eventEnum = {};
    let generalMethod = {};
    let transMethodMap = new Map();


    function setMethodProxy(method, methodProxy) {
        transMethodMap.set(method, methodProxy);
    }

    function getMethodProxy(method) {
        return transMethodMap.get(method);
    }

    function setState(name) {
        if (isString(name)) {
            delete stateEnum[name];
            stateEnum[name] = name;
        } else if (name instanceof Object) {
            if (isValid(name)) {
                delete stateEnum[name.state];
                stateEnum[name.state] = name;
            } else {
                throw new Error("[setState]:请输入正确的事件参数");
            }
        } else {
            throw new Error("[setState]:请输入正确的事件参数,要求是string|obj类型");
        }

        function isValid(name) {
            let res = false;
            if (isString(name.state)) {
                res = true;
                if (name.leave) {
                    res = name.leave instanceof Function;
                }
                if (name.enter) {
                    res = name.enter instanceof Function;
                }
            }
            return res;
        }

    }

    function setEvent(event) {
        if (isString(event)) {
            delete eventEnum[event];
            delete fsmTable[event];
            eventEnum[event] = event;
            fsmTable[event] = new Object();
        } else if (event instanceof Object) {
            if (isValid(event)) {
                eventEnum[event.event] = event;
                fsmTable[event.event] = new Object();
            } else {
                throw new Error("[setEvent]:请输入正确的状态参数");
            }
        } else {
            throw new Error("[setEvent]:请输入正确的状态参数,要求是string|obj类型");
        }

        function isValid(event) {
            let res = false;
            if (isString(event.event)) {
                res = true;
                if (event.before) {
                    res = event.before instanceof Function;
                }
                if (event.after) {
                    res = event.after instanceof Function;
                }
            }
            return res;
        }
    }

    function getState(key) {
        let res = stateEnum[key];
        if (!isString(res) && res instanceof Object) {
            res = res.state;
        }
        return res;
    }

    function getEvent(key) {
        let res = eventEnum[key];
        if (!isString(res) && res instanceof Object) {
            res = res.event;
        }
        return res;
    }

    function setTransform(transform) {
        if (transform instanceof Object) {
            let state = getState(transform.state);
            let event = getEvent(transform.event);
            let method = transform.method;
            let to = getState(transform.to);

            if (state && event && method && to) {
                if (method instanceof Function) {
                    let methodProxy = getMethodProxy(method);
                    if (!methodProxy) {
                        methodProxy = function () {
                            FSMState.val = to;
                            method();
                        };
                        setMethodProxy(method, methodProxy);
                    }
                    fsmTable[event][state] = methodProxy;
                } else {
                    throw new Error("[setTransform]请输入正确的转换方法,要求为Function类型")
                }
            } else {
                throw new Error("[setTransform]请输入正确的转换方式,要求内容不为空")
            }
        }
    }

    function setGeneralMethod(name, method) {
        if (name && method) {
            switch (name) {
                case 'leave':
                    method instanceof Function && (generalMethod.leave = method);
                    break;
                case 'enter':
                    method instanceof Function && (generalMethod.enter = method);
                    break;
                case 'before':
                    method instanceof Function && (generalMethod.before = method);
                    break;
                case 'after':
                    method instanceof Function && (generalMethod.after = method);
                    break;
                default:
                    console.log("请输入正常的参数");
            }
        }
    }


//初始化
    Object.defineProperty(FSMState, 'val', {
        get: function () {
            return FSMState.state;
        },
        set: function (newVal) {
            exeConfigMethod(stateEnum, FSMState.state, 'leave') || exeGeneralMethod('leave');
            FSMState.state = newVal;
            exeConfigMethod(stateEnum, newVal, 'enter') || exeGeneralMethod('enter');
        },
        enumerable: true,
        configurable: true
    });


    if (obj.initState) {
        FSMState.state = obj.initState.state;
        setState(obj.initState);
    } else {
        throw new Error("请输入一个初始化状态");
    }
    if (obj.states && obj.states instanceof Array) {
        if (obj.states.length != 0) {
            obj.states.forEach(function (item, index, arr) {
                setState(item);
            });
        }
    } else {
        throw new Error("请输入正确的状态参数,states要求是数组类型");
    }

    if (obj.events && obj.events instanceof Array) {
        if (obj.events.length != 0) {
            obj.events.forEach(function (item, index, arr) {
                setEvent(item);
            });
        }
    } else {
        throw new Error("请输入正确的状态参数,events要求是数组类型");
    }

    if (obj.transforms && obj.transforms instanceof Array) {
        if (obj.transforms.length != 0) {
            obj.transforms.forEach(function (item, index, arr) {
                setTransform(item);
            });
        }
    } else {
        throw new Error("请输入正确的状态参数,transforms要求是数组类型");
    }


    if (obj.generalMethod) {
        let method = obj.generalMethod;
        if (method) {
            for (let key in method) {
                setGeneralMethod(key, method[key]);
            }
        }
    }


    function triggerEvent(event) {
        if (isString(event) && getEvent(event) != undefined) {
            let method = fsmTable[getEvent(event)][FSMState.val];
            if (method) {
                try {
                    exeConfigMethod(eventEnum, event, 'before') || exeGeneralMethod('before');
                    method();
                    exeConfigMethod(eventEnum, event, 'after') || exeGeneralMethod('after');
                } catch (e) {
                    console.log(e);
                }
            }
        }
    }

    function triggerAllEvent() {
        for (let key in eventEnum) {
            triggerEvent(key);
        }
    }

    function isString(str) {
        let res = (typeof str) == 'string' || str instanceof String;
        return res;
    }

    function exeConfigMethod(obj, var1, var2) {
        let res = false;
        if (obj && var1 && var2 && obj[var1] && obj[var1][var2]) {
            obj[var1][var2]();
            res = true;
        }
        return res;
    }

    function exeGeneralMethod(name) {
        let res = false;
        if (name && generalMethod[name]) {
            generalMethod[name]();
            res = true;
        }
        return res;
    }


    function isState(state) {
        return FSMState == state;
    }

    function getCurrState() {
        return FSMState.val;
    }

    this.triggerEvent = triggerEvent;
    this.triggerAllEvent = triggerAllEvent;
    this.setTransform = setTransform;
    this.setEvent = setEvent;
    this.setState = setState;
    this.getCurrState = getCurrState;
    this.isState = isState;
}
