//     validate-obj.js 1.5.2
//     (c) 2014 Ron Liu
//     validate-obj may be freely distributed under the MIT license.

(function (name, definition) {
	if (typeof module !== 'undefined') {
		module.exports = definition();
	} else if (typeof define === 'function' && typeof define.amd === 'object') {
		define(definition);
	} else {
		this[name] = definition();
	}
})('validate-obj', function (validator) {
	var funcAttrName = '__validator-obj__';
	var u = {
		isObject : function(o) {
			return typeof o === "object";
		},
		each: function(obj, fn) {
			if (u.isArray(obj)) {
				for(var i = 0; i < obj.length; i ++) {
					fn(obj[i], i);
				}
				return;
			}

			for(var name in obj) {
				fn(obj[name], name);
			}
		},
		contains: function(array, k) {
			for(var item in array) {
				if (k === array[item]) return true;
			}
			return false;
		},
		reduce: function(array, fn, memo) {
			var ret = memo || array[0],
				hasMemo = !!memo;

			for (var i = hasMemo ? 0 : 1; i < array.length; i ++)	{
				ret = fn(ret, array[i]);
			}
			return ret;
		},
		some: function(a) {
			if (!u.isArray(a)) return false;
			return a.length > 0;
		},
		isArray: function(a) {
			return Object.prototype.toString.call(a) === "[object Array]";
		},
		isDate: function(d) {
			return Object.prototype.toString.call(d) === "[object Date]";
		},
		isString: function(s) {
			return typeof s === 'string';
		},
		isNumber: function(s) {
			return typeof s === 'number';
		},
		isFunction: function(f) {
			return typeof f === 'function';
		},
		every: function(list, fn) {
			for(var item in list) {
				if (!fn(list[item])) return false;
			}
			return true;
		},
		has: function(obj, propName) {
			return obj.hasOwnProperty(propName);
		},
		union: function() {
			var ret = [];
			u.each(arguments, function(argument, name) {
				if (!m.existy(argument)) return;
				u.each(argument, function(item, itemName) {
					if (u.contains(ret, item)) return;
					ret.push(item);
				});
			});
			return ret;
		},
		range: function(n) {
			var ret = [];
			for(var i = 0; i < n; i ++) ret.push(i);
			return ret;
		},
		map: function(list, fn) {
			var ret = [];

			if (u.isArray(list)) {
				for (var i = 0; i < list.length; i ++) {
					ret.push(fn(list[i], i));
				}
				return ret;
			}

			for (var item in list) {
				ret.push(fn(list[item], item));
			}
			return ret;
		},
		filter: function(list, fn) {
			var ret = [];
			for (var item in list) {
				if (fn(list[item]))	ret.push(list[item]);
			}
			return ret;
		},
		identity: function(i) {return i;}
	}; // small set of underscore
	var m = {
		emptyToNull: function(list) {
			var ret = u.filter(list, u.identity);
			return u.some(ret) ? ret : null;
		},
		sprintf: function(str)
		{
			if (typeof str !== 'string') throw 'the 1st argument should be string';
			var parts = str.split('%s');
			if (parts.length != arguments.length) throw 'the number of %s in string is not equal to the number of variables';
			var ret = parts[0];
			for (var i = 1; i < arguments.length; i ++) {
				ret += arguments[i] + parts[i];
			}
			return ret;
		},
		existy:function(value) {
			return value !== undefined && value !== null;
		},
		isConcrete: function(func) {
			return u.has(func, funcAttrName) && func[funcAttrName].type === 'concrete';
		},
		isHighOrder: function(func) {
			return u.has(func, funcAttrName) && func[funcAttrName].type === 'highOrder';
		},
		needParams: function(func) {
			return u.has(func, funcAttrName) && func[funcAttrName].needParams;
		},
		funcName : function(func) {
			return u.has(func, funcAttrName) && func[funcAttrName].name;
		},
		isValidationExpression: function(v) {
			var validators = u.isArray(v) ? v : [v];
			return u.every(validators, _isValidator);

			function _isValidator(v) {
				if(!u.isFunction(v)) return false;
				return (m.isConcrete(v) || (m.isHighOrder(v) && !m.needParams(v)));
			}
		}
	}; // internal functions

	var ret = {
		hasErrors: function (obj, validatorObj, name, errs) {
			var errs = errs || [];
			name = name || 'it';

			function _validate(validators, value, name) {
				if (!u.isArray(validators)) validators = [validators];
				return u.filter(
					u.map(validators, function (validator) {
						if (m.isHighOrder(validator)) validator = validator();
						if (!m.existy(value) && m.funcName(validator) !== 'required') return null;
						return validator(value, name);
					}), u.identity);
			}

			if (m.isValidationExpression(validatorObj))	{
				return m.emptyToNull(u.union(errs, _validate(validatorObj, obj, name)));
			}

			if (u.isArray(validatorObj)) {
				if (validatorObj.length !== 1) throw 'array validation expression must have one and only one validation expression, like [[v.required, v.isString]]';
				if(!u.isArray(obj)) return [m.sprintf('%s is not array', name)];
				if(!m.isValidationExpression(validatorObj[0])) {
					u.each(obj, function(o, no) {
						errs = u.union(errs, ret.hasErrors((m.existy(o) ? o : {}), validatorObj[0], m.sprintf('%s[%s]', name, no)));
					})
					return m.emptyToNull(errs);
				}
				return m.emptyToNull(u.union(errs, u.reduce(u.map(obj, function(item, i){
					return _validate(validatorObj[0], item, m.sprintf('%s[%s]', name, i));
				}), function(a,b){return u.union(a, b)})));
			}


			if (!u.isObject(validatorObj)) throw m.sprintf("invalid validation expression: %s", name);
			u.each(validatorObj, function (validators, propName) {
				errs = u.union(errs, ret.hasErrors((m.existy(obj) ? obj : {})[propName], validators, name + '.' + propName))
			});

//			if (u.isArray(obj)) {
//				u.each(obj, function(o, no) {
//					u.each(validatorObj, function (validators, propName) {
//						errs = u.union(errs, ret.hasErrors((obj[no] || {})[propName], validators, m.sprintf('%s[%s].%s', name, no, propName)))
//					});
//				})
//				return m.emptyToNull(errs);
//			}

			return m.emptyToNull(errs);
		},

		// validator could have the following format:
		// v.func;
		// {validator: v.func, err: 'this is wrong'};
		// {validator: v.func, err: function(propName) {...}}
		// {validator: v.func, {...}
		// and array of the above
		isValidationExpression: m.isValidationExpression,

		register : function(name, func, needParams) {
			if (!u.isFunction(func)) throw 'the passing argument is not a function';
			name = name || func.name;
			if (!name) throw  'the passing argument has no name';
			var highOrderFunc = function(err, params) {
				var ret = function(value, name) {
					return func(value, name, err, params);
				};
				ret[funcAttrName] = {type:'concrete', needParams: !!needParams, name: name};
				return ret;
			};
			highOrderFunc[funcAttrName] = {type:'highOrder', needParams: !!needParams};
			ret[name] = highOrderFunc;
		},

		build: function(validateFn, errFn) {
			errFn = errFn || function(name) {return name + ' is invalid';};
			if (!u.isFunction(validateFn) || !u.isFunction(errFn)) throw 'validateFn and errFn are required';
			return function(value, name, err, params) {
				err = err || errFn;
				return validateFn(value, params) ? null : (u.isString(err) ? err : err(name, params));
			};
		}
	};

	ret.register('required', ret.build(
		function(value) {return m.existy(value);},
		function(name) {return  name + ' is required';}
	));
	ret.register('isDate', ret.build(
		u.isDate,
		function(name) {return m.sprintf('%s is not date', name);}
	));
	ret.register('isString', ret.build(
		u.isString,
		function(name) {return m.sprintf('%s is not string', name);}
	));
	ret.register('isNumber', ret.build(
		u.isNumber,
		function(name) {return m.sprintf('%s is not number', name);}
	));
	ret.register('isIn',ret.build(
		function (value, params) { return u.contains(params.options, value); },
		function (name, params) {
			return m.sprintf('%s must be one of (%s)', name,
				u.reduce(params.options, function(whole, opt) {return m.sprintf('%s, %s', whole, opt);}));
		}
	));
	ret.register('minLength', ret.build(
		function(value, params) {return u.isString(value) && value.length >= params.min;},
		function(name, params) {return m.sprintf('%s must be a string and have at least %s characters', name, params.min); }
	));

	return ret;
});