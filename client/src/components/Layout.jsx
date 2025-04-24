// client/src/components/Layout.js
import Dock from "./Dock.jsx";
import PropTypes from 'prop-types';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
        <main className="flex-grow">{children}</main>
          <Dock />
    </div>
  );
};
Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
