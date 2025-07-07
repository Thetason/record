/** @type {import('next').NextConfig} */
const nextConfig = {
  // Force dynamic rendering
  generateBuildId: async () => {
    return `build-${Date.now()}`
  }
}

export default nextConfig