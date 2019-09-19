<template>
  <div>
    <h1 class="title">
      Select Role
    </h1>
    <div>
      <b-form-group label="">
        <b-form-radio v-model="selected" name="role-radios" value="Alice"
          >Alice: Send XEM, Receive ETH.</b-form-radio
        >
        <b-form-radio v-model="selected" name="role-radios" value="Bob"
          >Bob: Send ETH, Receive XEM.</b-form-radio
        >
      </b-form-group>
      <div class="mt-3">
        Selected: <strong>{{ selected }}</strong>
      </div>
      <div class="mt-3">
        <b-button variant="outline-primary" @click="submit">Next</b-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selected: ''
    }
  },
  watch: {
    selected(newVal) {
      this.$store.commit('setRole', newVal)
    }
  },
  mounted() {
    this.selected = 'Alice'
  },
  methods: {
    submit() {
      this.$router.push(`${this.selected.toLowerCase()}/step1`)
    }
  }
}
</script>
