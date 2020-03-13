import * as React from 'react'
import { Select } from 'baseui/select'
import { theme } from '../util';

const MainSearch = () => {
    const [value, setValue] = React.useState([]);
    return (
        <Select
            options={[]}
            value={value}
            placeholder="Søk"
            onChange={params => setValue([])}
            overrides={{
                SearchIcon: {
                  style: {
                    width: theme.sizing.scale900,
                    height: theme.sizing.scale900,
                    left: theme.sizing.scale400,
                    top: theme.sizing.scale400
                  }
                },
                Root: {
                  style: {
                    width: '600px',
                  }
                }
              }
              }
        />
    )
}

export default MainSearch