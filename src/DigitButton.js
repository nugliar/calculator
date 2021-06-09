import { useDispatch } from 'react-redux'
import { addOperandDigit } from './logicSlice'

export const DigitButton = (props) => {
  const dispatch = useDispatch()

  const handleClick = () => {
    dispatch(addOperandDigit(props.label))
  }

  return (
    <div id={props.id} className='button button-digit' onClick={handleClick}>
      <p>{props.label}</p>
    </div>
  )
}
