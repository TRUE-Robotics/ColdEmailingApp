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
import { ref } from 'vue';
import { createCampaign, addLeadsToCampaign, delay } from '@/utils/smartleadService';

export default {
  name: 'SmartleadCampaign',
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
    const successMessage = ref('');
    const errorMessage = ref('');
    const campaignCreated = ref(false);

    const createCampaignHandler = async () => {
      try {
        if (!props.campaignData || props.campaignData.length === 0) {
          errorMessage.value = 'No data available to create campaign.';
          return;
        }

        // Prepare the payload for the campaign creation
        const campaignPayload = {
          name: 'Cold Email Campaign',
          client_id: props.clientId,
        };

        // Call the service to create the campaign
        const campaignResponse = await createCampaign(campaignPayload);
        const campaignId = campaignResponse.id;

        console.log(`Campaign created with ID: ${campaignId}`);

        // Prepare the payload for adding leads
        const leadsPayload = {
          lead_list: props.campaignData.map((row) => ({
            first_name: row.Name,
            last_name: row.LastName || '',
            email: row.Email,
            custom_fields: {},
          })),
          settings: {
            ignore_global_block_list: true,
            ignore_unsubscribe_list: true,
            ignore_duplicate_leads_in_other_campaign: false,
          },
        };

        // Optional delay before adding leads
        await delay(2000);

        // Call the service to add leads
        const addLeadsResponse = await addLeadsToCampaign(campaignId, leadsPayload);

        console.log('Leads added to campaign:', addLeadsResponse);

        successMessage.value = `Campaign created with ID ${campaignId} and leads added successfully.`;
        campaignCreated.value = true;
      } catch (error) {
        console.error('Error creating campaign or adding leads:', error);
        errorMessage.value = error.response?.data?.error || 'Error creating campaign. Please try again.';
      }
    };

    return {
      createCampaign: createCampaignHandler,
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
