<template>
  <div>
    <h1 class="title">
      nem2-eth-atomic-swap
    </h1>
    <h5>NEM</h5>
    <ul>
      <li>
        Network :
        <span class="badge badge-nem">Private</span>
      </li>
      <li>
        Endpoint :
        <span class="badge badge-nem">{{ nemEndpoint }}</span>
      </li>
      <li>
        Block Explorer :
        <a
          class="badge badge-nem"
          href="http://explorer48gh23s.z31.web.core.windows.net/?host=elephant2.48gh23s.xyz:3000#/blocks/0"
          target="_blank"
        >
          here
        </a>
      </li>
    </ul>
    <h5>Ethereum</h5>
    <ul>
      <li>Network : <span class="badge badge-eth">Ropsten</span></li>
      <li>
        Endpoint :
        <span class="badge badge-eth">{{ ethEndpoint }}</span>
      </li>
      <li>
        Block Explorer :
        <a
          class="badge badge-eth"
          href="https://ropsten.etherscan.io/"
          target="_blank"
          >here</a
        >
      </li>
      <li>
        HTLC :
        <a
          class="badge badge-eth"
          href="https://ropsten.etherscan.io/address/0x21c0750c4bb2b38c52d997a06eacbc7dc48b90ee"
          target="_blank"
          >0x21c0750c4bb2b38c52d997a06eacbc7dc48b90ee</a
        >
      </li>
    </ul>
    <div>
      <b-button variant="outline-primary" to="/role">Next</b-button>
    </div>
  </div>
</template>

<script>
export default {
  components: {},
  computed: {
    nemEndpoint() {
      return process.env.nemEndpoint
    },
    ethEndpoint() {
      return process.env.ethEndpoint
    }
  }
}
</script>
