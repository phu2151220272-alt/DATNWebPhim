import App from '../App';
import BookMovie from '../Pages/BookMovie';
import DetailMovie from '../Pages/DetailMovie';
// import DetailBlog from '../Pages/DetailBlog';
import Login from '../Pages/Login';
import Register from '../Pages/Register';
import PaymentSuccess from '../Pages/PaymentSuccess';
import ProfileUser from '../Pages/InfoUser/ProfileUser';
import Category from '../Pages/Category';
import Admin from '../Pages/Admin/Index';
import ForgotPassword from '../Pages/ForgotPassword';
import BookingHistory from '../Pages/InfoUser/BookingHistory';

export const routes = [
    {
        path: '/',
        component: <App />,
    },
    {
        path: '/movie/:id',
        component: <DetailMovie />,
    },
    // {
    //     path: '/blog/:id',
    //     component: <DetailBlog />,
    // },
    {
        path: '/history',
        component: <BookingHistory />,
    },
    {
        path: '/login',
        component: <Login />,
    },
    {
        path: '/register',
        component: <Register />,
    },
    {
        path: '/booking/:id',
        component: <BookMovie />,
    },
    {
        path: '/payment-success/:id',
        component: <PaymentSuccess />,
    },
    {
        path: '/profile',
        component: <ProfileUser />,
    },
    {
        path: '/settings',
        component: <ProfileUser />,
    },
    {
        path: '/category/:id',
        component: <Category />,
    },
    {
        path: '/admin',
        component: <Admin />,
    },
    {
        path: '/forgot-password',
        component: <ForgotPassword />,
    },
];
