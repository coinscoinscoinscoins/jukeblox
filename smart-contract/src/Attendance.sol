// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

/// @notice Create time-bound sessions others can mark themselves as attending.
contract Attendance {
    /**
     * Base Types
     * int: int, uint, uint8, ... uint256
     * bool
     * address
     * bytes: bytes, bytes1, ... bytes32
     * string
     */

    // Structs are objects that contain nested variables
    struct Session {
        uint48 start;
        uint48 end;
        uint256 totalAttended;
    }

    // Storage variables persist on contract and can be accessed anytime
    address public owner;

    /**
     * Mappings are key-value hashmaps
     *
     * conner => 2
     * xander => 0
     */
    mapping(address attendee => uint256 total) public totalAttendence;

    /**
     * Arrays are mappings with length storage
     *
     * length = 2
     * 0 => Session({0, 1, 0})
     * 1 => Session({10, 20, 100})
     */
    Session[] public sessions;

    /**
     * Mappings can be nested for multiple independent keys
     *
     * 0 => conner => true
     * 1 => conner => true
     */
    mapping(uint256 sessionId => mapping(address attendee => bool attended)) public hasAttended;

    /**
     * Events or "logs" can be emitted to enable easier offchain parsing of state changes
     * Events can have named arguments
     */
    event SessionCreated(uint256 sessionId, uint48 start, uint48 end);
    event SessionAttended(uint256 sessionId, address attendee);

    /**
     * Errors can provide more context about why an execution failed
     * Errors can have named arguments
     */
    error NotOwner(address sender, address owner);
    error InvalidStartEnd(uint48 start, uint48 end);
    error SessionDoesNotExist(uint256 sessionId, uint256 totalSessions);
    error HasAttendedSession(uint256 sessionId, address sender);
    error SessionNotActive(uint256 sessionId);

    // Constructors are run only when deploying a contract
    constructor(address owner_) {
        owner = owner_;
    }

    /**
     * Function structure: name, arguments, visibility, mutability, return type
     *
     * Visibility defines who can call
     *
     * internal: only this contract
     * external: only outside of this contract
     * public: both internal and external
     * private: internal but excludes inheriting contracts
     *
     * Mutability defines access to storage
     *
     * [none]: read+write access
     * view: read-only access
     * pure: no access
     */

    /// @notice Get the total number of sessions created.
    function totalSessions() external view returns (uint256) {
        return sessions.length;
    }

    /// @notice Check if a session is currently active.
    function isActive(uint256 sessionId) public view returns (bool) {
        Session memory session = sessions[sessionId];
        return block.timestamp >= session.start && block.timestamp < session.end;
    }

    /// @notice Create a new session.
    function createSession(uint48 start, uint48 end) external returns (uint256 sessionId) {
        // Check sender is owner
        if (msg.sender != owner) revert NotOwner(msg.sender, owner);

        // Check session start is before end
        if (start >= end) revert InvalidStartEnd(start, end);

        // Set id as current length (next index to insert)
        sessionId = sessions.length;

        // Set both mapping value and increment sessions.length in storage
        sessions.push(Session({start: start, end: end, totalAttended: 0}));

        // Emit log for offchain indexing
        emit SessionCreated(sessionId, start, end);
    }

    /// @notice Attend an active session.
    /// @dev Sessions can only be attended only once per address.
    function attendSession(uint256 sessionId) external {
        // Check session exists
        if (sessionId > sessions.length - 1) revert SessionDoesNotExist(sessionId, sessions.length);

        // Check session is active
        if (!isActive(sessionId)) revert SessionNotActive(sessionId);

        // Check caller has not yet attended session
        if (hasAttended[sessionId][msg.sender]) revert HasAttendedSession(sessionId, msg.sender);

        // Effects
        hasAttended[sessionId][msg.sender] = true;
        totalAttendence[msg.sender]++;
        sessions[sessionId].totalAttended++;
        emit SessionAttended(sessionId, msg.sender);
    }
}
