import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Web3 from 'web3';
import style from './Navbar.module.css';

function Navbar() {
    const [account, setAccount] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const navigate = useNavigate();
    let web3;

    // Function to connect to MetaMask and allow user to choose an account
    const connectWallet = async () => {
        if (window.ethereum) {
            web3 = new Web3(window.ethereum);
            try {
                // Request account access from MetaMask. This triggers the MetaMask popup to select an account.
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setAccount(accounts[0]);
                setIsConnected(true);
            } catch (error) {
                console.error('User denied account access or other error', error);
            }
        } else {
            alert('Please install MetaMask or a web3 wallet!');
        }
    };

    // Function to "disconnect" the wallet
    const disconnectWallet = () => {
        setAccount(null);
        setIsConnected(false);
        navigate('/');
    };

    return (
        <div className={style.container}>
            <div className={style.leftContainer}>
                <div className={style.appTitle}>Crowdfunding DApp</div>
                <Link to="/" className={style.campaignLink}>Campaigns</Link>
                {isConnected && (
                <Link to={`/dashboard/${account}`} className={style.dashboardLink}>
                    Dashboard
                </Link>
                )}
            </div>
            <div className={style.rightContainer}>
            {isConnected ? (
                <div>
                    <span>{`Connected: ${account.slice(0, 6)}...${account.slice(-4)}`}</span>
                    <button onClick={disconnectWallet} className={style.disconnectButton}>Disconnect</button>
                </div>
                ) : (
                <button onClick={connectWallet} className={style.connectButton}>Connect</button>
                )}
            </div>
        </div>
    );
}
    
export default Navbar;
