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
        <b-input-group prepend="secret">
          <b-form-input v-model="secret1" :disabled="disabled1"></b-form-input>
          <b-input-group-append>
            <b-button variant="info" :disabled="disabled1" @click="submit1"
              >Go</b-button
            >
          </b-input-group-append>
        </b-input-group>
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
import { AccountHttp, Address, NetworkHttp, TransactionType } from 'nem2-sdk'
import { mergeMap } from 'rxjs/operators'
import Web3 from 'web3'
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
      message4: '',
      secret1: '',
      disabled1: false
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
  mounted() {},
  methods: {
    submit1() {
      if (this.secret1.length === 64) {
        this.disabled1 = true
        this.bobScenario()
      }
    },
    bobScenario() {
      const aliceAddress = this.$store.state.cpNemAddress
      const bobAddress = this.$nem.privateKeyToAddress(
        this.$store.state.nemPrivateKey
      )
      series({
        step1: async (done) => {
          this.variant1 = 'primary'
          const inputSecret = this.secret1
          for (let i = 0; i < 100; i++) {
            const accountHttp = new AccountHttp(
              process.env.nemEndpoint,
              new NetworkHttp(process.env.nemEndpoint)
            )
            const transactions = await accountHttp
              .getAccountInfo(Address.createFromRawAddress(aliceAddress))
              .pipe(
                mergeMap((accountInfo) => {
                  return accountHttp.transactions(accountInfo.publicAccount)
                })
              )
              .toPromise()
            const transactionsFiltered = transactions
              .filter((transaction) => {
                return transaction.type === TransactionType.SECRET_LOCK
              })
              .filter((transaction) => {
                return transaction.recipient.equals(
                  Address.createFromRawAddress(bobAddress)
                )
              })
              .filter((transaction) => {
                return transaction.secret === inputSecret
              })
            if (transactionsFiltered.length === 1) {
              console.log('transactionsFiltered', transactionsFiltered)
              this.hash1 = transactionsFiltered[0].transactionInfo.hash
              this.$store.commit('setSecret', transactionsFiltered[0].secret)
              this.variant1 = 'success'
              break
            }
            await new Promise((resolve) => setTimeout(resolve, 1000))
          }
          done()
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
          const receipt = await contract.methods
            .newContract(
              this.$store.state.cpEthAddress,
              `0x${this.$store.state.secret}`,
              Math.ceil(Date.now() / 1000) + 60 * 60 * 48
            )
            .send({
              from: account.address,
              gas: 150000,
              gasPrice: 15000000000,
              value: 1
            })
          this.hash2 = receipt.transactionHash
          this.variant2 = 'success'
          done()
        },
        step3: async (done) => {
          this.variant3 = 'primary'
          const web3 = new Web3(process.env.ethEndpoint)
          const contract = new web3.eth.Contract(
            abi,
            process.env.ethSwapContractAddress
          )
          const secret = `0x${this.$store.state.secret.toLowerCase()}`
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
                this.$store.commit('setContractId', contractId)
                this.hash3 = event.transactionHash
                break
              }
            }
            if (this.hash3 !== null) {
              break
            }
          }
          const preImage = await contract.methods
            .getContract(this.$store.state.contractId)
            .call()
            .then((result) => {
              return result.preimage
            })
          this.$store.commit('setProof', preImage.substr(2).toUpperCase())
          this.variant3 = 'success'
          done()
        },
        step4: (done) => {
          this.variant4 = 'primary'
          this.hash4 = this.$nem.sendSecretProof()
          this.variant4 = 'success'
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
