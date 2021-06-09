import { useSelector } from 'react-redux'

import { selectDisplay } from './logicSlice'

export const Display = () => {
  const display = useSelector(selectDisplay)

  return (
    <div className='display display-large'>
      <p className='display-text'>{display}</p>
    </div>
  )
}
