import axios from 'axios';

// SmartLead API Key
const SMARTLEAD_API_KEY = process.env.VUE_APP_SMARTLEAD_API_KEY;

// Utility function to simulate a delay
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
 * Example utility function for delaying execution.
 * You can use this as needed in other functions.
 */
export const delay = wait;
