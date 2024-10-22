<template>
  <v-container>
    <v-row>
      <v-col>
        <v-btn v-if="!isAuthenticated" @click="login" color="primary">
          Login with Microsoft
        </v-btn>

        <v-card v-else>
          <v-card-title> Welcome, {{ userName }}! </v-card-title>

          <v-card-actions>
            <v-btn @click="logout" color="error"> Logout </v-btn>
            <v-btn @click="fetchExcelFile" color="success">
              Fetch Excel File
            </v-btn>
          </v-card-actions>

          <v-card-text>
            <v-alert type="success">
              Excel Data Loaded Successfully! Excel changes will update every
              15-30 seconds.
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, onMounted, onUnmounted } from "vue";
import { msalInstance, loginRequest } from "../msal";
import axios from "axios";
import * as XLSX from "xlsx";

export default {
  name: "ExcelFileFetcher",
  emits: ["dataFetched"],
  setup(props, { emit }) {
    const isAuthenticated = ref(false);
    const userName = ref("");
    const excelData = ref(null);
    const fetchInterval = ref(null);

    const setActiveAccount = (account) => {
      msalInstance.setActiveAccount(account);
    };

    const login = async () => {
      try {
        const response = await msalInstance.loginPopup(loginRequest);
        setActiveAccount(response.account);
        isAuthenticated.value = true;
        userName.value = response.account.username;
      } catch (error) {
        console.error("Login error:", error);
      }
    };

    const logout = async () => {
      try {
        await msalInstance.logoutPopup();
        msalInstance.setActiveAccount(null);
        isAuthenticated.value = false;
        userName.value = "";
        excelData.value = null;

        // Clear interval when logged out
        if (fetchInterval.value) {
          clearInterval(fetchInterval.value);
          fetchInterval.value = null;
        }
      } catch (error) {
        console.error("Logout error:", error);
      }
    };

    const fetchExcelFile = async () => {
      try {
        let account = msalInstance.getActiveAccount();
        if (!account) {
          await login();
          account = msalInstance.getActiveAccount();
        }

        const tokenResponse = await msalInstance.acquireTokenSilent({
          scopes: ["Files.Read"],
          account: account,
        });

        const accessToken = tokenResponse.accessToken;

        // Use the correct file path in OneDrive
        const filePath = "/Sales/ColdEmailingDatabase.xlsx";

        const response = await axios.get(
          `https://graph.microsoft.com/v1.0/me/drive/root:${filePath}:/content`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            responseType: "arraybuffer",
          }
        );

        const data = new Uint8Array(response.data);
        const workbook = XLSX.read(data, { type: "array" });

        // Access the "Anthony" worksheet
        const worksheet = workbook.Sheets["Anthony"];
        if (!worksheet) {
          console.error("Worksheet 'Anthony' not found");
          return;
        }

        // Convert worksheet to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          defval: "", // Set default value for empty cells to empty string or 'N/A'
        });

        excelData.value = jsonData; // Store the data

        // Emit the data to the parent component
        emit("dataFetched", jsonData);
      } catch (error) {
        console.error("Error fetching Excel file:", error);
      }
    };

    onMounted(async () => {
      try {
        const response = await msalInstance.handleRedirectPromise();

        if (response !== null && response.account !== null) {
          setActiveAccount(response.account);
        } else {
          const currentAccounts = msalInstance.getAllAccounts();
          if (currentAccounts.length === 1) {
            setActiveAccount(currentAccounts[0]);
          } else if (currentAccounts.length > 1) {
            // Choose the appropriate account (you may need to add logic here)
            setActiveAccount(currentAccounts[0]); // For simplicity, pick the first one
          }
        }

        const account = msalInstance.getActiveAccount();
        if (account) {
          isAuthenticated.value = true;
          userName.value = account.username;

          // Fetch data on mount and set up an interval to fetch data every 15 seconds
          await fetchExcelFile();
          fetchInterval.value = setInterval(fetchExcelFile, 15000); // Fetch every 15 seconds
        }
      } catch (error) {
        console.error("Error handling redirect promise:", error);
      }
    });

    // Clear the interval when the component is unmounted to avoid memory leaks
    onUnmounted(() => {
      if (fetchInterval.value) {
        clearInterval(fetchInterval.value);
      }
    });

    return {
      isAuthenticated,
      userName,
      excelData,
      login,
      logout,
      fetchExcelFile,
    };
  },
};
</script>

<style scoped>
/* Add your styles here */
</style>
