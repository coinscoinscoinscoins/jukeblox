// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

/// @notice Create time-bound sessions others can mark themselves as attending.
contract Jukeblox {
    /**
     * Base Types
     * int: int, uint, uint8, ... uint256
     * bool
     * address
     * bytes: bytes, bytes1, ... bytes32
     * string
     */

    struct SongRequest {
        string songId;
        address requester;
    }

    // Structs are objects that contain nested variables
    struct Session {
        uint48 start;
        uint48 end;
        SongRequest[] songRequests;
    }



    // Storage variables persist on contract and can be accessed anytime
    address public owner;

    /**
     * Arrays are mappings with length storage
     *
     * length = 2
     * 0 => Session({0, 1, 0})
     * 1 => Session({10, 20, 100})
     */
    Session[] public sessions;

    /**
     * Events or "logs" can be emitted to enable easier offchain parsing of state changes
     * Events can have named arguments
     */
    event SessionCreated(uint256 sessionId, uint48 start, uint48 end);
    event AddSongRequest(uint256 sessionId, string song);
    event RemoveSongRequest(uint256 sessionId, string song);

    /**
     * Errors can provide more context about why an execution failed
     * Errors can have named arguments
     */
    error InvalidStartEnd(uint48 start, uint48 end);
    error SessionDoesNotExist(uint256 sessionId, uint256 totalSessions);
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
        // Check session start is before end
        if (start >= end) revert InvalidStartEnd(start, end);

        // Set id as current length (next index to insert)
        sessionId = sessions.length;

        // Set both mapping value and increment sessions.length in storage
        sessions.push(Session({start: start, end: end, songRequests: new string[](0)}));

        // Emit log for offchain indexing
        emit SessionCreated(sessionId, start, end);
    }

    function addSongRequest(uint256 sessionId, string memory song) external {
        sessions[sessionId].songRequests.push(song);
        emit AddSongRequest(sessionId, song);
    }
}
