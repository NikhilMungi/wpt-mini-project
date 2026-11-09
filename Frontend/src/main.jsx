// ==============================================================================
// ⚛️ REACT ROOT CLIENT ENTRY POINT (main.jsx)
// ==============================================================================
// PURPOSE:
// This is the absolute starting point of the frontend React application.
// When a user visits CineBook in their web browser, Vite compiles this file first.
// It initializes React and injects the top-level <App /> component into the
// `<div id="root"></div>` container located inside `index.html`.
// ==============================================================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';

// 1. Import Bootstrap 5 CSS & JS bundle:
// Provides the responsive 12-column grid system, buttons, modal dialogs, and styling utilities.
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// 2. Import Master Application Component:
// Houses the client-side routing, navigation bar, and footer.
import App from './App.jsx';

// 3. Import Global Custom Styles:
// Contains typography, dark hero banners, card elevations, and seat matrix layout.
import "./style/App.css";

// 4. Mount React Application to the Document Object Model (DOM):
// `createRoot` activates React 19's concurrent rendering engine.
ReactDOM.createRoot(document.getElementById('root')).render(
  // StrictMode runs additional development checks and warnings for cleaner code.
  <StrictMode>
    <App />
  </StrictMode>
);
