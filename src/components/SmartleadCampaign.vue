<template>
  <div>
    <!-- Log Message-->
    <h3>Logger</h3>
    <div v-if="logMessage">{{ logMessage }}</div>

    <!-- Input for existing campaign ID -->
    <h3 v-if="!campaignCreated">Use Existing Campaign</h3>
    <div v-if="!campaignCreated">
      <input
        type="number"
        v-model="existingCampaignId"
        placeholder="Enter Campaign ID"
      />
      <button @click="useExistingCampaign">Use Existing Campaign</button>
    </div>

    <!-- Input for campaign name if creating a new campaign -->
    <h3 v-if="!campaignCreated">Create Campaign</h3>
    <div v-if="!campaignCreated && !existingCampaignId">
      <label for="campaignName">New Campaign Name:</label>
      <input
        type="text"
        v-model="campaignName"
        placeholder="Enter Campaign Name"
      />
    </div>

    <!-- Button to create campaign and import leads -->
    <button v-if="!campaignCreated" @click="createCampaign">
      Create New Campaign and Import Leads
    </button>

    <!-- Button to update leads if the campaign is already created -->

    <h3 v-if="campaignCreated">Add Leads</h3>
    <button v-if="campaignCreated" @click="updateLeads">
      Import/Add Leads (Fetch Excel File Again First)
    </button>

    <!-- Pause/Resume Buttons for Campaign -->
    <h3 v-if="campaignCreated">Pause/Unpause Campaign</h3>
    <div v-if="campaignCreated" class="campaign-pause-resume-buttons">
      <button @click="pauseCampaign">Pause Campaign</button>
      <button @click="resumeCampaign">Resume Campaign</button>
    </div>

    <!-- Pause/Resume Buttons for Leads -->
    <h3 v-if="campaignCreated">Pause/Unpause All Leads</h3>
    <div v-if="campaignCreated" class="leads-pause-unpause-buttons">
      <button @click="pauseAllLeads">Pause All Leads</button>
      <button @click="resumeAllLeads">Resume All Leads</button>
    </div>

    <!-- Pause Specific Lead by Email -->
    <h3 v-if="campaignCreated">Pause Lead by Email</h3>
    <div v-if="campaignCreated">
      <input
        type="email"
        id="emailToPause"
        v-model="emailToPause"
        placeholder="Enter email for lead to pause"
      />
      <button @click="pauseLeadByEmail">Pause Lead by Email</button>
    </div>

    <!-- Sequence Input Fields -->
    <div v-if="campaignCreated">
      <h3>Add Sequence</h3>
      <div v-for="(sequence, index) in sequences" :key="index">
        <label>Sequence Number:</label>
        <input type="number" v-model="sequence.seq_number" />

        <label>Delay (in days):</label>
        <input
          type="number"
          v-model="sequence.seq_delay_details.delay_in_days"
        />

        <label>Subject:</label>
        <input type="text" v-model="sequence.subject" />

        <label>Email Body:</label>
        <textarea v-model="sequence.email_body"></textarea>
      </div>
      <button @click="addSequence">Add Another Sequence</button>
      <button @click="saveSequences">Save Sequences</button>
    </div>

    <!-- Update Campaign Schedule Section -->
    <div v-if="campaignCreated">
      <h3>Update Campaign Schedule</h3>

      <!-- Form to update schedule -->
      <label>Timezone:</label>
      <input
        type="text"
        v-model="schedule.timezone"
        placeholder="America/Los_Angeles"
      />

      <label>Days of the Week (0-6, Sunday-Saturday):</label>
      <input
        type="text"
        v-model="schedule.days_of_the_week"
        placeholder="1,2,3"
      />

      <label>Start Hour:</label>
      <input type="time" v-model="schedule.start_hour" placeholder="09:00" />

      <label>End Hour:</label>
      <input type="time" v-model="schedule.end_hour" placeholder="18:00" />

      <label>Min Time Between Emails (in minutes):</label>
      <input type="number" v-model="schedule.min_time_btw_emails" />

      <label>Max New Leads Per Day:</label>
      <input type="number" v-model="schedule.max_new_leads_per_day" />

      <label>Schedule Start Time:</label>
      <input type="datetime-local" v-model="schedule.schedule_start_time" />

      <button @click="updateSchedule">Update Schedule</button>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import {
  createCampaign,
  addLeadsToCampaign,
  updateCampaignStatus,
  listAllLeads,
  pauseLead,
  resumeLead,
  saveCampaignSequence,
  updateCampaignSchedule,
  fetchCampaignSequence,
  delay,
} from "@/utils/smartleadService";

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
  emits: ["campaignCreated"],
  setup(props, { emit }) {
    const logMessage = ref("Hello!");
    const campaignCreated = ref(false);
    const campaignId = ref(null);
    const existingCampaignId = ref("");
    const campaignName = ref("");
    const emailToPause = ref("");
    const sequences = ref([
      {
        seq_number: 1,
        seq_delay_details: { delay_in_days: 1 },
        subject: "",
        email_body: "",
      },
    ]);
    const schedule = ref({
      timezone: "America/Detroit",
      days_of_the_week: [1, 2, 3],
      start_hour: "09:00",
      end_hour: "18:00",
      min_time_btw_emails: 10,
      max_new_leads_per_day: 20,
      schedule_start_time: new Date().toISOString().slice(0, 16),
    });

    const useExistingCampaign = async () => {
      if (!existingCampaignId.value) {
        logMessage.value = "Please enter a valid Campaign ID.";
        return;
      }

      try {
        // Call the fetchCampaignSequence API to check if the campaign ID is valid
        const sequence = await fetchCampaignSequence(existingCampaignId.value);

        // If the API call succeeds and sequence data is returned, the campaign ID is valid
        if (sequence) {
          campaignId.value = existingCampaignId.value;
          campaignCreated.value = true;
          logMessage.value = `Using existing campaign with ID ${campaignId.value}.`;
          emit("campaignCreated", campaignId.value);
        } else {
          throw new Error("Invalid Campaign ID");
        }
      } catch (error) {
        // Handle invalid campaign ID or errors during the check
        logMessage.value = "Invalid Campaign ID. Please try again.";
        campaignId.value = null;
        campaignCreated.value = false;
      }
    };

    const createCampaignHandler = async () => {
      try {
        if (!props.campaignData || props.campaignData.length === 0) {
          logMessage.value = "No data available to create campaign.";
          return;
        }

        // Prepare the payload for the campaign creation
        const campaignPayload = {
          name: campaignName.value || "Cold Email Campaign",
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
            last_name: row.LastName || "",
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
        const addLeadsResponse = await addLeadsToCampaign(
          campaignId.value,
          leadsPayload
        );

        console.log("Leads added to campaign:", addLeadsResponse);

        logMessage.value = `Campaign created with ID ${campaignId.value} and leads added successfully.`;
        campaignCreated.value = true;
        emit("campaignCreated", campaignId.value);
      } catch (error) {
        console.error("Error creating campaign or adding leads:", error);
        logMessage.value =
          error.response?.data?.error ||
          "Error creating campaign. Please try again.";
      }
    };

    const updateLeads = async () => {
      try {
        if (!campaignId.value) {
          logMessage.value =
            "No campaign ID available. Please create a campaign first.";
          return;
        }

        // Prepare the payload for adding updated leads
        const updatedLeadsPayload = {
          lead_list: props.campaignData.map((row) => ({
            first_name: row.Name,
            last_name: row.LastName || "",
            email: row.Email,
            company_name: row.School,
            custom_fields: {
              Name: row.Name,
              Position: row.Position,
              State: row.State,
              Owner: row.Owner,
            },
          })),
          settings: {
            ignore_global_block_list: true,
            ignore_unsubscribe_list: true,
            ignore_duplicate_leads_in_other_campaign: false,
          },
        };

        // Call the service to update leads for the existing campaign
        const updateLeadsResponse = await addLeadsToCampaign(
          campaignId.value,
          updatedLeadsPayload
        );

        console.log("Leads updated in campaign:", updateLeadsResponse);

        logMessage.value = `Leads successfully updated for campaign ID ${campaignId.value}.`;
      } catch (error) {
        console.error("Error updating leads:", error);
        logMessage.value =
          error.response?.data?.error ||
          "Error updating leads. Please try again.";
      }
    };

    const pauseCampaign = async () => {
      try {
        if (!campaignId.value) {
          logMessage.value =
            "No campaign ID available. Please create a campaign first.";
          return;
        }

        // Call the service to pause the campaign
        await updateCampaignStatus(campaignId.value, "PAUSED");

        logMessage.value = `Campaign ID ${campaignId.value} has been paused.`;
      } catch (error) {
        console.error("Error pausing campaign:", error);
        logMessage.value =
          error.response?.data?.error ||
          "Error pausing campaign. Please try again.";
      }
    };

    const resumeCampaign = async () => {
      try {
        if (!campaignId.value) {
          logMessage.value =
            "No campaign ID available. Please create a campaign first.";
          return;
        }

        // Call the service to resume the campaign
        await updateCampaignStatus(campaignId.value, "START");

        logMessage.value = `Campaign ID ${campaignId.value} has been resumed and scheduled.`;
      } catch (error) {
        console.error("Error resuming campaign:", error);
        logMessage.value =
          error.response?.data?.error ||
          "Error resuming campaign. Please try again.";
      }
    };

    const pauseAllLeads = async () => {
      try {
        if (!campaignId.value) {
          logMessage.value =
            "No campaign ID available. Please create a campaign first.";
          return;
        }

        // Step 1: Get all leads from the campaign using the listAllLeads API
        const leads = await listAllLeads(campaignId.value);

        if (leads.total_leads == 0) {
          logMessage.value = "No leads available in the campaign.";
          return;
        }

        // Step 2: Iterate over each lead and pause them
        for (const leadInfo of leads.data) {
          await pauseLead(campaignId.value, leadInfo.lead.id);
        }

        logMessage.value = `All ${leads.total_leads} leads have been paused.`;
      } catch (error) {
        console.error("Error pausing all leads:", error);
        logMessage.value =
          error.response?.data?.error ||
          "Error pausing all leads. Please try again.";
      }
    };

    const resumeAllLeads = async () => {
      try {
        if (!campaignId.value) {
          logMessage.value =
            "No campaign ID available. Please create a campaign first.";
          return;
        }

        // Step 1: Get all leads from the campaign using listAllLeads API
        const leads = await listAllLeads(campaignId.value);

        if (!Array.isArray(leads.data) || leads.total_leads === 0) {
          logMessage.value = "No leads available in the campaign.";
          return;
        }

        // Step 2: Iterate over each lead and resume them using resumeLead
        for (const leadInfo of leads.data) {
          await resumeLead(campaignId.value, leadInfo.lead.id);
        }

        logMessage.value = `All ${leads.total_leads} leads have been resumed.`;
      } catch (error) {
        console.error("Error resuming all leads:", error);
        logMessage.value =
          error.response?.data?.error ||
          "Error resuming all leads. Please try again.";
      }
    };

    const pauseLeadByEmail = async () => {
      try {
        if (!campaignId.value) {
          logMessage.value =
            "No campaign ID available. Please create a campaign first.";
          return;
        }

        if (!emailToPause.value) {
          logMessage.value = "Please enter a valid email address.";
          return;
        }

        // Step 1: Fetch all leads in the campaign
        const leads = await listAllLeads(campaignId.value);

        // Step 2: Find the lead with the specified email
        const lead = leads.data.find(
          (leadInfo) => leadInfo.lead.email === emailToPause.value
        );

        if (!lead) {
          logMessage.value = `Lead with email ${emailToPause.value} not found.`;
          return;
        }

        // Step 3: Pause the lead using their ID
        await pauseLead(campaignId.value, lead.lead.id);

        logMessage.value = `Lead with email ${emailToPause.value} has been paused successfully.`;
      } catch (error) {
        console.error("Error pausing lead:", error);
        logMessage.value =
          error.response?.data?.error ||
          "Error pausing lead. Please try again.";
      }
    };

    const addSequence = () => {
      sequences.value.push({
        seq_number: sequences.value.length + 1,
        seq_delay_details: { delay_in_days: 1 },
        subject: "",
        email_body: "",
      });
    };

    const saveSequences = async () => {
      try {
        const sequencePayload = { sequences: sequences.value };
        await saveCampaignSequence(campaignId.value, sequencePayload);
        logMessage.value = "Sequences saved successfully.";
      } catch (error) {
        logMessage.value =
          error.response?.data?.error || "Error saving sequences.";
      }
    };

    const updateSchedule = async () => {
      try {
        const schedulePayload = { ...schedule.value };
        await updateCampaignSchedule(campaignId.value, schedulePayload);
        logMessage.value = "Schedule updated successfully!";
      } catch (error) {
        logMessage.value =
          error.response?.data?.error || "Error updating schedule.";
      }
    };

    return {
      createCampaign: createCampaignHandler,
      useExistingCampaign,
      updateLeads,
      pauseCampaign,
      resumeCampaign,
      pauseAllLeads,
      resumeAllLeads,
      pauseLeadByEmail,
      emailToPause,
      sequences,
      addSequence,
      saveSequences,
      schedule,
      updateSchedule,
      logMessage,
      campaignCreated,
      existingCampaignId,
      campaignName,
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
