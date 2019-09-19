import Web3 from 'web3'
import abi from '~/assets/abi'

const web3 = new Web3(process.env.ethEndpoint)
const contract = new web3.eth.Contract(abi, process.env.ethSwapContractAddress)

export default ({ app }, inject) => {
  inject('eth', {
    isAddressValid(addressString) {
      return web3.utils.isAddress(addressString)
    },
    isPrivateKeyValid(privateKeyString) {
      try {
        web3.eth.accounts.privateKeyToAccount(privateKeyString)
        return true
      } catch (e) {
        return false
      }
    },
    privateKeyToAddress(privateKeyString) {
      return web3.eth.accounts.privateKeyToAccount(privateKeyString).address
    },
    getEthBalance(addressString) {
      return web3.eth.getBalance(addressString)
    },
    getPastEvent(sender) {
      return web3.eth
        .getBlockNumber()
        .then((blockNumber) => {
          return new Promise((resolve, reject) => {
            contract.getPastEvents(
              'LogHTLCNew',
              {
                filter: { sender },
                fromBlock: blockNumber - 5000,
                toBlock: blockNumber
              },
              (err, result) => {
                if (err) reject(err)
                resolve(result)
              }
            )
          })
        })
        .then((result) => {
          console.log(result)
          return result
        })
    }
  })
}
