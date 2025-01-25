import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import factoryAbi from '../../../../../backend/artifacts/contracts/CrowdfundingFactory.sol/CrowdfundingFactory.json';
import style from './Dashboard.module.css';
import { Link, useParams } from 'react-router-dom'; 

function Dashboard() {
    const factoryABI = factoryAbi.abi;
    const factoryAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; //HARDCODED FOR HARDHAT ADDRESS

    const { userAddress } = useParams();    

    const web3 = new Web3("http://localhost:8545");

    const [userCampaigns, setUserCampaigns] = useState([]);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [goal, setGoal] = useState();
    const [duration, setDuration] = useState();

    // load user campaigns
    useEffect(() => {
            const loadCampaigns = async () => {
                try {
                    const crowdfundingFactoryContract = new web3.eth.Contract(factoryABI, factoryAddress);
                    const campaignsList = await crowdfundingFactoryContract.methods.getUserCampaigns(userAddress).call();
                    setUserCampaigns(campaignsList);
                    
                } catch (err) {
                    console.log('Error fetching campaigns from factory:', err);
                }
            };
            loadCampaigns();
        }, [factoryABI, factoryAddress]);
    
    // Create new campaign
    function createNewCampaign(name, desc, goal, duration){
        const createCampaign = async () => {
            try {
                const crowdfundingFactoryContract = new web3.eth.Contract(factoryABI, factoryAddress);
                const campaign = await crowdfundingFactoryContract.methods.createCampaign(name, desc, goal, duration).send({ from: userAddress });
                const campaignsList = await crowdfundingFactoryContract.methods.getUserCampaigns(userAddress).call();
                setUserCampaigns(campaignsList);
            } catch (err) {
                console.log('Error creating campaign:', err);
            }
        };
        createCampaign();
    }
    
    return (
        <div>
            <div className={style.createCampaignContainer}>
                <h1 className={style.pageTitle}>Create a New Campaign</h1>
                <div className={style.inputContainer}>
                    <input className={style.nameInput} type='string' placeholder='Name' value={name} onChange={(e) => setName(e.target.value)}></input>
                    <textarea className={style.descriptionInput} type='string' placeholder='Description' value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                    <input className={style.goalInput} type='number' placeholder='Goal in ETH' value={goal} onChange={(e) => setGoal(e.target.value)}></input>
                    <input className={style.durationInput} type='number' placeholder='Duration in days' value={duration} onChange={(e) => setDuration(e.target.value)}></input>
                    <button className={style.newCampaignButton} onClick={() => createNewCampaign(name, description, web3.utils.toWei(goal, 'ether'), duration)}>
                        New Campaign
                    </button>
                </div>
            </div>

            <div className={style.userCampaignsContainer}>
                <h1 className={style.pageTitle}>User Campaigns</h1>
                <div className={style.campaignGrid}>
                    {userCampaigns.length > 0 ? (
                            userCampaigns.map((campaign, index) => (
                                <Link to={`/Campaign/${campaign.campaignAddress}`} className={style.campaignLink} key={index}>
                                    <div className={style.campaignCard}>
                                        <div className={style.campaignName}>{campaign.name} </div>
                                        <div className={style.campaignDescription}>Description: {campaign.description}</div>
                                        <div className={style.campaignGoal}>Goal: {(web3.utils.fromWei(campaign.goal, 'ether'))} ETH</div>
                                        <div className={style.campaignDate}>Due date: {new Date(Number(campaign.creationTime) * 1000 + Number(campaign.duration) * 24 * 60 * 60 * 1000).toLocaleString()}</div>
                                        Details: <br/>
                                        <div className={style.campaignDetails}>
                                            Owner: {campaign.owner} <br />
                                            Address: {campaign.campaignAddress} <br />
                                            Created At: {new Date(Number(campaign.creationTime) * 1000).toLocaleString()}
                                        </div>
                                    </div>
                                </Link>
                            ))
                    ) : (
                        <p>No campaigns found.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
