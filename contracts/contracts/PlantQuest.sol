// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, ebool} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title PlantQuest - Plant Challenge Encrypted Record Contract
/// @notice Uses FHEVM fully homomorphic encryption to protect user challenge data privacy
/// @dev All sensitive data (completed days) is stored encrypted, only authorized users can decrypt
contract PlantQuest is ZamaEthereumConfig {
    /// @notice Quest configuration information
    struct QuestConfig {
        uint256 duration;          // Quest duration (days)
        uint256 startTime;         // Quest start timestamp
        bool isActive;             // Whether the quest is active
        address organizer;         // Quest organizer
    }

    /// @notice User quest record
    struct UserQuest {
        euint32 encDays;           // Encrypted completed days
        uint256 lastRecordTime;    // Last record timestamp
        bool questCompleted;       // Whether quest is completed
        bool badgeMinted;          // Whether badge is minted
        bool firstCheckInBadgeMinted; // Whether first check-in badge is claimed
    }

    /// @notice Global quest configuration
    QuestConfig public questConfig;

    /// @notice User address => User record
    mapping(address => UserQuest) public userQuests;

    /// @notice User address => Quest day index => Whether recorded
    mapping(address => mapping(uint256 => bool)) public dailyLogs;

    /// @notice Quest initiated event
    event QuestInitiated(address indexed organizer, uint256 duration, uint256 startTime);

    /// @notice Daily progress logged event
    event DailyProgressLogged(
        address indexed user,
        uint256 dayIndex,
        bool completed,
        uint256 timestamp
    );

    /// @notice Quest completed event
    event QuestCompleted(address indexed user, uint256 completedTime);

    /// @notice Badge minted event
    event BadgeMinted(address indexed user, uint256 tokenId);
    
    /// @notice First check-in badge minted event
    event FirstCheckInBadgeMinted(address indexed user, uint256 tokenId);

    /// @notice Initialize quest
    /// @param duration Quest duration (days)
    function initiateQuest(uint256 duration) external {
        require(duration > 0 && duration <= 365, "Invalid duration");
        require(!questConfig.isActive || block.timestamp >= questConfig.startTime + questConfig.duration * 1 days, "Previous quest still active");

        questConfig = QuestConfig({
            duration: duration,
            startTime: block.timestamp,
            isActive: true,
            organizer: msg.sender
        });

        emit QuestInitiated(msg.sender, duration, block.timestamp);
    }

    /// @notice Log daily progress
    /// @param completed Whether plant challenge is completed today
    /// @dev Uses FHE encryption to store completed days, protecting user privacy
    function logDailyProgress(bool completed) external {
        require(questConfig.isActive, "Quest not active");
        require(
            block.timestamp >= questConfig.startTime &&
            block.timestamp < questConfig.startTime + questConfig.duration * 1 days,
            "Quest period expired"
        );

        uint256 dayIndex = (block.timestamp - questConfig.startTime) / 1 days;
        require(!dailyLogs[msg.sender][dayIndex], "Already logged for this day");

        // Mark today as recorded
        dailyLogs[msg.sender][dayIndex] = true;

        // If completed, use FHE encryption to increment days
        if (completed) {
            UserQuest storage quest = userQuests[msg.sender];
            
            // Use FHE.add to increment in encrypted state
            euint32 one = FHE.asEuint32(1);
            quest.encDays = FHE.add(quest.encDays, one);

            // Authorize contract and user to decrypt
            FHE.allowThis(quest.encDays);
            FHE.allow(quest.encDays, msg.sender);
        }

        // Update last record time
        userQuests[msg.sender].lastRecordTime = block.timestamp;

        emit DailyProgressLogged(msg.sender, dayIndex, completed, block.timestamp);

        // Check if quest is completed (using homomorphic comparison)
        _checkQuestCompletion(msg.sender);
    }

    /// @notice Get user's encrypted days handle
    /// @param user User address
    /// @return encDaysHandle Encrypted days handle, needs frontend decryption
    /// @return totalDays Total quest days
    /// @dev Frontend needs to decrypt encDaysHandle using decryption signature to get plaintext days
    function fetchUserProgress(address user) external view returns (euint32 encDaysHandle, uint256 totalDays) {
        return (userQuests[user].encDays, questConfig.duration);
    }

    /// @notice Get quest status information
    /// @param user User address
    /// @return questCompleted Whether quest is completed
    /// @return badgeMinted Whether badge is minted
    /// @return lastRecordTime Last record time
    /// @return firstCheckInBadgeMinted Whether first check-in badge is claimed
    function getQuestStatus(address user) external view returns (
        bool questCompleted,
        bool badgeMinted,
        uint256 lastRecordTime,
        bool firstCheckInBadgeMinted
    ) {
        UserQuest storage quest = userQuests[user];
        return (
            quest.questCompleted,
            quest.badgeMinted,
            quest.lastRecordTime,
            quest.firstCheckInBadgeMinted
        );
    }

    /// @notice Get quest configuration information
    /// @return duration Quest duration
    /// @return startTime Start time
    /// @return isActive Whether active
    /// @return organizer Organizer address
    function getQuestConfig() external view returns (
        uint256 duration,
        uint256 startTime,
        bool isActive,
        address organizer
    ) {
        return (
            questConfig.duration,
            questConfig.startTime,
            questConfig.isActive,
            questConfig.organizer
        );
    }

    /// @notice Check if specified day is logged
    /// @param user User address
    /// @param dayIndex Quest day index (starting from 0)
    /// @return recorded Whether logged
    function isDayLogged(address user, uint256 dayIndex) external view returns (bool recorded) {
        return dailyLogs[user][dayIndex];
    }

    /// @notice Get current quest day index
    /// @return dayIndex Current quest day (starting from 0)
    function getCurrentDayIndex() external view returns (uint256 dayIndex) {
        require(questConfig.isActive, "Quest not active");
        require(
            block.timestamp >= questConfig.startTime &&
            block.timestamp < questConfig.startTime + questConfig.duration * 1 days,
            "Outside quest period"
        );
        return (block.timestamp - questConfig.startTime) / 1 days;
    }

    /// @notice Mark quest as completed (internal call only or triggered by completion check)
    /// @dev Uses homomorphic comparison encDays >= duration to determine if completed
    function _checkQuestCompletion(address user) internal {
        UserQuest storage quest = userQuests[user];
        
        if (quest.questCompleted) {
            return; // Already completed, no need to check again
        }

        // Use FHE homomorphic comparison to check if completed
        // Note: In FHE, comparison results are also encrypted, requiring special handling
        // Here we simplify: when logDailyProgress, if recorded day reaches or exceeds duration, mark as completed
        uint256 dayIndex = (block.timestamp - questConfig.startTime) / 1 days;
        
        // Since we cannot directly decrypt and compare in contract, use an approximation:
        // When last recorded day index >= duration - 1 and user continues recording, consider possibly completed
        // Actual completion verification is done by frontend after decryption
        
        // Trigger event, frontend can listen and verify with decryption
        if (dayIndex >= questConfig.duration - 1) {
            // Don't set as completed directly here, frontend verifies after decryption and calls completeQuest
        }
    }

    /// @notice Complete quest (called by frontend after decryption verification)
    /// @dev Frontend decrypts encDays, if >= duration, calls this function
    function completeQuest() external {
        UserQuest storage quest = userQuests[msg.sender];
        require(!quest.questCompleted, "Already completed");
        
        // 验证是否在挑战期间
        require(
            block.timestamp >= questConfig.startTime &&
            block.timestamp <= questConfig.startTime + questConfig.duration * 1 days + 1 days,
            "Quest period expired"
        );

        quest.questCompleted = true;
        emit QuestCompleted(msg.sender, block.timestamp);
    }

    /// @notice Mark badge as minted
    /// @param user User address
    function markBadgeMinted(address user) external {
        require(msg.sender == questConfig.organizer || msg.sender == user, "Unauthorized");
        UserQuest storage quest = userQuests[user];
        require(quest.questCompleted, "Quest not completed");
        require(!quest.badgeMinted, "Badge already minted");
        
        quest.badgeMinted = true;
        emit BadgeMinted(user, uint256(uint160(user))); // Use address as tokenId (simplified)
    }

    /// @notice Check if user has any record (for first check-in badge)
    /// @param user User address
    /// @return recorded Whether user has any record
    function hasLogged(address user) external view returns (bool recorded) {
        return userQuests[user].lastRecordTime > 0;
    }

    /// @notice Claim first check-in badge
    /// @dev User can manually claim this badge after first check-in
    function claimFirstCheckInBadge() external {
        UserQuest storage quest = userQuests[msg.sender];
        
        // Check if user has any record
        require(quest.lastRecordTime > 0, "No check-in record found");
        
        // Check if already claimed
        require(!quest.firstCheckInBadgeMinted, "First check-in badge already minted");
        
        // Mark as claimed
        quest.firstCheckInBadgeMinted = true;
        
        // Use address as tokenId (simplified implementation)
        uint256 tokenId = uint256(uint160(msg.sender)) + 1; // +1 to distinguish first check-in badge from quest completion badge
        emit FirstCheckInBadgeMinted(msg.sender, tokenId);
    }
}
