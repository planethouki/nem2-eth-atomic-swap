<template>
  <div>
    <h1 class="title">Progress of Atomic Swap ({{ role }} Role)</h1>
    <div class="mt-3">
      <b-card
        :border-variant="variant0"
        :header-bg-variant="variant0"
        header-text-variant="white"
        align="center"
      >
        <template v-slot:header>
          <b-badge>Step0</b-badge>
          <span>Prepare</span>
          <b-spinner
            v-show="variant0 === 'primary'"
            label="step0 executing"
            small
          ></b-spinner>
        </template>
        <b-card-text>Proof : {{ proof0 }}</b-card-text>
        <b-card-text>Lock Secret : {{ secret0 }}</b-card-text>
        <b-card-text>Message : {{ message0 }}</b-card-text>
        <b-button variant="info" @click="submit0">Done</b-button>
      </b-card>
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
        <b-card-text>
          <span>Transaction Hash : </span>
          <a
            v-if="variant1 === 'primary'"
            target="_blank"
            :href="$nem.txHashStatusUrl(hash1)"
            >{{ hash1 }}</a
          >
          <a
            v-else-if="variant1 === 'success'"
            target="_blank"
            :href="$nem.txHashUrl(hash1)"
            >{{ hash1 }}</a
          >
          <span v-else>{{ hash1 }}</span>
        </b-card-text>
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
        <b-card-text>
          <span>Transaction Hash : </span>
          <span v-if="variant2 === 'secondary'">{{ hash2 }}</span>
          <a v-else target="_blank" :href="$eth.txHashUrl(hash2)">{{
            hash2
          }}</a>
        </b-card-text>
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
        <b-card-text>
          <span>Transaction Hash : </span>
          <span v-if="variant3 === 'secondary'">{{ hash3 }}</span>
          <a v-else target="_blank" :href="$eth.txHashUrl(hash3)">{{
            hash3
          }}</a>
        </b-card-text>
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
        <b-card-text>
          <span>Transaction Hash : </span>
          <a
            v-if="variant4 === 'primary'"
            target="_blank"
            :href="$nem.txHashStatusUrl(hash4)"
            >{{ hash4 }}</a
          >
          <a
            v-else-if="variant4 === 'success'"
            target="_blank"
            :href="$nem.txHashUrl(hash4)"
            >{{ hash4 }}</a
          >
          <span v-else>{{ hash4 }}</span>
        </b-card-text>
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
      variant0: 'secondary',
      variant1: 'secondary',
      variant2: 'secondary',
      variant3: 'secondary',
      variant4: 'secondary',
      hash1: null,
      hash2: null,
      hash3: null,
      hash4: null,
      message0: '',
      message1: '',
      message2: '',
      message3: '',
      message4: '',
      proof0: '',
      secret0: '',
      done0: null
    }
  },
  computed: {
    role() {
      return this.$store.state.role
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
    submit0() {
      this.variant0 = 'success'
      this.done0()
    },
    aliceScenario() {
      series({
        step0: (done) => {
          this.variant0 = 'primary'
          this.proof0 = this.$nem.generateRandom()
          this.$store.commit('setProof', this.proof0)
          this.secret0 = this.$nem.keccac256(this.$store.state.proof)
          this.$store.commit('setSecret', this.secret0)
          this.message0 = 'Please tell above Lock Secret to Bob.'
          this.done0 = done
        },
        step1: (done) => {
          this.variant1 = 'primary'
          this.hash1 = this.$nem.sendSecretLock(
            this.$store.state.secret,
            this.$store.state.cpNemAddress,
            this.$store.state.nemPrivateKey
          )
          this.message1 =
            'SecretLock Tx was sent successfully. Wait for confirmed.'
          this.$nem
            .waitForConfirmed(
              this.$nem.privateKeyToAddress(this.$store.state.nemPrivateKey),
              this.hash1
            )
            .then(() => {
              this.variant1 = 'success'
              this.message1 = 'Confirmed.'
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
