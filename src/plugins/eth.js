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
    async waitLogHTLCWithdrawEvent(secretUppercaseWithout0x) {
      const returnObject = {
        hash: '',
        contractId: '',
        preImage: ''
      }
      const secret = `0x${secretUppercaseWithout0x.toLowerCase()}`
      const currentBlockNumber = await web3.eth.getBlockNumber()
      for (let i = 0; i < 1000; i++) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        const events = await contract.getPastEvents(
          'LogHTLCWithdraw',
          {
            fromBlock: currentBlockNumber - 1000
          },
          (error) => {
            if (error) console.error(error)
          }
        )
        for (let j = 0; j < events.length; j++) {
          const event = events[j]
          const contractId = event.returnValues.contractId
          const getContract = await contract.methods
            .getContract(contractId)
            .call()
          if (getContract.hashlock === secret) {
            returnObject.hash = event.transactionHash
            returnObject.contractId = contractId
            break
          }
        }
        if (returnObject.hash.length > 0) {
          break
        }
      }
      if (returnObject.hash.length === 0) {
        return Promise.reject(new Error('timeout'))
      }
      const preImage = await contract.methods
        .getContract(returnObject.contractId)
        .call()
        .then((result) => {
          return result.preimage
        })
      returnObject.preImage = preImage
      return returnObject
    },
    async waitLogHTLCNewEvent(
      senderEthAddress,
      receiverEthAddress,
      secretUppercaseWithout0x
    ) {
      const returnObject = {
        hash: '',
        contractId: ''
      }
      const currentBlockNumber = await web3.eth.getBlockNumber()
      for (let i = 0; i < 1000; i++) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        const events = await contract.getPastEvents(
          'LogHTLCNew',
          {
            fromBlock: currentBlockNumber - 1000,
            filter: {
              sender: senderEthAddress,
              receiver: receiverEthAddress
            }
          },
          (error) => {
            if (error) console.error(error)
          }
        )
        if (events.length > 0) {
          const eventsFiltered = events.filter((event) => {
            return (
              event.returnValues.hashlock ===
              `0x${secretUppercaseWithout0x.toLowerCase()}`
            )
          })
          if (eventsFiltered.length > 0) {
            returnObject.hash = eventsFiltered[0].transactionHash
            returnObject.contractId = eventsFiltered[0].returnValues.contractId
            break
          }
        }
      }
      return returnObject
    },
    async sendNewContractAndWaitConfirmed(
      privateKey,
      secretUppercaseWithout0x,
      recipient,
      txSentCallback
    ) {
      const account = web3.eth.accounts.privateKeyToAccount(privateKey)
      web3.eth.accounts.wallet.add(account)
      web3.eth.defaultAccount = account.address
      const receipt = await contract.methods
        .newContract(
          recipient,
          `0x${secretUppercaseWithout0x.toLowerCase()}`,
          Math.ceil(Date.now() / 1000) + 60 * 60 * 48
        )
        .send(
          {
            from: account.address,
            gas: 150000,
            gasPrice: 15000000000,
            value: 1
          },
          txSentCallback
        )
      web3.eth.accounts.wallet.remove(account)
      web3.eth.defaultAccount = undefined
      return receipt
    },
    async sendWithdrawAndWaitConfirmed(
      privateKey,
      proofUppercaseWithout0x,
      contractId,
      txSentCallback
    ) {
      const account = web3.eth.accounts.privateKeyToAccount(privateKey)
      web3.eth.accounts.wallet.add(account)
      web3.eth.defaultAccount = account.address
      const receipt = await contract.methods
        .withdraw(contractId, `0x${proofUppercaseWithout0x.toLowerCase()}`)
        .send(
          {
            from: account.address,
            gas: 500000,
            gasPrice: 15000000000
          },
          txSentCallback
        )
      web3.eth.accounts.wallet.remove(account)
      web3.eth.defaultAccount = undefined
      return receipt
    }
  })
}
