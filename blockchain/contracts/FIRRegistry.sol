// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract FIRRegistry {
    struct FIRRecord {
        string dataHash;
        uint256 timestamp;
        string status;
        bool exists;
    }

    struct EvidenceRecord {
        string fileHash;      // SHA-256 of the file bytes
        string fileName;
        address uploadedBy;
        uint256 uploadedAt;   // block.timestamp
        bool exists;
    }

    mapping(string => FIRRecord) private firRecords;
    // evidenceRecords[firId][evidenceId] => EvidenceRecord
    mapping(string => mapping(string => EvidenceRecord)) private evidenceRecords;

    address public owner;

    // Events
    event FIRRegistered(string indexed firId, string dataHash, string status, uint256 timestamp);
    event FIRUpdated(string indexed firId, string newHash, string newStatus, uint256 timestamp);
    event FIRVerified(string indexed firId, bool isValid, string blockchainHash);
    event EvidenceAnchored(
        string indexed firId,
        string indexed evidenceId,
        string fileHash,
        string fileName,
        address uploadedBy,
        uint256 timestamp
    );

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "FIRRegistry: Caller is not the owner");
        _;
    }

    function registerFIR(string calldata firId, string calldata dataHash, string calldata status) external onlyOwner {
        require(!firRecords[firId].exists, "FIRRegistry: FIR already exists");
        firRecords[firId] = FIRRecord({ dataHash: dataHash, timestamp: block.timestamp, status: status, exists: true });
        emit FIRRegistered(firId, dataHash, status, block.timestamp);
    }

    function updateFIR(string calldata firId, string calldata newHash, string calldata newStatus) external onlyOwner {
        require(firRecords[firId].exists, "FIRRegistry: FIR does not exist");
        firRecords[firId].dataHash = newHash;
        firRecords[firId].status = newStatus;
        firRecords[firId].timestamp = block.timestamp;
        emit FIRUpdated(firId, newHash, newStatus, block.timestamp);
    }

    function verifyFIR(string calldata firId, string calldata providedHash) external view returns (bool) {
        require(firRecords[firId].exists, "FIRRegistry: FIR does not exist");
        return keccak256(abi.encodePacked(providedHash)) == keccak256(abi.encodePacked(firRecords[firId].dataHash));
    }

    function getFIR(string calldata firId) external view returns (string memory, uint256, string memory, bool) {
        require(firRecords[firId].exists, "FIRRegistry: FIR does not exist");
        FIRRecord memory r = firRecords[firId];
        return (r.dataHash, r.timestamp, r.status, r.exists);
    }

    function exists(string calldata firId) external view returns (bool) {
        return firRecords[firId].exists;
    }

    /**
     * @dev Anchors an evidence file hash on the blockchain (tamper-proof).
     * @param firId        The FIR this evidence belongs to
     * @param evidenceId   Unique DB id for the evidence record
     * @param fileHash     SHA-256 hex string of the raw file bytes
     * @param fileName     Original file name (for audit trail)
     */
    function anchorEvidence(
        string calldata firId,
        string calldata evidenceId,
        string calldata fileHash,
        string calldata fileName
    ) external onlyOwner {
        require(!evidenceRecords[firId][evidenceId].exists, "FIRRegistry: Evidence already anchored");
        evidenceRecords[firId][evidenceId] = EvidenceRecord({
            fileHash:   fileHash,
            fileName:   fileName,
            uploadedBy: msg.sender,
            uploadedAt: block.timestamp,
            exists:     true
        });
        emit EvidenceAnchored(firId, evidenceId, fileHash, fileName, msg.sender, block.timestamp);
    }

    /**
     * @dev Verifies an evidence file hash against the on-chain record.
     * @return isValid  True if hashes match (file not tampered)
     * @return uploadedAt  Block timestamp of when it was anchored
     */
    function verifyEvidence(
        string calldata firId,
        string calldata evidenceId,
        string calldata providedHash
    ) external view returns (bool isValid, uint256 uploadedAt) {
        EvidenceRecord memory e = evidenceRecords[firId][evidenceId];
        require(e.exists, "FIRRegistry: Evidence not found");
        isValid = keccak256(abi.encodePacked(providedHash)) == keccak256(abi.encodePacked(e.fileHash));
        uploadedAt = e.uploadedAt;
    }

    /**
     * @dev Returns the on-chain evidence record.
     */
    function getEvidence(
        string calldata firId,
        string calldata evidenceId
    ) external view returns (string memory fileHash, string memory fileName, address uploadedBy, uint256 uploadedAt) {
        EvidenceRecord memory e = evidenceRecords[firId][evidenceId];
        require(e.exists, "FIRRegistry: Evidence not found");
        return (e.fileHash, e.fileName, e.uploadedBy, e.uploadedAt);
    }
}
