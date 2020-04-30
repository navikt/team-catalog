import * as React from 'react'
import { Menu } from 'baseui/icon'
import Button from '../common/Button'
import { Drawer, ANCHOR } from "baseui/drawer";
import { theme } from '../../util';

const BurgerMenu = () => {
    const [showMenu, setShowMenu] = React.useState<boolean>(false)

    return (
        <React.Fragment>
            {!showMenu && <Button kind="minimal" onClick={() => setShowMenu(true)}><Menu size={36} /></Button>}

            {showMenu && (
                <Drawer
                    isOpen={showMenu}
                    autoFocus
                    onClose={() => setShowMenu(false)}
                    anchor={ANCHOR.top}
                    overrides={{
                        DrawerContainer: {
                            style: () => {
                                return {
                                    backgroundColor: theme.colors.primaryA
                                };
                            }
                        }
                    }}
                >
                    Her kommer bilde
                </Drawer>
            )}
        </React.Fragment>


    )
}

export default BurgerMenu