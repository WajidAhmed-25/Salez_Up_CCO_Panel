
// import React from 'react';
// import { Route, Navigate } from 'react-router-dom';
// import { useAuth } from './AuthContext';

// function ProtectedRoute({ element: Component, ...rest }) {
//     const { isAuthenticated } = useAuth();

//     return isAuthenticated ? (
//         <Route {...rest} element={Component} />
//     ) : (
//         <Navigate to="/admin_portal_login" />
//     );
// }

// export default ProtectedRoute;




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function ProtectedRoute({ children }) {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/" />;
}
