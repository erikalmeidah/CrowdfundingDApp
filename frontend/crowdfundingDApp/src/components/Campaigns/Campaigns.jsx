import React, { useState, useEffect } from 'react';
import { Web3 } from 'web3';
import factoryAbi from '../../../../../backend/artifacts/contracts/CrowdfundingFactory.sol/CrowdfundingFactory.json';
import style from './Campaigns.module.css';
import { Link } from 'react-router-dom'; 

function Campaigns() {
    const factoryABI = factoryAbi.abi;
    const factoryAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; //HARDCODED FOR HARDHAT ADDRESS
    const [campaigns, setCampaigns] = useState([]);
    const web3 = new Web3("http://localhost:8545");
    
    useEffect(() => {
        const loadCampaigns = async () => {
            try {
                const crowdfundingFactoryContract = new web3.eth.Contract(factoryABI, factoryAddress);
                const campaignsList = await crowdfundingFactoryContract.methods.getAllCampaigns().call();
                setCampaigns(campaignsList);
                
            } catch (err) {
                console.log('Error fetching campaigns from factory:', err);
            }
        };
        loadCampaigns();
    }, [factoryABI, factoryAddress]);

    return (
        <div>
            <h1 className={style.pageTitle}>Campaigns</h1>
            <div className={style.campaignGrid}>
                {campaigns.length > 0 ? (
                    campaigns.map((campaign, index) => (
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
    );
}

export default Campaigns;
