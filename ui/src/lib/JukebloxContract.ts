import { Address } from 'viem';

// Replace this with your actual deployed contract address on Base Sepolia
export const jukebloxContract = "0xD69597CeCdCe55844Cd074274B67D11505168eFe" as Address;

export const JukebloxAbi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner_",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "uint48",
        "name": "start",
        "type": "uint48"
      },
      {
        "internalType": "uint48",
        "name": "end",
        "type": "uint48"
      }
    ],
    "name": "InvalidStartEnd",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "sessionId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalSessions",
        "type": "uint256"
      }
    ],
    "name": "SessionDoesNotExist",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "sessionId",
        "type": "uint256"
      }
    ],
    "name": "SessionNotActive",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "sessionId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "songId",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "requester",
        "type": "address"
      }
    ],
    "name": "AddSongRequest",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "sessionId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "songId",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "requester",
        "type": "address"
      }
    ],
    "name": "RemoveSongRequest",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "sessionId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint48",
        "name": "start",
        "type": "uint48"
      },
      {
        "indexed": false,
        "internalType": "uint48",
        "name": "end",
        "type": "uint48"
      }
    ],
    "name": "SessionCreated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "sessionId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "songId",
        "type": "string"
      }
    ],
    "name": "addSongRequest",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint48",
        "name": "start",
        "type": "uint48"
      },
      {
        "internalType": "uint48",
        "name": "end",
        "type": "uint48"
      }
    ],
    "name": "createSession",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "sessionId",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "sessionId",
        "type": "uint256"
      }
    ],
    "name": "getSongRequests",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "songId",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "requester",
            "type": "address"
          }
        ],
        "internalType": "struct Jukeblox.SongRequest[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "sessionId",
        "type": "uint256"
      }
    ],
    "name": "isActive",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "sessionId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "songId",
        "type": "string"
      }
    ],
    "name": "removeSongRequest",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "sessions",
    "outputs": [
      {
        "internalType": "uint48",
        "name": "start",
        "type": "uint48"
      },
      {
        "internalType": "uint48",
        "name": "end",
        "type": "uint48"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSessions",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const; 