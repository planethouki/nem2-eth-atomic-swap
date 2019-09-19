export const state = () => ({
  role: null,
  nemPrivateKey: null,
  ethPrivateKey: null,
  cpNemAddress: null,
  cpEthAddress: null,
  proof: null,
  secret: null,
  contractId: null
})

export const getters = {
  isFilledPrivateKeyAndAddress(state) {
    return !(
      state.nemPrivateKey === null ||
      state.ethPrivateKey === null ||
      state.cpNemAddress === null ||
      state.cpEthAddress === null
    )
  }
}

export const mutations = {
  setRole(state, roleName) {
    state.role = roleName
  },
  setPrivateKeyAndAddress(
    state,
    { nemPrivateKey, ethPrivateKey, cpNemAddress, cpEthAddress }
  ) {
    state.nemPrivateKey = nemPrivateKey
    state.ethPrivateKey = ethPrivateKey
    state.cpNemAddress = cpNemAddress
    state.cpEthAddress = cpEthAddress
  },
  setProof(state, proof) {
    state.proof = proof
  },
  setSecret(state, secret) {
    state.secret = secret
  },
  setContractId(state, contractId) {
    state.contractId = contractId
  }
}
