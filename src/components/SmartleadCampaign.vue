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
      Import/Add Leads (Fetch Excel File Again First)
    </button>

    <!-- Pause/Resume Buttons for Campaign -->
    <div v-if="campaignCreated" class="campaign-pause-resume-buttons">
      <button @click="pauseCampaign">Pause Campaign</button>
      <button @click="resumeCampaign">Resume Campaign</button>
    </div>

    <!-- Pause/Resume Buttons for Leads -->
    <div v-if="campaignCreated" class="leads-pause-unpause-buttons">
      <button @click="pauseAllLeads">Pause All Leads</button>
      <button @click="resumeAllLeads">Resume All Leads</button>
    </div>

    <!-- Pause Specific Lead by Email -->
    <div v-if="campaignCreated">
      <input type="email" id="emailToPause" v-model="emailToPause" placeholder="Enter email for lead to pause" />
      <button @click="pauseLeadByEmail">Pause Lead by Email</button>
    </div>

  </div>
</template>

<script>
import { ref } from 'vue';
import { createCampaign, addLeadsToCampaign, updateCampaignStatus, listAllLeads, pauseLead, resumeLead, delay } from '@/utils/smartleadService';

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
    const emailToPause = ref('');

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

    const resumeCampaign = async () => {
      try {
        if (!campaignId.value) {
          logMessage.value = 'No campaign ID available. Please create a campaign first.';
          return;
        }

        // Call the service to resume the campaign
        await updateCampaignStatus(campaignId.value, 'START');

        logMessage.value = `Campaign ID ${campaignId.value} has been resumed and scheduled.`;
      } catch (error) {
        console.error('Error resuming campaign:', error);
        logMessage.value = error.response?.data?.error || 'Error resuming campaign. Please try again.';
      }
    };

    const pauseAllLeads = async () => {
      try {
        if (!campaignId.value) {
          logMessage.value = 'No campaign ID available. Please create a campaign first.';
          return;
        }

        // Step 1: Get all leads from the campaign using the listAllLeads API
        const leads = await listAllLeads(campaignId.value);

        if (leads.total_leads == 0) {
          logMessage.value = 'No leads available in the campaign.';
          return;
        }

        // Step 2: Iterate over each lead and pause them
        for (const leadInfo of leads.data) {
          await pauseLead(campaignId.value, leadInfo.lead.id);
        }

        logMessage.value = `All ${leads.total_leads} leads have been paused.`;
      } catch (error) {
        console.error('Error pausing all leads:', error);
        logMessage.value = error.response?.data?.error || 'Error pausing all leads. Please try again.';
      }
    };

    const resumeAllLeads = async () => {
      try {
        if (!campaignId.value) {
          logMessage.value = 'No campaign ID available. Please create a campaign first.';
          return;
        }

        // Step 1: Get all leads from the campaign using listAllLeads API
        const leads = await listAllLeads(campaignId.value);

        if (!Array.isArray(leads.data) || leads.total_leads === 0) {
          logMessage.value = 'No leads available in the campaign.';
          return;
        }

        // Step 2: Iterate over each lead and resume them using resumeLead
        for (const leadInfo of leads.data) {
          await resumeLead(campaignId.value, leadInfo.lead.id);
        }

        logMessage.value = `All ${leads.total_leads} leads have been resumed.`;
      } catch (error) {
        console.error('Error resuming all leads:', error);
        logMessage.value = error.response?.data?.error || 'Error resuming all leads. Please try again.';
      }
    };

    const pauseLeadByEmail = async () => {
      try {
        if (!campaignId.value) {
          logMessage.value = 'No campaign ID available. Please create a campaign first.';
          return;
        }

        if (!emailToPause.value) {
          logMessage.value = 'Please enter a valid email address.';
          return;
        }

        // Step 1: Fetch all leads in the campaign
        const leads = await listAllLeads(campaignId.value);

        // Step 2: Find the lead with the specified email
        const lead = leads.data.find((leadInfo) => leadInfo.lead.email === emailToPause.value);

        if (!lead) {
          logMessage.value = `Lead with email ${emailToPause.value} not found.`;
          return;
        }

        // Step 3: Pause the lead using their ID
        await pauseLead(campaignId.value, lead.lead.id);
        
        logMessage.value = `Lead with email ${emailToPause.value} has been paused successfully.`;
      } catch (error) {
        console.error('Error pausing lead:', error);
        logMessage.value = error.response?.data?.error || 'Error pausing lead. Please try again.';
      }
    };

    return {
      createCampaign: createCampaignHandler,
      updateLeads,
      pauseCampaign,
      resumeCampaign,
      pauseAllLeads,
      resumeAllLeads,
      pauseLeadByEmail,
      emailToPause,
      logMessage,
      campaignCreated,
    };
  },
};
</script>

<style scoped>
.campaign-pause-unpause-buttons {
  display: flex;
  gap: 10px;
}

.leads-pause-unpause-buttons {
  display: flex;
  gap: 10px;
}
</style>
