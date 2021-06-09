import { useDispatch } from 'react-redux'
import { addOperator } from './logicSlice'

export const OperatorButton = (props) => {
  const dispatch = useDispatch()

  const handleClick = (e) => {
    dispatch(addOperator(props.label))
  }

  return (
    <div id={props.id} className='button button-oper' onClick={handleClick}>
      <p>{props.label}</p>
    </div>
  )
}
