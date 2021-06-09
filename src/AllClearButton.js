import { useDispatch } from 'react-redux'
import { allClear } from './logicSlice'

export const AllClearButton = () => {
  const dispatch = useDispatch()

  const handleClick = () => {
    dispatch(allClear())
  }

  return (
    <div id='ac' className='button button-oper' onClick={handleClick}>
      <p>AC</p>
    </div>
  )
}
