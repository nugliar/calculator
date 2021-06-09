import { useDispatch } from 'react-redux'
import { addFraction } from './logicSlice'

export const FractionButton = () => {
  const dispatch = useDispatch()

  const handleClick = () => {
    dispatch(addFraction())
  }

  return (
    <div id='fraction' className='button button-digit' onClick={handleClick}>
      <p>.</p>
    </div>
  )
}
