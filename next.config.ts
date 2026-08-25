import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove o header "X-Powered-By: Next.js" das respostas — não vaza nada
  // crítico, mas facilita fingerprinting do framework/versão por quem for
  // procurar CVEs conhecidos.
  poweredByHeader: false,
};

export default nextConfig;
