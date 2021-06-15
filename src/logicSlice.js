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

// Negative sign for PRECISION will not have any effect
const PRECISION = 20

const ERROR_SYNTAX = 'SYNTAX ERROR'
const ERROR_DIVISION_BY_ZERO = 'DIVISION BY ZERO'

// Exponentiation routine for bigint
const bigintPow = (bigint, expo) => {
  let result = BigInt(1)

  for (let i = 0; i < expo; i++) {
    result *= bigint
  }
  return result
}

// Create new operand
const newOperand = () => {
  return {
    type: OPERAND,
    coefficient: BigInt(0),
    exponent: 0,
    isNegative: false,
    isRational: false
  }
}

// Create new operator
const newOperator = () => {
  return {
    type: OPERATOR,
    symbol: ''
  }
}


// For NaN values a special big-integer operand is used.
const NAN_OPERAND = {...newOperand(), coefficient: null}

const operandSize = (operand) => {
  if (!operand || operand.coefficient === null) {
    return 'NaN'.length
  }
  return (operand.isRational ? 1 : 0) + Math.max(
    operand.coefficient.toString().length,
    Math.abs(operand.exponent)
  )
}

const clampOperand = (operand) => {

  // Remove trailing zeros

  if (!operand || operand.coefficient === null) {
    return NAN_OPERAND
  }

  let coeff = operand.coefficient
  let expo = operand.exponent

  while (expo < 0 && coeff % 10n === 0n) {
    coeff /= 10n
    expo++
  }

  return {
    ...newOperand(),
    coefficient: coeff,
    exponent: expo,
    isRational: expo !== 0,
    isNegative: operand.isNegative
  }
}

const calculatePrimitive = (operand2, operator, operand1) => {

  // Evaluate primitive expression

  if (operator === undefined) {
    return NAN_OPERAND
  }
  if (operand2 === undefined || operand2.coefficient === null) {
    return NAN_OPERAND
  }
  if (operand1 === undefined) {

    switch(operator.symbol) {
      case MINUS:
        return {...operand2, isNegative: !operand2.isNegative}
      case PLUS:
        return operand2
      default:
        return NAN_OPERAND
    }
  }
  if (operand1.coefficient === null) {
    return NAN_OPERAND
  }

  const c1 = operand1.coefficient * BigInt(operand1.isNegative ? -1 : 1)
  const c2 = operand2.coefficient * BigInt(operand2.isNegative ? -1 : 1)
  const e2 = operand2.exponent
  const e1 = operand1.exponent

  let coeff = 0n
  let expo = 0

  switch(operator.symbol) {
    case MULTIPLY:
      coeff = c1 * c2
      expo = e1 + e2
      break
    case DIVIDE:
      if (c2 === BigInt(0)) {
        throw(new Error(ERROR_DIVISION_BY_ZERO))
      }
      expo = -Math.abs(PRECISION)
      coeff = (c1 * bigintPow(10n, -expo)) / c2
      expo += e1 - e2
      break
    case PLUS:
      expo = Math.min(e1, e2);
      coeff = c1 * bigintPow(10n, -expo + e1) +
        c2 * bigintPow(10n, -expo + e2)
      break
    case MINUS:
      expo = Math.min(e1, e2)
      coeff = c1 * bigintPow(10n, -expo + e1) -
        c2 * bigintPow(10n, -expo + e2)
      break
    default:
      break
  }

  return clampOperand({
    ...newOperand(),
    coefficient: coeff > 0n ? coeff : -coeff,
    exponent: expo,
    isNegative: coeff < 0n,
    isRational: expo < 0
  })
}

const displayOperand = (operand) => {

  const sizeLimit = Math.abs(PRECISION)

  if (!operand || operand.coefficient === null) {
    return ('NaN')
  }
  const sign = operand.isNegative ? '-' : ''
  const coeff = operand.coefficient
  const expo = operand.exponent
  const sizeOperand = operandSize(operand)

  let coeffDisplay = coeff.toString()
  let display = ''

  // If exponent too large, use exponential form.
  if (sizeOperand > sizeLimit) {
    const sizeExpo = coeffDisplay.length - 1 + expo
    const expoDisplay = sizeExpo ? `e${sizeExpo < 0 ? '' : '+'}${sizeExpo}` : ''

    if (coeff === BigInt(0)) {
      return sign + '0'
    }
    if (coeffDisplay.length > 1) {
      coeffDisplay = coeffDisplay
        .slice(0, 1)
        .concat(`.${coeffDisplay.slice(1, sizeLimit - expoDisplay.length - 1)}`)
      // Remove trailing zeros
      coeffDisplay = coeffDisplay.replace(
        coeffDisplay.match(/\.?0+$/),
        ''
      )
    }
    display = coeffDisplay + expoDisplay
    return display.length <= sizeLimit ? sign + display : sign + 'inf'

  } else {
    if (operand.isRational) {
      // Prepend zeros according to exponent value.
      if (coeffDisplay.length <= Math.abs(expo)) {
        coeffDisplay = '0'
          .repeat(Math.abs(expo) - coeffDisplay.length + 1)
          .concat(coeffDisplay)
      }
      // Display operand as fixed point number (insert dot).
      coeffDisplay = coeffDisplay
        .slice(0, coeffDisplay.length - Math.abs(expo))
        .concat(`.${coeffDisplay.slice(coeffDisplay.length - Math.abs(expo))}`)

    } else {
      // Append zeros accroding to exponent value.
      coeffDisplay = coeffDisplay.concat('0'.repeat(expo))
    }
    return sign + coeffDisplay
  }
}

const displayFormula = (expression) => {
  const expr = [...expression]

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

// Extract big-integer array from redux state
// to avoid "non-serializable type" redux error

let bigIntExpression = []

// Array is a sequence of operands and operator which form
// a mathematical expression. Numbers are represented
// as a big-integers in the following form:

// NUMBER = COEFFICIENT * 10 ^ EXPONENT

// This form allows big-integer rational numbers

const initialState = {
  lastInput: '',
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
      bigIntExpression = []
    },

    addOperandDigit: (state, action) => {

      // Add digit to operand on top ofthe stack, if any.
      // Create new operand if needed.

      const digit = action.payload
      let operand = newOperand()

      if (state.lastInput === EQUALS) {
        bigIntExpression = []
        state.isNegative = false
      }
      if (state.lastInput === OPERAND) {
        operand = bigIntExpression.pop()
      }

      const sizeLimit = Math.abs(PRECISION)
      const sizeOperand = operandSize(operand)

      // Add digit only if operand size is within precision limits
      if (sizeOperand < sizeLimit) {
        operand.coefficient = 10n * operand.coefficient + BigInt(digit)
        operand.exponent -= operand.isRational ? 1 : 0
        operand.isNegative = state.isNegative
      }

      bigIntExpression.push(operand)
      state.display = displayOperand(operand)
      state.displayFormula = displayFormula(bigIntExpression)
      state.lastInput = OPERAND
    },

    addFraction: (state) => {

      // Set isRational flag for operand on top ofthe stack, if any.
      // Create new operand if needed.

      let operand = newOperand()

      if (state.lastInput === EQUALS) {
        bigIntExpression = []
        state.isNegative = false
      }
      if (state.lastInput === OPERAND) {
        operand = bigIntExpression.pop()
      }
      if (!operand.isRational) {
        const sizeLimit = Math.abs(PRECISION)
        const sizeOperand = operandSize(operand)

        if (sizeOperand < sizeLimit) {
          operand.isRational = true
        }
      }
      bigIntExpression.push(operand)
      state.display = displayOperand(operand)
      state.displayFormula = displayFormula(bigIntExpression)
      state.lastInput = OPERAND
    },

    addOperator: (state, action) => {

      // If top of the stack is operator, then replace it
      // with current operator, otherwise add new operator on to
      // the stack. If current operator is minus and
      // top of the stack is operator, then treat minus operator as
      // a negative sign.

      let operator = newOperator()
      let symbol = action.payload
      let isNegative = false
      let formulaAdd = ''

      if (state.lastInput === OPERATOR) {
        operator = bigIntExpression.pop()
        if (symbol === MINUS) {
          isNegative = symbol === MINUS
          symbol = operator.symbol
          formulaAdd = '-'
        }
      }
      operator.symbol = symbol

      bigIntExpression.push(operator)
      state.isNegative = isNegative
      state.display = isNegative ? MINUS : operator.symbol
      state.displayFormula = displayFormula(bigIntExpression) + formulaAdd
      state.lastInput = OPERATOR
    },

    calculateExpression: (state, action) => {

      // Convert expression to postfix form and calculate

      // If last item in expression is operator, then remove it
      if (bigIntExpression.length > 0) {
        const lastItem = bigIntExpression[bigIntExpression.length - 1]
        if (lastItem.type === OPERATOR) {
          bigIntExpression.pop()
        }
      }
      // Stop if nothing to calculate
      if (bigIntExpression.length === 0) {
        Object.assign(state, initialState)
        return
      }

      state.displayFormula = displayFormula(bigIntExpression)

      // Precedense of operators
      const order = {
        [MULTIPLY]: 2,
        [DIVIDE]: 2,
        [PLUS]: 1,
        [MINUS]: 1,
        [EQUAL]: 1
      }

      // Convert to postfix form (operator follows operands)
      let postfixExpr = []
      let operatorStack = []
      let prevOperator = undefined

      if (bigIntExpression[0].type === OPERAND) {
        postfixExpr.unshift(bigIntExpression.shift())
      }
      prevOperator = bigIntExpression[0]

      while (bigIntExpression.length > 0) {
        const item = bigIntExpression.shift()

        if (item.type === OPERATOR) {
          operatorStack.unshift(item)

        } else if (item.type === OPERAND) {

          const operator = operatorStack[0]

          if (prevOperator) {
            if (order[prevOperator.symbol] < order[operator.symbol]) {
              operatorStack.unshift(postfixExpr.shift())
            }
          }
          postfixExpr.unshift(...operatorStack, item)
          prevOperator = operatorStack[0]
          operatorStack = []
        }
      }

      if (operatorStack.length > 0) {
        Object.assign(state, initialState)
        state.display = ERROR_SYNTAX
        return
      }

      let operandStack = []

      // Evaluate postfix expression
      while (postfixExpr.length > 0) {
        const item = postfixExpr.pop()

        if (item.type === OPERAND) {
          operandStack.push(
            clampOperand(item)
          )
        } else {
          try {
            operandStack.push(
              calculatePrimitive(
                operandStack.pop(),
                item,
                operandStack.pop()
              )
            )
          } catch(error) {
            Object.assign(state, initialState)
            state.display = error.message
            return
          }
        }
      }

      // Display result and update expression stack
      if (operandStack.length === 1) {
        state.display = displayOperand(...operandStack)
        state.displayFormula += ` = ${state.display}`
        bigIntExpression = [...operandStack]
      } else {
        Object.assign(state, initialState)
        state.display = ERROR_SYNTAX
      }

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
