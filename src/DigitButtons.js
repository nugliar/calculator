import { DigitButton } from './DigitButton'
import { FractionButton } from './FractionButton'

const buttonIds = [
  'zero', 'one', 'two', 'three', 'four',
  'five', 'six', 'seven', 'eight', 'nine'
]

export const DigitButtons = () => {
  const digitButtons = buttonIds.map((id, index) => {
    return (
      <DigitButton key={id} id={buttonIds[index]} label={index} />
    )
  })

  return (
    <div id='digits' className='grid grid-row-3'>
      {digitButtons.reverse()}
      <FractionButton />
    </div>
  )
}
