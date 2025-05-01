// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {Attendance} from "../src/Attendance.sol";

contract AttendanceTest is Test {
    Attendance public attendance;

    function setUp() public {
        attendance = new Attendance(msg.sender);
    }

    function test_createSession_revert(uint48 start, uint48 end) public {
        vm.assume(start >= end);

        vm.expectRevert();
        attendance.createSession(start, end);
    }

    function test_createSession_success(uint48 start, uint48 end) public {
        vm.assume(start < end);

        attendance.createSession(start, end);
    }
}
