<template>
  <!-- Input for existing campaign ID -->
  <v-row>
    <v-col cols="12">
      <h3>Select Existing Campaign</h3>
      <v-select
        v-model="localExistingCampaignName"
        :items="campaigns.map((campaign) => campaign.name)"
        label="Select Campaign"
      ></v-select>
      <v-btn @click="useExistingCampaign" color="primary">
        Use Existing Campaign
      </v-btn>
    </v-col>
  </v-row>

  <!-- Input for new campaign name if creating a new campaign -->
  <v-row>
    <v-col cols="12">
      <h3>Create Campaign</h3>
      <v-text-field
        v-model="localCampaignName"
        label="New Campaign Name"
        placeholder="Enter Campaign Name"
      ></v-text-field>
    </v-col>
  </v-row>

  <!-- Button to create campaign and import leads -->
  <v-row>
    <v-col>
      <v-btn @click="createCampaign" color="success">
        Create New Campaign and Import Leads
      </v-btn>
    </v-col>
  </v-row>
</template>
<script>
export default {
  props: {
    campaignCreated: Boolean,
    campaigns: Array, // Should be an array of objects with 'id' and 'name'
    campaignName: String,
  },
  data() {
    return {
      localExistingCampaignName: null, // Store selected campaign name
      localCampaignName: this.campaignName, // Local copy of the new campaign name
    };
  },
  methods: {
    useExistingCampaign() {
      // Find the campaign with the selected name
      const selectedCampaign = this.campaigns.find(
        (campaign) => campaign.name === this.localExistingCampaignName
      );

      if (selectedCampaign) {
        // Emit the selected campaign's ID
        this.$emit("useExistingCampaign", selectedCampaign.id);
      } else {
        // Handle the case where the campaign is not found
        this.$emit("useExistingCampaign", null);
      }
    },
    createCampaign() {
      this.$emit("createCampaign", this.localCampaignName);
    },
  },
  watch: {
    campaignName: {
      immediate: true,
      handler(newName) {
        this.localCampaignName = newName;
      },
    },
  },
};
</script>
