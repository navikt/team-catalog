import React, { useReducer } from 'react'
import { Block } from 'baseui/block'
import { StatefulTooltip } from 'baseui/tooltip'
import { theme } from '../../util'

// Flipcard
const Flip = (props: { children: React.ReactNode[] }) => {
  const [child, toggle] = useReducer(p => (p + 1) % props.children.length, 0)
  return (
    <Block position='relative'>
      <Block>
        {props.children && !!props.children.length && props.children[child]}
      </Block>

      <div onClick={toggle} style={{position: 'absolute', top: 0, right: 0}}>
        <StatefulTooltip content='Flip'>
          <Block
            width={theme.sizing.scale900}
            height={theme.sizing.scale900}
            $style={{
              cursor: 'pointer',
              background: `linear-gradient(45deg, #ffffff 50%, ${theme.colors.accent200} 50%)`
            }}/>
        </StatefulTooltip>
      </div>
    </Block>
  )
}
