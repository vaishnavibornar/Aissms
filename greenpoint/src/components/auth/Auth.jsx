import { useLocation } from 'react-router-dom';
import Login from './Login';
import SignUp from './SignUp';

export default function Auth() {
  const location = useLocation();
  const isSignUp = location.pathname === '/signup';

  return isSignUp ? <SignUp /> : <Login />;
}
