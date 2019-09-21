<template>
  <div>
    <h1 class="title">
      Select Role
    </h1>
    <div class="d-flex">
      <b-card title="Alice" style="max-width: 20rem;" class="mb-2">
        <b-card-text>
          Send <span class="badge badge-nem">XEM</span>, Receive
          <span class="badge badge-eth">ETH</span>.
        </b-card-text>
        <b-button
          :variant="selected === 'Alice' ? 'primary' : 'secondary'"
          @click="selected = 'Alice'"
          >Select Alice</b-button
        >
      </b-card>
      <b-card title="Bob" style="max-width: 20rem;" class="mb-2">
        <b-card-text>
          Send <span class="badge badge-eth">ETH</span>, Receive
          <span class="badge badge-nem">XEM</span>.
        </b-card-text>
        <b-button
          :variant="selected === 'Bob' ? 'primary' : 'secondary'"
          @click="selected = 'Bob'"
          >Select Bob</b-button
        >
      </b-card>
    </div>
    <div>
      <div class="mt-3">
        Selected: <strong>{{ selected }}</strong>
      </div>
      <div class="mt-3">
        <b-button variant="outline-secondary" to="/">Back</b-button>
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
