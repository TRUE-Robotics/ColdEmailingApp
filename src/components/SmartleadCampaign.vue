<template>
  <v-container>
    <!-- Log Message-->
    <v-row>
      <v-col>
        <h3>Logger</h3>
        <v-alert v-if="logMessage" type="info">{{ logMessage }}</v-alert>
      </v-col>
    </v-row>

    <!-- Input for existing campaign ID -->
    <v-row v-if="!campaignCreated">
      <v-col cols="12">
        <h3>Use Existing Campaign</h3>
        <v-text-field
          v-model="existingCampaignId"
          label="Enter Campaign ID"
          type="number"
        ></v-text-field>
        <v-btn @click="useExistingCampaign" color="primary">
          Use Existing Campaign
        </v-btn>
      </v-col>
    </v-row>

    <!-- Input for campaign name if creating a new campaign -->
    <v-row v-if="!campaignCreated && !existingCampaignId">
      <v-col cols="12">
        <h3>Create Campaign</h3>
        <v-text-field
          v-model="campaignName"
          label="New Campaign Name"
          placeholder="Enter Campaign Name"
        ></v-text-field>
      </v-col>
    </v-row>

    <!-- Button to create campaign and import leads -->
    <v-row v-if="!campaignCreated">
      <v-col>
        <v-btn @click="createCampaign" color="success">
          Create New Campaign and Import Leads
        </v-btn>
      </v-col>
    </v-row>

    <!-- Button to update leads if the campaign is already created -->
    <v-row v-if="campaignCreated">
      <v-col>
        <h3>Add Leads</h3>
        <v-btn @click="updateLeads" color="primary">
          Import/Add Leads (Fetch Excel File Again First)
        </v-btn>
      </v-col>
    </v-row>

    <!-- Pause/Resume Buttons for Campaign -->
    <v-row v-if="campaignCreated">
      <v-col>
        <h3>Pause/Unpause Campaign</h3>
        <v-btn @click="pauseCampaign" color="warning">Pause Campaign</v-btn>
        <v-btn @click="resumeCampaign" color="success">Resume Campaign</v-btn>
      </v-col>
    </v-row>

    <!-- Pause/Resume Buttons for Leads -->
    <v-row v-if="campaignCreated">
      <v-col>
        <h3>Pause/Unpause All Leads</h3>
        <v-btn @click="pauseAllLeads" color="warning">Pause All Leads</v-btn>
        <v-btn @click="resumeAllLeads" color="success">Resume All Leads</v-btn>
      </v-col>
    </v-row>

    <!-- Pause Specific Lead by Email -->
    <v-row v-if="campaignCreated">
      <v-col cols="12">
        <h3>Pause Lead by Email</h3>
        <v-text-field
          v-model="emailToPause"
          label="Enter Email for Lead to Pause"
          type="email"
        ></v-text-field>
        <v-btn @click="pauseLeadByEmail" color="warning">
          Pause Lead by Email
        </v-btn>
      </v-col>
    </v-row>

    <!-- Sequence Input Fields -->
    <!-- <v-row v-if="campaignCreated">
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
    </v-row> -->

    <!-- Update Campaign Schedule Section -->
    <!-- <v-row v-if="campaignCreated">
      <v-col cols="12">
        <h3>Update Campaign Schedule</h3>
        <v-text-field
          v-model="schedule.timezone"
          label="Timezone"
          placeholder="America/Los_Angeles"
        ></v-text-field>
        <v-text-field
          v-model="schedule.days_of_the_week"
          label="Days of the Week (0-6, Sunday-Saturday)"
          placeholder="1,2,3"
        ></v-text-field>
        <v-text-field
          v-model="schedule.start_hour"
          label="Start Hour"
          type="time"
        ></v-text-field>
        <v-text-field
          v-model="schedule.end_hour"
          label="End Hour"
          type="time"
        ></v-text-field>
        <v-text-field
          v-model="schedule.min_time_btw_emails"
          label="Min Time Between Emails (in minutes)"
          type="number"
        ></v-text-field>
        <v-text-field
          v-model="schedule.max_new_leads_per_day"
          label="Max New Leads Per Day"
          type="number"
        ></v-text-field>
        <v-text-field
          v-model="schedule.schedule_start_time"
          label="Schedule Start Time"
          type="datetime-local"
        ></v-text-field>
        <v-btn @click="updateSchedule" color="primary">Update Schedule</v-btn>
      </v-col>
    </v-row> -->
  </v-container>
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
  // getCampaigns,
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
    const existingCampaignId = ref("751191");
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
