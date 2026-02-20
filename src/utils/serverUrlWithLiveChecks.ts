import { API_ENDPOINTS } from "@/config/api";
import { ServerInfo, } from "@/hooks/useDiscovery";

const testIpReachability = async (ip: string, port: number): Promise<boolean> => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 500); // 500ms timeout

        const testUrl = `http://${ip}:${port}${API_ENDPOINTS.SYSTEM.ROOT_PATH}`;
        console.log(`🔍 Testing IP: ${ip} - ${testUrl}`);

        // Get auth token from localStorage
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        const headers: HeadersInit = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(testUrl, {
            method: 'GET',
            headers,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const isReachable = response.ok;
        console.log(`${isReachable ? '✅' : '❌'} IP ${ip}: ${isReachable ? 'Reachable' : 'Unreachable'}`);
        return isReachable;
    } catch (error) {
        console.log(`❌ IP ${ip}: Unreachable (${error instanceof Error ? error.message : 'timeout'})`);
        return false;
    }
};

const getServerUrl = async (info: ServerInfo) => {
    // Prioritize IPs based on network type (higher score = better)
    const prioritizeIP = (ip: string): number => {
        // IPv6 addresses - lowest priority
        if (ip.includes(":")) return 1;

        // IPv4 prioritization
        if (ip.startsWith("10.0.0.")) return 100;        // LAN/wired - highest speed
        if (ip.startsWith("192.168.1.")) return 50;      // WiFi - lower speed
        if (ip.startsWith("192.168.")) return 40;        // Other local WiFi
        if (ip.startsWith("172.17.")) return 30;         // Docker network
        if (ip.startsWith("169.254.")) return 20;        // Link-local

        // Other IPv4
        return 60;
    };

    // Filter IPv4 addresses and test reachability
    const ipv4Addresses = info.addresses.filter(addr => !addr.includes(":"));

    console.log(`🔎 Testing ${ipv4Addresses.length} IPv4 addresses for ${info.hostname}...`);

    // Test all IPs in parallel
    const reachabilityTests = await Promise.all(
        ipv4Addresses.map(async (ip) => ({
            ip,
            priority: prioritizeIP(ip),
            reachable: await testIpReachability(ip, info.port)
        }))
    );

    // Filter to only reachable IPs and sort by priority
    const reachableIPs = reachabilityTests
        .filter(test => test.reachable)
        .sort((a, b) => b.priority - a.priority);

    if (reachableIPs.length === 0) {
        console.warn(`⚠️ No reachable IPs found for ${info.hostname}, using highest priority`);
        // Fallback to highest priority if none are reachable
        const fallback = reachabilityTests
            .sort((a, b) => b.priority - a.priority)[0];
        return `http://${fallback.ip}:${info.port}`;
    }

    const bestIP = reachableIPs[0].ip;

    console.log(`🎯 Selected IP for ${info.hostname}: ${bestIP} (priority: ${reachableIPs[0].priority})`);
    console.log(`   Reachable IPs:`, reachableIPs.map(s => `${s.ip} (${s.priority})`));

    return `http://${bestIP}:${info.port}`;
};


export default getServerUrl;