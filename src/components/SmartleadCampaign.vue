<!-- src/components/SmartleadCampaign.vue -->

<template>
  <div>
    <button v-if="!campaignCreated" @click="createCampaign">
      Create and Pause Campaign
    </button>
    <div v-if="successMessage">{{ successMessage }}</div>
    <div v-if="errorMessage">{{ errorMessage }}</div>
  </div>
</template>

<script>
import { ref } from "vue";
import axios from "axios";

export default {
  name: "SmartleadCampaign",
  props: {
    campaignData: {
      type: Array,
      required: true,
    },
  },
  setup(props) {
    const successMessage = ref("");
    const errorMessage = ref("");
    const campaignCreated = ref(false);

    // Remove API_KEY from frontend; it should be handled on the server side.
    // const API_KEY = process.env.VUE_APP_SMARTLEAD_API_KEY;

    const createCampaign = async () => {
      try {
        if (!props.campaignData || props.campaignData.length === 0) {
          errorMessage.value = "No data available to create campaign.";
          return;
        }

        // Prepare the campaign data according to the new API requirements
        const campaignPayload = {
          // Update property names and structure as needed
          name: "Cold Email Campaign",
          // Include additional required fields as per the new documentation
          leads: props.campaignData.map((row) => ({
            first_name: row.Name,
            last_name: row.LastName || "",
            email: row.Email,
            // Include any other required fields
            custom_fields: {
              // Add custom fields if applicable
            },
          })),
        };

        // Send request to your backend server
        const response = await axios.post(
          "http://localhost:3000/api/create-campaign",
          campaignPayload
        );

        successMessage.value = response.data.message;
        campaignCreated.value = true;
      } catch (error) {
        console.error(
          "Error creating campaign:",
          error.response?.data || error.message
        );
        errorMessage.value =
          error.response?.data?.error ||
          "Error creating campaign. Please try again.";
      }
    };

    return {
      createCampaign,
      successMessage,
      errorMessage,
      campaignCreated,
    };
  },
};
</script>

<style scoped>
/* Add your styles here */
</style>
