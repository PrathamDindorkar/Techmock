import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Hello from './components/Hello';
import AdminPortal from './components/AdminPortal';
import MockTestPage from './components/MockTestPage';
import { Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Registration';
import Layout from './components/Layout';
import Landing from './components/Landing';
import AllMocks from './components/AllMocks';
import ReviewMockPage from './components/ReviewMockPage';
import Cart from './components/Cart';
import ProfilePage from './components/Profile';
import ChangePassword from './components/ChangePassword';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/mock-test/:id" element={<MockTestPage />} />
        
        {/* Protected Routes with Layout */}
        <Route element={<Layout />}>
          <Route path="/mock-test/:id/review" element={<ReviewMockPage />} />
          <Route path='/mocks' element={<AllMocks/>}/>
          <Route path='/home' element={<Landing />} />
          <Route path="/hello" element={<Hello />} />
          <Route path="/admin" element={<AdminPortal />} />
          <Route path="/cart" element ={<Cart/>}/>
          <Route path="/profile" element={<ProfilePage/>}/>
          <Route path="/change-password" element={<ChangePassword darkMode={true} />} />
        </Route>

        {/* Redirect to Login by Default */}
        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
    </Router>
  );
};

export default App;

