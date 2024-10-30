export interface ContractListArray {
    [index: number]: {
        contract: string, // deprecated, now use contract address from API
        routers: {name: string,address: string, url: string}[],
        
        // creationFee?: number,
        // transactionFee: number,
        
        multicall3?:  `0x${string}`,
        stage?: 'local'|'test'|'prod',
        initialVirtualEthReserve?:number,
        initialVirtualTokenReserve?:number
    };
}

export const contractList:  ContractListArray = {
    31337: {
        contract: '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318',
        routers: [
            {
                name:'zSwap',
                address: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0', // Ra 0xAAA45c8F5ef92a000a121d102F4e89278a711Faa
                url: 'https://zswap.app'
            },
        ],
        // creationFee: 0.0005,
        // transactionFee: 0.01, // 1%
        initialVirtualEthReserve: 1,
        initialVirtualTokenReserve:1073000000
    },
    2522: {//fraxtal_test
        contract: '0xb2869F895FC24790e81EF05a3AeF0F23897eC33b',
        routers: [
            {
                name:'zSwap',
                address: '0xBc22E20975E980E484f617f3053680fb01E2e62A',
                url: 'https://zswap.app'
            },
            {
                name:'Ra Swap',
                address: '0xAAA45c8F5ef92a000a121d102F4e89278a711Faa', // Ra 0xAAA45c8F5ef92a000a121d102F4e89278a711Faa
                url: 'https://ra.exchange'
            },
            {
                name: 'FraxSwap',
                address: '0x39cd4db6460d8B5961F73E997E86DdbB7Ca4D5F6',
                url: 'https://app.frax.finance/swap/main'
            }
        ],
        // creationFee: 0.0005,
        // transactionFee: 0.01, // 1%
    },
    252: {//fraxtal
        contract: '0xE3979f0a50a84D51D41306245ADc4f96536eAa12',
        routers: [
            {
                name:'zSwap',
                address: '0x3C931aA2d16Ddec925A39E9Da9F6b84bFe917547',
                url: 'https://zswap.app'
            },
            {
                name:'Ra Swap',
                address: '0xAAA45c8F5ef92a000a121d102F4e89278a711Faa', // Ra 0xAAA45c8F5ef92a000a121d102F4e89278a711Faa
                url: 'https://ra.exchange'
            },
            {
                name: 'FraxSwap',
                address: '0x39cd4db6460d8B5961F73E997E86DdbB7Ca4D5F6',
                url: 'https://app.frax.finance/swap/main'
            }
        ],
        
        // transactionFee: 0.01, // 1%
    },
    2713017997578000: {//dchain
        contract: '0x6D096DA092FDF203c2886d88aD773A237822fD82',
        routers: [
            {
                name:'zSwap',
                address: '0x7EaCAC40f0474F846A4A313Dc668177098B530bE',
                url: 'https://zswap.app'
            },
            // {
            //     name:'Ra Swap',
            //     address: '0xAAA45c8F5ef92a000a121d102F4e89278a711Faa' // Ra 0xAAA45c8F5ef92a000a121d102F4e89278a711Faa
            // }
        ],
        
        // transactionFee: 0.01, // 1%
    },

    250: {// Fantom
        contract: '0x6D096DA092FDF203c2886d88aD773A237822fD82',
        routers: [
            {
                name:'zSwap',
                address: '0x49C591b5C26B2723987b993C606b772c7f7609F8',
                url: 'https://zswap.app'
            },
            
            {
                "name": "SpiritSwap",
                "address": "0x16327e3fbdaca3bcf7e38f5af2599d2ddc33ae52",
                "url": "https://spiritswap.finance"
              },
              {
                "name": "SpookySwap V1",
                "address": "0xf491e7b69e4244ad4002bc14e878a34207e38c29",
                "url": "https://spookyswap.finance"
              },
              {
                "name": "Beethoven X (50/50 pools only)",
                "address": "0xd100808034bd4a225fc85a0613b651e7f5a8d384",
                "url": "https://beets.fi"
              },
              {
                "name": "Sushi",
                "address": "0x1b02da8cb0d097eb8d57a175b88c7d8b47997506",
                "url": "https://sushi.com/swap"
              },
              {
                "name": "WigoSwap",
                "address": "0x5023882f4d1ec10544fcb2066abe9c1645e95aa0",
                "url": "https://wigoswap.io"
              },
              {
                "name": "Odos",
                "address": "0xD0c22A5435F4E8E5770C1fAFb5374015FC12F7cD",
                "url": "https://odos.io"
              }
        ],
        
        // transactionFee: 0.01, // 1%
    },

    4002: {// Fantom Testnet
        contract: '0x6ff45859D2728D7449C8Fc988c981b8EebF22E6d',
        routers: [
            {
                name:'zSwap',
                address: '0x9b2Ec125b0b0a88dbf5Ec3e350B3Ff998De12f04',
                url: 'https://zswap.app'
            },
            
              {
                "name": "SpookySwap V1",
                "address": "0xa6AD18C2aC47803E193F75c3677b14BF19B94883",
                "url": "https://spookyswap.finance"
              },



            //   {
            //     "name": "SpiritSwap",
            //     "address": "0x16327e3fbdaca3bcf7e38f5af2599d2ddc33ae52",
            //     "url": "https://spiritswap.finance"
            //   },
            //   {
            //     "name": "Beethoven X (50/50 pools only)",
            //     "address": "0xd100808034bd4a225fc85a0613b651e7f5a8d384",
            //     "url": "https://beets.fi"
            //   },
            //   {
            //     "name": "Sushi",
            //     "address": "0x1b02da8cb0d097eb8d57a175b88c7d8b47997506",
            //     "url": "https://sushi.com/swap"
            //   },
            //   {
            //     "name": "WigoSwap",
            //     "address": "0x5023882f4d1ec10544fcb2066abe9c1645e95aa0",
            //     "url": "https://wigoswap.io"
            //   },
            //   {
            //     "name": "Odos",
            //     "address": "0xD0c22A5435F4E8E5770C1fAFb5374015FC12F7cD",
            //     "url": "https://odos.io"
            //   }
          
        ],
        
        // transactionFee: 0.01, // 1%
    },

    656476: {//Educhain OpenCampus
        contract: '0x6D096DA092FDF203c2886d88aD773A237822fD82',
        routers: [
            {
                name:'zSwap',
                address: '0xf281436B28492364beB531D4971473F6794d2407',
                url: 'https://zswap.app'
            },
            // {
            //     name:'Ra Swap',
            //     address: '0xAAA45c8F5ef92a000a121d102F4e89278a711Faa' // Ra 0xAAA45c8F5ef92a000a121d102F4e89278a711Faa
            // }
        ],
        
        // transactionFee: 0.01, // 1%
    },


    1115: {//Core DAO Testnet
        contract: '0x6D096DA092FDF203c2886d88aD773A237822fD82',
        routers: [
            {
                name:'zSwap',
                address: '0x00B8AEA89E66EDE903B0aD0948703228b0b7dFe0',
                url: 'https://zswap.app'
            },
            // {
            //     name:'Ra Swap',
            //     address: '0xAAA45c8F5ef92a000a121d102F4e89278a711Faa' // Ra 0xAAA45c8F5ef92a000a121d102F4e89278a711Faa
            // }
        ],
        
        // transactionFee: 0.01, // 1%
    },

    42220: {//Celo 
        contract: '0x6D096DA092FDF203c2886d88aD773A237822fD82',
        routers: [
            {
                name:'zSwap',
                address: '0xa91fAbFD8E913b4aF4832e7c894bf4D27518F524',
                url: 'https://zswap.app'
            },
            {
                name:'UbeSwap',
                address: '0xE3D8bd6Aed4F159bc8000a9cD47CffDb95F96121',
                url: 'https://ubeswap.org'
            },//
            {
                name:'SushiSwap',
                address: '0x1421bDe4B10e8dd459b3BCb598810B1337D56842',
                url: 'https://sushi.com/swap'
            },
        ],
    },

    44787: {//Celo testnet
        contract: '0x6D096DA092FDF203c2886d88aD773A237822fD82',
        routers: [
            {
                name:'zSwap',
                address: '0x72168A4b335f1E6E36237bE31Db6a6c5832a6711',
                url: 'https://zswap.app'
            },
            {
                name:'UbeSwap',
                address: '0xe3d8bd6aed4f159bc8000a9cd47cffdb95f96121',
                url: 'https://ubeswap.org'
            }
        ],
    },

    696969: {//Galdriel testnet
        contract: '0x54B15d18c32032767d55AEB199ae488708cF6845',
        routers: [
            {
                name:'zSwap',
                address: '0x7EaCAC40f0474F846A4A313Dc668177098B530bE',
                url: 'https://zswap.app'
            }
        ],
    },

    // 
    5611: {// Op BNB testnet
        contract: '0x6D096DA092FDF203c2886d88aD773A237822fD82',
        routers: [
            {
                name:'zSwap',
                address: '0x03342C286Bd8914B480D6134ebA774bc3229a28c',
                url: 'https://zswap.app'
            }
        ],
    },

    2810:{// Morph Holesky
        contract:'0x7EaCAC40f0474F846A4A313Dc668177098B530bE',
        routers: [
            {
                name:'zSwap',
                address: '0x00aC989ddB7aEc2405a7f456De9E432c60A94283',
                url: 'https://zswap.app'
            }
        ],
    },

    12227332: {// Neo X Testnet
        contract: '0x7EaCAC40f0474F846A4A313Dc668177098B530bE',
        routers: [
            {
                name:'zSwap',
                address: '0x00aC989ddB7aEc2405a7f456De9E432c60A94283',
                url: 'https://zswap.app'
            }
        ],
    },

    1313161555: {// Aurora Testnet
        contract: '0x043C8d950F59d49B072eAacDACc1Cd1635936981',
        routers: [
            {
                name:'zSwap',
                address: '0x714ca4F6a3719C2277beE2510096f6D448aE6E5D',
                url: 'https://zswap.app'
            }
        ],
        multicall3: '0xb602DCA59Ba3F92b897cAF0b14A5C629D8825c73'
    },
    1313161554: {// Aurora Mainnet
        contract: '0xa91fAbFD8E913b4aF4832e7c894bf4D27518F524',
        routers: [
            {
                name:'zSwap',
                address: '0x3C931aA2d16Ddec925A39E9Da9F6b84bFe917547',
                url: 'https://zswap.app'
            }
        ],
        multicall3: '0xb602DCA59Ba3F92b897cAF0b14A5C629D8825c73'
    }
}