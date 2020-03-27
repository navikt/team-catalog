import * as React from 'react'
import startIll from '../resources/frontpage_ill.svg'
import { Block } from 'baseui/block'
import { theme } from '../util'

const MainPage = () => (
  <Block display='flex' justifyContent='center'>
    <Block marginTop={theme.sizing.scale1200}>
      <img src={startIll} alt='Scrum Team' width='800px'/>
    </Block>
  </Block>
)

export default MainPage
