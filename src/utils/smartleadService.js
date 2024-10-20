import axios from 'axios';

// SmartLead API Key
const SMARTLEAD_API_KEY = process.env.VUE_APP_SMARTLEAD_API_KEY;

// Utility function to simulate a delay
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Default event types to return all possible event types
const WEBHOOK_EVENT_TYPE = {
  EMAIL_SENT: 'EMAIL_SENT',
  EMAIL_OPEN: 'EMAIL_OPEN',
  EMAIL_LINK_CLICK: 'EMAIL_LINK_CLICK',
  EMAIL_REPLY: 'EMAIL_REPLY',
  LEAD_UNSUBSCRIBED: 'LEAD_UNSUBSCRIBED',
  LEAD_CATEGORY_UPDATED: 'LEAD_CATEGORY_UPDATED'
};

/**
 * Creates a campaign.
 * @param {Object} payload - The campaign payload.
 * @returns {Promise} - The result of the campaign creation.
 */
export const createCampaign = async (payload) => {
  try {
    const createCampaignUrl = `https://server.smartlead.ai/api/v1/campaigns/create?api_key=${SMARTLEAD_API_KEY}`;
    const response = await axios.post(createCampaignUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating campaign:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Fetches the campaign sequences for a given campaign ID.
 * @param {number|string} campaignId - The campaign ID to fetch sequences for.
 * @returns {Promise<Object>} - A promise that resolves to the campaign sequence data.
 * @throws {Error} - Throws an error if the campaign ID is invalid or the API request fails.
 */
export const fetchCampaignSequence = async (campaignId) => {
  try {
    const response = await axios.get(`https://server.smartlead.ai/api/v1/campaigns/${campaignId}/sequences?api_key=${SMARTLEAD_API_KEY}`);
    return response.data; // Assuming the sequence data is returned in `data`
  } catch (error) {
    console.error('Error fetching campaign sequence:', error.response?.data || error.message);
    throw error; // Propagate error so it can be handled in the component
  }
};


/**
 * Adds leads to an existing campaign.
 * @param {number} campaignId - The campaign ID.
 * @param {Object} leadsPayload - The leads payload.
 * @returns {Promise} - The result of adding leads.
 */
export const addLeadsToCampaign = async (campaignId, leadsPayload) => {
  try {
    const addLeadsUrl = `https://server.smartlead.ai/api/v1/campaigns/${campaignId}/leads?api_key=${SMARTLEAD_API_KEY}`;
    const response = await axios.post(addLeadsUrl, leadsPayload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error adding leads:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Updates the campaign's status
 * @param {number} campaignId - The ID of the campaign to update.
 * @param {string} status - The new status of the campaign ("PAUSED" or "START").
 * @returns {Promise} - The result of the status update.
 */
export const updateCampaignStatus = async (campaignId, status) => {
  try {
    const updateStatusUrl = `https://server.smartlead.ai/api/v1/campaigns/${campaignId}/status?api_key=${SMARTLEAD_API_KEY}`;

    // Prepare the payload to update the status and possibly set the scheduler
    const payload = {
      status: status, // Can be "PAUSED" or "START"
    };

    // Make the POST request to update the campaign status and schedule
    const response = await axios.post(updateStatusUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error updating campaign status:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Fetches all leads for a campaign by campaign ID.
 * @param {number} campaignId - The ID of the campaign.
 * @returns {Promise<Array>} - The list of leads in the campaign.
 */
export const listAllLeads = async (campaignId) => {
  try {
    const listLeadsUrl = `https://server.smartlead.ai/api/v1/campaigns/${campaignId}/leads?api_key=${SMARTLEAD_API_KEY}`;
    
    const response = await axios.get(listLeadsUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data
  } catch (error) {
    console.error('Error fetching leads:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Pauses a lead by campaign ID and lead ID.
 * @param {number} campaignId - The ID of the campaign.
 * @param {number} leadId - The ID of the lead to pause.
 * @returns {Promise} - The result of the pause lead action.
 */
export const pauseLead = async (campaignId, leadId) => {
  try {
    const pauseLeadUrl = `https://server.smartlead.ai/api/v1/campaigns/${campaignId}/leads/${leadId}/pause?api_key=${SMARTLEAD_API_KEY}`;
    
    const response = await axios.post(pauseLeadUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error pausing lead:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Resumes a lead by campaign ID and lead ID.
 * @param {number} campaignId - The ID of the campaign.
 * @param {number} leadId - The ID of the lead to resume.
 * @returns {Promise} - The result of the resume lead action.
 */
export const resumeLead = async (campaignId, leadId) => {
  try {
    const resumeLeadUrl = `https://server.smartlead.ai/api/v1/campaigns/${campaignId}/leads/${leadId}/resume?api_key=${SMARTLEAD_API_KEY}`;
    
    const response = await axios.post(resumeLeadUrl);

    return response.data;
  } catch (error) {
    console.error('Error resuming lead:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Save campaign sequence for a specific campaign.
 * @param {number} campaignId - The ID of the campaign.
 * @param {Object} sequencePayload - The payload containing sequence details.
 * @returns {Promise<Object>} - The response from the API.
 */
export const saveCampaignSequence = async (campaignId, sequencePayload) => {
  try {
    const saveSequenceUrl = `https://server.smartlead.ai/api/v1/campaigns/${campaignId}/sequences?api_key=${SMARTLEAD_API_KEY}`;
    
    const response = await axios.post(saveSequenceUrl, sequencePayload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data; // Return the data from the API response
  } catch (error) {
    console.error('Error saving campaign sequence:', error.response?.data || error.message);
    throw error; // Propagate the error to be handled by the caller
  }
};

/**
 * Update the schedule for a specific campaign.
 * @param {number} campaignId - The ID of the campaign.
 * @param {Object} schedulePayload - The schedule payload with details.
 * @returns {Promise<Object>} - The response from the API.
 */
export const updateCampaignSchedule = async (campaignId, schedulePayload) => {
  try {
    const updateScheduleUrl = `https://server.smartlead.ai/api/v1/campaigns/${campaignId}/schedule?api_key=${SMARTLEAD_API_KEY}`;
    
    const response = await axios.post(updateScheduleUrl, schedulePayload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data; // Return the data from the API response
  } catch (error) {
    console.error('Error updating campaign schedule:', error.response?.data || error.message);
    throw error; // Propagate the error to be handled by the caller
  }
};

/**
 * Add or update a webhook for a campaign.
 * @param {number} campaignId - The ID of the campaign.
 * @returns {Promise<Object>} - The response from the API.
 */
export const addOrUpdateCampaignWebhook = async (campaignId) => {
  try {
    const webhookPayload = {
      id: null, // Set to null to create a new webhook
      name: 'Webhook', 
      webhook_url: '?',
      event_types: Object.values(WEBHOOK_EVENT_TYPE), 
      categories: ['Interested'] // Default category, can be changed
    };

    const webhookUrl = `https://server.smartlead.ai/api/v1/campaigns/${campaignId}/webhooks?api_key=${SMARTLEAD_API_KEY}`;

    const response = await axios.post(webhookUrl, webhookPayload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(response.data);
    return response.data;  // Return the response from the API
  } catch (error) {
    console.error('Error adding/updating webhook:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Example utility function for delaying execution.
 * You can use this as needed in other functions.
 */
export const delay = wait;
