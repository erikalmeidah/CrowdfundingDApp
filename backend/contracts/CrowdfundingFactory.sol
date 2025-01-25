// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Crowdfunding} from "./Crowdfunding.sol";

contract CrowdfundingFactory {
    // Factory state variables
    address public owner;
    bool public paused;

    // Campaigns
    struct Campaign {
        address campaignAddress;
        address owner;
        string name;
        string description;
        uint256 goal;
        uint256 duration;
        uint256 creationTime;
    }
    Campaign[] public campaigns;
    mapping(address => Campaign[]) public userCampaigns; // map wallet address to campaigns

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner.");
        _;
    }

    modifier notPaused() {
        require(!paused, "Factory is paused.");
        _;
    }

    // Constructor
    constructor() {
        owner = msg.sender;
    }

    // Campaign functions
    function createCampaign(
        string memory _name,
        string memory _description,
        uint256 _goal,
        uint256 _durationInDays
    ) external notPaused {
        // deploy crowdfunding contract
        Crowdfunding newCampaign = new Crowdfunding(
            msg.sender,
            _name,
            _description,
            _goal,
            _durationInDays
        );

        // store info on deployed campaign
        address campaignAddress = address(newCampaign);
        Campaign memory campaign = Campaign({
            campaignAddress: campaignAddress,
            owner: msg.sender,
            name: _name,
            description: _description,
            goal: _goal,
            duration: _durationInDays,
            creationTime: block.timestamp
        });

        // add to factory/user arrays
        campaigns.push(campaign);
        userCampaigns[msg.sender].push(campaign);
    }

    // Setters
    function togglePause() public onlyOwner {
        paused = !paused;
    }

    // Getters
    function getUserCampaigns(address _user) external view returns (Campaign[] memory) {
        return userCampaigns[_user];
    }

    function getAllCampaigns() external view returns (Campaign[] memory) {
        return campaigns;
    }
}
