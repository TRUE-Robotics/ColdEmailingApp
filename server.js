// server.js

const express = require('express');
const axios = require('axios');
const cors = require('cors'); // Import the cors package
require('dotenv').config();

const app = express();

// Configure CORS middleware
app.use(cors({
    origin: 'http://localhost:8080', // Allow requests from your frontend origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // If you need to send cookies or auth headers
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());

// Retrieve the Smartlead API key from environment variables
const SMARTLEAD_API_KEY = process.env.SMARTLEAD_API_KEY;

if (!SMARTLEAD_API_KEY) {
    console.error('SMARTLEAD_API_KEY is not set in .env file');
    process.exit(1);
}

// Route definition
app.post('/api/create-campaign', async (req, res) => {
    try {
        const campaignPayload = req.body;

        // Log the payload for debugging
        console.log('Campaign Payload:', JSON.stringify(campaignPayload, null, 2));

        // Step 1: Create the campaign
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

        // Step 2: Add leads to the campaign
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

        res.json({
            message: `Campaign created with ID ${campaignId} and leads added successfully.`,
        });
    } catch (error) {
        console.error('Error creating campaign:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
        });

        res.status(error.response?.status || 500).json({
            error:
                error.response?.data?.error ||
                'Error creating campaign or adding leads. Please try again.',
        });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});
