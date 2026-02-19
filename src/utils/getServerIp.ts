import { useDiscovery } from "@/hooks/useDiscovery"
import { selectBestIpAddress } from "./serverConfig";

const GetServerIp = (): string | null => {
    const { availableServers } = useDiscovery();
    console.log("AVAILABLE SERVERS", availableServers, typeof availableServers);

    if (availableServers.length === 0) return null;

    const currentDeviceId = localStorage.getItem('aaxion_server_info') ? JSON.parse(localStorage.getItem('aaxion_server_info')!).deviceName : null;
    const matchedServer = availableServers.find((server: any) => server.hostname === currentDeviceId + ".local");
    if (matchedServer) {
        const bestIP = selectBestIpAddress(matchedServer.addresses);
        return `http://${bestIP}:${matchedServer.port}`;
    }

    return null;
}

export default GetServerIp;