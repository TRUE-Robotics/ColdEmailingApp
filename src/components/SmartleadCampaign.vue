<template>
  <div>
    <!-- Log Message-->
    <div v-if="logMessage">{{ logMessage }}</div>

    <!-- Button to create campaign and import leads -->
    <button v-if="!campaignCreated" @click="createCampaign">
      Create New Campaign and Import Leads
    </button>

    <!-- Button to update leads if the campaign is already created -->
    <button v-if="campaignCreated" @click="updateLeads">
      Update/Add Leads (Fetch Excel File Again)
    </button>

    <!-- Pause/Unpause Buttons -->
    <div v-if="campaignCreated" class="pause-unpause-buttons">
      <button @click="pauseCampaign">Pause Campaign</button>
      <button @click="unpauseCampaign">Unpause Campaign</button>
    </div>

  </div>
</template>

<script>
import { ref } from 'vue';
import { createCampaign, addLeadsToCampaign, updateCampaignStatus, delay } from '@/utils/smartleadService';

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
    const logMessage = ref('');
    const campaignCreated = ref(false);
    const campaignId = ref(null);

    const createCampaignHandler = async () => {
      try {
        if (!props.campaignData || props.campaignData.length === 0) {
          logMessage.value = 'No data available to create campaign.';
          return;
        }

        // Prepare the payload for the campaign creation
        const campaignPayload = {
          name: 'Cold Email Campaign',
          client_id: props.clientId,
        };

        // Call the service to create the campaign
        const campaignResponse = await createCampaign(campaignPayload);
        campaignId.value = campaignResponse.id;

        console.log(`Campaign created with ID: ${campaignId.value}`);

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
        const addLeadsResponse = await addLeadsToCampaign(campaignId.value, leadsPayload);

        console.log('Leads added to campaign:', addLeadsResponse);

        logMessage.value = `Campaign created with ID ${campaignId.value} and leads added successfully.`;
        campaignCreated.value = true;
      } catch (error) {
        console.error('Error creating campaign or adding leads:', error);
        logMessage.value = error.response?.data?.error || 'Error creating campaign. Please try again.';
      }
    };

    const updateLeads = async () => {
      try {
        if (!campaignId.value) {
          logMessage.value = 'No campaign ID available. Please create a campaign first.';
          return;
        }

        // Prepare the payload for adding updated leads
        const updatedLeadsPayload = {
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

        // Call the service to update leads for the existing campaign
        const updateLeadsResponse = await addLeadsToCampaign(campaignId.value, updatedLeadsPayload);

        console.log('Leads updated in campaign:', updateLeadsResponse);

        logMessage.value = `Leads successfully updated for campaign ID ${campaignId.value}.`;
      } catch (error) {
        console.error('Error updating leads:', error);
        logMessage.value = error.response?.data?.error || 'Error updating leads. Please try again.';
      }
    };

    const pauseCampaign = async () => {
      try {
        if (!campaignId.value) {
          logMessage.value = 'No campaign ID available. Please create a campaign first.';
          return;
        }

        // Call the service to pause the campaign
        await updateCampaignStatus(campaignId.value, 'PAUSED');

        logMessage.value = `Campaign ID ${campaignId.value} has been paused.`;
      } catch (error) {
        console.error('Error pausing campaign:', error);
        logMessage.value = error.response?.data?.error || 'Error pausing campaign. Please try again.';
      }
    };

    const unpauseCampaign = async () => {
      try {
        if (!campaignId.value) {
          logMessage.value = 'No campaign ID available. Please create a campaign first.';
          return;
        }

        // Call the service to unpause the campaign with a cron schedule
        await updateCampaignStatus(campaignId.value, 'START');

        logMessage.value = `Campaign ID ${campaignId.value} has been unpaused and scheduled.`;
      } catch (error) {
        console.error('Error unpausing campaign:', error);
        logMessage.value = error.response?.data?.error || 'Error unpausing campaign. Please try again.';
      }
    };


    return {
      createCampaign: createCampaignHandler,
      updateLeads,
      pauseCampaign,
      unpauseCampaign,
      logMessage,
      campaignCreated,
    };
  },
};
</script>

<style scoped>
.pause-unpause-buttons {
  display: flex;
  gap: 10px;
}

</style>
