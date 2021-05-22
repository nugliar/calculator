const buttonIds = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine'
]

export const DigitButtons = () => {
  const digitButtons = buttonIds.map((id, index) => {
    return (
      <div key={id} id={id} className='button button-digit'>
        <p>{index}</p>
      </div>
    )
  })
  const fractionButton = (
    <div key='fraction' id='fraction' className='button button-digit'>
      <p>.</p>
    </div>
  )
  return (
    <div id='digits' className='grid grid-row-3'>
      {digitButtons.reverse()}
      {fractionButton}
    </div>
  )
}
