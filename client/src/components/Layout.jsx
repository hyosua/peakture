// client/src/components/Layout.js
import Dock from "./Dock.jsx";
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext.jsx';

const Layout = ({ children }) => {
    const {currentUser} = useAuth()
  return (
    <div className="min-h-screen flex flex-col">
        <main className="flex-grow">{children}</main>
        {currentUser && !currentUser.sessionId && (
            <Dock />
        )}
    </div>
  );
};
Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
