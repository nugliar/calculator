import { DigitButtons } from './DigitButtons'
import { OperatorButton } from './OperatorButton'
import { EqualsButton } from './EqualsButton'
import { AllClearButton } from './AllClearButton'

export const Buttons = () => {

  return (
    <div id='buttons' className='grid grid-row-4'>
      <AllClearButton />
      <OperatorButton id='divide' label='/' />
      <OperatorButton id='multiply' label='x' />
      <DigitButtons />
      <OperatorButton id='subtract' label='-' />
      <OperatorButton id='add' label='+' />
      <EqualsButton />
    </div>
  )
}
