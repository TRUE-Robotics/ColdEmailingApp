<template>
  <v-row>
    <v-col cols="12">
      <h3>Add Sequence</h3>
      <v-card
        v-for="(sequence, index) in sequences"
        :key="index"
        outlined
        class="mb-3"
      >
        <v-card-text>
          <v-text-field
            v-model="sequence.seq_number"
            label="Sequence Number"
            type="number"
          ></v-text-field>
          <v-text-field
            v-model="sequence.seq_delay_details.delay_in_days"
            label="Delay (in days)"
            type="number"
          ></v-text-field>
          <v-text-field
            v-model="sequence.subject"
            label="Subject"
            type="text"
          ></v-text-field>
          <v-textarea
            v-model="sequence.email_body"
            label="Email Body"
            rows="3"
          ></v-textarea>
        </v-card-text>
      </v-card>
      <v-btn @click="addSequence" color="primary">Add Another Sequence</v-btn>
      <v-btn @click="saveSequences" color="success">Save Sequences</v-btn>
    </v-col>
  </v-row>
</template>

<script>
export default {
  props: {
    campaignCreated: Boolean,
    sequences: Array,
  },
  methods: {
    addSequence() {
      this.$emit("addSequence");
    },
    saveSequences() {
      this.$emit("saveSequences");
    },
  },
};
</script>
