import { useDispatch } from 'react-redux'
import { calculateExpression } from './logicSlice'

export const EqualsButton = (props) => {
  const dispatch = useDispatch()

  const handleClick = () => {
    dispatch(calculateExpression())
  }

  return (
    <div id='equals' className='button button-oper' onClick={handleClick}>
      <p>=</p>
    </div>
  )
}
