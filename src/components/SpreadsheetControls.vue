<template>
    <!-- Spreadsheet Controls -->
    <v-row>
      <v-col>

        <v-btn @click="pauseSchool" color="warning">Pause School</v-btn>
        <v-btn @click="resumeSchool" color="success">Resume School</v-btn>
      </v-col>
    </v-row>

</template>

<script>
export default {
    props: {
      
    },
    methods: {
      pauseSchool() {
        this.$emit("pauseSchool");
      },
      resumeSchool() {
        this.$emit("resumeSchool");
      },
    },
};
</script>