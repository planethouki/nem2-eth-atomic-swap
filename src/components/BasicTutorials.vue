<template
  ><div>
    <b-button v-b-modal.modal-1 size="sm" variant="outline-info"
      >Basic Tutorials</b-button
    >
    <b-modal id="modal-1" title="Basic Tutorials" size="xl" ok-only>
      <h4>What to swap</h4>
      <p>
        Swap private network XEM and Ropsten ETH. Unit is 0.00001 for XEM, 1wei
        for ETH
      </p>
      <h4>Getting Started</h4>
      <h5>Select Role</h5>
      <p>
        Two people are required for swap. A roll called Alice and Bob was
        prepared. Alice sends <b-badge variant="nem">XEM</b-badge> to Bob. Bob
        sends <b-badge variant="eth">ETH</b-badge> to Alice. The initiator is
        Alice.
      </p>
      <h5>Account Settings</h5>
      <p>
        Enter your private key in the first two input boxes. Required to send a
        transaction. Enter the address of the other party in the next two input
        boxes. Bob's if you are Alice. If you are Bob, Alice's. All accounts
        require a balance. If each account is valid and has a balance, &#x2705;
        appears on the right side of the input box. If you want to skip setting
        up an account, press the Use Preset button.
      </p>
      <h5>Atomic Swap (Alice Role)</h5>
      <h6>Step 0</h6>
      <p>
        Alice first generates a proof. This is a random number. Next, calculate
        the hash of the proof and call it the secret. This secret is the unique
        key for the swap. So tell Bob the secret, never tell the proof. When
        done, press the Done button. Atomic Swap starts.
      </p>
      <h6>Step 1</h6>
      <p>
        <b-badge variant="nem">NEM</b-badge> Network. Alice sends a secret lock
        transaction. In that transaction, Alice uses Bob as the recipient and
        the secret Alice just generated.
      </p>
      <h6>Step 2</h6>
      <p>
        <b-badge variant="eth">ETH</b-badge> Network. Wait for Bob to lock ETH
        with the same secret.
      </p>
      <h6>Step 3</h6>
      <p>
        <b-badge variant="eth">ETH</b-badge> Network. Put the generated proof in
        the transaction data and withdraw ETH locked by Bob. This makes proof
        visible to Bob.
      </p>
      <h6>Step 4</h6>
      <p>
        <b-badge variant="nem">NEM</b-badge> Network. Wait for Bob to withdraw
        the locked XEM with Alice using proof. Alice may not have to wait for
        this.
      </p>
      <h5>Atomic Swap (Bob Role)</h5>
      <h6>Step 0</h6>
      <p>
        First, Bob gets a secret from Alice. After entering the secret into the
        input box, press the Go button. Atomic Swap starts.
      </p>
      <h6>Step 1</h6>
      <p>
        <b-badge variant="nem">NEM</b-badge> Network. Wait for Alice to send a
        secret lock transaction. Bob then confirms that the secret for the
        transaction is the same as the received secret and that the recipient is
        Bob.
      </p>
      <h6>Step 2</h6>
      <p>
        <b-badge variant="eth">ETH</b-badge> Network. Using the received secret,
        Bob sends a transaction that locks ETH. The recipient is Alice.
      </p>
      <h6>Step 3</h6>
      <p>
        <b-badge variant="eth">ETH</b-badge> Network. Wait for Alice to send a
        transaction to unlock the locked ETH with proof.
      </p>
      <h6>Step 4</h6>
      <p>
        <b-badge variant="nem">NEM</b-badge> Network. At this point Bob knows
        the value of proof. Use this proof to send a secret proof transaction.
        This unlocks the XEM locked by Alice and sends it to Bob.
      </p>
    </b-modal>
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
