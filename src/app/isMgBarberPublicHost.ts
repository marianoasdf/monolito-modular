export function isMgBarberPublicHost(host: string | null): boolean {
  if (!host) {
    return false;
  }

  const normalizedHost = host.split(":")[0]?.toLowerCase();
  return normalizedHost === "mgbarber.xyz" || normalizedHost === "www.mgbarber.xyz";
}