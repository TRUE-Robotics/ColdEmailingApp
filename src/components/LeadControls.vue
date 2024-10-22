<template>
  <!-- Add Leads Section -->
  <v-row>
    <v-col>
      <h3>Add Leads</h3>
      <v-btn @click="updateLeads" color="primary">
        Import/Add Leads (Fetch Excel File Again First)
      </v-btn>
    </v-col>
  </v-row>

  <!-- Pause/Resume Buttons for Leads -->
  <v-row>
    <v-col>
      <h3>Pause/Unpause All Leads</h3>
      <v-btn @click="pauseAllLeads" color="warning">Pause All Leads</v-btn>
      <v-btn @click="resumeAllLeads" color="success">Resume All Leads</v-btn>
    </v-col>
  </v-row>

  <!-- Pause Specific Lead by Email -->
  <v-row>
    <v-col cols="12">
      <h3>Pause Lead by Email</h3>
      <v-text-field
        v-model="localEmailToPause"
        label="Enter Email for Lead to Pause"
        type="email"
      ></v-text-field>
      <v-btn @click="pauseLeadByEmail" color="warning">
        Pause Lead by Email
      </v-btn>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: "LeadControls",
  props: {
    campaignCreated: {
      type: Boolean,
      required: true,
    },
    emailToPause: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      localEmailToPause: this.emailToPause, // Create a local copy of the prop
    };
  },
  methods: {
    updateLeads() {
      this.$emit("updateLeads");
    },
    pauseAllLeads() {
      this.$emit("pauseAllLeads");
    },
    resumeAllLeads() {
      this.$emit("resumeAllLeads");
    },
    pauseLeadByEmail() {
      // Emit the local value back to the parent
      this.$emit("pauseLeadByEmail", this.localEmailToPause);
    },
  },
  watch: {
    // Watch for changes in the emailToPause prop and update the local copy
    emailToPause: {
      immediate: true,
      handler(newEmail) {
        this.localEmailToPause = newEmail;
      },
    },
  },
};
</script>
