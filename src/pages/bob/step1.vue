<template>
  <div>
    <h1 class="title">Account Settings ({{ role }} Role)</h1>
    <p>
      <b-button variant="secondary" size="sm" @click="usePreset"
        >Use Preset</b-button
      >
      <b-button variant="outline-secondary" size="sm" @click="clearInput"
        >Clear</b-button
      >
    </p>
    <div>
      <h2>{{ role }} Private Keys</h2>
      <b-form-group
        id="your-nem-form"
        label-cols="4"
        label="NEM Private Key"
        label-for="nem-private-key"
      >
        <b-input-group>
          <b-form-input
            id="nem-private-key"
            v-model="nemPrivateKey"
          ></b-form-input>
          <b-input-group-text slot="append">
            <span v-show="!nemLoading">
              {{ decoder(nemValidationStatus.icon) }}
            </span>
            <b-spinner
              v-show="nemLoading"
              type="grow"
              small
              label="Loading..."
            ></b-spinner>
          </b-input-group-text>
        </b-input-group>
        <b-list-group>
          <b-list-group-item
            class="d-flex justify-content-between align-items-center px-3 py-1 border-0"
          >
            <span>Balance</span>
            <span>{{ nemBalance }}</span>
          </b-list-group-item>
          <b-list-group-item
            class="d-flex justify-content-between align-items-center px-3 py-1 border-0"
          >
            <span>Address</span>
            <span>{{ nemAddress }}</span>
          </b-list-group-item>
          <b-list-group-item
            class="d-flex justify-content-between align-items-center px-3 py-1 border-0"
          >
            <span>Message</span>
            <span>{{ nemValidationStatus.message }}</span>
          </b-list-group-item>
        </b-list-group>
      </b-form-group>
      <b-form-group
        id="your-eth-form"
        label-cols="4"
        label="ETH Private Key"
        label-for="eth-private-key"
      >
        <b-input-group>
          <b-form-input
            id="eth-private-key"
            v-model="ethPrivateKey"
          ></b-form-input>
          <b-input-group-text slot="append">
            <span v-show="!ethLoading">
              {{ decoder(ethValidationStatus.icon) }}
            </span>
            <b-spinner
              v-show="ethLoading"
              type="grow"
              small
              label="Loading..."
            ></b-spinner>
          </b-input-group-text>
        </b-input-group>
        <b-list-group>
          <b-list-group-item
            class="d-flex justify-content-between align-items-center px-3 py-1 border-0"
          >
            <span>Balance</span>
            <span>{{ ethBalance }}</span>
          </b-list-group-item>
          <b-list-group-item
            class="d-flex justify-content-between align-items-center px-3 py-1 border-0"
          >
            <span>Address</span>
            <span>{{ ethAddress }}</span>
          </b-list-group-item>
          <b-list-group-item
            class="d-flex justify-content-between align-items-center px-3 py-1 border-0"
          >
            <span>Message</span>
            <span>{{ ethValidationStatus.message }}</span>
          </b-list-group-item>
        </b-list-group>
      </b-form-group>
    </div>
    <div class="mt-3">
      <h2>{{ counterparty }} Addresses</h2>
      <b-form-group
        id="cp-nem-form"
        label-cols="4"
        label="NEM Address"
        label-for="nem-address"
      >
        <b-input-group>
          <b-form-input id="nem-address" v-model="cpNemAddress"></b-form-input>
          <b-input-group-text slot="append">
            <span v-show="!cpNemLoading">
              {{ decoder(cpNemValidationStatus.icon) }}
            </span>
            <b-spinner
              v-show="cpNemLoading"
              type="grow"
              small
              label="Loading..."
            ></b-spinner>
          </b-input-group-text>
        </b-input-group>
        <b-list-group>
          <b-list-group-item
            class="d-flex justify-content-between align-items-center px-3 py-1 border-0"
          >
            <span>Balance</span>
            <span>{{ cpNemBalance }}</span>
          </b-list-group-item>
        </b-list-group>
        <b-list-group-item
          class="d-flex justify-content-between align-items-center px-3 py-1 border-0"
        >
          <span>Message</span>
          <span>{{ cpNemValidationStatus.message }}</span>
        </b-list-group-item>
      </b-form-group>
      <b-form-group
        id="cp-eth-form"
        label-cols="4"
        label="ETH Address"
        label-for="eth-address"
      >
        <b-input-group>
          <b-form-input id="eth-address" v-model="cpEthAddress"></b-form-input>
          <b-input-group-text slot="append">
            <span v-show="!cpEthLoading">
              {{ decoder(cpEthValidationStatus.icon) }}
            </span>
            <b-spinner
              v-show="cpEthLoading"
              type="grow"
              small
              label="Loading..."
            ></b-spinner>
          </b-input-group-text>
        </b-input-group>
        <b-list-group>
          <b-list-group-item
            class="d-flex justify-content-between align-items-center px-3 py-1 border-0"
          >
            <span>Balance</span>
            <span>{{ cpEthBalance }}</span>
          </b-list-group-item>
          <b-list-group-item
            class="d-flex justify-content-between align-items-center px-3 py-1 border-0"
          >
            <span>Message</span>
            <span>{{ cpEthValidationStatus.message }}</span>
          </b-list-group-item>
        </b-list-group>
      </b-form-group>
    </div>
    <div>
      <b-button variant="outline-secondary" to="/role">Back</b-button>
      <b-button
        variant="outline-primary"
        :disabled="!isEnableGoNext"
        @click="goNext"
        >Next</b-button
      >
    </div>
  </div>
</template>

<script>
export default {
  components: {},
  data() {
    return {
      nemPrivateKey: '',
      nemAddress: '',
      nemBalance: null,
      nemLoading: false,
      ethPrivateKey: '',
      ethAddress: '',
      ethBalance: null,
      ethLoading: false,
      cpNemAddress: '',
      cpNemBalance: null,
      cpNemLoading: false,
      cpEthAddress: '',
      cpEthBalance: null,
      cpEthLoading: false,
      isEnableGoNext: false
    }
  },
  computed: {
    role() {
      return this.$store.state.role
    },
    counterparty() {
      return this.$store.state.role === 'Alice' ? 'Bob' : 'Alice'
    },
    nemValidationStatus() {
      if (this.nemLoading) {
        return { message: '', icon: '&#x2754;' }
      }
      if (this.nemPrivateKey.length === 0) {
        return { message: '', icon: '&#x2754;' }
      }
      if (this.nemBalance === null) {
        return { message: 'Invalid Private Key', icon: '&#x274C;' }
      }
      return this.nemBalance > 0
        ? { message: 'OK', icon: '&#x2705;' }
        : { message: 'Balance must not be 0', icon: '&#x274C;' }
    },
    ethValidationStatus() {
      if (this.ethLoading) {
        return { message: '', icon: '&#x2754;' }
      }
      if (this.ethPrivateKey.length === 0) {
        return { message: '', icon: '&#x2754;' }
      }
      if (this.ethBalance === null) {
        return { message: 'Invalid Private Key', icon: '&#x274C;' }
      }
      return this.ethBalance > 0
        ? { message: 'OK', icon: '&#x2705;' }
        : { message: 'Balance must not be 0', icon: '&#x274C;' }
    },
    cpNemValidationStatus() {
      if (this.cpNemLoading) {
        return { message: '', icon: '&#x2754;' }
      }
      if (this.cpNemAddress.length === 0) {
        return { message: '', icon: '&#x2754;' }
      }
      if (this.cpNemBalance === null) {
        return { message: 'Invalid Address', icon: '&#x274C;' }
      }
      return this.cpNemBalance > 0
        ? { message: 'OK', icon: '&#x2705;' }
        : { message: 'Balance must not be 0', icon: '&#x274C;' }
    },
    cpEthValidationStatus() {
      if (this.cpEthLoading) {
        return { message: '', icon: '&#x2754;' }
      }
      if (this.cpEthAddress.length === 0) {
        return { message: '', icon: '&#x2754;' }
      }
      if (this.cpEthBalance === null) {
        return { message: 'Invalid Private Key', icon: '&#x274C;' }
      }
      return this.cpEthBalance > 0
        ? { message: 'OK', icon: '&#x2705;' }
        : { message: 'Balance must not be 0', icon: '&#x274C;' }
    }
  },
  watch: {
    nemPrivateKey() {
      this.nemLoading = true
      if (this.$nem.isPrivateKeyValid(this.nemPrivateKey)) {
        this.nemAddress = this.$nem.privateKeyToAddress(this.nemPrivateKey)
        this.$nem.getXemBalance(this.nemAddress).then((balance) => {
          this.nemBalance = balance
          this.checkNext()
          this.nemLoading = false
        })
      } else {
        this.nemAddress = ''
        this.nemBalance = null
        this.checkNext()
        this.nemLoading = false
      }
    },
    ethPrivateKey() {
      this.ethLoading = true
      if (this.$eth.isPrivateKeyValid(this.ethPrivateKey)) {
        this.ethAddress = this.$eth.privateKeyToAddress(this.ethPrivateKey)
        this.$eth.getEthBalance(this.ethAddress).then((balance) => {
          this.ethBalance = balance
          this.checkNext()
          this.ethLoading = false
        })
      } else {
        this.ethAddress = ''
        this.ethBalance = null
        this.checkNext()
        this.ethLoading = false
      }
    },
    cpNemAddress() {
      this.cpNemLoading = true
      if (this.$nem.isAddressValid(this.cpNemAddress)) {
        this.$nem.getXemBalance(this.cpNemAddress).then((balance) => {
          this.cpNemBalance = balance
          this.checkNext()
          this.cpNemLoading = false
        })
      } else {
        this.cpNemBalance = null
        this.checkNext()
        this.cpNemLoading = false
      }
    },
    cpEthAddress() {
      this.cpEthLoading = true
      if (this.$eth.isAddressValid(this.cpEthAddress)) {
        this.$eth.getEthBalance(this.cpEthAddress).then((balance) => {
          this.cpEthBalance = balance
          this.checkNext()
          this.cpEthLoading = false
        })
      } else {
        this.cpEthBalance = null
        this.checkNext()
        this.cpEthLoading = false
      }
    }
  },
  asyncData({ store, redirect }) {
    if (store.state.role === null) {
      redirect('/role')
    }
  },
  methods: {
    store() {
      this.$store.commit('setPrivateKeyAndAddress', {
        nemPrivateKey: this.nemPrivateKey,
        ethPrivateKey: this.ethPrivateKey,
        cpNemAddress: this.cpNemAddress,
        cpEthAddress: this.cpEthAddress
      })
    },
    usePreset() {
      if (this.$store.state.role === 'Alice') {
        this.nemPrivateKey = process.env.alice.nemPrivateKey
        this.ethPrivateKey = process.env.alice.ethPrivateKey
        this.cpNemAddress = process.env.alice.cpNemAddress
        this.cpEthAddress = process.env.alice.cpEthAddress
      } else {
        this.nemPrivateKey = process.env.bob.nemPrivateKey
        this.ethPrivateKey = process.env.bob.ethPrivateKey
        this.cpNemAddress = process.env.bob.cpNemAddress
        this.cpEthAddress = process.env.bob.cpEthAddress
      }
    },
    clearInput() {
      this.nemPrivateKey = ''
      this.ethPrivateKey = ''
      this.cpNemAddress = ''
      this.cpEthAddress = ''
      this.checkNext()
    },
    checkNext() {
      this.isEnableGoNext = false
      this.$nextTick(() => {
        if (
          this.nemBalance !== null &&
          this.ethBalance !== null &&
          this.cpEthBalance !== null &&
          this.cpNemBalance !== null
        ) {
          this.isEnableGoNext = true
        }
      })
    },
    goNext() {
      this.store()
      if (this.$store.state.role === 'Alice') {
        this.$router.push('/alice/step2')
      } else {
        this.$router.push('/bob/step2')
      }
    },
    decoder(str) {
      const textArea = document.createElement('textarea')
      textArea.innerHTML = str
      return textArea.value
    }
  }
}
</script>
