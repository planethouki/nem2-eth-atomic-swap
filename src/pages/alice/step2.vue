<template>
  <div>
    <h1 class="title">
      Progress of Atomic Swap
    </h1>
    <div class="mt-3">
      <b-card
        :border-variant="variant1"
        :header-bg-variant="variant1"
        header-text-variant="white"
        align="center"
      >
        <template v-slot:header>
          <b-badge>Step1</b-badge>
          <span>Alice locks XEM.</span>
          <b-spinner
            v-show="variant1 === 'primary'"
            label="step1 executing"
            small
          ></b-spinner>
        </template>
        <b-card-text>Transaction Hash : {{ hash1 }}</b-card-text>
        <b-card-text>Lock Secret : {{ secret1 }}</b-card-text>
        <b-card-text>Message : {{ message1 }}</b-card-text>
      </b-card>
      <b-card
        :border-variant="variant2"
        :header-bg-variant="variant2"
        header-text-variant="white"
        align="center"
      >
        <template v-slot:header>
          <b-badge>Step2</b-badge>
          <span>Bob locks ETH.</span>
          <b-spinner
            v-show="variant2 === 'primary'"
            label="step2 executing"
            small
          ></b-spinner>
        </template>
        <b-card-text>Transaction Hash : {{ hash2 }}</b-card-text>
        <b-card-text>Message : {{ message2 }}</b-card-text>
      </b-card>
      <b-card
        :border-variant="variant3"
        :header-bg-variant="variant3"
        header-text-variant="white"
        align="center"
      >
        <template v-slot:header>
          <b-badge>Step3</b-badge>
          <span>Alice unlocks ETH.</span>
          <b-spinner
            v-show="variant3 === 'primary'"
            label="step3 executing"
            small
          ></b-spinner>
        </template>
        <b-card-text>Transaction Hash : {{ hash3 }}</b-card-text>
        <b-card-text>Message : {{ message3 }}</b-card-text>
      </b-card>
      <b-card
        :border-variant="variant4"
        :header-bg-variant="variant4"
        header-text-variant="white"
        align="center"
      >
        <template v-slot:header>
          <b-badge>Step4</b-badge>
          <span>Bob unlocks XEM.</span>
          <b-spinner
            v-show="variant4 === 'primary'"
            label="step4 executing"
            small
          ></b-spinner>
        </template>
        <b-card-text>Transaction Hash : {{ hash4 }}</b-card-text>
        <b-card-text>Message : {{ message4 }}</b-card-text>
      </b-card>
    </div>
  </div>
</template>

<script>
import { series } from 'async'

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
      secret1: ''
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
          this.$store.commit('setProof', this.$nem.generateRandom())
          const secret = this.$nem.keccac256(this.$store.state.proof)
          this.$store.commit('setSecret', secret)
          this.secret1 = secret
          this.hash1 = this.$nem.sendSecretLock(
            secret,
            this.$store.state.cpNemAddress,
            this.$store.state.nemPrivateKey
          )
          this.message1 =
            'SecretLock Tx was sent successfully. Wait for confirmed. Please tell above lock secret to Bob.'
          this.$nem
            .waitForConfirmed(
              this.$nem.privateKeyToAddress(this.$store.state.nemPrivateKey),
              this.hash1
            )
            .then(() => {
              this.variant1 = 'success'
              this.message1 = 'Confirmed. Please tell above lock secret to Bob.'
              done()
            })
        },
        step2: async (done) => {
          this.variant2 = 'primary'
          this.message2 = "Waiting for Bob's sent transaction to be confirmed."
          const result = await this.$eth.waitLogHTLCNewEvent(
            this.$store.state.cpEthAddress,
            this.$eth.privateKeyToAddress(this.$store.state.ethPrivateKey),
            this.$store.state.secret
          )
          this.hash2 = result.hash
          this.$store.commit('setContractId', result.contractId)
          this.message2 = 'Confirmed.'
          this.variant2 = 'success'
          done()
        },
        step3: async (done) => {
          this.variant3 = 'primary'
          this.message3 = 'Preparing for Unlock Transaction.'
          await this.$eth.sendWithdrawAndWaitConfirmed(
            this.$store.state.ethPrivateKey,
            this.$store.state.proof,
            this.$store.state.contractId,
            (error, transactionHash) => {
              if (error) {
                console.error(error)
                this.message3 = error.message
              }
              this.hash3 = transactionHash
              this.message3 = 'Transaction sent. Waiting for confirm.'
            }
          )
          this.message3 = 'Confirmed.'
          this.variant3 = 'success'
          done()
        },
        step4: async (done) => {
          this.variant4 = 'primary'
          this.message4 =
            "Waiting for Bob's sent SecretProof tx to be confirmed."
          this.hash4 = await this.$nem.waitAndFindSecretProofConfirmed(
            this.$store.state.cpNemAddress,
            this.$store.state.secret
          )
          this.variant4 = 'success'
          this.message4 = 'Confirmed.'
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
