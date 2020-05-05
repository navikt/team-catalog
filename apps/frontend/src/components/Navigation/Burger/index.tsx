import * as React from 'react'
import { Menu } from 'baseui/icon'
import Button from '../../common/Button'
import { Drawer, ANCHOR } from "baseui/drawer";
import { theme } from '../../../util';
import { Block, BlockProps } from 'baseui/block';
import { StyledLink } from 'baseui/link';
import { H6, Paragraph2 } from 'baseui/typography';
import RouteLink from '../../common/RouteLink';
import NavLogo from '../../../resources/navlogo.svg'
import { useLocation } from 'react-router-dom';

const drawerFooterProps: BlockProps = {
    display: 'flex',
    width: '100%',
    height: '100%',
    bottom: '0',
    alignItems: 'flex-end'
}

const Brand = () =>
    <StyledLink style={{ textDecoration: 'none' }} href="/">
        <H6 color="white" marginBottom="2rem">Teamkatalog</H6>
    </StyledLink>

const NavItem = (props: { to: string, text: string }) =>
    <RouteLink href={props.to} style={{ textDecoration: 'none' }}>
        <Paragraph2 color="white">{props.text}</Paragraph2>
    </RouteLink>

const BurgerMenu = () => {
    const [showMenu, setShowMenu] = React.useState<boolean>(false)
    const currentLocation = useLocation()

    React.useEffect(() => {
        if (showMenu) setShowMenu(false)
    }, [currentLocation])


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
                                    backgroundColor: theme.colors.primaryA,
                                };
                            }
                        },
                        Close: {
                            style: ({ $theme }) => {
                                return {
                                    backgroundColor: 'white'
                                };
                            }
                        }
                    }}
                >
                    <Block display="flex" flexDirection="column" alignItems="center" height="100%">
                        <Brand />
                        <Block>
                            <NavItem to="/productarea" text="Produktområder" />
                            <NavItem to="/team" text="Teams" />
                        </Block>

                        <Block {...drawerFooterProps}>
                            <Block paddingBottom={theme.sizing.scale600}>
                                <img src={NavLogo} alt='NAV logo' width="30%" />
                            </Block>
                        </Block>
                    </Block>
                </Drawer>
            )}
        </React.Fragment>


    )
}

export default BurgerMenu