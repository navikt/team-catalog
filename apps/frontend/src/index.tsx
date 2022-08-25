import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';

import Main from './main';
import { createRoot } from 'react-dom/client';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<Main />);

