import { useSelector } from 'react-redux'

import { selectFormulaDisplay } from './logicSlice'

export const FormulaDisplay = () => {
  const formula = useSelector(selectFormulaDisplay)

  return (
    <div className='display display-small'>
      <p className='display-text'>{formula}</p>
    </div>
  )
}
