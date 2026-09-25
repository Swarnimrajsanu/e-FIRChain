// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract FIRRegistry {
    struct FIRRecord {
        string dataHash;
        uint256 timestamp;
        string status;
        bool exists;
    }

    mapping(string => FIRRecord) private firRecords;
    address public owner;

    // Events
    event FIRRegistered(string indexed firId, string dataHash, string status, uint256 timestamp);
    event FIRUpdated(string indexed firId, string newHash, string newStatus, uint256 timestamp);
    event FIRVerified(string indexed firId, bool isValid, string blockchainHash);

    constructor() {
        owner = msg.sender;
    }

    // Modifier to restrict access to owner only
    modifier onlyOwner() {
        require(msg.sender == owner, "FIRRegistry: Caller is not the owner");
        _;
    }

    /**
     * @dev Registers a new FIR on the blockchain
     * @param firId Unique identifier for the FIR
     * @param dataHash SHA-256 hash of the FIR data
     * @param status Initial status of the FIR
     */
    function registerFIR(string calldata firId, string calldata dataHash, string calldata status) external onlyOwner {
        require(!firRecords[firId].exists, "FIRRegistry: FIR already exists");

        firRecords[firId] = FIRRecord({
            dataHash: dataHash,
            timestamp: block.timestamp,
            status: status,
            exists: true
        });

        emit FIRRegistered(firId, dataHash, status, block.timestamp);
    }

    /**
     * @dev Updates an existing FIR record on the blockchain
     * @param firId Unique identifier for the FIR
     * @param newHash New SHA-256 hash of the FIR data
     * @param newStatus New status of the FIR
     */
    function updateFIR(string calldata firId, string calldata newHash, string calldata newStatus) external onlyOwner {
        require(firRecords[firId].exists, "FIRRegistry: FIR does not exist");

        firRecords[firId].dataHash = newHash;
        firRecords[firId].status = newStatus;
        firRecords[firId].timestamp = block.timestamp;

        emit FIRUpdated(firId, newHash, newStatus, block.timestamp);
    }

    /**
     * @dev Verifies if the provided hash matches the stored hash for an FIR
     * @param firId Unique identifier for the FIR
     * @param providedHash SHA-256 hash to verify
     * @return bool True if the hash matches, false otherwise
     */
    function verifyFIR(string calldata firId, string calldata providedHash) external view returns (bool) {
        require(firRecords[firId].exists, "FIRRegistry: FIR does not exist");
        
        bool isValid = keccak256(abi.encodePacked(providedHash)) == keccak256(abi.encodePacked(firRecords[firId].dataHash));
        
        emit FIRVerified(firId, isValid, firRecords[firId].dataHash);
        
        return isValid;
    }

    /**
     * @dev Gets the stored record for an FIR
     * @param firId Unique identifier for the FIR
     * @return string dataHash, uint256 timestamp, string status, bool exists
     */
    function getFIR(string calldata firId) external view returns (string memory, uint256, string memory, bool) {
        require(firRecords[firId].exists, "FIRRegistry: FIR does not exist");
        
        FIRRecord memory record = firRecords[firId];
        return (record.dataHash, record.timestamp, record.status, record.exists);
    }

    /**
     * @dev Checks if an FIR exists on the blockchain
     * @param firId Unique identifier for the FIR
     * @return bool True if the FIR exists, false otherwise
     */
    function exists(string calldata firId) external view returns (bool) {
        return firRecords[firId].exists;
    }
}