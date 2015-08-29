var v = require('../validate-obj');
var expect = require('chai').expect;

describe('samples', function() {
	it('to validate simple variables', function() {
		expect(v.validate(1, v.isNumber)).to.equal(null);
		expect(v.validate('a', v.isNumber)).to.include('it is not number');
		expect(v.validate('male', v.isIn(['male', 'female']))).to.equal(null);
		expect(v.validate('middle', v.isIn(['male', 'female']))).to.include('it must be one of (male, female)');
	});

	it('to override the error message', function() {
		expect(v.validate('a', v.isNumber('age should be a number'))).to.include('age should be a number');
		expect(v.validate('middle', v.isIn(['male', 'female'], 'gender has to be male or female'))).to.include('gender has to be male or female');
		expect(v.validate('middle', v.isIn('gender has to be male or female', ['male', 'female']))).to.include('gender has to be male or female');
	});

	it('validate with multiple validators', function() {
		expect(v.validate('a', [v.required, v.isString])).to.equal(null);

		expect(v.validate(undefined, [v.required, v.isString])).to.include('it is required');
	})

	it ('to validate array', function() {
		expect(v.validate('a', [[v.isString]])).to.include('it is not array');
		expect(v.validate(['a', 'b'], [[v.isString]])).to.equal(null);
	});

	it('To validate object', function() {
		expect(v.validate({name: 'john', age: 27}, {name: v.isString, age: v.isNumber})).to.equal(null);
		expect(v.validate({name: 'john', age: '27'}, {name: v.isString, age: v.isNumber})).to.include('it.age is not number');
	});

	it('To validate complex object', function() {
		expect(v.validate({name: 'john', orderNumber: 12345, items: [{sku: 222, quantity: 2}]},
			{name: v.isString, orderNumber: v.isNumber, items: [{ sku: v.isNumber, quantity: v.isNumber}]})).to.equal(null);
		expect(v.validate({name: 'john', orderNumber: 12345, items: [{sku: '123', quantity: 2}]},
			{name: v.isString, orderNumber: v.isNumber, items: [{ sku: v.isNumber, quantity: v.isNumber}]})).to.include('it.items[0].sku is not number'); // ==> null
	});

	describe('To extend', function() {
		it('with auto error messages', function() {
			v.register('isGender', v.build(function(value) {return value ==='male' || value ==='female';}));
			expect(v.validate('male', v.isGender)).to.equal(null);
			expect(v.validate('middle', v.isGender)).to.include('it is invalid');
		});
		it('with custom error messages', function() {
			v.register('isGender', v.build(
				function(value) {return value ==='male' || value ==='female';},
				function(name) {return  name + ' is not gender'}
			));
			expect(v.validate('male', v.isGender)).to.equal(null);
			expect(v.validate('middle', v.isGender)).to.include('it is not gender');
		});	});

});
