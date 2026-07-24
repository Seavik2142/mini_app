import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import Splash from "./page/Splash";
import Introduction from "./page/Introduction";
import ContextApi from "./utils/ContextApi";
import Home from "./page/Home";
import Cart from "./page/Cart";
import Orders from "./page/Orders";
import Profile from "./page/Profile";
import AuthLogin from "./page/AuthLogin";
import { TonConnectUIProvider } from '@tonconnect/ui-react';

const Routes = createBrowserRouter([
    {
        path: '/auth',
        element: <AuthLogin />
    },
    {
        path: '/app',
        element: (
            <TonConnectUIProvider
                manifestUrl={"https://api.ascentraico.com/manifest"}
                restoreConnection
                actionsConfiguration={{ twaReturnUrl: "https://t.me/SiamDevBot/time" }}>
                <AppLayout />
            </TonConnectUIProvider>
        ),
        children: [
            {
                index: true,
                element: <Home />
            },
            {
                path: 'cart',
                element: <Cart />
            },
            {
                path: 'orders',
                element: <Orders />
            },
            {
                path: 'profile',
                element: <Profile />
            },
        ]
    },
    {
        path: '/',
        element: <Splash />
    },
    {
        path: '/intro',
        element: <ContextApi><Introduction /></ContextApi>
    },
    {
        path: '*',
        element: <Navigate to="/app" replace />
    }
]);

export default Routes;