import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { routes } from './routes';

import { Provider } from './store/Provider';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Provider>
            <Router>
                <Routes>
                    {routes.map((route, index) => (
                        <Route key={index} path={route.path} element={route.component} />
                    ))}
                </Routes>
            </Router>
        </Provider>
    </StrictMode>,
);
