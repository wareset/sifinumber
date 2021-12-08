const arrSub = (sub) => (v, k, a) => {
  a[k] = v - sub
}

// const pow = (base, exponent) => {
//   console.log(Math.pow(base, exponent))
//   let res
//   const arr = ('' + base).split('.')
//   if (arr[1])
//     res =
//       Math.pow(+arr.join(''), exponent) / Math.pow(10, arr[1].length * exponent)
//   else res = Math.pow(base, exponent)
//   return res
// }

import { repeat } from '@wareset-utilites/string/repeat'
import { trimLeft } from '@wareset-utilites/string/trimLeft'
import { trimRight } from '@wareset-utilites/string/trimRight'
import { padEnd } from '@wareset-utilites/string/padEnd'
import { padStart } from '@wareset-utilites/string/padStart'

// const sortByMinMax = (v1, v2, key) =>
//   v1[key].length > v2[key].length ? [v2, v1] : [v1, v2]

const __adequationFactory__ = (key, fn) => (that, some) => {
  const int1L = that[key].length
  const int2L = some[key].length
  if (int1L !== int2L) {
    if (int1L < int2L) that[key] = fn(that[key], int2L, '0')
    else some[key] = fn(some[key], int1L, '0')
  }
}

const __adequationInt__ = __adequationFactory__('int', padStart)
const __adequationFrac__ = __adequationFactory__('frac', padEnd)

const __resign__ = (that) => {
  that.sign = that.sign === '+' ? '-' : '+'
}

const __plus__ = (min, max, transfer) => {
  let res = ''
  for (let sum, i = max.length; i-- > 0;) {
    transfer = (sum = +min[i] + +max[i] + transfer) > 9 ? (sum -= 10, 1) : 0
    res = sum + res
  }
  return [res, transfer]
}

const __minus__ = (min, max, transfer) => {
  let res = ''
  for (let sum, i = max.length; i-- > 0;) {
    transfer = (sum = +min[i] - +max[i] - transfer) < 0 ? (sum += 10, 1) : 0
    res = sum + res
  }
  return [res, transfer]
}

const __slash_or_percent__ = (that, some, isSlash) => {
  const res = new SIFINumber('0')

  const pres = some.frac.length
  if (pres) {
    that.frac = padEnd(that.frac, pres, '0')
    that.int += that.frac.slice(0, pres)
    that.frac = that.frac.slice(pres)
  }
  let offset = that.frac.length
  that.int += that.frac, some.int += some.frac
  that.frac = some.frac = '', that._normalize(), some._normalize()

  if (isSlash) {
    if (offset < SIFINumber.precision) {
      that.int += repeat('0', SIFINumber.precision - offset)
      offset = SIFINumber.precision
    }
  } else if (offset) some.int += padEnd(that.frac, offset, '0')

  some.sign = '-'
  let int1 = that.int
  const int2 = some.int
  let int1L = int1.length
  const int2L = int2.length

  let self
  let coef = 0
  let count = 0
  // const n = 1
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if ((that.int = int1.slice(0, coef = int2L)) <= int2) {
      that.int += int1[coef++] || ''
    }

    count = -1
    that.sign = '+'
    while (that.sign === '+') self = new SIFINumber(that), count++, that.plus(some)

    // console.log(333, res.int)
    if ((coef = int1L - coef) < 0) break
    int1L = (int1 = self.int + (coef ? int1.slice(-coef) : '')).length
    res.plus(count + repeat('0', coef))
  }

  if (isSlash) {
    self.int && res.plus(+(self.int + repeat('0', coef)) / +int2)
    if (offset) {
      res.frac = res.int.slice(-offset) + res.frac
      res.int = res.int.slice(0, -offset)
    }
  } else {
    offset += pres
    if (!offset) offset--
    res.int = self.int.slice(0, -offset)
    res.frac = self.int.slice(-offset)
    // console.log(333, [pres, self.int, self.int + repeat('0', coef)])
  }

  return res
}

const __compare__ = (that, some) => {
  that._normalize(), some = new SIFINumber(some)

  let l1, l2
  let res = 0
  if (that.sign !== some.sign) {
    res = some.sign === '+' ? 1 : -1
  } else {
    if (that.isInfinity !== some.isInfinity) {
      res = some.isInfinity ? 1 : -1
    } else if (that.int !== some.int) {
      l1 = that.int.length, l2 = some.int.length
      res = (l1 === l2 ? that.int < some.int : l1 < l2) ? 1 : -1
    } else if (that.frac !== some.frac) {
      l1 = that.frac.length, l2 = some.frac.length
      res = (l1 === l2 ? that.frac < some.frac : l1 < l2) ? 1 : -1
    }
    if (some.sign !== '+') res *= -1
  }

  return res
}

const __isNaN__ = (that) => !!that.isNaN
const __isInfinity__ = (that) => !!that.isInfinity
// const __isZero__ = (that) =>
//   !that.int && !that.frac && !__isNaN__(that) && !__isInfinity__(that)

class SIFINumber {
  static precision = 100
  static PI = new SIFINumber(
    '3,14159265358979323846264338327950288419716939937510582097494459230781640628620899 86280348253421170679'
  )

  static isSIFINumber(value) {
    return value instanceof SIFINumber
  }

  toString() {
    const that = this
    return __isNaN__(that)
      ? 'NaN'
      : that.sign +
          (__isInfinity__(that)
            ? 'Infinity'
            : (that.int || 0) + (that.frac ? '.' + that.frac : ''))
  }
  get string() {
    return this.toString()
  }

  valueOf() {
    return +this.toString()
  }
  get number() {
    return +this.valueOf()
  }

  /* === */
  eq(some) {
    return __compare__(this, some) === 0
  }
  /* <= */
  lte(some) {
    return __compare__(this, some) >= 0
  }
  /* >= */
  gte(some) {
    return __compare__(this, some) <= 0
  }
  /* < */
  lt(some) {
    return __compare__(this, some) > 0
  }
  /* > */
  gt(some) {
    return __compare__(this, some) < 0
  }

  constructor(some) {
    const that = this
    if (!some || !some.sign) {
      some = ('' + (some || 0))
        .replace(/[\s_]+/g, '')
        .match(
          /^(?<s>[-+])?(?<isInfinity>Infinity)?(?<isNaN>NaN)?(?<i>\d+)?(?:[.,](?<f>\d+)?)?(?:e(?<es>[-+])?(?<e>\d+))?n?$/i
        ).groups
      some.sign = some.s || '+'
      if (
        !(some.isNaN = !!some.isNaN) &&
        !(some.isInfinity = !!some.isInfinity)
      ) {
        if (!some.i) some.i = ''
        if (!some.f) some.f = ''
        if (some.e) {
          const e = +some.e
          if (some.es === '-') {
            some.f = padStart(some.i.slice(-e) + some.f, e + some.f.length, '0')
            some.i = some.i.slice(0, -e)
          } else {
            some.i = padEnd(some.i + some.f.slice(0, e), e + some.i.length, '0')
            some.f = some.f.slice(e)
          }
        }
        some.int = some.i
        some.frac = some.f
      }
    }

    that.sign = some.sign
    that.int = some.int || ''
    that.frac = some.frac || ''
    that.isNaN = some.isNaN
    that.isInfinity = some.isInfinity
    that._normalize()
  }

  _normalize() {
    const that = this
    if (that.isNaN = __isNaN__(that)) {
      that.sign = '+'; that.int = that.frac = ''; that.isInfinity = false
    } else {
      if (that.sign !== '+' && that.sign !== '-') that.sign = '+'
      if (that.isInfinity = __isInfinity__(that)) that.int = that.frac = ''
      else {
        if (that.int[0] === '0') that.int = trimLeft(that.int, '0')
        // if (SIFINumber.precision)
        //   that.frac = that.frac.slice(0, SIFINumber.precision)
        if (that.frac[that.frac.length - 1] === '0') {
          that.frac = trimRight(that.frac, '0')
        }
        if (!that.int && !that.frac) that.sign = '+'
      }
    }
    return that
  }

  /* + */
  plus(some) {
    const that = this._normalize()
    if (!__isNaN__(that)) {
      some = new SIFINumber(some)
      // console.log('ORIGIN', that, some, that.number + some.number)

      if (!(that.isNaN = __isNaN__(some))) {
        if (__isInfinity__(that)) {
          if (__isInfinity__(some)) {
            that.isNaN = !(that.isInfinity = that.sign === some.sign)
          }
        } else if (that.isInfinity = __isInfinity__(some)) {
          that.sign = some.sign
        } else if (that.sign !== some.sign &&
          that.int === some.int && that.frac === some.frac) {
          that.sign = '+'; that.int = that.frac = ''
        } else if (!that.int && !that.frac) {
          that.sign = some.sign; that.int = some.int; that.frac = some.frac
        } else if (some.int || some.frac) {
          let int = ''
          let frac = ''
          let transfer = 0

          __adequationInt__(that, some)
          __adequationFrac__(that, some)
          if (that.sign === some.sign) {
            [frac, transfer] = __plus__(that.frac, some.frac, transfer);
            [int, transfer] = __plus__(that.int, some.int, transfer)
            if (transfer) int = transfer + int
          } else if (that.int !== some.int || that.frac !== some.frac) {
            let max = that
            let min = some
            if (
              min.int > max.int ||
              min.int === max.int && min.frac > max.frac
            ) max = some, min = that;
            [frac, transfer] = __minus__(max.frac, min.frac, transfer);
            [int, transfer] = __minus__(max.int, min.int, transfer)
            that.sign = max.sign
          }

          that.int = int
          that.frac = frac
        }
      }

      that._normalize()
    }
    return that
  }
  /* - */
  minus(some) {
    some = new SIFINumber(some)
    __resign__(some)
    return this.plus(some)
  }
  /* * */
  star(some) {
    const that = this._normalize()
    if (!__isNaN__(that)) {
      some = new SIFINumber(some)
      // console.log('ORIGIN', that.number * some.number)

      if (!(that.isNaN = __isNaN__(some))) {
        if (some.sign === '-') __resign__(that)
        if (
          !(__isInfinity__(that) || (that.isInfinity = __isInfinity__(some)))
        ) {
          const a = that.int + that.frac
          const b = some.int + some.frac
          if (!a || !b) that.int = that.frac = ''
          else {
            let res = ''
            const arr = [] // Array(a.length + b.length - 1)
            for (let i = a.length; i-- > 0;) {
              for (let j = b.length; j-- > 0;) arr[i + j] = +a[i] * +b[j] + (arr[i + j] || 0)
            }
            for (let item, i = arr.length; i-- > 0;) {
              if (i && (item = arr[i]) > 9) {
                arr[i - 1] += (item - (arr[i] = item % 10)) / 10
              }
              res = arr[i] + res
            }

            const pres = -(that.frac + some.frac).length || res.length
            // console.log('GENERI', res)
            that.int = res.slice(0, pres)
            that.frac = res.slice(pres)
          }
        }
      }

      that._normalize()
    }
    return that
  }
  /* / */
  slash(some) {
    const that = this._normalize()
    if (!__isNaN__(that)) {
      some = new SIFINumber(some)
      // console.log('ORIGIN', that.number / some.number)

      if (!(that.isNaN = __isNaN__(some))) {
        if (some.sign === '-') __resign__(that)
        const sign = that.sign

        if (__isInfinity__(that)) {
          that.isNaN = __isInfinity__(some)
        } else if (__isInfinity__(some)) {
          that.int = '', that.frac = ''
        } else if (!some.int && !some.frac) {
          that.isNaN = !(that.isInfinity = !!(that.int || that.frac))
        } else if (
          (that.int || that.frac) &&
          (some.frac || some.int && some.int !== '1')
        ) {
          const res = __slash_or_percent__(that, some, true)
          that.int = res.int
          that.frac = res.frac
        }

        that.sign = sign
      }
      that._normalize()
    }
    return that
  }
  /* % */
  pcnt(some) {
    const that = this._normalize()
    if (!__isNaN__(that)) {
      some = new SIFINumber(some)
      // console.log('ORIGIN', that.number % some.number)

      if (
        !(that.isNaN =
          __isInfinity__(that) ||
          !(__isInfinity__(some) || some.int || some.frac))
      ) {
        const cmp = __compare__(that, some)
        if (!cmp) {
          that.int = that.frac = ''
        } else if (cmp < 0) {
          const sign = that.sign
          const res = __slash_or_percent__(that, some, false)
          that.sign = sign
          that.int = res.int
          that.frac = res.frac
        }
      }

      that._normalize()
    }
    return that
  }
  /* ** ^ */
  expo(some) {
    const that = this
    that._normalize(), some = new SIFINumber(some)
    console.log('ORIGIN', that.number ** some.number)

    if (!(that.isInfinity = that.isInfinity || some.isInfinity)) {
      if (!some.int && !some.frac) that.sign = '+', that.int = '1', that.frac = ''
      else if (!that.int && !that.frac) {
        that.isInfinity = some.sign === '-'
        if (!some.frac && !(+some.int[some.int.length - 1] % 2)) that.sign = '+'
      } else {
        const sign2 = some.sign
        some.sign = '+'
        let self = new SIFINumber(that)
        some.minus('1')
        if (some.int) while (some.int) some.minus('1'), that.star(self)

        if (some.frac) {
          const frac = new SIFINumber(10).slash(some.frac)
          if (frac.frac) {
            self.star(frac.frac.length * 10).star(frac.frac.length * 10)
            frac.int += frac.frac
            frac.frac = ''
          }
          console.log(2222, frac, self)
        }

        if (sign2 === '-') {
          self = new SIFINumber('1').slash(that)
          that.sign = self.sign
          that.int = self.int
          that.frac = self.frac
          that.isInfinity = self.isInfinity
        }
      }
    }
    return that._normalize()
  }

  /* | */
  root(some) {
    const that = this._normalize()
    some = new SIFINumber(some)
    console.log('ORIGIN', that.number ** (1 / some.number))

    let mul = new SIFINumber('1')
    console.log(mul)

    const m1 = new SIFINumber('-1')

    if (some.int) some.plus(m1)
    // const frac = new SIFINumber('.' + some.frac)

    const precision = SIFINumber.precision
    SIFINumber.precision = 0

    let l1, l2
    let v = 2
    let n = 0
    let self, some2, res
    let cmp
    while (n++ < 15) {
      res = new SIFINumber(mul).star(v)
      some2 = new SIFINumber(some)
      self = new SIFINumber(res)
      console.log('-----------------------------------------------------------')
      console.log('mul', mul)
      console.log('res', v, res)

      // if (frac.frac) {
      //   console.log(343434)
      //   self.star(new SIFINumber(res).star(frac))
      //   cmp = __compare__(this, self)
      //   console.log(cmp, self)
      //   console.log(this, self)
      //   if (!cmp) return res._normalize()
      // }

      while (some2.int) {
        some2.plus(m1)
        self.star(res)
        l1 = that.int.length, l2 = self.int.length
        cmp = (l1 === l2 ? that.int < self.int : l1 < l2) ? 1 : -1
        console.log(cmp)
        console.log(that, self)
        if (cmp > 0) {
          v *= 0.75
          break
        }
      }

      if (cmp < 0) mul = res
      console.log('FINAL', res)
      if (!cmp) return res._normalize()
    }
  }
}

console.dir(SIFINumber)

// const PI180 = new SIFINumber(SIFINumber.PI).slash('180')
// console.log(11, PI180)

const sit = new SIFINumber('166')
console.log(sit.root('4'))

const pow = (base, exponent) => {
  let res = 1 // Math.pow(+arr.join(''), exponent)
  if (exponent) {
    const sit = new SIFINumber(base)
    const value = res = BigInt(sit.sign + sit.int + sit.frac || 0)
    for (let i = exponent; --i > 0;) res *= value
    res = '' + res
    // console.log(sit, res)
    if (sit.frac) res += 'e-' + sit.frac.length * exponent
  }
  return +res
}

// console.log(111, Math.pow(0.55, 2), pow(0.55, 2))

const calc = (arr) =>
// for (let i = arr.length; i-- > 0;) {
//   if (arr[i] === '**') arr[i] =
// }

  arr

const highmath = (expression) => {
  const arr = expression.split(/\s+|([-+/%&^|()]|[*<>]+)/)
  for (let item, j, parenthesiss = [], i = arr.length; i-- > 0;) {
    if (!(item = arr[i])) arr.splice(i, 1), parenthesiss.forEach(arrSub(1))
    if (item === ')') parenthesiss.push(i)
    else if (item === '(') {
      j = parenthesiss.pop() - i
      parenthesiss.forEach(arrSub(j))
      arr[i] = calc(arr.splice(i, j).slice(1))
    }
  }
  return arr
}

// console.log(highmath('(-2 +5) - ((22+33 ** 2) + (1 + 3))'))

// import { startsWith } from '@wareset-utilites/string'

// const q = '20202020201818181818181818181818181818222'

// const searchrepeat = (str) => {
//   let c = 0
//   let match
//   str.replace(/(\d+)(?=\1)|\d{2}/g, (...a) => {
//     console.log(a)
//     if (!a[1]) {
//       if (--c < 0) match = null
//     } else {
//       if (!match || !startsWith(match[1], a[1]))
//         (match = a), (c = match[1].length)
//       else if (c === match[1].length) (match[1] = a[1]), (c = match[1].length)
//     }

//     return ''
//   })

//   console.log(1, match)
// }

// searchrepeat(q)
