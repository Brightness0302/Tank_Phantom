import { connectWallet } from "../utils/wallet";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { loadUser, logIn, signUp } from "../actions/user";
import { connect } from "react-redux";
import { Navigate } from "react-router-dom";

const Sign = ({ loadUser, logIn, signUp, auth, alerts }) => {
  console.log(auth);

  const [walletAddress, setWalletAddress] = useState(null);
  const [username, setUserName] = useState(null);
  const [team, setTeam] = useState(null);

  useEffect(() => {
    alerts.forEach((element) => {
      toast.error(element.msg, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    });
  }, [alerts]);
  const signIn = async () => {
    if (walletAddress == null) {
      const address = await connectWallet();
      logIn(address);
    } else {
      logIn(walletAddress);
    }
  };
  const createAccount = async () => {
    if (username == null || username == "")
      toast.error("Input your username", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    else if (team == null || team == "")
      toast.error("Input your team name", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    else if (walletAddress == null) {
      toast.error("Connect your wallet", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    } else {
      const res = await signUp(walletAddress, username, team);
    }
  };

  if (auth.isAuthenticated == true) return <Navigate to="/dashboard" />;
  return (
    <>
      <div className="container mx-auto px-10 py-10 mt-10 rounded-lg bg-gray-800 w-11/12 sm:w-[600px]">
        <div className="text-gray-300 text-xl"> Create An Account</div>
        <div className="mt-10">
          <div className="mb-10">
            <label
              for="name"
              class="block mb-2 text-sm font-medium text-gray-300 dark:text-white"
            >
              Username
            </label>
            <input
              type="text"
              name="name"
              id="emnameail"
              class="bg-gray-800 border border-gray-300 text-white sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              value={username}
              onChange={(e) => {
                setUserName(e.target.value);
              }}
              placeholder="Input your username"
            />
          </div>
          <div className="mb-10">
            <label
              for="Team"
              class="block mb-2 text-sm font-medium text-gray-300 dark:text-white"
            >
              Team
            </label>
            <input
              type="text"
              name="name"
              id="Team"
              class="bg-gray-800 border border-gray-300 text-white sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Input your team name"
              value={team}
              onChange={(e) => {
                setTeam(e.target.value);
              }}
            />
          </div>
          <div className="mb-10">
            <label
              for="address"
              class="block mb-2 text-sm font-medium text-gray-300 dark:text-white"
            >
              Wallet Address {walletAddress}
            </label>
            <button
              type="button"
              className="w-full focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
              onClick={async () => {
                try {
                  const address = await connectWallet();
                  setWalletAddress(address);
                } catch (err) {
                  alert(err);
                }
              }}
            >
              Connect Wallet
            </button>
            <button
              type="button"
              className="w-full focus:outline-none text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
              onClick={createAccount}
            >
              Create Account
            </button>
          </div>
          <div className="text-white flex flex-row">
            <div>Already have an account?</div>
            <div
              className="mx-2 hover:font-bold hover:cursor-pointer underline"
              onClick={signIn}
            >
              Sign In
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  alerts: state.alert,
});
export default connect(mapStateToProps, { logIn, loadUser, signUp })(Sign);
