import { API_CONFIG } from "../../config";
import { getUser } from "../../api/endpoints";
import { getUserSettings } from "../../api/endpoints/apiService";

export const requestUserSettings = async (group: string) => {
    try {
        const response = await getUserSettings(group);
        if (response.status === 200) {
            const data = response.settings;
            return data;
        } else {
            throw new Error(`Error fetching user settings: ${response.statusText}`);
        }
    } catch (error) {
        console.error("Error fetching user settings:", error);
        throw error;
    }
};
