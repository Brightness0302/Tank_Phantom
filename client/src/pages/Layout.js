import { useState } from "react";
import { connect } from "react-redux";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { logout } from "../actions/user";
import { Navigate } from "react-router-dom";
import { isMobile } from "../utils/utils";
const { Outlet, Link } = require("react-router-dom");

const Layout = ({ auth, alert, logout }) => {
  const [ showNavbar, setShowNavbar ] = useState(false)

  const ToggleNavbar = () => {
    setShowNavbar(!showNavbar)
  }

  return (
    <>
      <nav className="border-gray-200 px-2 sm:px-4  rounded dark:bg-gray-900 bg-gray-900 text-white">
        <div className="container flex flex-wrap justify-between items-center mx-auto">
          <a href="https://flowbite.com/" className="flex items-center">
            <img
              src="https://flowbite.com/docs/images/logo.svg"
              className="mr-3 h-6 sm:h-9"
              alt="Flowbite Logo"
            />
            <span className="self-center text-xl font-semibold whitespace-nowrap text-white dark:text-white">
              Flowbite
            </span>
          </a>
          <button
            // data-collapse-toggle="navbar-default"
            type="button"
            className="inline-flex items-center p-2 ml-3 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            // aria-controls="navbar-default"
            // aria-expanded="false"
            onClick={ToggleNavbar}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-6 h-6"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
          <div
            className={`bg-gray-900 w-full md:block md:w-auto ${isMobile && !showNavbar && "hidden"}`}
            // id="navbar-default"
          >
            <ul className="flex flex-col p-4 mt-4 bg-gray-900 rounded-lg border border-gray-100 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium md:border-0 dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
              <li>
                <Link
                  to="/"
                  className="block py-2 pr-4 pl-3 text-gray-400 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-white md:p-0 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                  aria-current="page"
                >
                  Home
                </Link>
              </li>
              {auth.isAuthenticated === true ? (
                <li>
                  <Link
                    to="/dashboard"
                    className="block py-2 pr-4 pl-3 text-gray-400 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-white md:p-0 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                  >
                    Dashboard
                  </Link>
                </li>
              ) : (
                ""
              )}

              <li>
                <Link
                  to="#"
                  className="block py-2 pr-4 pl-3 text-gray-400 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-white md:p-0 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                >
                  About
                </Link>
              </li>

              <li>
                <Link
                  to="#"
                  className="block py-2 pr-4 pl-3 text-gray-400 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-white md:p-0 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                >
                  Contact
                </Link>
              </li>
              {auth.isAuthenticated === true ? (
                <li>
                  <Link
                    to="/signup"
                    className="block py-2 pr-4 pl-3 text-gray-400 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-white md:p-0 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                    onClick={() => {
                      logout();
                    }}
                  >
                    Log Out
                  </Link>
                </li>
              ): (
                <li>
                  <Link
                    to="/signup"
                    className="block py-2 pr-4 pl-3 text-gray-400 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-white md:p-0 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                  >
                    Sign Up / In
                  </Link>
                </li>
              ) }
            </ul>
          </div>
        </div>
      </nav>
      <Outlet />
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  alert: state.alert,
});
export default connect(mapStateToProps, { logout })(Layout);
