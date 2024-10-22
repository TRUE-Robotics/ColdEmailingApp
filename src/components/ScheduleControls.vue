<template>
  <v-row>
    <v-col cols="12">
      <h3>Update Campaign Schedule</h3>
      <v-text-field
        v-model="localSchedule.timezone"
        label="Timezone"
        placeholder="America/Los_Angeles"
      ></v-text-field>
      <v-text-field
        v-model="localSchedule.days_of_the_week"
        label="Days of the Week (0-6, Sunday-Saturday)"
        placeholder="1,2,3"
      ></v-text-field>
      <v-text-field
        v-model="localSchedule.start_hour"
        label="Start Hour"
        type="time"
      ></v-text-field>
      <v-text-field
        v-model="localSchedule.end_hour"
        label="End Hour"
        type="time"
      ></v-text-field>
      <v-text-field
        v-model="localSchedule.min_time_btw_emails"
        label="Min Time Between Emails (in minutes)"
        type="number"
      ></v-text-field>
      <v-text-field
        v-model="localSchedule.max_new_leads_per_day"
        label="Max New Leads Per Day"
        type="number"
      ></v-text-field>
      <v-text-field
        v-model="localSchedule.schedule_start_time"
        label="Schedule Start Time"
        type="datetime-local"
      ></v-text-field>
      <v-btn @click="updateSchedule" color="primary">Update Schedule</v-btn>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: "ScheduleControls",
  props: {
    schedule: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      localSchedule: { ...this.schedule }, // Create a local copy of the schedule prop
    };
  },
  methods: {
    updateSchedule() {
      // Emit the updated schedule to the parent
      this.$emit("updateSchedule", this.localSchedule);
    },
  },
  watch: {
    // Watch for changes in the schedule prop and update the local copy accordingly
    schedule: {
      immediate: true,
      handler(newSchedule) {
        this.localSchedule = { ...newSchedule };
      },
    },
  },
};
</script>
