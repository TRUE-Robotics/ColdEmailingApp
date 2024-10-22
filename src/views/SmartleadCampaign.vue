<template>
  <v-container>
    <!-- Logger -->
    <LoggerControls :logMessage="logMessage" />

    <!-- Campaign Form -->
    <CampaignForm
      v-if="!campaignCreated"
      :campaignCreated="campaignCreated"
      :campaigns="campaigns"
      :campaignName="campaignName"
      @useExistingCampaign="useExistingCampaign"
      @createCampaign="createCampaign"
    />

    <!-- Lead Controls -->
    <LeadControls
      v-if="campaignCreated"
      :emailToPause="emailToPause"
      @updateLeads="updateLeads"
      @pauseAllLeads="pauseAllLeads"
      @resumeAllLeads="resumeAllLeads"
      @pauseLeadByEmail="pauseLeadByEmail"
    />

    <!-- Campaign Controls -->
    <CampaignControls
      v-if="campaignCreated"
      @pauseCampaign="pauseCampaign"
      @resumeCampaign="resumeCampaign"
    />

    <!-- Sequence Controls -->
    <SequenceControls
      v-if="campaignCreated"
      :sequences="sequences"
      @addSequence="addSequence"
      @saveSequences="saveSequences"
    />

    <!-- Schedule Controls -->
    <ScheduleControls
      v-if="campaignCreated"
      :schedule="schedule"
      @updateSchedule="updateSchedule"
    />
  </v-container>
</template>

<script>
import LoggerControls from "@/components/LoggerControls.vue";
import CampaignForm from "@/components/CampaignForm.vue";
import LeadControls from "@/components/LeadControls.vue";
import CampaignControls from "@/components/CampaignControls.vue";
import SequenceControls from "@/components/SequenceControls.vue";
import ScheduleControls from "@/components/ScheduleControls.vue";
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
  getCampaigns,
} from "@/utils/smartleadService";

export default {
  components: {
    LoggerControls,
    CampaignForm,
    LeadControls,
    CampaignControls,
    SequenceControls,
    ScheduleControls,
  },
  data() {
    return {
      logMessage: "Welcome to the campaign!",
      campaignCreated: false,
      campaignName: "",
      emailToPause: "",
      campaignId: "", // Define the campaignId correctly
      sequences: [
        {
          seq_number: 1,
          seq_delay_details: { delay_in_days: 1 },
          subject: "",
          email_body: "",
        },
      ],
      schedule: {
        timezone: "America/Detroit",
        days_of_the_week: [1, 2, 3],
        start_hour: "09:00",
        end_hour: "18:00",
        min_time_btw_emails: 10,
        max_new_leads_per_day: 20,
        schedule_start_time: new Date().toISOString().slice(0, 16),
      },
      campaigns: [], // List to store campaigns
    };
  },
  mounted() {
    this.fetchCampaigns(); // Fetch campaigns when component is mounted
  },
  methods: {
    async fetchCampaigns() {
      try {
        const campaignData = await getCampaigns(); // Fetch the campaigns
        // Map the campaigns to ensure each has 'id' and 'name' properties
        this.campaigns = campaignData.map((campaign) => ({
          id: campaign.id,
          name: campaign.name,
        }));
        this.logMessage = "Campaigns loaded successfully!";
      } catch (error) {
        this.logMessage = "Failed to load campaigns.";
        console.error(error);
      }
    },
    async useExistingCampaign(campaignId) {
      if (!campaignId) {
        this.logMessage = "Please select a valid Campaign ID.";
        return;
      }

      try {
        const sequence = await fetchCampaignSequence(campaignId);

        if (sequence) {
          this.campaignCreated = true;
          this.campaignId = campaignId;
          this.logMessage = `Using existing campaign with ID ${campaignId}-${this.campaignName}.`;
        } else {
          throw new Error("Invalid Campaign ID");
        }
      } catch (error) {
        this.logMessage = "Invalid Campaign ID. Please try again.";
        this.campaignCreated = false;
      }
    },
    async createCampaign() {
      try {
        if (!this.campaignData || this.campaignData.length === 0) {
          this.logMessage = "No data available to create campaign.";
          return;
        }

        // Prepare the payload for the campaign creation
        const campaignPayload = {
          name: this.campaignName || "Cold Email Campaign",
          client_id: this.clientId, // assuming clientId is a prop or data
        };

        // Call the service to create the campaign
        const campaignResponse = await createCampaign(campaignPayload);
        this.campaignId = campaignResponse.id;

        console.log(`Campaign created with ID: ${this.campaignId}`);

        // Prepare the payload for adding leads
        const leadsPayload = {
          lead_list: this.campaignData.map((row) => ({
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
          this.campaignId,
          leadsPayload
        );

        console.log("Leads added to campaign:", addLeadsResponse);

        this.logMessage = `Campaign created with ID ${this.campaignId} and leads added successfully.`;
        this.campaignCreated = true;
        this.$emit("campaignCreated", this.campaignId);
      } catch (error) {
        console.error("Error creating campaign or adding leads:", error);
        this.logMessage =
          error.response?.data?.error ||
          "Error creating campaign. Please try again.";
      }
    },
    async updateLeads() {
      try {
        if (!this.campaignId) {
          this.logMessage =
            "No campaign ID available. Please create a campaign first.";
          return;
        }

        // Prepare the payload for adding updated leads
        const updatedLeadsPayload = {
          lead_list: this.campaignData.map((row) => ({
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
          this.campaignId,
          updatedLeadsPayload
        );

        console.log("Leads updated in campaign:", updateLeadsResponse);

        this.logMessage = `Leads successfully updated for campaign ID ${this.campaignId}.`;
      } catch (error) {
        console.error("Error updating leads:", error);
        this.logMessage =
          error.response?.data?.error ||
          "Error updating leads. Please try again.";
      }
    },
    async pauseAllLeads() {
      try {
        if (!this.campaignId) {
          this.logMessage =
            "No campaign ID available. Please create a campaign first.";
          return;
        }

        const leads = await listAllLeads(this.campaignId);

        if (leads.total_leads == 0) {
          this.logMessage = "No leads available in the campaign.";
          return;
        }

        // Step 2: Iterate over each lead and pause them
        for (const leadInfo of leads.data) {
          await pauseLead(this.campaignId, leadInfo.lead.id);
        }

        this.logMessage = `All ${leads.total_leads} leads have been paused.`;
      } catch (error) {
        console.error("Error pausing all leads:", error);
        this.logMessage =
          error.response?.data?.error ||
          "Error pausing all leads. Please try again.";
      }
    },
    async resumeAllLeads() {
      try {
        if (!this.campaignId) {
          this.logMessage =
            "No campaign ID available. Please create a campaign first.";
          return;
        }

        const leads = await listAllLeads(this.campaignId);

        if (!Array.isArray(leads.data) || leads.total_leads === 0) {
          this.logMessage = "No leads available in the campaign.";
          return;
        }

        // Step 2: Iterate over each lead and resume them using resumeLead
        for (const leadInfo of leads.data) {
          await resumeLead(this.campaignId, leadInfo.lead.id);
        }

        this.logMessage = `All ${leads.total_leads} leads have been resumed.`;
      } catch (error) {
        console.error("Error resuming all leads:", error);
        this.logMessage =
          error.response?.data?.error ||
          "Error resuming all leads. Please try again.";
      }
    },
    async pauseLeadByEmail() {
      try {
        if (!this.campaignId) {
          this.logMessage =
            "No campaign ID available. Please create a campaign first.";
          return;
        }

        if (!this.emailToPause) {
          this.logMessage = "Please enter a valid email address.";
          return;
        }

        const leads = await listAllLeads(this.campaignId);

        const lead = leads.data.find(
          (leadInfo) => leadInfo.lead.email === this.emailToPause
        );

        if (!lead) {
          this.logMessage = `Lead with email ${this.emailToPause} not found.`;
          return;
        }

        await pauseLead(this.campaignId, lead.lead.id);

        this.logMessage = `Lead with email ${this.emailToPause} has been paused successfully.`;
      } catch (error) {
        console.error("Error pausing lead:", error);
        this.logMessage =
          error.response?.data?.error ||
          "Error pausing lead. Please try again.";
      }
    },
    async pauseCampaign() {
      try {
        if (!this.campaignId) {
          this.logMessage =
            "No campaign ID available. Please create a campaign first.";
          return;
        }

        await updateCampaignStatus(this.campaignId, "PAUSED");

        this.logMessage = `Campaign ID ${this.campaignId} has been paused.`;
      } catch (error) {
        console.error("Error pausing campaign:", error);
        this.logMessage =
          error.response?.data?.error ||
          "Error pausing campaign. Please try again.";
      }
    },
    async resumeCampaign() {
      try {
        if (!this.campaignId) {
          this.logMessage =
            "No campaign ID available. Please create a campaign first.";
          return;
        }

        await updateCampaignStatus(this.campaignId, "START");

        this.logMessage = `Campaign ID ${this.campaignId} has been resumed and scheduled.`;
      } catch (error) {
        console.error("Error resuming campaign:", error);
        this.logMessage =
          error.response?.data?.error ||
          "Error resuming campaign. Please try again.";
      }
    },
    addSequence() {
      this.sequences.push({
        seq_number: this.sequences.length + 1,
        seq_delay_details: { delay_in_days: 1 },
        subject: "",
        email_body: "",
      });
    },
    async saveSequences() {
      try {
        const sequencePayload = { sequences: this.sequences };
        await saveCampaignSequence(this.campaignId, sequencePayload);
        this.logMessage = "Sequences saved successfully.";
      } catch (error) {
        this.logMessage =
          error.response?.data?.error || "Error saving sequences.";
      }
    },
    async updateSchedule() {
      try {
        const schedulePayload = { ...this.schedule };
        await updateCampaignSchedule(this.campaignId, schedulePayload);
        this.logMessage = "Schedule updated successfully!";
      } catch (error) {
        this.logMessage =
          error.response?.data?.error || "Error updating schedule.";
      }
    },
  },
};
</script>
