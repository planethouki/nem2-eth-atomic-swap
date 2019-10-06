import {
  Account,
  AccountHttp,
  Address,
  Deadline,
  HashType,
  Listener,
  Mosaic,
  MosaicId,
  NetworkHttp,
  NetworkType,
  SecretLockTransaction,
  SecretProofTransaction,
  TransactionHttp,
  TransactionType,
  UInt64
} from 'nem2-sdk'
import { keccak256 } from 'js-sha3'
import { randomBuffer } from 'secure-random'
import { filter, timeout, mergeMap } from 'rxjs/operators'

export default ({ app, store }, inject) => {
  inject('nem', {
    test: (string) => {
      console.log('Okay, another function', string)
    },
    txHashUrl(txHash) {
      return txHash ? `${process.env.nemExplorerTxUrl}/${txHash}` : ''
    },
    txHashStatusUrl(txHash) {
      return txHash ? `${process.env.nemExplorerTxUrl}/${txHash}/status` : ''
    },
    isPrivateKeyValid(privateKeyString) {
      try {
        Account.createFromPrivateKey(privateKeyString, NetworkType.MIJIN_TEST)
        return true
      } catch (e) {
        return false
      }
    },
    isAddressValid(addressString) {
      try {
        Address.createFromRawAddress(addressString)
        return true
      } catch (e) {
        return false
      }
    },
    privateKeyToAddress(privateKeyString) {
      return Account.createFromPrivateKey(
        privateKeyString,
        NetworkType.MIJIN_TEST
      ).address.plain()
    },
    keccac256(hex) {
      return keccak256
        .create()
        .update(Buffer.from(hex, 'hex'))
        .hex()
        .toUpperCase()
    },
    generateRandom() {
      return randomBuffer(32)
        .toString('hex')
        .toUpperCase()
    },
    getXemBalance(addressString) {
      const networkHttp = new NetworkHttp(process.env.nemEndpoint)
      const accountHttp = new AccountHttp(process.env.nemEndpoint, networkHttp)
      return accountHttp
        .getAccountInfo(Address.createFromRawAddress(addressString))
        .toPromise()
        .then((accountInfo) => {
          const xemBalanceOrEmpty = accountInfo.mosaics
            .filter((mosaic) => {
              return (
                mosaic.id.toHex().toUpperCase() === process.env.xemMosaicHexId
              )
            })
            .map((mosaic) => {
              return mosaic.amount.compact()
            })
          if (xemBalanceOrEmpty.length === 0) {
            return 0
          } else {
            return xemBalanceOrEmpty[0]
          }
        })
        .catch(() => {
          return 0
        })
    },
    sendSecretLock(secret, recipientAddress, privateKey) {
      const deadLine = Deadline.create()
      const mosaic = new Mosaic(
        new MosaicId(process.env.xemMosaicHexId),
        UInt64.fromUint(1)
      )
      const duration = UInt64.fromUint(1000)
      const hashType = HashType.Op_Keccak_256
      const recipient = Address.createFromRawAddress(recipientAddress)
      const networkType = NetworkType.MIJIN_TEST
      const maxFee = UInt64.fromUint(200000)
      const secretLockTransaction = SecretLockTransaction.create(
        deadLine,
        mosaic,
        duration,
        hashType,
        secret,
        recipient,
        networkType,
        maxFee
      )
      const account = Account.createFromPrivateKey(privateKey, networkType)
      const signedTransaction = account.sign(
        secretLockTransaction,
        process.env.nemGenerationHash
      )
      const transactionHttp = new TransactionHttp(process.env.nemEndpoint)
      transactionHttp.announce(signedTransaction)
      return signedTransaction.hash
    },
    sendSecretProof() {
      const privateKey = store.state.nemPrivateKey
      const networkType = NetworkType.MIJIN_TEST
      const account = Account.createFromPrivateKey(privateKey, networkType)
      const proof = store.state.proof
      const secret = store.state.secret
      const deadLine = Deadline.create()
      const hashType = HashType.Op_Keccak_256
      const recipient = account.address
      const maxFee = UInt64.fromUint(200000)
      const secretProofTransaction = SecretProofTransaction.create(
        deadLine,
        hashType,
        secret,
        recipient,
        proof,
        networkType,
        maxFee
      )
      const signedTransaction = account.sign(
        secretProofTransaction,
        process.env.nemGenerationHash
      )
      const transactionHttp = new TransactionHttp(process.env.nemEndpoint)
      transactionHttp.announce(signedTransaction)
      return signedTransaction.hash
    },
    async waitForConfirmed(addressString, transactionHash) {
      const transactionHttp = new TransactionHttp(process.env.nemEndpoint)
      const isAlreadyConfirmed = await transactionHttp
        .getTransactionStatus(transactionHash)
        .toPromise()
        .then((transactionStatus) => {
          return transactionStatus.group === 'confirmed'
        })
        .catch(() => {
          return false
        })
      console.log('isAlreadyConfirmed', isAlreadyConfirmed)
      if (isAlreadyConfirmed) {
        return Promise.resolve()
      }
      const listener = new Listener(
        process.env.nemEndpoint.replace('http', 'ws'),
        WebSocket
      )
      await listener.open()
      await new Promise((resolve, reject) => {
        listener
          .confirmed(Address.createFromRawAddress(addressString))
          .pipe(
            filter((transaction) => {
              return transaction.transactionInfo.hash === transactionHash
            }),
            timeout(120000)
          )
          .subscribe(
            () => {
              listener.close()
              console.log('connection close')
              return resolve()
            },
            (e) => {
              listener.close()
              console.log('connection close')
              return reject(e)
            }
          )
      })
    },
    async waitAndFindSecretLockConfirmed(recipientAddress, secret) {
      const returnObject = {
        hash: '',
        secret: ''
      }
      const recipient = Address.createFromRawAddress(recipientAddress)
      for (let i = 0; i < 1000; i++) {
        const accountHttp = new AccountHttp(
          process.env.nemEndpoint,
          new NetworkHttp(process.env.nemEndpoint)
        )
        const transactions = await accountHttp
          .getAccountInfo(recipient)
          .pipe(
            mergeMap((accountInfo) => {
              return accountHttp.incomingTransactions(accountInfo.publicAccount)
            })
          )
          .toPromise()
        const transactionsFiltered = transactions
          .filter((transaction) => {
            return transaction.type === TransactionType.SECRET_LOCK
          })
          .filter((transaction) => {
            return transaction.recipient.equals(recipient)
          })
          .filter((transaction) => {
            return transaction.secret === secret
          })
        if (transactionsFiltered.length === 1) {
          returnObject.hash = transactionsFiltered[0].transactionInfo.hash
          returnObject.secret = transactionsFiltered[0].secret
          return Promise.resolve(returnObject)
        }
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
      return Promise.reject(new Error('timeout'))
    },
    async waitAndFindSecretProofConfirmed(recipientAddress, secret) {
      const recipient = Address.createFromRawAddress(recipientAddress)
      let hash
      for (let i = 0; i < 1000; i++) {
        const accountHttp = new AccountHttp(
          process.env.nemEndpoint,
          new NetworkHttp(process.env.nemEndpoint)
        )
        const transactions = await accountHttp
          .getAccountInfo(recipient)
          .pipe(
            mergeMap((accountInfo) => {
              return accountHttp.incomingTransactions(accountInfo.publicAccount)
            })
          )
          .toPromise()
        const transactionsFiltered = transactions
          .filter((transaction) => {
            return transaction.type === TransactionType.SECRET_PROOF
          })
          .filter((transaction) => {
            return transaction.recipient.equals(recipient)
          })
          .filter((transaction) => {
            return transaction.secret === secret
          })
        if (transactionsFiltered.length === 1) {
          hash = transactionsFiltered[0].transactionInfo.hash
          return Promise.resolve(hash)
        }
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
      return Promise.reject(new Error('timout'))
    }
  })
}
