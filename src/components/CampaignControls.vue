<template>
  <!-- Pause/Resume Buttons for Campaign -->
  <v-row>
    <v-col>
      <h3>Pause/Unpause Campaign</h3>
      <v-btn @click="pauseCampaign" color="warning">Pause Campaign</v-btn>
      <v-btn @click="resumeCampaign" color="success">Resume Campaign</v-btn>
    </v-col>
  </v-row>
</template>

<script>
export default {
  props: {
    campaignCreated: Boolean,
  },
  methods: {
    pauseCampaign() {
      this.$emit("pauseCampaign");
    },
    resumeCampaign() {
      this.$emit("resumeCampaign");
    },
  },
};
</script>
