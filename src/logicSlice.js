import { createSlice } from '@reduxjs/toolkit'

BigInt.prototype.toJSON = function() { return this.toString() }

const OPERAND = 'OPERAND'
const OPERATOR = 'OPERATOR'
const EQUALS = 'EQUALS'
const MINUS = '-'
const PLUS = '+'
const MULTIPLY = 'x'
const DIVIDE = '/'
const EQUAL = '='

const PRECISION = 15

const newOperand = () => {
  return {
    type: OPERAND,
    coefficient: BigInt(0),
    exponent: 0,
    isNegative: false,
    isRational: false
  }
}

const newOperator = () => {
  return {
    type: OPERATOR,
    symbol: ''
  }
}

const displayOperand = (operand) => {
  const sign = operand.isNegative ? -1 : 1
  const coeff = operand.coefficient * BigInt(sign)
  const expo = operand.exponent
  let display = coeff.toString()

  if (display.length <= -expo) {
    display = '0'.repeat(-expo - display.length + 1).concat(display)
  }

  if (expo || operand.isRational) {
    return display
      .slice(0, display.length - -expo)
      .concat(`.${display
      .slice(display.length - -expo)}`)
  } else {
    return display
  }
}

const displayFormula = (expression) => {
  const expr = [...expression]

  expr.reverse()

  return expr.map(item => {
    switch(item.type) {
      case OPERAND:
        return displayOperand(item)
      case OPERATOR:
        return `${item.symbol}`
      default:
        return ''
    }
  }).join(' ')
}

const initialState = {
  expression: [newOperand()],
  lastInput: OPERAND,
  isNegative: false,
  display: '',
  displayFormula: ''
}

const logicSlice = createSlice({
  name: 'logic',
  initialState,
  reducers: {

    allClear: (state) => {
      Object.assign(state, initialState)
    },

    addOperandDigit: (state, action) => {
      const digit = action.payload
      let operand = newOperand()

      if (state.lastInput === EQUALS) {
        state.expression = []
        state.isNegative = false
      }
      if (state.lastInput === OPERAND) {
        operand = state.expression.shift()
      }

      if (operand.coefficient <= 10n ** BigInt(PRECISION) - 1n) {
        operand.coefficient = 10n * operand.coefficient + BigInt(digit)
        operand.exponent -= operand.isRational ? 1 : 0
        operand.isNegative = state.isNegative
      }

      state.expression.unshift(operand)
      state.display = displayOperand(operand)
      state.displayFormula = displayFormula(state.expression)
      state.lastInput = OPERAND
    },

    addFraction: (state) => {
      let operand = newOperand()
      let displayAdd = ''

      if (state.lastInput === EQUALS) {
        state.expression = []
        state.isNegative = false
      }
      if (state.lastInput === OPERAND) {
        operand = state.expression.shift()
      }
      if (!operand.isRational) {
        operand.isRational = true
      }
      state.expression.unshift(operand)
      state.display = displayOperand(operand)
      state.displayFormula = displayFormula(state.expression)
      state.lastInput = OPERAND
    },

    addOperator: (state, action) => {
      let operator = newOperator()
      let symbol = action.payload
      let isNegative = false
      let formulaAdd = ''

      if (state.lastInput === OPERATOR) {
        operator = state.expression.shift()
        if (symbol === MINUS) {
          isNegative = symbol === MINUS
          symbol = operator.symbol
          formulaAdd = '-'
        }
      }
      operator.symbol = symbol

      state.expression.unshift(operator)
      state.isNegative = isNegative
      state.display = isNegative ? MINUS : operator.symbol
      state.displayFormula = displayFormula(state.expression) + formulaAdd
      state.lastInput = OPERATOR
    },

    calculateExpression: (state, action) => {
      const expression = [...state.expression]
      const formula = displayFormula(expression)
      const nextExpression = []
      const firstOrder = {
        [MULTIPLY]: true,
        [DIVIDE]: true,
        [PLUS]: false,
        [MINUS]: false,
        [EQUAL]: false
      }

      const calculate = (operator, operand1, operand2) => {
        const sign1 = operand1.isNegative ? -1 : 1
        const sign2 = operand2.isNegative ? -1 : 1
        const c1 = operand1.coefficient * BigInt(sign1)
        const c2 = operand2.coefficient * BigInt(sign2)
        const e2 = operand2.exponent
        const e1 = operand1.exponent

        const result = newOperand()

        let coeff = 0n
        let expo = 0

        switch(operator.symbol) {
          case MULTIPLY:
            coeff = c1 * c2
            expo = e1 + e2
            break

          case DIVIDE:
            expo = -PRECISION
            coeff = (c1 * 10n ** BigInt(-expo)) / c2
            expo += e1 - e2
            break

          case PLUS:
            expo = Math.min(e1, e2);
            coeff = c1 * 10n ** BigInt(-expo + e1) +
              c2 * 10n ** BigInt(-expo + e2)
            break

          case MINUS:
            expo = Math.min(e1, e2)
            coeff = c1 * 10n ** BigInt(-expo + e1) -
              c2 * 10n ** BigInt(-expo + e2)
            break

          default:
            break
        }

        while (expo < 0 && coeff % 10n === 0n) {
          coeff /= 10n
          expo++
        }

        result.coefficient = coeff > 0n ? coeff : -coeff
        result.exponent = expo
        result.isNegative = coeff < 0n
        result.isRational = expo < 0

        return result
      }

      while (expression.length > 0) {
        const operand1 = expression.pop()
        const operator = expression.pop()
        const operand2 = expression.pop()

        if (!operand2) {
          nextExpression.unshift(operand1)
        } else if (firstOrder[operator.operator]) {
          expression.push(calculate(operator, operand1, operand2))
        } else {
          expression.push(operand2)
          nextExpression.unshift(operator, operand1)
        }
      }

      while (nextExpression.length > 1) {
        const operand1 = nextExpression.pop()
        const operator = nextExpression.pop()
        const operand2 = nextExpression.pop()

        nextExpression.push(calculate(operator, operand1, operand2))
      }

      const [ result ] = nextExpression

      state.expression = nextExpression
      state.display = displayOperand(result)
      state.displayFormula = formula + ` = ${state.display}`
      state.lastInput = EQUALS
    }
  }
})

export default logicSlice.reducer

export const {
  allClear,
  addOperandDigit,
  addOperator,
  addFraction,
  calculateExpression
} = logicSlice.actions

export const selectDisplay = state => state.logic.display ?
  state.logic.display : 0

export const selectFormulaDisplay = state => state.logic.displayFormula
