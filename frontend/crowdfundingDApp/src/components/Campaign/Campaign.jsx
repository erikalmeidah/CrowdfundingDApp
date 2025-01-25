import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Web3 } from 'web3';
import crowdfundingAbi from '../../../../../backend/artifacts/contracts/Crowdfunding.sol/Crowdfunding.json';
import style from './Campaign.module.css';

function Campaign() {
    const web3 = new Web3("http://localhost:8545");
    const { campaignAddress } = useParams();
    const [campaign, setCampaign] = useState(null);
    const [tiers, setTiers] = useState([]);
    const [userAddress, setUserAddress] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
    const crowdfundingABI = crowdfundingAbi.abi;
    const [extensionDays, setExtensionDays] = useState();
    const [tierName, setTierName] = useState();
    const [tierGoal, setTierGoal] = useState();
    const [refreshState, setRefreshState] = useState(false);

    useEffect(() => {
        const loadCampaign = async () => {
            try {
                const campaignContract = new web3.eth.Contract(crowdfundingABI, campaignAddress);
                const name = await campaignContract.methods.name().call();
                const description = await campaignContract.methods.description().call();
                const goal = await campaignContract.methods.goal().call();
                const deadline = await campaignContract.methods.deadline().call();
                const owner = await campaignContract.methods.owner().call();
                const paused = await campaignContract.methods.paused().call();
                const balance = await campaignContract.methods.getContractBalance().call();
                const tiers = await campaignContract.methods.getTiers().call();
                setCampaign({ name, description, goal, deadline, owner, paused, balance });
                setTiers(tiers);

                let web3Metamask = new Web3(window.ethereum);
                const accounts = await web3Metamask.eth.getAccounts();
                if (accounts.length > 0) {
                    setUserAddress(accounts[0]);
                    if (accounts[0].toLowerCase() === owner.toLowerCase()) {
                        setIsOwner(true);
                    }
                }
            } catch (err) {
                console.log("Error loading campaign:", err);
            }
        }
        loadCampaign();
    }, [campaignAddress, crowdfundingABI, refreshState]);

    if (!campaign) {
        return <div>Loading campaign data...</div>;
    }

    return(
        <>
            <div className={style.container}>
                <div className={style.name}>{campaign.name}</div>
                <div className={style.status}>{campaign.paused ? "Paused" : "Active"}</div>
                <div className={style.progressContainer}>
                    <div>0</div>
                    <progress className={style.progress} value={web3.utils.fromWei(campaign.balance, 'ether')} max={web3.utils.fromWei(campaign.goal, 'ether')}></progress>
                    <div>{web3.utils.fromWei(Number(campaign.goal), 'ether')} ETH</div>
                </div>
                <div className={style.description}>{campaign.description}</div>
                <div className={style.dueDate}>Due: {new Date(Number(campaign.deadline) * 1000).toLocaleString()}</div>
                <div className={style.tiersContainer}>
                    {tiers.length > 0 ? (
                        tiers.map((tier, index) => (
                            <div key={index}>
                                <button
                                    onClick={async () => {
                                        try {
                                            const accounts = await web3.eth.getAccounts();       
                                            const campaignContract = new web3.eth.Contract(crowdfundingABI, campaignAddress);
                                            await campaignContract.methods.fund(index).send({ from: accounts[0], value: tier.amount });
                                            alert("Funding successful!");
                                            setRefreshState(!refreshState);
                                        } catch (err) {
                                            console.log("Error during funding:", err);
                                            alert("Funding failed.");
                                        }
                                }}  >
                                    {tier.name}
                                    <br/>
                                    {web3.utils.fromWei(tier.amount, 'ether')} ETH
                                </button>
                            </div>
                        ))
                    ) : (
                        <div>No tiers available.</div>
                    )}
                </div>
                <div>
                    <button
                        className={style.refund}
                        onClick={async () => {
                            try {
                                const accounts = await web3.eth.getAccounts();       
                                const campaignContract = new web3.eth.Contract(crowdfundingABI, campaignAddress);
                                const state = await campaignContract.methods.state().call();
                                if (Number(state) !== 3) {
                                    alert("Refunds are only available if the campaign failed.");
                                    return;
                                }
                                await campaignContract.methods.refund().send({ from: accounts[0] });
                                alert("Refund successful!");
                                setRefreshState(!refreshState);
                            } catch (err) {
                                console.log("Error during refund:", err);
                                alert("Refund failed.");
                            }
                        }}  
                    >
                        Refund
                    </button>
                </div>
            </div>
            
            {userAddress && isOwner && (
                <div className={style.ownerContainer}>
                    <div className={style.name}>Owner Controls</div>
                    <div className={style.withdrawContainer}>
                        <button className={style.withdrawButton}
                            onClick={async () => {
                                try {
                                    const accounts = await web3.eth.getAccounts();       
                                    const campaignContract = new web3.eth.Contract(crowdfundingABI, campaignAddress);
                                    const state = await campaignContract.methods.state().call();
                                    if (Number(state) !== 1) {
                                        alert("Withdraw only available if the campaign is successful.");
                                        return;
                                    }
                                    await campaignContract.methods.withdraw().send({ from: accounts[0] });
                                    alert("Withdraw successful!");
                                    setRefreshState(!refreshState);
                                } catch (err) {
                                    console.log("Error during withdraw:", err);
                                    alert("Withdraw failed.");
                                }
                            }}  >
                            Withdraw funds
                        </button>
                    </div>
                    <div className={style.extendDeadlineContainer}>
                        <input className={style.extendInput} type='number' placeholder='Extra Days' value={extensionDays} onChange={(e) => {setExtensionDays(e.target.value)}}></input>
                        <button className={style.extendButton}
                            onClick={async () => {
                                try {
                                    const accounts = await web3.eth.getAccounts();       
                                    const campaignContract = new web3.eth.Contract(crowdfundingABI, campaignAddress);
                                    const state = await campaignContract.methods.state().call();
                                    if (Number(state) !== 0) {
                                        alert("Extension only available if the campaign is Active.");
                                        return;
                                    }
                                    await campaignContract.methods.extendDeadline(extensionDays).send({ from: accounts[0] });
                                    alert("Extension successful!");
                                    setRefreshState(!refreshState);
                                } catch (err) {
                                    console.log("Error during extension:", err);
                                    alert("Extension failed.");
                                }
                            }}  >
                            Extend Deadline
                        </button>
                    </div>
                    <div className={style.pauseContainer}>
                        <button className={style.pauseButton}
                            onClick={async () => {
                                try {
                                    const accounts = await web3.eth.getAccounts();       
                                    const campaignContract = new web3.eth.Contract(crowdfundingABI, campaignAddress);      
                                    await campaignContract.methods.togglePause().send({ from: accounts[0] });
                                    alert("Pause/Unpause successful!");
                                    setRefreshState(!refreshState);
                                } catch (err) {
                                    console.log("Error during pause/unpause:", err);
                                    alert("Pause/Unpause failed.");
                                }
                            }}  >
                            Pause/Unpause campaign
                        </button>
                    </div>
                    <div className={style.addTiersContainer}>
                        <input type='string' className={style.addTierInput} placeholder='Name' value={tierName} onChange={(e) => {setTierName(e.target.value)}}></input>
                        <input type='number' className={style.addTierInput} placeholder='Goal in ETH' value={tierGoal} onChange={(e) => {setTierGoal(e.target.value)}}></input>
                        <button
                            className={style.addTierButton}
                            onClick={async () => {
                                try {
                                    const accounts = await web3.eth.getAccounts();       
                                    const campaignContract = new web3.eth.Contract(crowdfundingABI, campaignAddress);      
                                    await campaignContract.methods.addTier(tierName, web3.utils.toWei(tierGoal, 'ether')).send({ from: accounts[0] });
                                    alert("Tier added!");
                                    setRefreshState(!refreshState);
                                } catch (err) {
                                    console.log("Error adding tier:", err);
                                    alert("Adding tier failed.");
                                }
                            }}  >
                                Add Tier
                            </button>
                    </div>
                    <div className={style.removeTiersContainer}>
                        {tiers.length > 0 ? (
                            tiers.map((tier, index) => (
                                <div key={index}>
                                    <button
                                        onClick={async () => {
                                            try {
                                                const accounts = await web3.eth.getAccounts();       
                                                const campaignContract = new web3.eth.Contract(crowdfundingABI, campaignAddress);      
                                                await campaignContract.methods.removeTier(index).send({ from: accounts[0] });
                                                alert("Tier removed!");
                                                setRefreshState(!refreshState);
                                            } catch (err) {
                                                console.log("Error removing tier:", err);
                                                alert("Removing tier failed.");
                                            }
                                        }}  >
                                        {tier.name}
                                        <br/>
                                        {web3.utils.fromWei(tier.amount, 'ether')} ETH
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div>No tiers available.</div>
                        )}
                    </div>
                </div>
            )}             
        </>
    );
}

export default Campaign;
