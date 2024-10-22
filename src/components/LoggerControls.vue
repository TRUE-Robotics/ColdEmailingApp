<template>
  <v-row>
    <v-col>
      <h3>LoggerControls</h3>
      <v-alert type="info">{{ logMessage }}</v-alert>
    </v-col>
  </v-row>
</template>

<script>
export default {
  props: {
    logMessage: {
      type: String,
      default: "Hello!",
    },
  },
};
</script>
