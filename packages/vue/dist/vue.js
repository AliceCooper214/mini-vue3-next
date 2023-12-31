var Vue = (function (exports) {
    'use strict';

    function normalizeClass(value) {
        var res = '';
        if (isString(value)) {
            res = value;
        }
        else if (isArray(value)) {
            for (var i = 0; i < value.length; i++) {
                var normalized = normalizeClass(value[i]);
                if (normalized) {
                    res += normalized + ' ';
                }
            }
        }
        else if (isObject(value)) {
            for (var name_1 in value) {
                if (value[name_1]) {
                    res += name_1 + ' ';
                }
            }
        }
        return res.trim();
    }

    var toDisplayString = function (val) {
        return String(val);
    };

    var isArray = Array.isArray;
    var isObject = function (val) {
        return val !== null && typeof val === 'object';
    };
    var hasChange = function (value, oldValue) {
        return !Object.is(value, oldValue);
    };
    var isFunction = function (val) {
        return typeof val === 'function';
    };
    var extend = Object.assign;
    var EMPTY_OBJ = {};
    var isString = function (val) {
        return typeof val === 'string';
    };
    var onRE = /^on[^a-z]/;
    var isOn = function (key) {
        return onRE.test(key);
    };
    var NO = function () { return false; };

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spreadArray(to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    }

    var createDep = function (effects) {
        var dep = new Set(effects);
        return dep;
    };

    var targetMap = new WeakMap();
    function track(target, key) {
        if (!activeEffect)
            return;
        var depsMap = targetMap.get(target);
        if (!depsMap) {
            targetMap.set(target, (depsMap = new Map()));
        }
        var dep = depsMap.get(key);
        if (!dep) {
            depsMap.set(key, (dep = createDep()));
        }
        trackEffects(dep);
    }
    function trackEffects(dep) {
        dep.add(activeEffect);
    }
    function trigger(target, key) {
        var depsMap = targetMap.get(target);
        if (!depsMap) {
            return;
        }
        var dep = depsMap.get(key);
        if (!dep) {
            return;
        }
        triggerEffects(dep);
    }
    function triggerEffects(dep) {
        var e_1, _a, e_2, _b;
        var effects = isArray(dep) ? dep : __spreadArray([], __read(dep), false);
        try {
            for (var effects_1 = __values(effects), effects_1_1 = effects_1.next(); !effects_1_1.done; effects_1_1 = effects_1.next()) {
                var effect_1 = effects_1_1.value;
                if (effect_1.computed) {
                    triggerEffect(effect_1);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (effects_1_1 && !effects_1_1.done && (_a = effects_1.return)) _a.call(effects_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        try {
            for (var effects_2 = __values(effects), effects_2_1 = effects_2.next(); !effects_2_1.done; effects_2_1 = effects_2.next()) {
                var effect_2 = effects_2_1.value;
                if (!effect_2.computed) {
                    triggerEffect(effect_2);
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (effects_2_1 && !effects_2_1.done && (_b = effects_2.return)) _b.call(effects_2);
            }
            finally { if (e_2) throw e_2.error; }
        }
    }
    function triggerEffect(effect) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
    var activeEffect;
    var ReactiveEffect = /** @class */ (function () {
        function ReactiveEffect(fn, scheduler) {
            if (scheduler === void 0) { scheduler = null; }
            this.fn = fn;
            this.scheduler = scheduler;
        }
        ReactiveEffect.prototype.run = function () {
            activeEffect = this;
            return this.fn();
        };
        ReactiveEffect.prototype.stop = function () {
        };
        return ReactiveEffect;
    }());
    function effect(fn, options) {
        var _effect = new ReactiveEffect(fn);
        if (options) {
            extend(_effect, options);
        }
        if (!options || !options.lazy) {
            _effect.run();
        }
    }

    var get = createGetter();
    function createGetter() {
        return function get(target, key, receiver) {
            var res = Reflect.get(target, key, receiver);
            track(target, key);
            return res;
        };
    }
    var set = createSetter();
    function createSetter() {
        return function set(target, key, value, receiver) {
            var result = Reflect.set(target, key, value, receiver);
            trigger(target, key);
            return result;
        };
    }
    var mutableHandlers = {
        get: get,
        set: set
    };

    var reactiveMap = new WeakMap();
    function reactive(target) {
        return createReactiveObject(target, mutableHandlers, reactiveMap);
    }
    function createReactiveObject(target, baseHandlers, proxyMap) {
        var existingProxy = proxyMap.get(target);
        if (existingProxy) {
            return existingProxy;
        }
        var proxy = new Proxy(target, baseHandlers);
        proxy["__v_isReactive" /* ReactiveFlags.IS_REACTIVE */] = true;
        proxyMap.set(target, proxy);
        return proxy;
    }
    var toReactive = function (value) {
        return isObject(value) ? reactive(value) : value;
    };
    var isReactive = function (value) {
        return !!(value && value["__v_isReactive" /* ReactiveFlags.IS_REACTIVE */]);
    };

    function ref(value) {
        return createRef(value, false);
    }
    function createRef(rawValue, shallow) {
        if (isRef(rawValue)) {
            return rawValue;
        }
        return new RefImpl(rawValue, shallow);
    }
    var RefImpl = /** @class */ (function () {
        function RefImpl(value, __v_isShallow) {
            this.__v_isShallow = __v_isShallow;
            this.dep = undefined;
            this.__v_isRef = true;
            this._rawValue = value;
            this._value = __v_isShallow ? value : toReactive(value);
        }
        Object.defineProperty(RefImpl.prototype, "value", {
            get: function () {
                trackRefValue(this);
                return this._value;
            },
            set: function (newVal) {
                if (hasChange(newVal, this._rawValue)) {
                    this._rawValue = newVal;
                    this._value = toReactive(newVal);
                    triggerRefValue(this);
                }
            },
            enumerable: false,
            configurable: true
        });
        return RefImpl;
    }());
    function trackRefValue(ref) {
        if (activeEffect) {
            trackEffects(ref.dep || (ref.dep = createDep()));
        }
    }
    function triggerRefValue(ref) {
        if (ref.dep) {
            triggerEffects(ref.dep);
        }
    }
    function isRef(r) {
        return (r && r.__v_isRef === true);
    }

    var ComputedRefImpl = /** @class */ (function () {
        function ComputedRefImpl(getter) {
            var _this = this;
            this.dep = undefined;
            this.__v_isRef = true;
            this._dirty = true;
            this.effect = new ReactiveEffect(getter, function () {
                if (!_this._dirty) {
                    _this._dirty = true;
                    triggerRefValue(_this);
                }
            });
            this.effect.computed = this;
        }
        Object.defineProperty(ComputedRefImpl.prototype, "value", {
            get: function () {
                trackRefValue(this);
                if (this._dirty) {
                    this._dirty = false;
                    this._value = this.effect.run();
                }
                return this._value;
            },
            enumerable: false,
            configurable: true
        });
        return ComputedRefImpl;
    }());
    function computed(getterOrOptions) {
        var getter;
        var onlyGetter = isFunction(getterOrOptions);
        if (onlyGetter) {
            getter = getterOrOptions;
        }
        var cRef = new ComputedRefImpl(getter);
        return cRef;
    }

    var isFlushPending = false;
    var resolvedPromise = Promise.resolve();
    var pendingPreFlushCbs = [];
    function queuePreFlushCb(cb) {
        queueCb(cb, pendingPreFlushCbs);
    }
    function queueCb(cb, pendingQueue) {
        pendingQueue.push(cb);
        queueFlush();
    }
    function queueFlush() {
        if (!isFlushPending) {
            isFlushPending = true;
            resolvedPromise.then(flushJobs);
        }
    }
    function flushJobs() {
        isFlushPending = false;
        flushPreFlushCbs();
    }
    function flushPreFlushCbs() {
        if (pendingPreFlushCbs.length) {
            var activePreFlushCbs = __spreadArray([], __read(new Set(pendingPreFlushCbs)), false);
            pendingPreFlushCbs.length = 0;
            for (var i = 0; i < activePreFlushCbs.length; i++) {
                activePreFlushCbs[i]();
            }
        }
    }

    function watch(source, cb, options) {
        return doWatch(source, cb, options);
    }
    function doWatch(source, cb, _a) {
        var _b = _a === void 0 ? EMPTY_OBJ : _a, immediate = _b.immediate, deep = _b.deep;
        var getter;
        if (isReactive(source)) {
            getter = function () { return source; };
            deep = true;
        }
        else {
            getter = function () { };
        }
        if (cb && deep) {
            var baseGetter_1 = getter;
            getter = function () { return traverse(baseGetter_1()); };
        }
        var oldValue = {};
        var job = function () {
            if (cb) {
                var newValue = effect.run();
                if (deep || hasChange(newValue, oldValue)) {
                    cb(newValue, oldValue);
                    oldValue = newValue;
                }
            }
        };
        var scheduler = function () { return queuePreFlushCb(job); };
        var effect = new ReactiveEffect(getter, scheduler);
        if (cb) {
            if (immediate) {
                job();
            }
            else {
                oldValue = effect.run();
            }
        }
        else {
            effect.run();
        }
        return function () {
            effect.stop();
        };
    }
    function traverse(value, seen) {
        if (!isObject(value)) {
            return value;
        }
        seen = seen || new Set();
        seen.add(value);
        for (var key in value) {
            traverse(value[key], seen);
        }
        return value;
    }

    var Fragment = Symbol('Fragment');
    var Text = Symbol('Text');
    var Comment = Symbol('Comment');
    function isVNode(value) {
        return value ? value.__v_isVNode === true : false;
    }
    function createVNode(type, props, children) {
        var shapeFlag = isString(type) ?
            1 /* ShapeFlags.ELEMENT */
            : isObject(type)
                ? 4 /* ShapeFlags.STATEFUL_COMPONENT */
                : 0;
        if (props) {
            var klass = props.class; props.style;
            if (klass && !isString(klass)) {
                props.class = normalizeClass(klass);
            }
        }
        return createBaseVNode(type, props, children, shapeFlag);
    }
    function createBaseVNode(type, props, children, shapeFlag) {
        var vnode = {
            __v_isVNode: true,
            type: type,
            props: props,
            shapeFlag: shapeFlag,
            key: (props === null || props === void 0 ? void 0 : props.key) || null
        };
        normalizeChildren(vnode, children);
        return vnode;
    }
    function normalizeChildren(vnode, children) {
        var type = 0;
        vnode.shapeFlag;
        if (children == null) {
            children = null;
        }
        else if (isArray(children)) {
            type = 16 /* ShapeFlags.ARRAY_CHILDREN */;
        }
        else if (typeof children === 'object') ;
        else if (isFunction(children)) ;
        else {
            children = String(children);
            type = 8 /* ShapeFlags.TEXT_CHILDREN */;
        }
        vnode.children = children;
        vnode.shapeFlag |= type;
    }
    function isSameVNodeType(n1, n2) {
        return n1.type === n2.type && n1.key === n2.key;
    }
    function createCommentVNode(text) {
        return createVNode(Comment, null, text);
    }

    function h(type, propsOrChildren, children) {
        var l = arguments.length;
        if (l == 2) {
            if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
                if (isVNode(propsOrChildren)) {
                    return createVNode(type, null, [propsOrChildren]);
                }
                return createVNode(type, propsOrChildren);
            }
            else {
                return createVNode(type, null, propsOrChildren);
            }
        }
        else {
            if (l > 3) {
                children = Array.prototype.slice.call(arguments, 2);
            }
            else if (l === 3 && isVNode(children)) {
                children = [children];
            }
            return createVNode(type, propsOrChildren, children);
        }
    }

    function createAppAPI(render) {
        return function createApp(rootComponent, rootProps) {
            if (rootProps === void 0) { rootProps = null; }
            var app = {
                _component: rootComponent,
                _container: null,
                mount: function (rootContainer) {
                    var vnode = createVNode(rootComponent, rootProps);
                    render(vnode, rootContainer);
                }
            };
            return app;
        };
    }

    function renderComponentRoot(instance) {
        var vnode = instance.vnode, render = instance.render, _a = instance.data, data = _a === void 0 ? {} : _a;
        var result;
        try {
            if (vnode.shapeFlag & 4 /* ShapeFlags.STATEFUL_COMPONENT */) {
                result = normalizeVNode(render.call(data, data));
            }
        }
        catch (error) {
            console.error("[Vue-next-mini]: ".concat(error.message));
        }
        return result;
    }
    function normalizeVNode(child) {
        if (typeof child === 'object') {
            return cloneIfMounted(child);
        }
        else {
            return createVNode(Text, null, String(child));
        }
    }
    function cloneIfMounted(child) {
        return child;
    }

    var onBeforeMount = createHook("bm" /* LifecycleHooks.BEFORE_MOUNT */);
    var onMounted = createHook("m" /* LifecycleHooks.MOUNTED */);
    function injectHook(type, hook, target) {
        if (target) {
            target[type] = hook;
            return hook;
        }
    }
    function createHook(lifecycle) {
        return function (hook, target) { return injectHook(lifecycle, hook, target); };
    }

    var uid = 0;
    function createComponentInstance(vnode) {
        var type = vnode.type;
        var instance = {
            uid: uid++,
            vnode: vnode,
            type: type,
            subTree: null,
            effect: null,
            update: null,
            render: null,
            isMounted: false,
            bc: null,
            c: null,
            bm: null,
            m: null,
        };
        return instance;
    }
    function setupComponent(instance) {
        var setupResult = setupStatefulComponent(instance);
        return setupResult;
    }
    function setupStatefulComponent(instance) {
        var Component = instance.type;
        var setup = Component.setup;
        if (setup) {
            var setupResult = setup();
            handleSetupResult(instance, setupResult);
        }
        else {
            finishComponentSetup(instance);
        }
    }
    function handleSetupResult(instance, setupResult) {
        if (isFunction(setupResult)) {
            instance.render = setupResult;
        }
        finishComponentSetup(instance);
    }
    function finishComponentSetup(instance) {
        var Component = instance.type;
        if (!instance.render) {
            if (compile$1 && !Component.render) {
                if (Component.template) {
                    var template = Component.template;
                    Component.render = compile$1(template);
                }
            }
            instance.render = Component.render;
        }
        applyOptions(instance);
    }
    function applyOptions(instance) {
        var _a = instance.type, dataOptions = _a.data, beforeCreate = _a.beforeCreate, created = _a.created, beforeMount = _a.beforeMount, mounted = _a.mounted;
        if (beforeCreate) {
            callHook(beforeCreate, instance.data);
        }
        if (dataOptions) {
            var data = dataOptions();
            if (isObject(data)) {
                instance.data = reactive(data);
            }
        }
        if (created) {
            callHook(created, instance.data);
        }
        function registerLifecycleHook(register, hook) {
            register(hook === null || hook === void 0 ? void 0 : hook.bind(instance.data), instance);
        }
        registerLifecycleHook(onBeforeMount, beforeMount);
        registerLifecycleHook(onMounted, mounted);
    }
    function callHook(hook, proxy) {
        hook.bind(proxy)();
    }
    var compile$1;
    function registerRuntimeCompiler(_compile) {
        compile$1 = _compile;
    }

    function createRenderer(options) {
        return baseCreateRenderer(options);
    }
    function baseCreateRenderer(options) {
        var hostInsert = options.insert, hostPatchProp = options.patchProp, hostCreateElement = options.createElement, hostSetElementText = options.setElementText, hostRemove = options.remove, hostCreateText = options.createText, hostSetText = options.setText, hostCreateComment = options.createComment;
        var processCommentNode = function (oldVNode, newVNode, container, anchor) {
            if (oldVNode == null) {
                newVNode.el = hostCreateComment(newVNode.children || '');
                hostInsert(newVNode.el, container, anchor);
            }
            else {
                newVNode.el = oldVNode.el;
            }
        };
        var processText = function (oldVNode, newVNode, container, anchor) {
            if (oldVNode == null) {
                newVNode.el = hostCreateText(newVNode.children);
                hostInsert(newVNode.el, container, anchor);
            }
            else {
                var el = (newVNode.el = oldVNode.el);
                if (newVNode.children !== oldVNode.children) {
                    hostSetText(el, newVNode.children);
                }
            }
        };
        var processElement = function (oldVNode, newVNode, container, anchor) {
            if (oldVNode == null) {
                mountElement(newVNode, container, anchor);
            }
            else {
                patchElement(oldVNode, newVNode);
            }
        };
        var processFragment = function (oldVNode, newVNode, container, anchor) {
            if (oldVNode == null) {
                mountChildren(newVNode.children, container, anchor);
            }
            else {
                patchChildren(oldVNode, newVNode, container, anchor);
            }
        };
        var processComponent = function (oldVNode, newVNode, container, anchor) {
            if (oldVNode == null) {
                mountComponent(newVNode, container, anchor);
            }
        };
        var mountComponent = function (initialVNode, container, anchor) {
            initialVNode.component = createComponentInstance(initialVNode);
            var instance = initialVNode.component;
            setupComponent(instance);
            setupRenderEffect(instance, initialVNode, container, anchor);
        };
        var setupRenderEffect = function (instance, initialVNode, container, anchor) {
            var componentUpdateFn = function () {
                if (!instance.isMounted) {
                    var bm = instance.bm, m = instance.m;
                    if (bm) {
                        bm();
                    }
                    var subTree = (instance.subTree = renderComponentRoot(instance));
                    patch(null, subTree, container, anchor);
                    if (m) {
                        m();
                    }
                    initialVNode.el = subTree.el;
                    instance.isMounted = true;
                }
                else {
                    var next = instance.next, vnode = instance.vnode;
                    if (!next) {
                        next = vnode;
                    }
                    var nextTree = renderComponentRoot(instance);
                    var preTree = instance.subTree;
                    instance.subTree = nextTree;
                    patch(preTree, nextTree, container, anchor);
                    next.el = nextTree.el;
                }
            };
            var effect = (instance.effect = new ReactiveEffect(componentUpdateFn, function () { return queuePreFlushCb(update); }));
            var update = (instance.update = function () { return effect.run(); });
            update();
        };
        var patchElement = function (oldVNode, newVNode) {
            var el = (newVNode.el = oldVNode.el);
            var oldProps = oldVNode.props || EMPTY_OBJ;
            var newProps = newVNode.props || EMPTY_OBJ;
            patchChildren(oldVNode, newVNode, el, null);
            patchProps(el, newVNode, oldProps, newProps);
        };
        var mountElement = function (vnode, container, anchor) {
            var _a = vnode, type = _a.type, props = _a.props, shapeFlag = _a.shapeFlag;
            var el = vnode.el = hostCreateElement(type);
            if (shapeFlag & 8 /* ShapeFlags.TEXT_CHILDREN */) {
                hostSetElementText(el, vnode.children);
            }
            else if (shapeFlag & 16 /* ShapeFlags.ARRAY_CHILDREN */) {
                mountChildren(vnode.children, el, anchor);
            }
            if (props) {
                for (var key in props) {
                    hostPatchProp(el, key, null, props[key]);
                }
            }
            hostInsert(el, container, anchor);
        };
        var patchProps = function (el, vnode, oldProps, newProps) {
            if (oldProps !== newProps) {
                for (var key in newProps) {
                    var next = newProps[key];
                    var prev = oldProps[key];
                    if (next !== prev) {
                        hostPatchProp(el, key, prev, next);
                    }
                }
                if (oldProps !== EMPTY_OBJ) {
                    for (var key in oldProps) {
                        if (!(key in newProps)) {
                            hostPatchProp(el, key, oldProps[key], null);
                        }
                    }
                }
            }
        };
        var mountChildren = function (children, container, anchor) {
            if (isString(children)) {
                children = children.split('');
            }
            for (var i = 0; i < children.length; i++) {
                var child = (children[i] = normalizeVNode(children[i]));
                patch(null, child, container, anchor);
            }
        };
        var patchChildren = function (oldVNode, newVNode, container, anchor) {
            var c1 = oldVNode && oldVNode.children;
            var prevShapeFlag = oldVNode ? oldVNode.shapeFlag : 0;
            var c2 = newVNode.children;
            var shapeFlag = newVNode.shapeFlag;
            // 新子节点为 TEXT_CHILDREN
            if (shapeFlag & 8 /* ShapeFlags.TEXT_CHILDREN */) {
                // 旧子节点为 ARRAY_CHILDREN
                if (prevShapeFlag & 16 /* ShapeFlags.ARRAY_CHILDREN */) {
                    // 卸载旧子节点
                    unmountChildren(c1.children);
                }
                // 新旧子节点不同
                if (c2 !== c1) {
                    // 挂载新子节点的文本
                    hostSetElementText(container, c2);
                }
            }
            else {
                // 旧子节点为 ARRAY_CHILDREN
                if (prevShapeFlag & 16 /* ShapeFlags.ARRAY_CHILDREN */) {
                    // 新子节点也为 ARRAY_CHILDREN
                    if (shapeFlag & 16 /* ShapeFlags.ARRAY_CHILDREN */) {
                        // dom diff
                        patchKeyedChildren(c1, c2, container, anchor);
                    }
                    else {
                        // 新子节点不为 ARRAY_CHILDREN，则直接卸载旧子节点
                        unmountChildren(c1);
                    }
                }
                else {
                    // 旧子节点为 TEXT_CHILDREN
                    if (prevShapeFlag & 8 /* ShapeFlags.TEXT_CHILDREN */) {
                        // 删除旧的文本
                        hostSetElementText(container, '');
                    }
                    // 新子节点为 ARRAY_CHILDREN
                    if (shapeFlag & 16 /* ShapeFlags.ARRAY_CHILDREN */) {
                        // 单独挂载新子节点操作
                        mountChildren(c2, container, anchor);
                    }
                }
            }
        };
        var patchKeyedChildren = function (oldChildren, newChildren, container, parentAnchor) {
            var i = 0;
            var newChildrenLength = newChildren.length;
            var oldChildrenEnd = oldChildren.length - 1;
            var newChildrenEnd = newChildrenLength - 1;
            // 自前向后
            while (i <= oldChildrenEnd && i <= newChildrenEnd) {
                var oldVNode = oldChildren[i];
                var newVNode = normalizeVNode(newChildren[i]);
                if (isSameVNodeType(oldVNode, newVNode)) {
                    patch(oldVNode, newVNode, container, null);
                }
                else {
                    break;
                }
                i++;
            }
            // 自后向前
            while (i <= oldChildrenEnd && i <= newChildrenEnd) {
                var oldVNode = oldChildren[oldChildrenEnd];
                var newVNode = normalizeVNode(newChildren[newChildrenEnd]);
                if (isSameVNodeType(oldVNode, newVNode)) {
                    patch(oldVNode, newVNode, container, null);
                }
                else {
                    break;
                }
                oldChildrenEnd--;
                newChildrenEnd--;
            }
            // 新节点多于旧节点
            if (i > oldChildrenEnd) {
                if (i <= newChildrenEnd) {
                    var nextPos = newChildrenEnd + 1;
                    var anchor = nextPos < newChildrenLength ? newChildren[nextPos].el : parentAnchor;
                    while (i <= newChildrenEnd) {
                        patch(null, normalizeVNode(newChildren[i]), container, anchor);
                        i++;
                    }
                }
            }
            // 旧节点多于新节点
            else if (i > newChildrenEnd) {
                while (i <= oldChildrenEnd) {
                    unmount(oldChildren[i]);
                    i++;
                }
            }
            // 纯乱序
            else {
                // 旧子节点的开始索引：oldChildrenStart
                var oldStartIndex = i;
                // 新子节点的开始索引：newChildrenStart
                var newStartIndex = i;
                // 5.1 创建一个 <key（新节点的 key）:index（新节点的位置）> 的 Map 对象 keyToNewIndexMap。通过该对象可知：新的 child（根据 key 判断指定 child） 更新后的位置（根据对应的 index 判断）在哪里
                var keyToNewIndexMap = new Map();
                // 通过循环为 keyToNewIndexMap 填充值（s2 = newChildrenStart; e2 = newChildrenEnd）
                for (i = newStartIndex; i <= newChildrenEnd; i++) {
                    // 从 newChildren 中根据开始索引获取每一个 child（c2 = newChildren）
                    var nextChild = normalizeVNode(newChildren[i]);
                    // child 必须存在 key（这也是为什么 v-for 必须要有 key 的原因）
                    if (nextChild.key != null) {
                        // 把 key 和 对应的索引，放到 keyToNewIndexMap 对象中
                        keyToNewIndexMap.set(nextChild.key, i);
                    }
                }
                // 5.2 循环 oldChildren ，并尝试进行 patch（打补丁）或 unmount（删除）旧节点
                var j 
                // 记录已经修复的新节点数量
                = void 0;
                // 记录已经修复的新节点数量
                var patched = 0;
                // 新节点待修补的数量 = newChildrenEnd - newChildrenStart + 1
                var toBePatched = newChildrenEnd - newStartIndex + 1;
                // 标记位：节点是否需要移动
                var moved = false;
                // 配合 moved 进行使用，它始终保存当前最大的 index 值
                var maxNewIndexSoFar = 0;
                // 创建一个 Array 的对象，用来确定最长递增子序列。它的下标表示：《新节点的下标（newIndex），不计算已处理的节点。即：n-c 被认为是 0》，元素表示：《对应旧节点的下标（oldIndex），永远 +1》
                // 但是，需要特别注意的是：oldIndex 的值应该永远 +1 （ 因为 0 代表了特殊含义，他表示《新节点没有找到对应的旧节点，此时需要新增新节点》）。即：旧节点下标为 0， 但是记录时会被记录为 1
                var newIndexToOldIndexMap = new Array(toBePatched);
                // 遍历 toBePatched ，为 newIndexToOldIndexMap 进行初始化，初始化时，所有的元素为 0
                for (i = 0; i < toBePatched; i++)
                    newIndexToOldIndexMap[i] = 0;
                // 遍历 oldChildren（s1 = oldChildrenStart; e1 = oldChildrenEnd），获取旧节点，如果当前 已经处理的节点数量 > 待处理的节点数量，那么就证明：《所有的节点都已经更新完成，剩余的旧节点全部删除即可》
                for (i = oldStartIndex; i <= oldChildrenEnd; i++) {
                    // 获取旧节点
                    var prevChild = oldChildren[i];
                    // 如果当前 已经处理的节点数量 > 待处理的节点数量，那么就证明：《所有的节点都已经更新完成，剩余的旧节点全部删除即可》
                    if (patched >= toBePatched) {
                        // 所有的节点都已经更新完成，剩余的旧节点全部删除即可
                        unmount(prevChild);
                        continue;
                    }
                    // 新节点需要存在的位置，需要根据旧节点来进行寻找（包含已处理的节点。即：n-c 被认为是 1）
                    var newIndex 
                    // 旧节点的 key 存在时
                    = void 0;
                    // 旧节点的 key 存在时
                    if (prevChild.key != null) {
                        // 根据旧节点的 key，从 keyToNewIndexMap 中可以获取到新节点对应的位置
                        newIndex = keyToNewIndexMap.get(prevChild.key);
                    }
                    else {
                        // 旧节点的 key 不存在（无 key 节点）
                        // 那么我们就遍历所有的新节点，找到《没有找到对应旧节点的新节点，并且该新节点可以和旧节点匹配》，如果能找到，那么 newIndex = 该新节点索引
                        for (j = newStartIndex; j <= newChildrenEnd; j++) {
                            // 找到《没有找到对应旧节点的新节点，并且该新节点可以和旧节点匹配》
                            if (newIndexToOldIndexMap[j - newStartIndex] === 0 &&
                                isSameVNodeType(prevChild, newChildren[j])) {
                                // 如果能找到，那么 newIndex = 该新节点索引
                                newIndex = j;
                                break;
                            }
                        }
                    }
                    // 最终没有找到新节点的索引，则证明：当前旧节点没有对应的新节点
                    if (newIndex === undefined) {
                        // 此时，直接删除即可
                        unmount(prevChild);
                    }
                    // 没有进入 if，则表示：当前旧节点找到了对应的新节点，那么接下来就是要判断对于该新节点而言，是要 patch（打补丁）还是 move（移动）
                    else {
                        // 为 newIndexToOldIndexMap 填充值：下标表示：《新节点的下标（newIndex），不计算已处理的节点。即：n-c 被认为是 0》，元素表示：《对应旧节点的下标（oldIndex），永远 +1》
                        // 因为 newIndex 包含已处理的节点，所以需要减去 s2（s2 = newChildrenStart）表示：不计算已处理的节点
                        newIndexToOldIndexMap[newIndex - newStartIndex] = i + 1;
                        // maxNewIndexSoFar 会存储当前最大的 newIndex，它应该是一个递增的，如果没有递增，则证明有节点需要移动
                        if (newIndex >= maxNewIndexSoFar) {
                            // 持续递增
                            maxNewIndexSoFar = newIndex;
                        }
                        else {
                            // 没有递增，则需要移动，moved = true
                            moved = true;
                        }
                        // 打补丁
                        patch(prevChild, newChildren[newIndex], container, null);
                        // 自增已处理的节点数量
                        patched++;
                    }
                }
                // 5.3 针对移动和挂载的处理
                // 仅当节点需要移动的时候，我们才需要生成最长递增子序列，否则只需要有一个空数组即可
                var increasingNewIndexSequence = moved
                    ? getSequence(newIndexToOldIndexMap)
                    : [];
                // j >= 0 表示：初始值为 最长递增子序列的最后下标
                // j < 0 表示：《不存在》最长递增子序列。
                j = increasingNewIndexSequence.length - 1;
                // 倒序循环，以便我们可以使用最后修补的节点作为锚点
                for (i = toBePatched - 1; i >= 0; i--) {
                    // nextIndex（需要更新的新节点下标） = newChildrenStart + i
                    var nextIndex = newStartIndex + i;
                    // 根据 nextIndex 拿到要处理的 新节点
                    var nextChild = newChildren[nextIndex];
                    // 获取锚点（是否超过了最长长度）
                    var anchor = nextIndex + 1 < newChildrenLength
                        ? newChildren[nextIndex + 1].el
                        : parentAnchor;
                    // 如果 newIndexToOldIndexMap 中保存的 value = 0，则表示：新节点没有用对应的旧节点，此时需要挂载新节点
                    if (newIndexToOldIndexMap[i] === 0) {
                        // 挂载新节点
                        patch(null, nextChild, container, anchor);
                    }
                    // moved 为 true，表示需要移动
                    else if (moved) {
                        // j < 0 表示：不存在 最长递增子序列
                        // i !== increasingNewIndexSequence[j] 表示：当前节点不在最后位置
                        // 那么此时就需要 move （移动）
                        if (j < 0 || i !== increasingNewIndexSequence[j]) {
                            move(nextChild, container, anchor);
                        }
                        else {
                            // j 随着循环递减
                            j--;
                        }
                    }
                }
            }
        };
        var unmountChildren = function (children) {
            for (var i = 0; i < children.length; i++) {
                hostRemove(children[i].el);
            }
        };
        var move = function (vnode, container, anchor) {
            var el = vnode.el;
            hostInsert(el, container, anchor);
        };
        var patch = function (oldVNode, newVNode, container, anchor) {
            if (anchor === void 0) { anchor = null; }
            if (oldVNode === newVNode) {
                return;
            }
            if (oldVNode && !isSameVNodeType(oldVNode, newVNode)) {
                unmount(oldVNode);
                oldVNode = null;
            }
            var type = newVNode.type, shapeFlag = newVNode.shapeFlag;
            switch (type) {
                case Text:
                    processText(oldVNode, newVNode, container, anchor);
                    break;
                case Comment:
                    processCommentNode(oldVNode, newVNode, container, anchor);
                    break;
                case Fragment:
                    processFragment(oldVNode, newVNode, container, anchor);
                    break;
                default:
                    if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                        processElement(oldVNode, newVNode, container, anchor);
                    }
                    else if (shapeFlag & 6 /* ShapeFlags.COMPONENT */) {
                        processComponent(oldVNode, newVNode, container, anchor);
                    }
            }
        };
        var unmount = function (vnode) {
            hostRemove(vnode.el);
        };
        var render = function (vnode, container) {
            if (vnode === null) {
                if (container._vnode) {
                    unmount(container._vnode);
                }
            }
            else {
                patch(container._vnode || null, vnode, container);
            }
            container._vnode = vnode;
        };
        return {
            render: render,
            createApp: createAppAPI(render)
        };
    }
    /**
     * 获取最长递增子序列下标
     * 维基百科：https://en.wikipedia.org/wiki/Longest_increasing_subsequence
     * 百度百科：https://baike.baidu.com/item/%E6%9C%80%E9%95%BF%E9%80%92%E5%A2%9E%E5%AD%90%E5%BA%8F%E5%88%97/22828111
     */
    function getSequence(arr) {
        // 获取一个数组浅拷贝。注意 p 的元素改变并不会影响 arr
        // p 是一个最终的回溯数组，它会在最终的 result 回溯中被使用
        // 它会在每次 result 发生变化时，记录 result 更新前最后一个索引的值
        var p = arr.slice();
        // 定义返回值（最长递增子序列下标），因为下标从 0 开始，所以它的初始值为 0
        var result = [0];
        var i, j, u, v, c;
        // 当前数组的长度
        var len = arr.length;
        // 对数组中所有的元素进行 for 循环处理，i = 下标
        for (i = 0; i < len; i++) {
            // 根据下标获取当前对应元素
            var arrI = arr[i];
            //
            if (arrI !== 0) {
                // 获取 result 中的最后一个元素，即：当前 result 中保存的最大值的下标
                j = result[result.length - 1];
                // arr[j] = 当前 result 中所保存的最大值
                // arrI = 当前值
                // 如果 arr[j] < arrI 。那么就证明，当前存在更大的序列，那么该下标就需要被放入到 result 的最后位置
                if (arr[j] < arrI) {
                    p[i] = j;
                    // 把当前的下标 i 放入到 result 的最后位置
                    result.push(i);
                    continue;
                }
                // 不满足 arr[j] < arrI 的条件，就证明目前 result 中的最后位置保存着更大的数值的下标。
                // 但是这个下标并不一定是一个递增的序列，比如： [1, 3] 和 [1, 2]
                // 所以我们还需要确定当前的序列是递增的。
                // 计算方式就是通过：二分查找来进行的
                // 初始下标
                u = 0;
                // 最终下标
                v = result.length - 1;
                // 只有初始下标 < 最终下标时才需要计算
                while (u < v) {
                    // (u + v) 转化为 32 位 2 进制，右移 1 位 === 取中间位置（向下取整）例如：8 >> 1 = 4;  9 >> 1 = 4; 5 >> 1 = 2
                    // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Right_shift
                    // c 表示中间位。即：初始下标 + 最终下标 / 2 （向下取整）
                    c = (u + v) >> 1;
                    // 从 result 中根据 c（中间位），取出中间位的下标。
                    // 然后利用中间位的下标，从 arr 中取出对应的值。
                    // 即：arr[result[c]] = result 中间位的值
                    // 如果：result 中间位的值 < arrI，则 u（初始下标）= 中间位 + 1。即：从中间向右移动一位，作为初始下标。 （下次直接从中间开始，往后计算即可）
                    if (arr[result[c]] < arrI) {
                        u = c + 1;
                    }
                    else {
                        // 否则，则 v（最终下标） = 中间位。即：下次直接从 0 开始，计算到中间位置 即可。
                        v = c;
                    }
                }
                // 最终，经过 while 的二分运算可以计算出：目标下标位 u
                // 利用 u 从 result 中获取下标，然后拿到 arr 中对应的值：arr[result[u]]
                // 如果：arr[result[u]] > arrI 的，则证明当前  result 中存在的下标 《不是》 递增序列，则需要进行替换
                if (arrI < arr[result[u]]) {
                    if (u > 0) {
                        p[i] = result[u - 1];
                    }
                    // 进行替换，替换为递增序列
                    result[u] = i;
                }
            }
        }
        // 重新定义 u。此时：u = result 的长度
        u = result.length;
        // 重新定义 v。此时 v = result 的最后一个元素
        v = result[u - 1];
        // 自后向前处理 result，利用 p 中所保存的索引值，进行最后的一次回溯
        while (u-- > 0) {
            result[u] = v;
            v = p[v];
        }
        return result;
    }

    var doc = document;
    var nodeOps = {
        insert: function (child, parent, anchor) {
            parent.insertBefore(child, anchor || null);
        },
        createElement: function (tag) {
            var el = doc.createElement(tag);
            return el;
        },
        setElementText: function (el, text) {
            el.textContent = text;
        },
        remove: function (child) {
            var parent = child.parentNode;
            if (parent) {
                parent.removeChild(child);
            }
        },
        createText: function (text) { return doc.createTextNode(text); },
        setText: function (node, text) {
            node.nodeValue = text;
        },
        createComment: function (text) { return doc.createComment(text); }
    };

    function patchAttr(el, key, value) {
        if (value === null) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, value);
        }
    }

    function patchClass(el, value) {
        if (value == null) {
            el.removeAttribute('class');
        }
        else {
            el.className = value;
        }
    }

    function patchEvent(el, rawName, prevValue, nextValue) {
        var invokers = el._vei || (el._vei = {});
        var existingInvoker = invokers[rawName];
        if (nextValue && existingInvoker) {
            existingInvoker.value = nextValue;
        }
        else {
            var name_1 = parseName(rawName);
            if (nextValue) {
                var invoker = (invokers[rawName] = createInvoker(nextValue));
                el.addEventListener(name_1, invoker);
            }
            else if (existingInvoker) {
                el.removeEventListener(name_1, existingInvoker);
                invokers[rawName] = undefined;
            }
        }
    }
    function parseName(name) {
        return name.slice(2).toLowerCase();
    }
    function createInvoker(initialValue) {
        var invoker = function (e) {
            invoker.value && invoker.value();
        };
        invoker.value = initialValue;
        return invoker;
    }

    function patchDOMProp(el, key, value) {
        try {
            el[key] = value;
        }
        catch (error) {
            console.warn("[vue:warn]: ".concat(error));
        }
    }

    function patchStyle(el, prev, next) {
        var style = el.style;
        var isCssString = isString(next);
        if (next && !isCssString) {
            for (var key in next) {
                setStyle(style, key, next[key]);
            }
            if (prev && !isString(prev)) {
                for (var key in prev) {
                    if (next[key] == null) {
                        setStyle(style, key, '');
                    }
                }
            }
        }
    }
    function setStyle(style, name, val) {
        style[name] = val;
    }

    var patchProp = function (el, key, prevValue, nextValue) {
        if (key === 'class') {
            patchClass(el, nextValue);
        }
        else if (key === 'style') {
            patchStyle(el, prevValue, nextValue);
        }
        else if (isOn(key)) {
            patchEvent(el, key, prevValue, nextValue);
        }
        else if (shouldSetAsProp(el, key)) {
            patchDOMProp(el, key, nextValue);
        }
        else {
            patchAttr(el, key, nextValue);
        }
    };
    function shouldSetAsProp(el, key) {
        if (key === 'form') {
            return false;
        }
        if (key === 'list' && el.tagName === 'INPUT') {
            return false;
        }
        if (key === 'type' && el.tagName === 'TEXTAREA') {
            return false;
        }
        return key in el;
    }

    var rendererOptions = extend({ patchProp: patchProp }, nodeOps);
    var renderer;
    function ensureRenderer() {
        return renderer || (renderer = createRenderer(rendererOptions));
    }
    var render = function () {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        (_a = ensureRenderer()).render.apply(_a, __spreadArray([], __read(args), false));
    };
    var createApp = function () {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        console.log(ensureRenderer());
        var app = (_a = ensureRenderer()).createApp.apply(_a, __spreadArray([], __read(args), false));
        var mount = app.mount;
        app.mount = function (containerOrSelector) {
            var container = normalizeContainer(containerOrSelector);
            if (!container)
                return;
            mount(container);
        };
        return app;
    };
    function normalizeContainer(container) {
        if (isString(container)) {
            var res = document.querySelector(container);
            return res;
        }
        return container;
    }

    var _a;
    var CREATE_ELEMENT_VNODE = Symbol('createElementVNode');
    var CREATE_VNODE = Symbol('createVNode');
    var TO_DISPLAY_STRING = Symbol('toDisplayString');
    var CREATE_COMMENT = Symbol("createCommentVNode");
    /**
     * const {xxx} = Vue
     * 即：从 Vue 中可以被导出的方法，我们这里统一使用  createVNode
     */
    var helperNameMap = (_a = {},
        // 在 renderer 中，通过 export { createVNode as createElementVNode }
        _a[CREATE_ELEMENT_VNODE] = 'createElementVNode',
        _a[CREATE_VNODE] = 'createVNode',
        _a[TO_DISPLAY_STRING] = 'toDisplayString',
        _a[CREATE_COMMENT] = 'createCommentVNode',
        _a);

    function isText(node) {
        return node.type === 5 /* NodeTypes.INTERPOLATION */
            || node.type === 2 /* NodeTypes.TEXT */;
    }
    function getVNodeHelper(ssr, isComponent) {
        return ssr || isComponent ? CREATE_VNODE : CREATE_ELEMENT_VNODE;
    }
    function isVSlot(p) {
        return p.type === 7 /* NodeTypes.DIRECTIVE */ && p.name === 'slot';
    }
    function getMemoedVNodeCall(node) {
        return node;
    }
    function createObjectExpression(properties) {
        return {
            type: 15 /* NodeTypes.JS_OBJECT_EXPRESSION */,
            loc: {},
            properties: properties
        };
    }
    function injectProp(node, prop) {
        var propsWithInjection;
        var props = node.type === 13 /* NodeTypes.VNODE_CALL */ ? node.props : node.arguments[2];
        if (props == null || isString(props)) {
            propsWithInjection = createObjectExpression([prop]);
        }
        if (node.type === 13 /* NodeTypes.VNODE_CALL */) {
            node.props = propsWithInjection;
        }
    }

    var aliasHelper = function (s) { return "".concat(helperNameMap[s], ": _").concat(helperNameMap[s]); };
    function createCodegenContext(ast) {
        var context = {
            // render 函数代码字符串
            code: "",
            // 运行时全局的变量名
            runtimeGlobalName: 'Vue',
            // 模板源
            source: ast.loc.source,
            // 缩进级别
            indentLevel: 0,
            // 需要触发的方法，关联 JavaScript AST 中的 helpers
            helper: function (key) {
                return "_".concat(helperNameMap[key]);
            },
            /**
             * 插入代码
             */
            push: function (code) {
                context.code += code;
            },
            /**
             * 新的一行
             */
            newline: function () {
                newline(context.indentLevel);
            },
            /**
             * 控制缩进 + 换行
             */
            indent: function () {
                newline(++context.indentLevel);
            },
            /**
             * 控制缩进 + 换行
             */
            deindent: function () {
                newline(--context.indentLevel);
            }
        };
        function newline(n) {
            context.code += '\n' + "  ".repeat(n);
        }
        return context;
    }
    function generate(ast) {
        var context = createCodegenContext(ast);
        var push = context.push, newline = context.newline, indent = context.indent, deindent = context.deindent;
        genFunctionPreamble(context);
        var functionName = "render";
        var args = ['_ctx', '_cache'];
        var signature = args.join(', ');
        push("function ".concat(functionName, "(").concat(signature, ") {"));
        indent();
        push("with (_ctx) {");
        indent();
        var hasHelpers = ast.helpers.length > 0;
        if (hasHelpers) {
            push("const { ".concat(ast.helpers.map(aliasHelper).join(', '), " } = _Vue"));
            push("\n");
            newline();
        }
        newline();
        push("return ");
        if (ast.codegenNode) {
            genNode(ast.codegenNode, context);
        }
        else {
            push("null");
        }
        deindent();
        push("}");
        deindent();
        push("}");
        return {
            ast: ast,
            code: context.code
        };
    }
    function genFunctionPreamble(context) {
        var push = context.push, newline = context.newline, runtimeGlobalName = context.runtimeGlobalName;
        var VueBinding = runtimeGlobalName;
        push("const _Vue = ".concat(VueBinding, "\n"));
        newline();
        push("return ");
    }
    function genNode(node, context) {
        switch (node.type) {
            case 1 /* NodeTypes.ELEMENT */:
            case 9 /* NodeTypes.IF */:
                genNode(node.codegenNode, context);
                break;
            case 13 /* NodeTypes.VNODE_CALL */:
                genVNodeCall(node, context);
                break;
            case 2 /* NodeTypes.TEXT */:
                genText(node, context);
                break;
            case 4 /* NodeTypes.SIMPLE_EXPRESSION */:
                genExpression(node, context);
                break;
            case 5 /* NodeTypes.INTERPOLATION */:
                genInterpolation(node, context);
                break;
            case 8 /* NodeTypes.COMPOUND_EXPRESSION */:
                genCompoundExpression(node, context);
                break;
            case 14 /* NodeTypes.JS_CALL_EXPRESSION */:
                genCallExpression(node, context);
                break;
            case 19 /* NodeTypes.JS_CONDITIONAL_EXPRESSION */:
                genConditionalExpression(node, context);
                break;
        }
    }
    function genCallExpression(node, context) {
        var push = context.push, helper = context.helper;
        var callee = isString(node.callee) ? node.callee : helper(node.callee);
        push(callee + "(", node);
        genNodeList(node.arguments, context);
        push(")");
    }
    function genConditionalExpression(node, context) {
        var test = node.test, consequent = node.consequent, alternate = node.alternate, needNewline = node.newline;
        var push = context.push, indent = context.indent, deindent = context.deindent, newline = context.newline;
        if (test.type === 4 /* NodeTypes.SIMPLE_EXPRESSION */) {
            genExpression(test, context);
        }
        newline && indent();
        context.indentLevel++;
        newline || push(" ");
        push("?");
        genNode(consequent, context);
        context.indentLevel--;
        needNewline && newline();
        newline || push(" ");
        push(": ");
        var isNested = alternate.type === 19 /* NodeTypes.JS_CONDITIONAL_EXPRESSION */;
        if (!isNested) {
            context.indentLevel++;
        }
        genNode(alternate, context);
        if (!isNested) {
            context.indentLevel--;
        }
        needNewline && deindent(true /* without newline */);
    }
    function genText(node, context) {
        context.push(JSON.stringify(node.content), node);
    }
    function genVNodeCall(node, context) {
        var push = context.push, helper = context.helper;
        var tag = node.tag, props = node.props, children = node.children, patchFlag = node.patchFlag, dynamicProps = node.dynamicProps, isComponent = node.isComponent;
        var callHelper = getVNodeHelper(context.isSSR, isComponent);
        push(helper(callHelper) + '(');
        var args = genNullableArgs([tag, props, children, patchFlag, dynamicProps]);
        genNodeList(args, context);
        push(")");
    }
    function genNodeList(nodes, context) {
        var push = context.push;
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            if (isString(node)) {
                push(node);
            }
            else if (isArray(node)) {
                genNodeListAsArray(node, context);
            }
            else {
                genNode(node, context);
            }
            if (i < nodes.length - 1) {
                push(', ');
            }
        }
    }
    function genNodeListAsArray(nodes, context) {
        context.push("[");
        genNodeList(nodes, context);
        context.push("]");
    }
    function genNullableArgs(args) {
        var i = args.length;
        while (i--) {
            if (args[i] != null)
                break;
        }
        return args.slice(0, i + 1).map(function (arg) { return arg || "null"; });
    }
    function genCompoundExpression(node, context) {
        for (var i = 0; i < node.children.length; i++) {
            var child = node.children[i];
            if (isString(child)) {
                context.push(child);
            }
            else {
                genNode(child, context);
            }
        }
    }
    function genExpression(node, context) {
        var content = node.content, isStatic = node.isStatic;
        context.push(isStatic ? JSON.stringify(content) : content, node);
    }
    function genInterpolation(node, context) {
        var push = context.push, helper = context.helper;
        push("".concat(helper(TO_DISPLAY_STRING), "("));
        genNode(node.content, context);
        push(")");
    }

    function baseParse(content) {
        var context = createParserContext(content);
        var children = parseChildren(context, []);
        return createRoot(children);
    }
    function createParserContext(context) {
        return {
            source: context
        };
    }
    function createRoot(children) {
        return {
            type: 0 /* NodeTypes.ROOT */,
            children: children,
            loc: {}
        };
    }
    function parseChildren(context, ancestors) {
        var nodes = [];
        while (!isEnd(context, ancestors)) {
            var s = context.source;
            var node = void 0;
            if (startsWith(s, '{{')) {
                node = parseInterpolation(context);
            }
            else if (s[0] === '<') {
                if (/[a-z]/i.test(s[1])) {
                    node = parseElement(context, ancestors);
                }
            }
            if (!node) {
                node = parseText(context);
            }
            pushNode(nodes, node);
        }
        return nodes;
    }
    function parseInterpolation(context) {
        var _a = __read(['{{', '}}'], 2), open = _a[0], close = _a[1];
        advanceBy(context, open.length);
        var closeIndex = context.source.indexOf(close, open.length);
        var preTrimContent = parseTextData(context, closeIndex);
        var content = preTrimContent.trim();
        advanceBy(context, close.length);
        return {
            type: 5 /* NodeTypes.INTERPOLATION */,
            content: {
                type: 4 /* NodeTypes.SIMPLE_EXPRESSION */,
                isStatic: false,
                content: content
            }
        };
    }
    function parseElement(context, ancestors) {
        var element = parseTag(context, 0 /* TagType.Start */);
        ancestors.push(element);
        var children = parseChildren(context, ancestors);
        ancestors.pop();
        element.children = children;
        if (startsWithEndTagOpen(context.source, element.tag)) {
            parseTag(context, 1 /* TagType.End */);
        }
        return element;
    }
    function parseTag(context, type) {
        var match = /^<\/?([a-z][^\r\n\t\f />]*)/i.exec(context.source);
        var tag = match[1];
        advanceBy(context, match[0].length);
        advanceSpaces(context);
        var props = parseAttributes(context, type);
        var isSelfClosing = startsWith(context.source, '/>');
        advanceBy(context, isSelfClosing ? 2 : 1);
        return {
            type: 1 /* NodeTypes.ELEMENT */,
            tag: tag,
            tagType: 0 /* ElementTypes.ELEMENT */,
            children: [],
            props: props,
        };
    }
    function parseText(context) {
        var endTokens = ['<', '{{'];
        var endIndex = context.source.length;
        for (var i = 0; i < endTokens.length; i++) {
            var index = context.source.indexOf(endTokens[i], 1);
            if (index !== -1 && endIndex > index) {
                endIndex = index;
            }
        }
        var content = parseTextData(context, endIndex);
        return {
            type: 2 /* NodeTypes.TEXT */,
            content: content
        };
    }
    function startsWith(source, searchString) {
        return source.startsWith(searchString);
    }
    function parseTextData(context, length) {
        var rawText = context.source.slice(0, length);
        advanceBy(context, length);
        return rawText;
    }
    function pushNode(nodes, node) {
        nodes.push(node);
    }
    function isEnd(context, ancestors) {
        var s = context.source;
        if (startsWith(s, '</')) {
            for (var i = ancestors.length - 1; i >= 0; i--) {
                if (startsWithEndTagOpen(s, ancestors[i].tag)) {
                    return true;
                }
            }
        }
        return !s;
    }
    function startsWithEndTagOpen(source, tag) {
        return (startsWith(source, '</') &&
            source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase() &&
            /[\t\r\n\f />]/.test(source[2 + tag.length] || '>'));
    }
    function advanceBy(context, numberOfCharacters) {
        var source = context.source;
        context.source = source.slice(numberOfCharacters);
    }
    function advanceSpaces(context) {
        var match = /^[\t\r\n\f ]+/.exec(context.source);
        if (match) {
            advanceBy(context, match[0].length);
        }
    }
    function parseAttributes(context, type) {
        var props = [];
        var attributeNames = new Set();
        while (context.source.length > 0 &&
            !startsWith(context.source, '>') &&
            !startsWith(context.source, '/>')) {
            var attr = parseAttribute(context, attributeNames);
            if (type === 0 /* TagType.Start */) {
                props.push(attr);
            }
            advanceSpaces(context);
        }
        return props;
    }
    function parseAttribute(context, nameSet) {
        var match = /^[^\t\r\n\f />][^\t\r\n\f />=]*/.exec(context.source);
        var name = match[0];
        nameSet.add(name);
        advanceBy(context, name.length);
        var value = undefined;
        if (/^[\t\r\n\f ]*=/.test(context.source)) {
            advanceSpaces(context);
            advanceBy(context, 1);
            advanceSpaces(context);
            value = parseAttributeValue(context);
        }
        // 针对 v- 的指令处理
        if (/^(v-[A-Za-z0-9-]|:|\.|@|#)/.test(name)) {
            // 获取指令名称
            var match_1 = /(?:^v-([a-z0-9-]+))?(?:(?::|^\.|^@|^#)(\[[^\]]+\]|[^\.]+))?(.+)?$/i.exec(name);
            // 指令名。v-if 则获取 if
            var dirName = match_1[1];
            // TODO：指令参数  v-bind:arg
            // let arg: any
            // TODO：指令修饰符  v-on:click.modifiers
            // const modifiers = match[3] ? match[3].slice(1).split('.') : []
            return {
                type: 7 /* NodeTypes.DIRECTIVE */,
                name: dirName,
                exp: value && {
                    type: 4 /* NodeTypes.SIMPLE_EXPRESSION */,
                    content: value.content,
                    isStatic: false,
                    loc: value.loc
                },
                arg: undefined,
                modifiers: undefined,
                loc: {}
            };
        }
        return {
            type: 6 /* NodeTypes.ATTRIBUTE */,
            name: name,
            value: value && {
                type: 2 /* NodeTypes.TEXT */,
                content: value.content,
                loc: value.loc
            },
            loc: {}
        };
    }
    function parseAttributeValue(context) {
        var content = '';
        var quote = context.source[0];
        var isQuoted = quote === "\"" || quote === "'";
        if (isQuoted) {
            advanceBy(context, 1);
            var endIndex = context.source.indexOf(quote);
            if (endIndex === -1) {
                content = parseTextData(context, context.source.length);
            }
            else {
                content = parseTextData(context, endIndex);
                advanceBy(context, 1);
            }
        }
        return { content: content, isQuoted: isQuoted, loc: {} };
    }

    /**
     * 单个元素的根节点
     */
    function isSingleElementRoot(root, child) {
        var children = root.children;
        return children.length === 1 && child.type === 1 /* NodeTypes.ELEMENT */;
    }

    function createTransformContext(root, _a) {
        var _b = _a.nodeTransforms, nodeTransforms = _b === void 0 ? [] : _b;
        var context = {
            nodeTransforms: nodeTransforms,
            root: root,
            helpers: new Map(),
            currentNode: root,
            parent: null,
            childIndex: 0,
            helper: function (name) {
                var count = context.helpers.get(name) || 0;
                context.helpers.set(name, count + 1);
                return name;
            },
            replaceNode: function (node) {
                context.parent.children[context.childIndex] = context.currentNode = node;
            },
        };
        return context;
    }
    function transform(root, options) {
        var context = createTransformContext(root, options);
        traverseNode(root, context);
        createRootCodegen(root);
        root.helpers = __spreadArray([], __read(context.helpers.keys()), false);
        root.components = [];
        root.directives = [];
        root.imports = [];
        root.hoists = [];
        root.temps = [];
        root.cached = [];
    }
    function traverseNode(node, context) {
        context.currentNode = node;
        var nodeTransforms = context.nodeTransforms;
        var exitFns = [];
        for (var i_1 = 0; i_1 < nodeTransforms.length; i_1++) {
            var onExit = nodeTransforms[i_1](node, context);
            if (onExit) {
                if (isArray(onExit)) {
                    exitFns.push.apply(exitFns, __spreadArray([], __read(onExit), false));
                }
                else {
                    exitFns.push(onExit);
                }
            }
            if (!context.currentNode) {
                return;
            }
            else {
                node = context.currentNode;
            }
        }
        switch (node.type) {
            case 10 /* NodeTypes.IF_BRANCH */:
            case 1 /* NodeTypes.ELEMENT */:
            case 0 /* NodeTypes.ROOT */:
                traverseChildren(node, context);
                break;
            case 5 /* NodeTypes.INTERPOLATION */:
                context.helper(TO_DISPLAY_STRING);
                break;
            case 9 /* NodeTypes.IF */:
                for (var i_2 = 0; i_2 < node.branches.length; i_2++) {
                    traverseNode(node.branches[i_2], context);
                }
                break;
        }
        context.currentNode = node;
        var i = exitFns.length;
        while (i--) {
            exitFns[i]();
        }
    }
    function traverseChildren(parent, context) {
        parent.children.forEach(function (node, index) {
            context.parent = parent;
            context.childIndex = index;
            traverseNode(node, context);
        });
    }
    function createRootCodegen(root) {
        var children = root.children;
        if (children.length === 1) {
            var child = children[0];
            if (isSingleElementRoot(root, child) && child.codegenNode) {
                var codegenNode = child.codegenNode;
                root.codegenNode = codegenNode;
            }
        }
    }
    function createStructuralDirectiveTransform(name, fn) {
        var matches = isString(name)
            ? function (n) { return n === name; }
            : function (n) { return name.test(n); };
        return function (node, context) {
            if (node.type === 1 /* NodeTypes.ELEMENT */) {
                var props = node.props;
                if (node.tagType === 3 /* ElementTypes.TEMPLATE */ && props.some(isVSlot)) {
                    return;
                }
                var exitFns = [];
                for (var i = 0; i < props.length; i++) {
                    var prop = props[i];
                    if (prop.type === 7 /* NodeTypes.DIRECTIVE */ && matches(prop.name)) {
                        props.splice(i, 1);
                        i--;
                        var onExit = fn(node, prop, context);
                        if (onExit)
                            exitFns.push(onExit);
                    }
                }
                return exitFns;
            }
        };
    }

    function createVNodeCall(context, tag, props, children) {
        if (context) {
            context.helper(CREATE_ELEMENT_VNODE);
        }
        return {
            type: 13 /* NodeTypes.VNODE_CALL */,
            tag: tag,
            props: props,
            children: children
        };
    }
    function createCompoundExpression(children, loc) {
        return {
            type: 8 /* NodeTypes.COMPOUND_EXPRESSION */,
            loc: loc,
            children: children
        };
    }
    function createConditionalExpression(test, consequent, alternate, newline) {
        if (newline === void 0) { newline = true; }
        return {
            type: 19 /* NodeTypes.JS_CONDITIONAL_EXPRESSION */,
            test: test,
            consequent: consequent,
            alternate: alternate,
            newline: newline,
            loc: {}
        };
    }
    function createCallExpression(callee, args) {
        return {
            type: 14 /* NodeTypes.JS_CALL_EXPRESSION */,
            loc: {},
            callee: callee,
            arguments: args
        };
    }
    function createSimpleExpression(content, isStatic) {
        return {
            type: 4 /* NodeTypes.SIMPLE_EXPRESSION */,
            loc: {},
            content: content,
            isStatic: isStatic
        };
    }
    function createObjectProperty(key, value) {
        return {
            type: 16 /* NodeTypes.JS_PROPERTY */,
            loc: {},
            key: isString(key) ? createSimpleExpression(key, true) : key,
            value: value
        };
    }

    var transformElement = function (node, context) {
        return function postTransformElement() {
            node = context.currentNode;
            if (node.type !== 1 /* NodeTypes.ELEMENT */) {
                return;
            }
            var tag = node.tag;
            var vnodeTag = "\"".concat(tag, "\"");
            var vnodeProps = [];
            var vnodeChildren = node.children;
            node.codegenNode = createVNodeCall(context, vnodeTag, vnodeProps, vnodeChildren);
        };
    };

    var transformText = function (node, context) {
        if (node.type === 0 /* NodeTypes.ROOT */ ||
            node.type === 1 /* NodeTypes.ELEMENT */ ||
            node.type === 11 /* NodeTypes.FOR */ ||
            node.type === 10 /* NodeTypes.IF_BRANCH */) {
            return function () {
                var children = node.children;
                var currentContainer;
                for (var i = 0; i < children.length; i++) {
                    var child = children[i];
                    if (isText(child)) {
                        for (var j = i + 1; j < children.length; j++) {
                            var next = children[j];
                            if (isText(next)) {
                                if (!currentContainer) {
                                    currentContainer = children[i] = createCompoundExpression([child], child.loc);
                                }
                                currentContainer.children.push(" + ", next);
                                children.splice(j, 1);
                                j--;
                            }
                            else {
                                currentContainer = undefined;
                                break;
                            }
                        }
                    }
                }
            };
        }
    };

    var transformIf = createStructuralDirectiveTransform(/^(if|else|else-if)$/, function (node, dir, context) {
        return processIf(node, dir, context, function (ifNode, branch, isRoot) {
            var key = 0;
            return function () {
                if (isRoot) {
                    ifNode.codegenNode = createCodegenNodeForBranch(branch, key, context);
                }
            };
        });
    });
    function processIf(node, dir, context, processCodegen) {
        if (dir.name === "if") {
            var branch = createIfBranch(node, dir);
            var ifNode = {
                type: 9 /* NodeTypes.IF */,
                loc: node.loc,
                branches: [branch]
            };
            context.replaceNode(ifNode);
            if (processCodegen) {
                return processCodegen(ifNode, branch, true);
            }
        }
    }
    function createIfBranch(node, dir) {
        return {
            type: 10 /* NodeTypes.IF_BRANCH */,
            loc: node.loc,
            condition: dir.exp,
            children: [node]
        };
    }
    function createCodegenNodeForBranch(branch, keyIndex, context) {
        if (branch.condition) {
            return createConditionalExpression(branch.condition, createChildrenCodegenNode(branch, keyIndex), createCallExpression(context.helper(CREATE_COMMENT), ['"v-if"', 'true']));
        }
        else {
            return createChildrenCodegenNode(branch, keyIndex);
        }
    }
    function createChildrenCodegenNode(branch, keyIndex) {
        var keyProperty = createObjectProperty("key", createSimpleExpression("".concat(keyIndex), false));
        var children = branch.children;
        var firstChild = children[0];
        var ret = firstChild.codegenNode;
        var vnodeCall = getMemoedVNodeCall(ret);
        injectProp(vnodeCall, keyProperty);
        return ret;
    }

    function baseCompile(template, options) {
        if (options === void 0) { options = {}; }
        var ast = baseParse(template.trim());
        transform(ast, extend(options, {
            nodeTransforms: [
                transformElement,
                transformText,
                transformIf
            ]
        }));
        return generate(ast);
    }

    function compile(template, options) {
        return baseCompile(template, options);
    }

    function compileToFunction(template, options) {
        var code = compile(template, options).code;
        var render = new Function(code)();
        return render;
    }
    registerRuntimeCompiler(compileToFunction);

    exports.Comment = Comment;
    exports.EMPTY_OBJ = EMPTY_OBJ;
    exports.Fragment = Fragment;
    exports.NO = NO;
    exports.ReactiveEffect = ReactiveEffect;
    exports.Text = Text;
    exports.compile = compileToFunction;
    exports.computed = computed;
    exports.createApp = createApp;
    exports.createCommentVNode = createCommentVNode;
    exports.createElementVNode = createVNode;
    exports.createRenderer = createRenderer;
    exports.effect = effect;
    exports.extend = extend;
    exports.h = h;
    exports.hasChange = hasChange;
    exports.isArray = isArray;
    exports.isFunction = isFunction;
    exports.isObject = isObject;
    exports.isOn = isOn;
    exports.isReactive = isReactive;
    exports.isString = isString;
    exports.nodeOps = nodeOps;
    exports.normalizeClass = normalizeClass;
    exports.queuePreFlushCb = queuePreFlushCb;
    exports.reactive = reactive;
    exports.ref = ref;
    exports.registerRuntimeCompiler = registerRuntimeCompiler;
    exports.render = render;
    exports.toDisplayString = toDisplayString;
    exports.watch = watch;

    return exports;

})({});
//# sourceMappingURL=vue.js.map
