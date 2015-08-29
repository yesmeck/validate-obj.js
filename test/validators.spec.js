var v = require('../validate-obj');
var expect = require('chai').expect;

describe('built-in validators:', function() {
  describe ('required:', function() {
    it('existed prop', function() {
      expect(v.validate(1, v.required)).to.equal(null);
    });
    it('non-existed prop', function () {
      expect(v.validate(null, v.required)).to.include('it is required');
    });
    it ('existed prop', function() {
      expect(v.validate(undefined, v.required)).to.include('it is required');
    })
    it ('empty string should treated as not qualified for required', function(){
      expect(v.validate('', v.required)).to.include('it is required');
    })
  });

  describe('isDate:', function() {
    it('undefined should pass', function() {
      expect(v.validate(undefined, v.isDate)).to.equal(null);
    });

    it('int should not pass', function() {
      expect(v.validate(1, v.isDate)).to.include('it is not date');
    });

    it('date should pass', function() {
      expect(v.validate(new Date(), v.isDate)).to.equal(null);
    });
  });

  describe('isString:', function() {
    it('undefined should pass', function() {
      expect(v.validate(undefined, v.isString)).to.equal(null);
    });
    it('int should not pass', function() {
      expect(v.validate(1, v.isString)).to.include('it is not string');
    });

    it('string should pass', function() {
      expect(v.validate('abc', v.isString)).to.equal(null);
    });
  });

  describe('isNumber:', function() {
    it('undefined should pass', function() {
      expect(v.validate(undefined, v.isNumber)).to.equal(null);
    });
    it('string should not pass', function() {
      expect(v.validate('fdas', v.isNumber)).to.include('it is not number');
    });

    it('number should pass', function() {
      expect(v.validate(1, v.isNumber)).to.equal(null);
    });
  });

  describe('isIn:', function() {
    it('undefined should pass', function() {
      expect(v.validate(undefined, v.isIn(['red','blue']))).to.equal(null);
    });

    it('not contained should not pass', function() {
      expect(v.validate('yellow', v.isIn(['red', 'blue']))).to.include('it must be one of (red, blue)');
    });

    it('not contained should not pass with custom string err', function() {
      expect(v.validate('yellow', v.isIn('color is invalid', ['red', 'blue']))).to.include('color is invalid');
    });

    it('not contained should not pass with custom func err', function() {
      expect(v.validate('yellow', v.isIn(function(name){return name + ' is not a valid color'}, ['red', 'blue']))).to.include('it is not a valid color');
    });

    it('contained should pass', function() {
      expect(v.validate('red', v.isIn(['red', 'blue']))).to.equal(null);
    });

    it('without params should throw', function(done) {
      try {
        expect(v.validate('red', v.isIn)).to.equal(null);
      }
      catch (e) {
        expect(e).to.equal('it: isIn has to have a array options parameter like v.isIn([\'option1\', \'option2\'])');
        done();
      }
    });
  });

  describe('minLength:', function() {
    it('int should not pass', function() {
      expect(v.validate(1, v.minLength([3]))).to.include('it must be a string and have at least 3 characters');
    });
    it('3 length should pass', function() {
      expect(v.validate('abc', v.minLength([3]))).to.equal(null);
    })
    it('2 length should not pass', function() {
      expect(v.validate('ab', v.minLength([3]))).to.include('it must be a string and have at least 3 characters');
    });
  });

  describe('isEmail', function() {
    it('valid email should pass', function() {
      expect(v.validate('john@gmail.com', v.isEmail)).to.equal(null);
      expect(v.validate('john.hacker@gmail.com', v.isEmail)).to.equal(null);
      expect(v.validate('john+1@gmail.com', v.isEmail)).to.equal(null);
    });
    it('invalid email should not pass', function() {
      expect(v.validate('johngmail.com', v.isEmail)).to.include('it is not email');
      expect(v.validate('john.hacker@', v.isEmail)).to.include('it is not email');
      expect(v.validate('john.hacker@gmail', v.isEmail)).to.include('it is not email');
      expect(v.validate('@gmail.com', v.isEmail)).to.include('it is not email');
    });

  });

  describe('maxLength:', function() {
    it('int should not pass', function() {
      expect(v.validate(1, v.maxLength([3]))).to.include('it must be a string and have at most 3 characters');
    });
    it('3 length should pass', function() {
      expect(v.validate('abc', v.maxLength([3]))).to.equal(null);
    })
    it('4 length should not pass', function() {
      expect(v.validate('abcd', v.maxLength([3]))).to.include('it must be a string and have at most 3 characters');
    });
  });

  describe('isCredit', function() {
    it('valid credit card should pass', function() {
      expect(v.validate('5212345678901234', v.isCreditCard)).to.equal(null); // mastercard
      expect(v.validate('4123456789012', v.isCreditCard)).to.equal(null); // visa 1
      expect(v.validate('4123456789012345', v.isCreditCard)).to.equal(null); // visa 2
      expect(v.validate('371234567890123', v.isCreditCard)).to.equal(null); // amex
      expect(v.validate('601112345678901234', v.isCreditCard)).to.equal(null); // diners club
      expect(v.validate('38812345678901', v.isCreditCard)).to.equal(null);
    });
    it('invalid credit card should not pass', function() {
      expect(v.validate('aa444433332222', v.isCreditCard)).to.include('it is not credit card number');
      expect(v.validate('dfdsafdasfds', v.isCreditCard)).to.include('it is not credit card number');
    });
  });

  describe('isUrl', function() {
    it('valid url should pass', function() {
      expect(v.validate('http://www.google.com', v.isUrl)).to.equal(null);
      //expect(v.validate('ftp://www.cctv.com', v.isUrl)).to.equal(null);
      expect(v.validate('https://www.yahoo.com.au', v.isUrl)).to.equal(null);
      expect(v.validate('http://g.cn/acdefee', v.isUrl)).to.equal(null);
      expect(v.validate('http://www.abc.com?color=red&name=john', v.isUrl)).to.equal(null);
    });
    it('invalid url should not pass', function() {
      expect(v.validate('httpp://www.google.com', v.isUrl)).to.include('it is not url');
      //expect(v.validate('http://www .yahoo.com', v.isUrl)).to.include('it is not url');
    });
  });

  describe('isBefore', function() {
    it('valid should pass', function () {
      expect(v.validate(new Date(2014,1,21,10,30,0), v.isBefore([new Date(2014,1,21,10,31,0)]))).to.equal(null);
    });
    it('invalid should pass', function () {
      expect(v.validate(new Date(2014,1,21,10,30,0), v.isBefore([new Date(2014,1,21,10,29,0)]))).to.include('it is not before');
    });
  });

  describe('isAfter', function() {
    it('valid should pass', function () {
      expect(v.validate(new Date(2014,1,21,10,30,0), v.isAfter([new Date(2014,1,21,10,29,0)]))).to.equal(null);
    });
    it('invalid should pass', function () {
      expect(v.validate(new Date(2014,1,21,10,30,0), v.isAfter([new Date(2014,1,21,10,31,0)]))).to.include('it is not after');
    });
  });

  describe('isBool', function() {
    it('valid should pass', function () {
      expect(v.validate(true, v.isBool)).to.equal(null);
    });
    it('invalid should pass', function () {
      expect(v.validate('', v.isBool)).to.include('it is not bool');
    });
  });

  describe('isObject', function() {
    it ('valid should pass', function() {
      expect(v.validate({}, v.isObject)).to.equal(null);
    })
    it ('invalid should pass', function() {
      expect(v.validate('', v.isObject)).to.include('it is not object');
    })
  })
});
