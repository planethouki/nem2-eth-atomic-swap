<template>
  <div>
    <h1 class="title">
      Progress of Atomic Swap
    </h1>
    <div class="mt-3">
      <b-card
        :border-variant="variant1"
        header="Step 1"
        :header-bg-variant="variant1"
        header-text-variant="white"
        align="center"
      >
        <b-card-text>Alice locks XEM.</b-card-text>
        <b-card-text>{{ hash1 }}</b-card-text>
        <b-card-text>{{ message1 }}</b-card-text>
      </b-card>
      <b-card
        :border-variant="variant2"
        header="Step 2"
        :header-bg-variant="variant2"
        header-text-variant="white"
        align="center"
      >
        <b-card-text>Bob locks ETH.</b-card-text>
        <b-card-text>{{ hash2 }}</b-card-text>
        <b-card-text>{{ message2 }}</b-card-text>
      </b-card>
      <b-card
        :border-variant="variant3"
        header="Step 3"
        :header-bg-variant="variant3"
        header-text-variant="white"
        align="center"
      >
        <b-card-text>Alice unlocks ETH.</b-card-text>
        <b-card-text>{{ hash3 }}</b-card-text>
        <b-card-text>{{ message3 }}</b-card-text>
      </b-card>
      <b-card
        :border-variant="variant4"
        header="Step 4"
        :header-bg-variant="variant4"
        header-text-variant="white"
        align="center"
      >
        <b-card-text>Bob unlocks XEM.</b-card-text>
        <b-card-text>{{ hash4 }}</b-card-text>
        <b-card-text>{{ message4 }}</b-card-text>
      </b-card>
    </div>
  </div>
</template>

<script>
import { series } from 'async'
import Web3 from 'web3'

import {
  Account,
  AccountHttp,
  Address,
  NetworkHttp,
  NetworkType,
  TransactionType
} from 'nem2-sdk'
import { mergeMap } from 'rxjs/operators'
import abi from '~/assets/abi'

export default {
  components: {},
  data() {
    return {
      variant1: 'secondary',
      variant2: 'secondary',
      variant3: 'secondary',
      variant4: 'secondary',
      hash1: null,
      hash2: null,
      hash3: null,
      hash4: null,
      message1: '',
      message2: '',
      message3: '',
      message4: ''
    }
  },
  asyncData({ store, redirect }) {
    if (store.state.role === null) {
      redirect('/role')
    }
    if (!store.getters.isFilledPrivateKeyAndAddress) {
      redirect('/alice/step1')
    }
  },
  mounted() {
    this.aliceScenario()
  },
  methods: {
    aliceScenario() {
      series({
        step1: (done) => {
          this.variant1 = 'primary'
          this.hash1 = this.$nem.sendSecretLock()
          this.$nem
            .waitForConfirmed(
              this.$nem.privateKeyToAddress(this.$store.state.nemPrivateKey),
              this.hash1
            )
            .then(() => {
              this.variant1 = 'success'
              this.message1 = `secret ${this.$store.state.secret}`
              done()
            })
        },
        step2: async (done) => {
          this.variant2 = 'primary'
          const web3 = new Web3(process.env.ethEndpoint)
          const account = web3.eth.accounts.privateKeyToAccount(
            this.$store.state.ethPrivateKey
          )
          web3.eth.accounts.wallet.add(account)
          web3.eth.defaultAccount = account.address
          const contract = new web3.eth.Contract(
            abi,
            process.env.ethSwapContractAddress
          )
          const currentBlockNumber = await web3.eth.getBlockNumber()
          for (let i = 0; i < 1000; i++) {
            await new Promise((resolve) => setTimeout(resolve, 1000))
            const events = await contract.getPastEvents(
              'LogHTLCNew',
              {
                fromBlock: currentBlockNumber - 1000,
                filter: {
                  sender: this.$store.state.cpEthAddress,
                  reciever: account.address
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
                  `0x${this.$store.state.secret.toLowerCase()}`
                )
              })
              if (eventsFiltered.length > 0) {
                this.hash2 = eventsFiltered[0].transactionHash
                this.$store.commit(
                  'setContractId',
                  eventsFiltered[0].returnValues.contractId
                )
                break
              }
            }
          }
          this.variant2 = 'success'
          done()
        },
        step3: async (done) => {
          this.variant3 = 'primary'
          const web3 = new Web3(process.env.ethEndpoint)
          const account = web3.eth.accounts.privateKeyToAccount(
            this.$store.state.ethPrivateKey
          )
          web3.eth.accounts.wallet.add(account)
          web3.eth.defaultAccount = account.address
          const contract = new web3.eth.Contract(
            abi,
            process.env.ethSwapContractAddress
          )
          const receipt = await contract.methods
            .withdraw(
              this.$store.state.contractId,
              `0x${this.$store.state.proof.toLowerCase()}`
            )
            .send({
              from: account.address,
              gas: 500000,
              gasPrice: 15000000000
            })
          this.hash3 = receipt.transactionHash
          this.variant3 = 'success'
          done()
        },
        step4: async (done) => {
          this.variant4 = 'primary'
          const aliceAddressObj = Account.createFromPrivateKey(
            this.$store.state.nemPrivateKey,
            NetworkType.MIJIN_TEST
          ).address
          const bobAddressObj = Address.createFromRawAddress(
            this.$store.state.cpNemAddress
          )
          for (let i = 0; i < 100; i++) {
            const accountHttp = new AccountHttp(
              process.env.nemEndpoint,
              new NetworkHttp(process.env.nemEndpoint)
            )
            const transactions = await accountHttp
              .getAccountInfo(bobAddressObj)
              .pipe(
                mergeMap((accountInfo) => {
                  return accountHttp.transactions(accountInfo.publicAccount)
                })
              )
              .toPromise()
            const transactionsFiltered = transactions
              .filter((transaction) => {
                return transaction.type === TransactionType.SECRET_PROOF
              })
              .filter((transaction) => {
                return transaction.recipient.equals(aliceAddressObj)
              })
              .filter((transaction) => {
                return transaction.secret === this.$store.state.secret
              })
            if (transactionsFiltered.length === 1) {
              console.log('transactionsFiltered', transactionsFiltered)
              this.hash4 = transactionsFiltered[0].transactionInfo.hash
              this.variant4 = 'success'
              break
            }
            await new Promise((resolve) => setTimeout(resolve, 1000))
          }
          done()
        }
      })
    }
  }
}
</script>

<style scoped>
.card + .card {
  margin-top: 1rem;
}
</style>
