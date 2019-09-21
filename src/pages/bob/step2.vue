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
        <b-card-text>Message : {{ message1 }}</b-card-text>
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
        <b-card-text>Bob locks ETH.</b-card-text>
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
        <b-card-text>Alice unlocks ETH.</b-card-text>
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
        <b-card-text>Bob unlocks XEM.</b-card-text>
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
      series({
        step1: async (done) => {
          this.variant1 = 'primary'
          this.message1 =
            "Waiting for Alice's sent SecretLock tx to be confirmed."
          const result = await this.$nem.waitAndFindSecretLockConfirmed(
            this.$nem.privateKeyToAddress(this.$store.state.nemPrivateKey),
            this.secret1
          )
          this.hash1 = result.hash
          this.$store.commit('setSecret', result.secret)
          this.variant1 = 'success'
          this.message1 = 'Confirmed.'
          done()
        },
        step2: async (done) => {
          this.variant2 = 'primary'
          await this.$eth.sendNewContractAndWaitConfirmed(
            this.$store.state.ethPrivateKey,
            this.$store.state.secret,
            this.$store.state.cpEthAddress,
            (error, transactionHash) => {
              if (error) {
                this.message2 = error.message
                console.error(error)
              }
              this.message2 = 'Transaction sent. Waiting for confirm.'
              this.hash2 = transactionHash
            }
          )
          this.message2 = 'Confirmed.'
          this.variant2 = 'success'
          done()
        },
        step3: async (done) => {
          this.variant3 = 'primary'
          this.message3 =
            "Waiting for Alice's sent transaction to be confirmed."
          const result = await this.$eth.waitLogHTLCWithdrawEvent(
            this.$store.state.secret
          )
          this.$store.commit('setContractId', result.contractId)
          this.$store.commit(
            'setProof',
            result.preImage.substr(2).toUpperCase()
          )
          this.hash3 = result.transactionHash
          this.variant3 = 'success'
          this.message3 = 'Confirmed.'
          done()
        },
        step4: async (done) => {
          this.variant4 = 'primary'
          this.message4 = 'Preparing for SecretProof Tx.'
          this.hash4 = this.$nem.sendSecretProof()
          this.message4 = 'SecretProof Tx was sent successfully.'
          await this.$nem
            .waitForConfirmed(
              this.$nem.privateKeyToAddress(this.$store.state.nemPrivateKey),
              this.hash4
            )
            .then(() => {
              this.variant4 = 'success'
              this.message4 = 'Confirmed.'
            })
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
