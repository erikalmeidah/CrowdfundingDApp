// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Crowdfunding {
    // Campaign state variables
    string public name;
    string public description;
    uint256 public goal;
    uint256 public deadline;
    address public owner;
    bool public paused;

    // Campaign tiers
    struct Tier {
        string name;
        uint256 amount;
        uint256 backers;
    }
    Tier[] public tiers;

    // Campaign State enum
    enum CampaignState { Active, Successful, Failed }
    CampaignState public state;

    // Campaign backers
    struct Backer {
        uint256 totalContribution;
        mapping(uint256 => bool) fundedTiers; // tierIndex => bool
    }
    mapping(address => Backer) public backers;

    // Constructor
    constructor(
        address _owner,
        string memory _name,
        string memory _description,
        uint256 _goal,
        uint256 _durationInDays
    ) {
        name = _name;
        description = _description;
        goal =_goal;
        deadline = block.timestamp + (_durationInDays * 1 days);
        owner = _owner;
        state = CampaignState.Active;
        //paused = false;
    }

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner.");
        _;
    }

    modifier campaignOpen() {
        require(state == CampaignState.Active, "Campaign is not active.");
        _;
    }

    modifier notPaused() {
        require(!paused, "Contract is paused.");
        _;
    }

    // Tier functionality
    function addTier(
        string memory _name,
        uint256 _amount
    ) public onlyOwner {
        require(_amount > 0, "Amount must be greater than 0.");
        tiers.push(Tier(_name, _amount, 0));
    }

    function removeTier(uint256 _index) public onlyOwner {
        require(_index < tiers.length, "Tier doesn't exist.");
        tiers[_index] = tiers[tiers.length - 1];
        tiers.pop();
    }

    // Campaign state functionality
    function updateCampaignState() internal {
        if (state == CampaignState.Active) {
            if(block.timestamp >= deadline) { // Campaign over
                state = address(this).balance >= goal ? CampaignState.Successful : CampaignState.Failed;
            } else {
                state = address(this).balance >= goal ? CampaignState.Successful : CampaignState.Active;
            }
        }
    }

    // Fund related functions
    function fund(uint256 _tierIndex) public payable campaignOpen notPaused {
        require(_tierIndex < tiers.length, "Invalid tier.");
        require(msg.value == tiers[_tierIndex].amount, "Incorrect amount.");

        tiers[_tierIndex].backers++;
        updateCampaignState();
    }

    function refund() public {
        updateCampaignState();
        require(state == CampaignState.Failed, "Campaign still active.");
        uint256 amount = backers[msg.sender].totalContribution;
        require(amount > 0, "No contribution to refund.");

        backers[msg.sender].totalContribution = 0;
        payable(msg.sender).transfer(amount);
    }

    function withdraw() public onlyOwner {
        updateCampaignState();
        require(state == CampaignState.Successful, "Campaign not successful yet.");
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw yet.");

        payable(owner).transfer(balance);
    }

    // Setters
    function togglePause() public onlyOwner {
        paused = !paused;
    }

    function extendDeadline(uint256 _daysToAdd) public onlyOwner campaignOpen {
        deadline += _daysToAdd * 1 days; 
    }

    // Getters
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function hasFundedTier(address _backer, uint256 _tierIndex) public view returns (bool) {
        return backers[_backer].fundedTiers[_tierIndex];
    }

    function getTiers() public view returns (Tier[] memory) {
        return tiers;
    }

    function getCampaignStatus() public view returns (CampaignState) {
        if (state == CampaignState.Active && block.timestamp > deadline) {
            return address(this).balance >= goal ? CampaignState.Successful : CampaignState.Failed;
        }
        return state;
    }
}
