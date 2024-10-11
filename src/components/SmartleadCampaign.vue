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
    clientId: {
      type: Number,
      default: null, // Optional prop if you have a client_id
    },
  },
  setup(props) {
    const successMessage = ref("");
    const errorMessage = ref("");
    const campaignCreated = ref(false);

    // Define the wait function inside setup
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    
    const SMARTLEAD_API_KEY = process.env.VUE_APP_SMARTLEAD_API_KEY;

    const createCampaign = async () => {
      try {
        if (!props.campaignData || props.campaignData.length === 0) {
          errorMessage.value = "No data available to create campaign.";
          return;
        }

        // Prepare the campaign data according to the new API requirements
        const campaignPayload = {
          name: "Cold Email Campaign",
          client_id: props.clientId,
          leads: props.campaignData.map((row) => ({
            first_name: row.Name,
            last_name: row.LastName || "",
            email: row.Email,
            custom_fields: {
              // Add custom fields if applicable
            },
          })),
        };

        //Step 1: Create the campsign
        const createCampaignUrl = `https://server.smartlead.ai/api/v1/campaigns/create?api_key=${SMARTLEAD_API_KEY}`;

        const createCampaignResponse = await axios.post(
              createCampaignUrl,
              {
                  name: campaignPayload.name || 'Cold Email Campaign',
                  client_id: campaignPayload.client_id || null, // Include client_id if applicable
              },
              {
                  headers: {
                      'Content-Type': 'application/json',
                  },
              }
          );

        const campaignId = createCampaignResponse.data.id;

        console.log(`Campaign created with ID: ${campaignId}`);
        
        //Step 2: Add leads to the created campaign
        await wait(2000);
        const addLeadsUrl = `https://server.smartlead.ai/api/v1/campaigns/${campaignId}/leads?api_key=${SMARTLEAD_API_KEY}`;

        const leadsPayload = {
            lead_list: campaignPayload.leads,
            settings: {
                ignore_global_block_list: true,
                ignore_unsubscribe_list: true,
                ignore_duplicate_leads_in_other_campaign: false,
            },
        };

        const addLeadsResponse = await axios.post(addLeadsUrl, leadsPayload, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        console.log('Leads added to campaign:', addLeadsResponse.data);

        // res.json({
        //     message: `Campaign created with ID ${campaignId} and leads added successfully.`,
        // });

        //successMessage.value = response.data.message;
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
