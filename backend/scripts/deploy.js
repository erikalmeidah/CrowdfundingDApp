const {Web3} = require('web3');
const fs = require('fs');
const path = require('path');

// Connect to the Hardhat local node
const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));

// Read contract artifacts (ABI and Bytecode)
const crowdfundingFactoryPath = path.join(__dirname, '../artifacts/contracts/CrowdfundingFactory.sol/CrowdfundingFactory.json');
const crowdfundingPath = path.join(__dirname, '../artifacts/contracts/Crowdfunding.sol/Crowdfunding.json');

const crowdfundingFactoryJson = JSON.parse(fs.readFileSync(crowdfundingFactoryPath, 'utf8'));
const crowdfundingJson = JSON.parse(fs.readFileSync(crowdfundingPath, 'utf8'));

// Deploy contracts
async function deploy() {
    // Get accounts from the Hardhat node
    const accounts = await web3.eth.getAccounts();

    const owner = accounts[0]; // First account will be the owner

    // Deploy CrowdfundingFactory
    const factory = new web3.eth.Contract(crowdfundingFactoryJson.abi);
    const factoryDeploy = factory.deploy({ data: crowdfundingFactoryJson.bytecode });
    const deployedFactory = await factoryDeploy.send({ from: owner, gas: 5000000 });
    console.log('CrowdfundingFactory deployed to:', deployedFactory.options.address);

    // Deploy Crowdfunding
    const crowdfunding = new web3.eth.Contract(crowdfundingJson.abi);
    const crowdfundingDeploy = crowdfunding.deploy({ 
        data: crowdfundingJson.bytecode,
        arguments: [owner, 'My Crowdfunding Campaign', 'Description of the campaign', web3.utils.toWei('10', 'ether'), 30] // example arguments
    });
    const deployedCrowdfunding = await crowdfundingDeploy.send({ from: owner, gas: 5000000 });
    console.log('Crowdfunding contract deployed to:', deployedCrowdfunding.options.address);
}

deploy().catch(console.error);
